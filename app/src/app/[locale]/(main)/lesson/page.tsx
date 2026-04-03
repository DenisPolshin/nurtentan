import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LessonClient } from "./lesson-client";
import { getTranslations } from "next-intl/server";

export default async function LessonPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { type } = await searchParams;
  const t = await getTranslations("Lesson");
  const c = await getTranslations("Common");

  const whereClause = type === "akkusativ" 
    ? { case: "Akkusativ" } 
    : type === "dativ" 
    ? { case: "Dativ" } 
    : {};

  const verbs = await prisma.verb.findMany({
    where: whereClause,
    include: { sentences: true }
  });

  if (verbs.length === 0) {
    return <div className="p-8 text-center">Keine Verben gefunden.</div>;
  }

  // Flatten sentences for the quiz
  const questions = verbs.flatMap(v => 
    v.sentences.map(s => ({
      verbId: v.id,
      infinitive: v.infinitive,
      case: v.case,
      preposition: v.preposition,
      translation: v.translation,
      text: s.text,
      verbAnswer: s.verbAnswer,
      prepAnswer: s.prepAnswer,
      sentenceTranslation: s.translation,
      sentenceId: s.id,
    }))
  ).sort(() => Math.random() - 0.5).slice(0, 10); // Take 10 random questions

  const allPrepositionsData = await prisma.verb.findMany({
    select: { preposition: true },
    distinct: ['preposition'],
  });
  const allPrepositions = allPrepositionsData.map(p => p.preposition);

  return (
    <LessonClient 
      questions={questions} 
      allPrepositions={allPrepositions}
      t={{
        check: c("check"),
        continue: c("continue"),
        correct: c("correct"),
        incorrect: c("incorrect"),
        lesson_complete: t("lesson_complete"),
        fill_blanks: t("fill_blanks"),
        accuracy: t("accuracy"),
      }}
    />
  );
}