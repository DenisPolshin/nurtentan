"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Report {
  id: string;
  user: {
    name: string | null;
    email: string | null;
  };
  sentence: {
    text: string;
    verbAnswer: string;
    prepAnswer: string;
    verb: {
      infinitive: string;
    };
  };
  userAnswer: string | null;
  createdAt: Date;
}

interface ReportTableProps {
  reports: Report[];
}

export function ReportTable({ reports }: ReportTableProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async (reportId: string) => {
    setIsDeleting(reportId);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete report");
      }

      toast.success("Report deleted");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDeleting(null);
    }
  };

  if (reports.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400">
        No error reports found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/50">
            <th className="p-4 font-semibold text-slate-600">User</th>
            <th className="p-4 font-semibold text-slate-600">Sentence & Issue</th>
            <th className="p-4 font-semibold text-slate-600">User's Answer</th>
            <th className="p-4 font-semibold text-slate-600">Reported At</th>
            <th className="p-4 font-semibold text-slate-600 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
              <td className="p-4">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800">{report.user.name || "Anonymous"}</span>
                  <span className="text-xs text-slate-500">{report.user.email}</span>
                </div>
              </td>
              <td className="p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] uppercase font-bold py-0">
                      {report.sentence.verb.infinitive}
                    </Badge>
                    <span className="text-sm font-medium text-slate-700">
                      {report.sentence.text.replace(/____/g, "___")}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    <span className="font-semibold">Correct:</span> {report.sentence.verbAnswer} {report.sentence.prepAnswer}
                  </div>
                </div>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2 text-red-600 font-medium">
                  <MessageSquare className="h-3 w-3" />
                  {report.userAnswer || "N/A"}
                </div>
              </td>
              <td className="p-4">
                <span className="text-sm text-slate-500">
                  {new Date(report.createdAt).toLocaleString()}
                </span>
              </td>
              <td className="p-4 text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  disabled={isDeleting === report.id}
                  onClick={() => handleDelete(report.id)}
                >
                  {isDeleting === report.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
