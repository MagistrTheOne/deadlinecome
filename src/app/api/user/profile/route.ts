import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
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

    return NextResponse.json({
      user: {
        id: userData[0].id,
        name: userData[0].name,
        email: userData[0].email,
        image: userData[0].image,
        username: userData[0].username,
        bio: userData[0].bio,
        location: userData[0].location,
        website: userData[0].website,
        timezone: userData[0].timezone,
        language: userData[0].language,
        theme: userData[0].theme,
        status: userData[0].status,
        statusMessage: userData[0].statusMessage,
        lastActive: userData[0].lastActive
      }
    });

  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
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
      statusMessage
    } = body;

    // Обновляем профиль пользователя
    await db
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
        updatedAt: new Date()
      })
      .where(eq(user.id, session.user.id));

    return NextResponse.json({
      message: "Profile updated successfully"
    });

  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}