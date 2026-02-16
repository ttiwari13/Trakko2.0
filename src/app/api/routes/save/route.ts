import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { prisma } from "@/lib/prisma"; 

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verify(token, JWT_SECRET) as { userId: string };
    const body = await req.json();
    
    const { title, routePoints, activityType, isFavourite } = body;

    if (!title || !routePoints || !Array.isArray(routePoints)) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }
    const distance = calculateDistance(routePoints);
    const duration = calculateDuration(routePoints);
    const userPath = await prisma.path.findFirst({
      where: { creatorId: decoded.userId },
    });

    if (!userPath) {
      return NextResponse.json(
        { error: "User path not found" },
        { status: 404 }
      );
    }

    // Save route
    const route = await prisma.pathRoute.create({
      data: {
        pathId: userPath.id,
        creatorId: decoded.userId,
        title,
        encodedPolyline: JSON.stringify(routePoints),
        distance,
        duration,
        activityType: activityType || "walking",
        isFavourite: isFavourite || false, 
      },
    });

    return NextResponse.json({
      success: true,
      route: {
        id: route.id,
        title: route.title,
        distance: route.distance,
        duration: route.duration,
        isFavourite: route.isFavourite,
        createdAt: route.createdAt,
      },
    });
  } catch (error) {
    console.error("Save route error:", error);
    return NextResponse.json(
      { error: "Failed to save route" },
      { status: 500 }
    );
  }
}
function calculateDistance(points: Array<{ lat: number; lng: number }>): number {
  let totalDistance = 0;
  
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    
    const R = 6371e3; 
    const φ1 = (p1.lat * Math.PI) / 180;
    const φ2 = (p2.lat * Math.PI) / 180;
    const Δφ = ((p2.lat - p1.lat) * Math.PI) / 180;
    const Δλ = ((p2.lng - p1.lng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    totalDistance += R * c;
  }

  return totalDistance;
}
function calculateDuration(points: Array<{ lat: number; lng: number; timestamp?: number }>): number {
  if (points.length < 2) return 0;

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  
  if (firstPoint.timestamp && lastPoint.timestamp) {
    return Math.floor((lastPoint.timestamp - firstPoint.timestamp) / 1000);
  }
  const distance = calculateDistance(points);
  return Math.floor(distance / 1.4);
}