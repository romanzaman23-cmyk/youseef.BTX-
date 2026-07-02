import { NextResponse } from "next/server";
import { getCertificateVerification } from "@/lib/certificate-verify";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ valid: false });
  }

  const data = await getCertificateVerification(id);

  if (!data) {
    return NextResponse.json({ valid: false });
  }

  return NextResponse.json({ valid: true, data });
}
