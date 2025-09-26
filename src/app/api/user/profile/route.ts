import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userData = await db
      .select()
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (userData.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: userData[0] });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      username,
      bio,
      location,
      website,
      timezone,
      language,
      theme,
      status,
      statusMessage,
      notifications,
      preferences
    } = body;

    // Проверяем уникальность username
    if (username) {
      const existingUser = await db
        .select()
        .from(user)
        .where(eq(user.username, username))
        .limit(1);
      
      if (existingUser.length > 0 && existingUser[0].id !== session.user.id) {
        return NextResponse.json({ error: "Username already taken" }, { status: 400 });
      }
    }

    const updatedUser = await db
      .update(user)
      .set({
        name: name || undefined,
        username: username || undefined,
        bio: bio || undefined,
        location: location || undefined,
        website: website || undefined,
        timezone: timezone || undefined,
        language: language || undefined,
        theme: theme || undefined,
        status: status || undefined,
        statusMessage: statusMessage || undefined,
        notifications: notifications ? JSON.stringify(notifications) : undefined,
        preferences: preferences ? JSON.stringify(preferences) : undefined,
        lastActive: new Date(),
        updatedAt: new Date()
      })
      .where(eq(user.id, session.user.id))
      .returning();

    return NextResponse.json({ user: updatedUser[0] });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}