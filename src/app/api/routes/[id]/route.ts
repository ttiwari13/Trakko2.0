import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log("=== DELETE ROUTE API CALLED ===");
    console.log("Route ID:", params.id);
    
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET!) as {
      userId: string;
    };

    const route = await prisma.pathRoute.findUnique({
      where: { id: params.id },
    });

    if (!route) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 });
    }

    if (route.creatorId !== decoded.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.pathRoute.delete({
      where: { id: params.id },
    });

    console.log("✅ Route deleted successfully");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ DELETE ROUTE ERROR:", error);
    return NextResponse.json(
      { error: "Failed to delete route" },
      { status: 500 }
    );
  }
}