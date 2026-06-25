import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCompetencyColor } from "@/lib/competency";
import { format } from "date-fns";
import { Award, Download } from "lucide-react";
import { CertificateDownloadButton } from "@/components/portal/CertificateDownloadButton";

export default async function CertificatesPage() {
  const session = await auth();
  const userId = session!.user.id;

  const certificates = await prisma.certificate.findMany({
    where: { userId },
    orderBy: { issuedAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl lg:text-3xl font-bold text-btx-primary mb-6">My Certificates</h1>

      {certificates.length === 0 ? (
        <div className="bg-white rounded-xl p-12 card-shadow text-center">
          <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No certificates issued yet. Complete an examination to earn your certificate.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          {certificates.map((cert) => {
            const color = getCompetencyColor(cert.competencyLevel);
            return (
              <div
                key={cert.id}
                className="bg-white rounded-xl overflow-hidden card-shadow border-t-4"
                style={{ borderColor: color }}
              >
                <div className="gradient-primary text-white p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-btx-secondary text-sm font-medium">BTX Certificate</p>
                      <p className="text-xl font-bold mt-1">{cert.participantName}</p>
                    </div>
                    <Award className="w-10 h-10 text-btx-secondary" />
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Score</span>
                    <span className="font-bold" style={{ color }}>{cert.finalScore.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Classification</span>
                    <span className="font-medium text-btx-primary">{cert.competencyLevel}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Date</span>
                    <span>{format(new Date(cert.examDate), "PPP")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Verification ID</span>
                    <span className="font-mono text-xs">{cert.verificationId}</span>
                  </div>
                  <CertificateDownloadButton certificateId={cert.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
