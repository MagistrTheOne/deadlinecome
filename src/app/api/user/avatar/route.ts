import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

import { requireAuth } from "@/lib/auth/guards";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);

    const formData = await request.formData();
    const avatar = formData.get('avatar') as File;

    if (!avatar) {
      return NextResponse.json({ error: "No avatar provided" }, { status: 400 });
    }

    // Проверяем размер файла (максимум 5MB)
    if (avatar.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    // Проверяем тип файла
    if (!avatar.type.startsWith('image/')) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    // В реальном приложении здесь бы загружали файл в облачное хранилище
    // Для демо просто обновляем URL в базе данных
    const avatarUrl = `https://avatars.githubusercontent.com/u/${Date.now()}?v=4`;

    await db
      .update(user)
      .set({
        image: avatarUrl,
        updatedAt: new Date()
      })
      .where(eq(user.id, session.user.id));

    return NextResponse.json({
      message: "Avatar updated successfully",
      avatarUrl
    });

  } catch (error) {
    console.error("Error uploading avatar:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}