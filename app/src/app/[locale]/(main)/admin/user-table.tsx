"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Mail, Calendar, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

interface UserWithProgress {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: Date;
  role: string;
  progress: { correctAnswers: number }[];
}

interface UserTableProps {
  users: UserWithProgress[];
  currentUserId?: string;
  totalSentences: number;
}

export function UserTable({ users, currentUserId, totalSentences }: UserTableProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async (userId: string) => {
    setIsDeleting(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete user");
      }

      toast.success("User successfully deleted");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/50">
            <th className="p-4 font-semibold text-slate-600">User</th>
            <th className="p-4 font-semibold text-slate-600">Progress</th>
            <th className="p-4 font-semibold text-slate-600">Joined</th>
            <th className="p-4 font-semibold text-slate-600">Role</th>
            <th className="p-4 font-semibold text-slate-600 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const totalCorrect = user.progress.reduce((acc, p) => acc + Math.min(p.correctAnswers, 4), 0);
            
            return (
              <tr
                key={user.id}
                className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
              >
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800">
                      {user.name || "Anonymous"}
                    </span>
                    <span className="text-sm text-slate-500 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-700">
                        {totalCorrect} / {totalSentences}
                      </span>
                      <span className="text-xs text-slate-400">learned sentences</span>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-sm text-slate-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </td>
                <td className="p-4">
                  <Badge
                    variant={user.role === "ADMIN" ? "default" : "secondary"}
                    className={
                      user.role === "ADMIN"
                        ? "bg-green-600"
                        : "bg-slate-100 text-slate-600"
                    }
                  >
                    {user.role}
                  </Badge>
                </td>
                <td className="p-4 text-right">
                  {user.id !== currentUserId && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          disabled={isDeleting === user.id}
                        >
                          {isDeleting === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the
                            account for <strong>{user.email}</strong> and remove their data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(user.id)}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                          >
                            Delete User
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
