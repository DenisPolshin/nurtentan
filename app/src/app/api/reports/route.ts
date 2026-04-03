import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sentenceId, userAnswer } = await request.json();

    if (!sentenceId) {
      return NextResponse.json({ error: "Missing sentenceId" }, { status: 400 });
    }

    const report = await prisma.report.create({
      data: {
        userId: session.user.id!,
        sentenceId,
        userAnswer,
      },
    });

    return NextResponse.json({ success: true, id: report.id });
  } catch (error: any) {
    console.error("[Report API] Error creating report:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
