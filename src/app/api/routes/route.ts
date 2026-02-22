
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const decoded = verify(token, JWT_SECRET) as { userId: string };
    const routes = await prisma.pathRoute.findMany({
      where: {
        creatorId: decoded.userId,
      },
      include: {
        notes: true, 
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json({ data: routes });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch routes" },
      { status: 500 }
    );
  }
}