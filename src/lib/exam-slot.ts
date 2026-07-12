/** Combine slot date + "HH:mm" start time into one local datetime. */
export function getExamSlotDateTime(slot: { date: Date; startTime: string }): Date {
  const [hours, minutes] = slot.startTime.split(":").map((part) => parseInt(part, 10));
  const dt = new Date(slot.date);
  dt.setHours(Number.isFinite(hours) ? hours : 0, Number.isFinite(minutes) ? minutes : 0, 0, 0);
  return dt;
}

export function formatExamSlotDateTime(slot: { date: Date; startTime: string; endTime: string }) {
  const examStart = getExamSlotDateTime(slot);
  const dateLabel = examStart.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return { dateLabel, startTime: slot.startTime, endTime: slot.endTime, examStart };
}
