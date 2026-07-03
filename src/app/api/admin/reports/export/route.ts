import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import { format } from "date-fns";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const formatType = searchParams.get("format") || "xlsx";

  const results = await prisma.examResult.findMany({
    include: { user: { select: { fullName: true, email: true, companyName: true } } },
    orderBy: { createdAt: "desc" },
  });

  const data = results.map((r) => ({
    Participant: r.user.fullName,
    Email: r.user.email,
    Company: r.user.companyName,
    Score: `${r.percentage.toFixed(1)}%`,
    Classification: r.competencyLevel,
    Correct: r.correctAnswers,
    Incorrect: r.incorrectAnswers,
    Total: r.totalQuestions,
    Date: format(new Date(r.createdAt), "yyyy-MM-dd"),
  }));

  if (formatType === "pdf") {
    const doc = new jsPDF();
    doc.setFillColor(15, 39, 68);
    doc.rect(0, 0, 210, 30, "F");
    doc.setTextColor(201, 162, 39);
    doc.setFontSize(18);
    doc.text("BTX - Examination Report", 105, 18, { align: "center" });
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    let y = 40;
    doc.text(`Generated: ${format(new Date(), "PPP")}`, 14, y);
    y += 10;
    doc.text(`Total Exams: ${results.length}`, 14, y);
    y += 15;

    for (const r of results.slice(0, 30)) {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(`${r.user.fullName} | ${r.percentage.toFixed(1)}% | ${r.competencyLevel}`, 14, y);
      y += 7;
    }

    const buffer = doc.output("arraybuffer");
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="BTX-Report.pdf"',
      },
    });
  }

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Results");
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="BTX-Report.xlsx"',
    },
  });
}
