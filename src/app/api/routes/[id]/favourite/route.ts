
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: routeId } = await context.params;

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verify(token, JWT_SECRET) as { userId: string };
    const route = await prisma.pathRoute.findUnique({
      where: { id: routeId },
    });

    if (!route) {
      return NextResponse.json(
        { error: "Route not found" },
        { status: 404 }
      );
    }
    if (route.creatorId !== decoded.userId) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403 }
      );
    }
    const updatedRoute = await prisma.pathRoute.update({
      where: { id: routeId },
      data: {
        isFavourite: !route.isFavourite,
      },
    });

    return NextResponse.json({
      success: true,
      isFavourite: updatedRoute.isFavourite,
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to toggle favourite" },
      { status: 500 }
    );
  }
}
