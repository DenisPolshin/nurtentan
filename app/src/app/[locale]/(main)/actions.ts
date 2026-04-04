"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function updateNativeLanguage(language: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { nativeLanguage: language }
  });
}
