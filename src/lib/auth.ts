import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
export async function getUserFromSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  console.log("Token:", token);

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    console.log("Decoded:", decoded);  
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true },
    });
    console.log("User found:", user); 
    return user;
  } catch (e) {
    console.error("JWT error:", e);  
    return null;
  }
}