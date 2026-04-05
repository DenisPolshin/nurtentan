import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import { LanguageSelector } from "./language-selector";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
      redirect("/login");
  }
  const userId = session.user.id;

  // Retrieve user to get native language
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { nativeLanguage: true } });
  const nativeLanguage = user?.nativeLanguage || "RU";

  const t = await getTranslations("Dashboard");
  const c = await getTranslations("Common");

  const progress = await prisma.userProgress.findMany({
    where: { userId }
  });

  const verbsCount = await prisma.verb.count();
  const sentencesCount = await prisma.sentence.count();
  
  const learnedCount = progress.filter(p => p.isLearned).length;
  // Общий прогресс в баллах (макс 4 на каждый глагол теперь)
  const totalPoints = progress.reduce((acc, p) => acc + Math.min(p.correctAnswers, 4), 0);
  const progressPercentage = sentencesCount > 0 ? (totalPoints / sentencesCount) * 100 : 0;

  return (
    <div className="space-y-4 sm:space-y-8 pb-28 sm:pb-0 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="absolute top-0 right-0 z-10 hidden sm:block">
        <LanguageSelector currentLanguage={nativeLanguage} />
      </div>

      <div className="text-center space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-4xl font-bold text-slate-800">{t("title")}</h1>
        <p className="text-slate-500 text-sm sm:text-lg">{t("subtitle")}</p>
        <div className="sm:hidden flex justify-center mt-4 pt-2">
           <LanguageSelector currentLanguage={nativeLanguage} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3 sm:gap-6">
        <Card className="border-2 border-green-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6 flex flex-col items-center text-center space-y-3 sm:space-y-4">
            <div className="hidden sm:flex w-16 h-16 bg-green-100 rounded-full items-center justify-center">
              <span className="text-2xl font-bold text-green-600">A</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">{t("akkusativ")}</h2>
            <Link href="/lesson?type=akkusativ" className="w-full">
              <Button size="lg" className="w-full bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-sm hover:shadow-md h-12 sm:h-14 text-base sm:text-lg">
                {c("start")}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6 flex flex-col items-center text-center space-y-3 sm:space-y-4">
            <div className="hidden sm:flex w-16 h-16 bg-blue-100 rounded-full items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">D</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">{t("dativ")}</h2>
            <Link href="/lesson?type=dativ" className="w-full">
              <Button size="lg" className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-sm hover:shadow-md h-12 sm:h-14 text-base sm:text-lg">
                {c("start")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 sm:static">
        <div className="mx-auto w-full max-w-4xl px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:px-0 sm:pb-0">
          <Card className="border-2 border-slate-200 shadow-sm bg-slate-50/95 backdrop-blur-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 sm:mb-4 gap-1">
                <h3 className="text-lg sm:text-xl font-bold text-slate-800">{t("progress")}</h3>
                <span className="text-sm sm:text-base text-slate-500 font-medium truncate w-full sm:w-auto text-left sm:text-right">{totalPoints} / {sentencesCount} {t("sentences_learned")}</span>
              </div>
              <div className="h-3 sm:h-4 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all duration-1000"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
