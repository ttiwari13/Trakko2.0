import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function POST() {
  try {
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const inviteCode = randomBytes(16).toString("hex"); 

    const userPath = await prisma.path.upsert({  
      where: { creatorId: user.id },             
      update: {},
      create: { creatorId: user.id, inviteCode },
    });

    return NextResponse.json({ success: true, inviteCode: userPath.inviteCode });

  } catch (e) {
    console.error("[POST /api/path/create]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}