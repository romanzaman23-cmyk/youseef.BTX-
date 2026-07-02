import { format } from "date-fns";
import { Award, CheckCircle, Shield, User, Building2, Briefcase, Mail, Phone } from "lucide-react";
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
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  examCompletedAt: string;
}

export function CertificateVerificationView({ data }: { data: CertificateVerifyData }) {
  const color = getCompetencyColor(data.competencyLevel);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Authentic badge */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className="flex items-center gap-2 bg-btx-accent/10 text-btx-accent px-4 py-2 rounded-full text-sm font-semibold">
          <CheckCircle className="w-5 h-5" />
          Certificate Authentic & Verified
        </div>
      </div>

      {/* Certificate card */}
      <div className="bg-white rounded-xl overflow-hidden card-shadow-lg border border-border/50">
        <div className="gradient-primary text-white px-6 py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Shield className="w-6 h-6 text-btx-secondary" />
            <span className="text-3xl font-bold text-btx-secondary">BTX</span>
          </div>
          <p className="text-sm text-white/80">Bin Tuwaym Excellence</p>
          <p className="text-xs text-white/50 mt-1">Measuring Excellence in Food Safety Competency</p>
        </div>

        <div className="p-6 lg:p-8">
          <div className="text-center mb-6">
            <Award className="w-10 h-10 text-btx-secondary mx-auto mb-3" />
            <h2 className="text-xl font-bold text-btx-primary">Certificate of Competency</h2>
            <p className="text-sm text-gray-500 mt-1">Official Verification Record</p>
          </div>

          <div className="text-center mb-6 pb-6 border-b border-border/50">
            <p className="text-sm text-gray-500">This certifies that</p>
            <p className="text-2xl font-bold text-btx-primary mt-1">{data.participantName}</p>
            <p className="text-sm text-gray-500 mt-2">
              has successfully completed the Food Safety Competency Assessment
            </p>
            <div
              className="inline-block mt-4 px-6 py-2 rounded-lg text-white font-bold text-sm tracking-wide"
              style={{ backgroundColor: color }}
            >
              {data.competencyLevel.toUpperCase()}
            </div>
          </div>

          {/* Participant details */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <DetailRow icon={User} label="Participant Name" value={data.participantName} />
            <DetailRow icon={Building2} label="Company" value={data.companyName} />
            <DetailRow icon={Briefcase} label="Job Title" value={data.jobTitle} />
            <DetailRow icon={Mail} label="Email" value={data.email} />
            <DetailRow icon={Phone} label="Mobile" value={data.mobile} />
            <DetailRow icon={Shield} label="Verification ID" value={data.verificationId} mono />
          </div>

          {/* Exam results */}
          <div className="bg-muted rounded-xl p-5 mb-6">
            <h3 className="font-bold text-btx-primary mb-4 text-sm uppercase tracking-wide">
              Examination Results
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <StatBox label="Final Score" value={`${data.finalScore.toFixed(1)}%`} highlight color={color} />
              <StatBox label="Correct" value={String(data.correctAnswers)} />
              <StatBox label="Incorrect" value={String(data.incorrectAnswers)} />
              <StatBox label="Total Questions" value={String(data.totalQuestions)} />
            </div>
          </div>

          {/* Dates */}
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-gray-500 text-xs">Examination Date</p>
              <p className="font-medium text-btx-primary">{format(new Date(data.examDate), "MMMM d, yyyy")}</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-gray-500 text-xs">Certificate Issued</p>
              <p className="font-medium text-btx-primary">{format(new Date(data.issuedAt), "MMMM d, yyyy")}</p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-4">
        This certificate was issued by BTX – Bin Tuwaym Excellence. Verification ID: {data.verificationId}
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
        Please check the ID and try again.
      </p>
    </div>
  );
}
