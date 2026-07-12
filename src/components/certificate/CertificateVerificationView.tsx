import { format } from "date-fns";
import {
  Award,
  CheckCircle,
  Shield,
  User,
  Building2,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from "lucide-react";
import { getCompetencyColor } from "@/lib/competency";

export interface CertificateVerifyData {
  verificationId: string;
  participantName: string;
  finalScore: number;
  competencyLevel: string;
  examDate: string;
  issuedAt: string;
  email: string;
  mobile: string;
  companyName: string;
  jobTitle: string;
  accountStatus: string;
  memberSince: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  examCompletedAt: string;
  resultId: string;
  strengths: string[];
  weaknesses: string[];
  categoryPerformance: Array<{
    category: string;
    correct: number;
    total: number;
    percentage: number;
  }>;
}

export function CertificateVerificationView({ data }: { data: CertificateVerifyData }) {
  const color = getCompetencyColor(data.competencyLevel);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className="flex items-center gap-2 bg-btx-accent/10 text-btx-accent px-4 py-2 rounded-full text-sm font-semibold">
          <CheckCircle className="w-5 h-5" />
          Authentic BTX Certificate — Verified Online
        </div>
      </div>

      <div className="bg-white rounded-xl overflow-hidden card-shadow-lg border border-border/50">
        <div className="gradient-primary text-white px-6 py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Shield className="w-6 h-6 text-btx-secondary" />
            <span className="text-3xl font-bold text-btx-secondary">BTX</span>
          </div>
          <p className="text-sm text-white/80">Bin Tuwaym Excellence</p>
          <p className="text-xs text-white/50 mt-1">Official Online Verification Record</p>
        </div>

        <div className="p-6 lg:p-8 space-y-8">
          <div className="text-center">
            <Award className="w-10 h-10 text-btx-secondary mx-auto mb-3" />
            <h2 className="text-xl font-bold text-btx-primary">Certificate of Competency</h2>
            <p className="text-sm text-gray-500 mt-1">Food Safety Competency Assessment</p>
            <p className="text-2xl font-bold text-btx-primary mt-4">{data.participantName}</p>
            <div
              className="inline-block mt-3 px-6 py-2 rounded-lg text-white font-bold text-sm tracking-wide"
              style={{ backgroundColor: color }}
            >
              {data.competencyLevel.toUpperCase()}
            </div>
            <p className="text-sm text-gray-500 mt-3 font-mono">{data.verificationId}</p>
          </div>

          <section>
            <h3 className="font-bold text-btx-primary mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-btx-accent" />
              Participant Information
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <DetailRow icon={User} label="Full Name" value={data.participantName} />
              <DetailRow icon={Building2} label="Company" value={data.companyName} />
              <DetailRow icon={Briefcase} label="Job Title" value={data.jobTitle} />
              <DetailRow icon={Mail} label="Email" value={data.email} />
              <DetailRow icon={Phone} label="Mobile" value={data.mobile} />
              <DetailRow icon={Calendar} label="Member Since" value={format(new Date(data.memberSince), "MMMM d, yyyy")} />
              <DetailRow icon={Shield} label="Account Status" value={data.accountStatus} />
              <DetailRow icon={Shield} label="Verification ID" value={data.verificationId} mono />
            </div>
          </section>

          <section>
            <h3 className="font-bold text-btx-primary mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-btx-accent" />
              Examination Results
            </h3>
            <div className="bg-muted rounded-xl p-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mb-6">
                <StatBox label="Final Score" value={`${data.finalScore.toFixed(1)}%`} highlight color={color} />
                <StatBox label="Correct" value={String(data.correctAnswers)} />
                <StatBox label="Incorrect" value={String(data.incorrectAnswers)} />
                <StatBox label="Total Questions" value={String(data.totalQuestions)} />
              </div>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-gray-500 text-xs">Examination Date</p>
                  <p className="font-medium text-btx-primary">{format(new Date(data.examDate), "MMMM d, yyyy")}</p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-gray-500 text-xs">Certificate Issued</p>
                  <p className="font-medium text-btx-primary">{format(new Date(data.issuedAt), "MMMM d, yyyy")}</p>
                </div>
              </div>
            </div>
          </section>

          {data.categoryPerformance.length > 0 && (
            <section>
              <h3 className="font-bold text-btx-primary mb-4">Performance by Category</h3>
              <div className="space-y-3">
                {data.categoryPerformance.map((item) => (
                  <div key={item.category} className="p-3 bg-muted rounded-lg">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-btx-primary">{item.category}</span>
                      <span className="text-gray-600">
                        {item.correct}/{item.total} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-white rounded-full overflow-hidden">
                      <div
                        className="h-full bg-btx-accent transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {(data.strengths.length > 0 || data.weaknesses.length > 0) && (
            <section className="grid sm:grid-cols-2 gap-4">
              {data.strengths.length > 0 && (
                <div className="p-4 bg-green-50 rounded-xl">
                  <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Strengths
                  </h4>
                  <ul className="space-y-1">
                    {data.strengths.map((item) => (
                      <li key={item} className="text-sm text-green-700">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {data.weaknesses.length > 0 && (
                <div className="p-4 bg-amber-50 rounded-xl">
                  <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" />
                    Areas for Improvement
                  </h4>
                  <ul className="space-y-1">
                    {data.weaknesses.map((item) => (
                      <li key={item} className="text-sm text-amber-700">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-4">
        Scanned from BTX certificate QR code · Issued by Bin Tuwaym Excellence · {data.verificationId}
      </p>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
      <Icon className="w-4 h-4 text-btx-accent mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`text-sm font-medium text-btx-primary break-all ${mono ? "font-mono text-xs" : ""}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  highlight,
  color,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  color?: string;
}) {
  return (
    <div>
      <p className="text-xl font-bold" style={highlight && color ? { color } : { color: "#0F2744" }}>
        {value}
      </p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

export function CertificateNotFoundView() {
  return (
    <div className="max-w-lg mx-auto bg-white rounded-xl p-10 card-shadow text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
        <Shield className="w-8 h-8 text-red-400" />
      </div>
      <h2 className="text-xl font-bold text-red-600">Certificate Not Found</h2>
      <p className="text-sm text-gray-500 mt-2">
        This verification ID could not be matched to any issued BTX certificate.
        Please check the QR code or ID and try again.
      </p>
    </div>
  );
}
