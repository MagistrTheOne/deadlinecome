import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { workspaceMember } from "@/lib/db/schema";
import { Member } from "@/lib/types";
import { generateId } from "@/lib/utils";

export interface IMembersRepo {
  findById(id: string): Promise<Member | null>;
  findByWorkspace(workspaceId: string): Promise<Member[]>;
  findByUser(userId: string): Promise<Member[]>;
  create(member: Omit<Member, "id" | "createdAt" | "updatedAt">): Promise<Member>;
  update(id: string, updates: Partial<Omit<Member, "id" | "createdAt" | "updatedAt">>): Promise<Member | null>;
  delete(id: string): Promise<boolean>;
}

export class DrizzleMembersRepo implements IMembersRepo {
  async findById(id: string): Promise<Member | null> {
    const result = await db.select().from(workspaceMember).where(eq(workspaceMember.id, id)).limit(1);
    if (!result[0]) return null;

    const item = result[0];
    return {
      ...item,
      createdAt: item.createdAt ?? new Date(),
      updatedAt: item.updatedAt ?? new Date(),
    } as Member;
  }

  async findByWorkspace(workspaceId: string): Promise<Member[]> {
    const result = await db.select().from(workspaceMember).where(eq(workspaceMember.workspaceId, workspaceId));
    return result.map(item => ({
      ...item,
      createdAt: item.createdAt ?? new Date(),
      updatedAt: item.updatedAt ?? new Date(),
    } as Member));
  }

  async findByUser(userId: string): Promise<Member[]> {
    const result = await db.select().from(workspaceMember).where(eq(workspaceMember.userId, userId));
    return result.map(item => ({
      ...item,
      createdAt: item.createdAt ?? new Date(),
      updatedAt: item.updatedAt ?? new Date(),
    } as Member));
  }

  async create(memberData: Omit<Member, "id" | "createdAt" | "updatedAt">): Promise<Member> {
    const id = generateId();
    const newMember = {
      id,
      workspaceId: memberData.workspaceId,
      userId: memberData.userId,
      role: memberData.role,
    };

    await db.insert(workspaceMember).values(newMember);
    return {
      ...newMember,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Member;
  }

  async update(id: string, updates: Partial<Omit<Member, "id" | "createdAt" | "updatedAt">>): Promise<Member | null> {
    await db.update(workspaceMember).set(updates).where(eq(workspaceMember.id, id));
    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(workspaceMember).where(eq(workspaceMember.id, id));
    return (result as any).rowCount > 0;
  }
}

export const membersRepo = new DrizzleMembersRepo();
