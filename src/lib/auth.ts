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
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true },
    });
    return user;
  } catch (e) { 
    return null;
  }
}