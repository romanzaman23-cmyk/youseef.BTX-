"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/ui/PageHeader";
import { CheckCircle, XCircle, Search } from "lucide-react";

function VerifyForm() {
  const searchParams = useSearchParams();
  const [verificationId, setVerificationId] = useState(searchParams.get("id") || "");
  const [result, setResult] = useState<{
    valid: boolean;
    data?: {
      participantName: string;
      finalScore: number;
      competencyLevel: string;
      examDate: string;
      issuedAt: string;
    };
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/certificates/verify?id=${encodeURIComponent(verificationId)}`);
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-xl p-8 card-shadow">
      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Verification ID</label>
          <input
            type="text"
            value={verificationId}
            onChange={(e) => setVerificationId(e.target.value)}
            placeholder="BTX-2026-XXXXXXXX"
            required
            className="input-field font-mono"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          <Search className="w-4 h-4" />
          {loading ? "Verifying..." : "Verify Certificate"}
        </button>
      </form>

      {result && (
        <div className={`mt-6 p-6 rounded-lg ${result.valid ? "bg-btx-accent/10" : "bg-red-50"}`}>
          {result.valid && result.data ? (
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-btx-accent mx-auto mb-3" />
              <p className="font-bold text-btx-primary text-lg">Certificate Verified</p>
              <div className="mt-4 space-y-2 text-sm text-left">
                <p><strong>Name:</strong> {result.data.participantName}</p>
                <p><strong>Score:</strong> {result.data.finalScore.toFixed(1)}%</p>
                <p><strong>Classification:</strong> {result.data.competencyLevel}</p>
                <p><strong>Exam Date:</strong> {new Date(result.data.examDate).toLocaleDateString()}</p>
                <p><strong>Issued:</strong> {new Date(result.data.issuedAt).toLocaleDateString()}</p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <p className="font-bold text-red-600">Certificate Not Found</p>
              <p className="text-sm text-gray-500 mt-2">The verification ID could not be matched to any issued certificate.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function VerifyCertificatePage() {
  const t = useTranslations("footer");

  return (
    <>
      <PageHeader title={t("verify")} subtitle="Verify the authenticity of a BTX competency certificate" />
      <section className="section-padding bg-muted">
        <div className="max-w-lg mx-auto px-4">
          <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
            <VerifyForm />
          </Suspense>
        </div>
      </section>
    </>
  );
}
