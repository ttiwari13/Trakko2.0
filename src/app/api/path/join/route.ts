import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { inviteCode } = await req.json();
  if (!inviteCode) {
    return NextResponse.json({ error: "Invite code required" }, { status: 400 });
  }

  const path = await prisma.path.findUnique({
    where: { inviteCode },
  });

  if (!path) {
    return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
  }

  if (path.creatorId === user.id) {
    return NextResponse.json({ error: "You are already in this path" }, { status: 400 });
  }

  try {
    await prisma.pathMember.create({
      data: {
        pathId: path.id,
        userId: user.id,
      },
    });
  } catch {
    return NextResponse.json({ error: "Already a member" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}