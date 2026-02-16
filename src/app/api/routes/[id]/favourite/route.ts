// src/app/api/routes/[id]/favourite/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { prisma } from "@/lib/prisma"; // adjust path as needed

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verify(token, JWT_SECRET) as { userId: string };
    const routeId = params.id;

    // Get current route
    const route = await prisma.pathRoute.findUnique({
      where: { id: routeId },
    });

    if (!route) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 });
    }

    // Check if user owns this route
    if (route.creatorId !== decoded.userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Toggle favourite
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
    console.error("Toggle favourite error:", error);
    return NextResponse.json(
      { error: "Failed to toggle favourite" },
      { status: 500 }
    );
  }
}