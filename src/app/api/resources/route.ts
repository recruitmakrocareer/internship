import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { resources, users } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const filter: Record<string, string | undefined> = { isPublic: "true" };
    if (category) filter.category = category;
    if (type) filter.type = type;

    const allResources = await resources.findMany(filter);

    // Sort by createdAt descending
    allResources.sort(
      (a, b) =>
        new Date(b.createdAt || "").getTime() -
        new Date(a.createdAt || "").getTime()
    );

    const total = allResources.length;
    const paged = allResources.slice(skip, skip + limit);

    // Enrich with uploadedBy user info
    const enriched = await Promise.all(
      paged.map(async (resource) => {
        const uploader = resource.uploadedById
          ? await users.findById(resource.uploadedById)
          : null;
        return {
          ...resource,
          uploadedBy: uploader
            ? { id: uploader.id, name: uploader.name, email: uploader.email }
            : null,
        };
      })
    );

    return NextResponse.json({
      resources: enriched,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/resources error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = session.user as { id: string };
    const body = await req.json();
    const {
      title,
      description,
      category,
      type,
      url,
      fileUrl,
      fileName,
      fileSize,
      isPublic,
    } = body;

    if (!title || !type) {
      return NextResponse.json(
        { error: "Title and type are required" },
        { status: 400 }
      );
    }

    const resource = await resources.create({
      title,
      description: description ?? "",
      category: category ?? "",
      type,
      url: url ?? "",
      fileUrl: fileUrl ?? "",
      fileName: fileName ?? "",
      fileSize: fileSize ?? "",
      uploadedById: currentUser.id,
      isPublic: isPublic !== undefined ? String(isPublic) : "true",
    });

    // Enrich with uploadedBy user info
    const uploader = await users.findById(currentUser.id);

    return NextResponse.json(
      {
        ...resource,
        uploadedBy: uploader
          ? { id: uploader.id, name: uploader.name, email: uploader.email }
          : null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/resources error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
