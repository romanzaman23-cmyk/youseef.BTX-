import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { getCertificateVerifyUrl } from "@/lib/certificate-verify";
import { BRAND } from "@/lib/constants";
import { format } from "date-fns";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  const certificate = await prisma.certificate.findUnique({ where: { id } });
  if (!certificate) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (session?.user?.role !== "ADMIN" && certificate.userId !== session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const verifyUrl = getCertificateVerifyUrl(certificate.verificationId);
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 140, margin: 1 });

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  // Background border
  doc.setDrawColor(15, 39, 68);
  doc.setLineWidth(1.5);
  doc.rect(10, 10, 277, 190);

  doc.setDrawColor(201, 162, 39);
  doc.setLineWidth(0.5);
  doc.rect(14, 14, 269, 182);

  // Header
  doc.setFillColor(15, 39, 68);
  doc.rect(14, 14, 269, 40, "F");

  doc.setTextColor(201, 162, 39);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("BTX", 148, 32, { align: "center" });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Bin Tuwaym Excellence", 148, 42, { align: "center" });
  doc.setFontSize(9);
  doc.text(BRAND.tagline, 148, 49, { align: "center" });

  // Title
  doc.setTextColor(15, 39, 68);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Certificate of Competency", 148, 72, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("This is to certify that", 148, 85, { align: "center" });

  doc.setTextColor(15, 39, 68);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(certificate.participantName, 148, 98, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("has successfully completed the Food Safety Competency Assessment", 148, 108, { align: "center" });
  doc.text("and achieved the following classification:", 148, 115, { align: "center" });

  // Competency badge
  doc.setFillColor(0, 137, 123);
  doc.roundedRect(108, 122, 80, 16, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(certificate.competencyLevel.toUpperCase(), 148, 132, { align: "center" });

  // Details
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Final Score: ${certificate.finalScore.toFixed(1)}%`, 60, 155);
  doc.text(`Examination Date: ${format(new Date(certificate.examDate), "MMMM d, yyyy")}`, 60, 163);
  doc.text(`Verification ID: ${certificate.verificationId}`, 60, 171);
  doc.text(`Issued: ${format(new Date(certificate.issuedAt), "MMMM d, yyyy")}`, 60, 179);

  // QR Code
  doc.addImage(qrDataUrl, "PNG", 220, 148, 35, 35);
  doc.setFontSize(7);
  doc.text("Scan to verify", 237, 186, { align: "center" });

  const pdfBuffer = doc.output("arraybuffer");

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="BTX-Certificate-${certificate.verificationId}.pdf"`,
    },
  });
}
