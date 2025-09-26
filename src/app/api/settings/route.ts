import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guards";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);

    // Возвращаем настройки пользователя (пока заглушка)
    const settings = {
      emailNotifications: true,
      pushNotifications: false,
      projectUpdates: true,
      profileVisibility: "public",
      showEmail: false,
      theme: "dark",
      language: "ru",
      timezone: "Europe/Moscow",
    };

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth(request);

    const body = await request.json();
    
    // Здесь можно сохранить настройки в базу данных
    console.log("Saving settings for user:", session.user.id, body);

    return NextResponse.json({ 
      message: "Settings saved successfully",
      settings: body 
    });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
