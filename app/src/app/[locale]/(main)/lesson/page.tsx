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

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { nativeLanguage: true },
  });
  
  const nativeLanguage = user?.nativeLanguage || "RU";

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

  // Get user's progress to filter out learned verbs
  const progress = await prisma.userProgress.findMany({
    where: { userId: session.user.id }
  });
  
  // Create a set of verb IDs that are considered learned (either explicitly marked or correct >= 4)
  const learnedVerbIds = new Set(
    progress.filter(p => p.isLearned || p.correctAnswers >= 4).map(p => p.verbId)
  );

  // Flatten sentences for the quiz
  const allQuestions = verbs.flatMap(v => 
    v.sentences.map(s => ({
      verbId: v.id,
      infinitive: v.infinitive,
      case: v.case,
      preposition: v.preposition,
      translation: v.translation,
      text: s.text,
      verbAnswer: s.verbAnswer,
      prepAnswer: s.prepAnswer,
      verbOptions: s.verbOptions ? JSON.parse(s.verbOptions) : [],
      sentenceTranslation: s.translation, // Original german translation
      sentenceId: s.id,
      nativeTranslation: null as string | null,
    }))
  );
  
  // Separate into learned and unlearned
  const unlearnedQuestions = allQuestions.filter(q => !learnedVerbIds.has(q.verbId));
  const learnedQuestions = allQuestions.filter(q => learnedVerbIds.has(q.verbId));

  // Helper to shuffle arrays
  const shuffle = (array: typeof allQuestions) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      // eslint-disable-next-line react-hooks/purity
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const shuffledUnlearned = shuffle(unlearnedQuestions);
  const shuffledLearned = shuffle(learnedQuestions);

  let selectedQuestions: typeof allQuestions = [];
  const TARGET_COUNT = 10;
  const NEW_TARGET = 8; // Try to get 8 unlearned and 2 learned for review

  if (shuffledUnlearned.length >= NEW_TARGET) {
    // If we have enough new ones, take 8 new and fill the rest with learned (review)
    selectedQuestions.push(...shuffledUnlearned.slice(0, NEW_TARGET));
    selectedQuestions.push(...shuffledLearned.slice(0, TARGET_COUNT - NEW_TARGET));
  } else {
    // If not enough new ones, take all remaining new ones and fill the rest with learned
    selectedQuestions.push(...shuffledUnlearned);
    selectedQuestions.push(...shuffledLearned.slice(0, TARGET_COUNT - shuffledUnlearned.length));
  }

  // Shuffle the final 10 questions so the user doesn't know which is new and which is review
  const questions = shuffle(selectedQuestions).slice(0, TARGET_COUNT);

  // Fetch translations for questions
  const sentenceIds = questions.map(q => q.sentenceId);
  const translations = await prisma.sentenceTranslation.findMany({
    where: {
      sentenceId: { in: sentenceIds },
      language: nativeLanguage,
    },
  });

  const translationMap = new Map(translations.map(t => [t.sentenceId, t.text]));

  for (const q of questions) {
    if (!q.sentenceTranslation) continue; // If no German full text exists
    
    const nativeText = translationMap.get(q.sentenceId);
    if (nativeText) {
      q.nativeTranslation = nativeText;
    } else {
      // Fallback: show original german sentence
      q.nativeTranslation = q.sentenceTranslation;
    }
  }

  const allPrepositionsData = await prisma.verb.findMany({
    select: { preposition: true },
    distinct: ['preposition'],
  });
  const allPrepositions = allPrepositionsData.map(p => p.preposition);
  
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <LessonClient 
      questions={questions} 
      allPrepositions={allPrepositions}
      isAdmin={isAdmin}
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