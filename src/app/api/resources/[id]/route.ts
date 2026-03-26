import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { resources, users } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const resource = await resources.findById(id);

    if (!resource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    // Enrich with uploadedBy user info
    const uploader = resource.uploadedById
      ? await users.findById(resource.uploadedById)
      : null;

    return NextResponse.json({
      ...resource,
      uploadedBy: uploader
        ? { id: uploader.id, name: uploader.name, email: uploader.email }
        : null,
    });
  } catch (error) {
    console.error("GET /api/resources/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = session.user as { id: string; role: string };
    const { id } = params;

    // Only admin or the uploader can update
    const existing = await resources.findById(id);
    if (!existing) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    if (
      currentUser.role !== "ADMIN" &&
      existing.uploadedById !== currentUser.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, category, type, url, fileUrl, fileName, fileSize, isPublic } = body;

    const updateData: Record<string, string | number | boolean | null | undefined> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (type !== undefined) updateData.type = type;
    if (url !== undefined) updateData.url = url;
    if (fileUrl !== undefined) updateData.fileUrl = fileUrl;
    if (fileName !== undefined) updateData.fileName = fileName;
    if (fileSize !== undefined) updateData.fileSize = fileSize;
    if (isPublic !== undefined) updateData.isPublic = String(isPublic);

    const resource = await resources.update(id, updateData);

    if (!resource) {
      return NextResponse.json({ error: "Failed to update resource" }, { status: 500 });
    }

    // Enrich with uploadedBy user info
    const uploader = resource.uploadedById
      ? await users.findById(resource.uploadedById)
      : null;

    return NextResponse.json({
      ...resource,
      uploadedBy: uploader
        ? { id: uploader.id, name: uploader.name, email: uploader.email }
        : null,
    });
  } catch (error) {
    console.error("PATCH /api/resources/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = session.user as { id: string; role: string };
    const { id } = params;

    const existing = await resources.findById(id);
    if (!existing) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    if (
      currentUser.role !== "ADMIN" &&
      existing.uploadedById !== currentUser.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await resources.delete(id);

    return NextResponse.json({ message: "Resource deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/resources/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
