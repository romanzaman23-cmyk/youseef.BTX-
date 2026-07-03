import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const questions = await prisma.question.findMany({ orderBy: [{ level: "asc" }, { category: "asc" }] });

  const data = questions.map((q) => ({
    Level: q.level,
    Category: q.category,
    "Question (EN)": q.textEn,
    "Question (AR)": q.textAr,
    "Option A (EN)": q.optionAEn,
    "Option A (AR)": q.optionAAr,
    "Option B (EN)": q.optionBEn,
    "Option B (AR)": q.optionBAr,
    "Option C (EN)": q.optionCEn,
    "Option C (AR)": q.optionCAr,
    "Option D (EN)": q.optionDEn,
    "Option D (AR)": q.optionDAr,
    "Correct Answer": q.correctAnswer,
    Active: q.isActive ? "Yes" : "No",
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Questions");
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="BTX-Question-Bank.xlsx"',
    },
  });
}
