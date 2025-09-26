import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { qualityGate } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getWebSocketManager } from "@/lib/websocket-server";

import { requireAuth } from "@/lib/auth/guards";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    let gates = await db.select().from(qualityGate);

    if (projectId) {
      gates = gates.filter(gate => gate.projectId === projectId);
    }

    return NextResponse.json({
      success: true,
      gates: gates.map(gate => ({
        ...gate,
        rules: gate.rules ? JSON.parse(gate.rules) : [],
      })),
    });
  } catch (error) {
    console.error("Error fetching quality gates:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);

    const {
      projectId,
      name,
      description,
      rules,
      minQualityScore = 80,
      minSecurityScore = 90,
      minPerformanceScore = 70,
      minMaintainabilityScore = 75,
      autoBlock = true,
    } = await request.json();

    if (!projectId || !name || !rules) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const gateId = `gate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newGate = await db.insert(qualityGate).values({
      id: gateId,
      projectId,
      name,
      description,
      rules: JSON.stringify(rules),
      minQualityScore,
      minSecurityScore,
      minPerformanceScore,
      minMaintainabilityScore,
      autoBlock,
    }).returning();

    // Отправляем уведомление через WebSocket
    const wsManager = getWebSocketManager();
    if (wsManager) {
      wsManager.notifyQualityGateCreated(projectId, newGate[0]);
    }

    return NextResponse.json({
      success: true,
      gate: {
        ...newGate[0],
        rules: rules,
      },
    });
  } catch (error) {
    console.error("Error creating quality gate:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth(request);

    const { 
      gateId, 
      name, 
      description, 
      rules, 
      minQualityScore, 
      minSecurityScore, 
      minPerformanceScore, 
      minMaintainabilityScore, 
      autoBlock, 
      isActive 
    } = await request.json();

    if (!gateId) {
      return NextResponse.json({ error: "Gate ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (rules) updateData.rules = JSON.stringify(rules);
    if (minQualityScore !== undefined) updateData.minQualityScore = minQualityScore;
    if (minSecurityScore !== undefined) updateData.minSecurityScore = minSecurityScore;
    if (minPerformanceScore !== undefined) updateData.minPerformanceScore = minPerformanceScore;
    if (minMaintainabilityScore !== undefined) updateData.minMaintainabilityScore = minMaintainabilityScore;
    if (autoBlock !== undefined) updateData.autoBlock = autoBlock;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedGate = await db
      .update(qualityGate)
      .set(updateData)
      .where(eq(qualityGate.id, gateId))
      .returning();

    if (!updatedGate.length) {
      return NextResponse.json({ error: "Quality gate not found" }, { status: 404 });
    }

    // Отправляем уведомление через WebSocket
    const wsManager = getWebSocketManager();
    if (wsManager) {
      wsManager.notifyQualityGateUpdate(updatedGate[0].projectId, updatedGate[0]);
    }

    return NextResponse.json({
      success: true,
      gate: {
        ...updatedGate[0],
        rules: updatedGate[0].rules ? JSON.parse(updatedGate[0].rules) : [],
      },
    });
  } catch (error) {
    console.error("Error updating quality gate:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const gateId = searchParams.get("gateId");

    if (!gateId) {
      return NextResponse.json({ error: "Gate ID is required" }, { status: 400 });
    }

    const deletedGate = await db
      .delete(qualityGate)
      .where(eq(qualityGate.id, gateId))
      .returning();

    if (!deletedGate.length) {
      return NextResponse.json({ error: "Quality gate not found" }, { status: 404 });
    }

    // Отправляем уведомление через WebSocket
    const wsManager = getWebSocketManager();
    if (wsManager) {
      wsManager.notifyQualityGateDeleted(deletedGate[0].projectId, deletedGate[0]);
    }

    return NextResponse.json({
      success: true,
      message: "Quality gate deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting quality gate:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
