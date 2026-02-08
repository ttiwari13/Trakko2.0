import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function getUserFromSession() {
  const cookieStore = await cookies(); 
  const userId = cookieStore.get("userId")?.value;

  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
    },
  });

  return user;
}
