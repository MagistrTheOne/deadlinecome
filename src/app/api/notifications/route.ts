import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { NotificationService } from "@/lib/api/notifications";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await NotificationService.getNotifications(session.user.id);
    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notificationId, action } = await request.json();

    if (action === "markAsRead") {
      await NotificationService.markAsRead(notificationId, session.user.id);
    } else if (action === "delete") {
      await NotificationService.deleteNotification(notificationId, session.user.id);
    } else if (action === "markAllAsRead") {
      await NotificationService.markAllAsRead(session.user.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
