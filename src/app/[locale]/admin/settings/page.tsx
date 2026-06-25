import { prisma } from "@/lib/prisma";
import { SettingsPanel } from "@/components/admin/SettingsPanel";

export default async function AdminSettingsPage() {
  const thresholds = await prisma.competencyThreshold.findFirst();

  return (
    <SettingsPanel
      thresholds={thresholds || {
        beginnerMax: 49.99,
        practitionerMin: 50,
        practitionerMax: 69.99,
        advancedMin: 70,
        advancedMax: 84.99,
        expertMin: 85,
      }}
    />
  );
}
