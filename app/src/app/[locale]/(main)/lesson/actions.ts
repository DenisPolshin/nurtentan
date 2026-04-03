"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function updateUserProgress(verbId: string, isCorrect: boolean) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  const current = await prisma.userProgress.findUnique({
    where: {
      userId_verbId: {
        userId,
        verbId,
      },
    },
  });

  const newCorrectAnswers = (current?.correctAnswers || 0) + (isCorrect ? 1 : 0);
  // Теперь слово считается выученным только после 4 правильных ответов (по одному на каждое предложение)
  const isLearned = newCorrectAnswers >= 4;

  await prisma.userProgress.upsert({
    where: {
      userId_verbId: {
        userId,
        verbId,
      },
    },
    update: {
      timesPracticed: { increment: 1 },
      correctAnswers: isCorrect ? { increment: 1 } : undefined,
      isLearned: isLearned,
      lastPracticed: new Date(),
    },
    create: {
      userId,
      verbId,
      timesPracticed: 1,
      correctAnswers: isCorrect ? 1 : 0,
      isLearned: isLearned,
      lastPracticed: new Date(),
    },
  });

  return { success: true };
}
