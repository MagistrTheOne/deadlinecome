import { Member } from "@/lib/types";
import { generateId } from "@/lib/utils";
import { seedMembers } from "../seed";

// In-memory storage
let members: Member[] = [...seedMembers];

export interface IMembersRepo {
  findById(id: string): Promise<Member | null>;
  findByWorkspace(workspaceId: string): Promise<Member[]>;
  findByUser(userId: string): Promise<Member[]>;
  create(member: Omit<Member, "id">): Promise<Member>;
  update(id: string, updates: Partial<Member>): Promise<Member | null>;
  delete(id: string): Promise<boolean>;
}

export class InMemoryMembersRepo implements IMembersRepo {
  async findById(id: string): Promise<Member | null> {
    return members.find((member) => member.id === id) || null;
  }

  async findByWorkspace(workspaceId: string): Promise<Member[]> {
    return members.filter((member) => member.workspaceId === workspaceId);
  }

  async findByUser(userId: string): Promise<Member[]> {
    return members.filter((member) => member.userId === userId);
  }

  async create(memberData: Omit<Member, "id">): Promise<Member> {
    const newMember: Member = {
      ...memberData,
      id: generateId(),
    };

    members.push(newMember);
    return newMember;
  }

  async update(id: string, updates: Partial<Member>): Promise<Member | null> {
    const memberIndex = members.findIndex((member) => member.id === id);
    if (memberIndex === -1) return null;

    members[memberIndex] = {
      ...members[memberIndex],
      ...updates,
    };

    return members[memberIndex];
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = members.length;
    members = members.filter((member) => member.id !== id);
    return members.length < initialLength;
  }
}

export const membersRepo = new InMemoryMembersRepo();
