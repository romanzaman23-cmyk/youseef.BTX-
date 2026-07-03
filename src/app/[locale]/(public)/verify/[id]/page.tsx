import { PageHeader } from "@/components/ui/PageHeader";
import { getCertificateVerification } from "@/lib/certificate-verify";
import {
  CertificateVerificationView,
  CertificateNotFoundView,
} from "@/components/certificate/CertificateVerificationView";

export default async function VerifyByIdPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const data = await getCertificateVerification(decodedId);

  return (
    <>
      <PageHeader
        title="Certificate Verification"
        subtitle="Scan QR code or enter verification ID to confirm certificate authenticity"
      />
      <section className="section-padding bg-muted">
        <div className="max-w-3xl mx-auto px-4">
          {data ? <CertificateVerificationView data={data} /> : <CertificateNotFoundView />}
        </div>
      </section>
    </>
  );
}
