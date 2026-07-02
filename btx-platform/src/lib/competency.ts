export interface CompetencyThresholds {
  beginnerMax: number;
  practitionerMin: number;
  practitionerMax: number;
  advancedMin: number;
  advancedMax: number;
  expertMin: number;
}

export const DEFAULT_THRESHOLDS: CompetencyThresholds = {
  beginnerMax: 49.99,
  practitionerMin: 50,
  practitionerMax: 69.99,
  advancedMin: 70,
  advancedMax: 84.99,
  expertMin: 85,
};

export function getCompetencyLevel(
  percentage: number,
  thresholds: CompetencyThresholds = DEFAULT_THRESHOLDS
): string {
  if (percentage >= thresholds.expertMin) return "Expert";
  if (percentage >= thresholds.advancedMin) return "Advanced";
  if (percentage >= thresholds.practitionerMin) return "Practitioner";
  return "Beginner";
}

export function getCompetencyColor(level: string): string {
  switch (level) {
    case "Expert":
      return "#C9A227";
    case "Advanced":
      return "#00897B";
    case "Practitioner":
      return "#0F2744";
    default:
      return "#6B7280";
  }
}

export function canTakeExam(lastExamAt: Date | null): boolean {
  if (!lastExamAt) return true;
  const cooldown = new Date(lastExamAt);
  cooldown.setMonth(cooldown.getMonth() + 3);
  return new Date() >= cooldown;
}

export function nextEligibleDate(lastExamAt: Date | null): Date | null {
  if (!lastExamAt) return null;
  const next = new Date(lastExamAt);
  next.setMonth(next.getMonth() + 3);
  return next;
}
