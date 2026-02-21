import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const decoded = jwt.verify(
      token.value,
      process.env.JWT_SECRET!
    ) as { userId: string };
    const route = await prisma.pathRoute.findUnique({
      where: { id },
    });
    if (!route) {
      return NextResponse.json(
        { error: "Route not found" },
        { status: 404 }
      );
    }
    if (route.creatorId !== decoded.userId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }
    await prisma.pathRoute.delete({
      where: { id },
    });
  return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete route" },
      { status: 500 }
    );
  }
}
