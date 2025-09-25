import { NextRequest, NextResponse } from "next/server";
import { NotificationManager } from "@/lib/notifications";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "all":
        const allNotifications = NotificationManager.getNotifications();
        return NextResponse.json(allNotifications);

      case "unread":
        const unreadNotifications = NotificationManager.getUnreadNotifications();
        return NextResponse.json(unreadNotifications);

      case "stats":
        const stats = NotificationManager.getNotificationStats();
        return NextResponse.json(stats);

      default:
        return NextResponse.json({
          notifications: NotificationManager.getNotifications(),
          unread: NotificationManager.getUnreadNotifications(),
          stats: NotificationManager.getNotificationStats()
        });
    }
  } catch (error) {
    console.error("Ошибка получения уведомлений:", error);
    return NextResponse.json(
      { error: "Ошибка получения уведомлений" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case "create":
        const { type, title, message, persistent, source, userId, actions } = data;
        const notification = NotificationManager.addNotification({
          type,
          title,
          message,
          persistent: persistent || false,
          source: source || "system",
          userId,
          actions
        });
        return NextResponse.json({
          success: true,
          notification,
          message: "Уведомление создано"
        });

      case "mark-read":
        const { notificationId } = data;
        const marked = NotificationManager.markAsRead(notificationId);
        return NextResponse.json({
          success: marked,
          message: marked ? "Уведомление отмечено как прочитанное" : "Уведомление не найдено"
        });

      case "mark-all-read":
        NotificationManager.markAllAsRead();
        return NextResponse.json({
          success: true,
          message: "Все уведомления отмечены как прочитанные"
        });

      case "remove":
        const { notificationId: removeId } = data;
        const removed = NotificationManager.removeNotification(removeId);
        return NextResponse.json({
          success: removed,
          message: removed ? "Уведомление удалено" : "Уведомление не найдено"
        });

      case "cleanup":
        const { daysOld } = data;
        NotificationManager.cleanupOldNotifications(daysOld || 7);
        return NextResponse.json({
          success: true,
          message: "Старые уведомления очищены"
        });

      case "system-notification":
        const { type: sysType, title: sysTitle, message: sysMessage, persistent: sysPersistent } = data;
        const sysNotification = NotificationManager.createSystemNotification(
          sysType,
          sysTitle,
          sysMessage,
          sysPersistent
        );
        return NextResponse.json({
          success: true,
          notification: sysNotification,
          message: "Системное уведомление создано"
        });

      case "ai-notification":
        const { type: aiType, title: aiTitle, message: aiMessage, actions: aiActions } = data;
        const aiNotification = NotificationManager.createAINotification(
          aiType,
          aiTitle,
          aiMessage,
          aiActions
        );
        return NextResponse.json({
          success: true,
          notification: aiNotification,
          message: "AI уведомление создано"
        });

      case "team-notification":
        const { type: teamType, title: teamTitle, message: teamMessage, userId: teamUserId } = data;
        const teamNotification = NotificationManager.createTeamNotification(
          teamType,
          teamTitle,
          teamMessage,
          teamUserId
        );
        return NextResponse.json({
          success: true,
          notification: teamNotification,
          message: "Командное уведомление создано"
        });

      default:
        return NextResponse.json(
          { error: "Неизвестное действие" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Ошибка обработки уведомлений:", error);
    return NextResponse.json(
      { error: "Ошибка обработки уведомлений" },
      { status: 500 }
    );
  }
}