import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

import { requireAuth } from "@/lib/auth/guards";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);

    const users = await db.select().from(user);
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
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
    const { name, image } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const updatedUser = await db
      .update(user)
      .set({ name, image })
      .where(eq(user.id, session.user.id))
      .returning();

    return NextResponse.json(updatedUser[0]);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
