import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notifications, users } from "@/lib/db";
import { sendLineNotification } from "@/lib/line";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = session.user as { id: string };
    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unread") === "true";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const filter: Record<string, string | undefined> = {
      userId: currentUser.id,
    };
    if (unreadOnly) {
      filter.isRead = "false";
    }

    const allNotifications = await notifications.findMany(filter);

    // Sort by createdAt descending
    allNotifications.sort(
      (a, b) =>
        new Date(b.createdAt || "").getTime() -
        new Date(a.createdAt || "").getTime()
    );

    const total = allNotifications.length;
    const paged = allNotifications.slice(skip, skip + limit);

    // Count unread
    const allForUser = unreadOnly
      ? allNotifications
      : await notifications.findMany({
          userId: currentUser.id,
          isRead: "false",
        });
    const unreadCount = unreadOnly ? total : allForUser.length;

    return NextResponse.json({
      notifications: paged,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
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

    const userRole = (session.user as { role: string }).role;
    if (userRole !== "ADMIN" && userRole !== "MENTOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { userId, title, message, type, sendLine } = body;

    if (!userId || !title || !message) {
      return NextResponse.json(
        { error: "userId, title, and message are required" },
        { status: 400 }
      );
    }

    // Verify the target user exists
    const targetUser = await users.findById(userId);

    if (!targetUser) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 }
      );
    }

    let sentViaLine = false;

    if (sendLine) {
      sentViaLine = await sendLineNotification(userId, title, message);
    }

    const notification = await notifications.create({
      userId,
      title,
      message,
      type: type || "general",
      sentViaLine: String(sentViaLine),
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error("POST /api/notifications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = session.user as { id: string };
    const body = await req.json();
    const { notificationId, markAllRead } = body;

    if (markAllRead) {
      await notifications.markAllRead(currentUser.id);

      return NextResponse.json({ message: "All notifications marked as read" });
    }

    if (!notificationId) {
      return NextResponse.json(
        { error: "notificationId or markAllRead is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const notification = await notifications.findById(notificationId);

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    if (notification.userId !== currentUser.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await notifications.update(notificationId, {
      isRead: "true",
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/notifications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
