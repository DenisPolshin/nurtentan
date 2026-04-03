import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, ShieldCheck, Flag, MessageSquare } from "lucide-react";
import { UserTable } from "./user-table";
import { ReportTable } from "./report-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function AdminPage() {
  const session = await auth();
  
  // Verify admin status
  if (!session?.user || (session.user as any).isAdmin !== true) {
    redirect("/");
  }

  const users = await prisma.user.findMany({
    include: {
      progress: {
        select: {
          correctAnswers: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const reports = await prisma.report.findMany({
    include: {
      user: {
        select: {
          email: true,
          name: true,
        }
      },
      sentence: {
        include: {
          verb: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const sentencesCount = await prisma.sentence.count();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-100">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Admin Panel</h1>
            <p className="text-slate-500 font-medium">Manage users and system health</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1 rounded-full">
          Admin Access
        </Badge>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-12 bg-slate-100 p-1 rounded-xl mb-6">
          <TabsTrigger value="users" className="rounded-lg flex items-center gap-2">
            <User className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="reports" className="rounded-lg flex items-center gap-2">
            <Flag className="h-4 w-4" />
            Error Reports
            {reports.length > 0 && (
              <Badge className="ml-1 px-1.5 h-5 bg-red-500 text-white border-none">
                {reports.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card className="border-2 border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
              <CardTitle className="flex items-center gap-2 text-slate-700">
                <User className="h-5 w-5 text-green-600" />
                Registered Users ({users.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <UserTable users={users} currentUserId={session.user.id} totalSentences={sentencesCount} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card className="border-2 border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
              <CardTitle className="flex items-center gap-2 text-slate-700">
                <Flag className="h-5 w-5 text-red-500" />
                User Error Reports ({reports.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ReportTable reports={reports} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
