"use client";

import { Download } from "lucide-react";

export function CertificateDownloadButton({ certificateId }: { certificateId: string }) {
  const handleDownload = () => {
    window.open(`/api/certificates/${certificateId}/pdf`, "_blank");
  };

  return (
    <button
      onClick={handleDownload}
      className="btn-primary w-full flex items-center justify-center gap-2 text-sm !py-2.5 mt-2"
    >
      <Download className="w-4 h-4" />
      Download Certificate (PDF)
    </button>
  );
}
