import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { getCompetencyColor } from "@/lib/competency";
import { Award } from "lucide-react";

export default async function AdminCertificatesPage() {
  const certificates = await prisma.certificate.findMany({
    include: { user: { select: { fullName: true, email: true, companyName: true } } },
    orderBy: { issuedAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl lg:text-3xl font-bold text-btx-primary mb-6">Certificates</h1>

      {certificates.length === 0 ? (
        <div className="bg-white rounded-xl p-12 card-shadow text-center">
          <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No certificates issued yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl card-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-btx-primary text-white">
                <tr>
                  <th className="text-left p-4">Participant</th>
                  <th className="text-left p-4 hidden md:table-cell">Company</th>
                  <th className="text-left p-4">Score</th>
                  <th className="text-left p-4">Classification</th>
                  <th className="text-left p-4 hidden lg:table-cell">Verification ID</th>
                  <th className="text-left p-4">Issued</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((cert) => {
                  const color = getCompetencyColor(cert.competencyLevel);
                  return (
                    <tr key={cert.id} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="p-4">
                        <p className="font-medium text-btx-primary">{cert.participantName}</p>
                        <p className="text-xs text-gray-400">{cert.user.email}</p>
                      </td>
                      <td className="p-4 text-gray-600 hidden md:table-cell">{cert.user.companyName}</td>
                      <td className="p-4 font-bold" style={{ color }}>{cert.finalScore.toFixed(1)}%</td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${color}20`, color }}>
                          {cert.competencyLevel}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-xs hidden lg:table-cell">{cert.verificationId}</td>
                      <td className="p-4 text-gray-500">{format(new Date(cert.issuedAt), "PP")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
