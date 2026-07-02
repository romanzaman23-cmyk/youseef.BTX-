"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/ui/PageHeader";
import { Search } from "lucide-react";
import {
  CertificateVerificationView,
  CertificateNotFoundView,
  type CertificateVerifyData,
} from "@/components/certificate/CertificateVerificationView";

function VerifyForm() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || "";
  const [verificationId, setVerificationId] = useState(initialId);
  const [result, setResult] = useState<{ valid: boolean; data?: CertificateVerifyData } | null>(null);
  const [loading, setLoading] = useState(false);

  const verify = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/certificates/verify?id=${encodeURIComponent(id.trim())}`);
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  useEffect(() => {
    if (initialId) verify(initialId);
  }, [initialId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verify(verificationId);
  };

  return (
    <>
      <div className="bg-white rounded-xl p-8 card-shadow mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
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
      </div>

      {loading && !result && (
        <div className="text-center py-8 text-gray-500">Verifying certificate...</div>
      )}

      {result && (
        result.valid && result.data ? (
          <CertificateVerificationView data={result.data} />
        ) : (
          <CertificateNotFoundView />
        )
      )}
    </>
  );
}

export default function VerifyCertificatePage() {
  const t = useTranslations("footer");

  return (
    <>
      <PageHeader title={t("verify")} subtitle="Verify the authenticity of a BTX competency certificate" />
      <section className="section-padding bg-muted">
        <div className="max-w-3xl mx-auto px-4">
          <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
            <VerifyForm />
          </Suspense>
        </div>
      </section>
    </>
  );
}
