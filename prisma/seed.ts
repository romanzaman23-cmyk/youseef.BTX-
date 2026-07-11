import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";
import { QUESTION_CATEGORIES } from "../src/lib/constants";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const levelTopics: Record<number, string[]> = {
  1: [
    "What is the safe minimum internal cooking temperature for poultry?",
    "Which practice helps prevent cross-contamination in food preparation?",
    "What is the danger zone temperature range for bacterial growth?",
    "How often should food handlers wash their hands?",
    "What color cutting board is typically used for raw meat?",
  ],
  2: [
    "What is a Critical Control Point (CCP) in HACCP?",
    "Which microorganism is most associated with reheated rice?",
    "What is the purpose of a food safety management system?",
    "How should allergen information be communicated to consumers?",
    "What verification activity confirms HACCP system effectiveness?",
  ],
  3: [
    "What is the difference between validation and verification in HACCP?",
    "Which ISO standard addresses food safety management systems?",
    "What is a prerequisite program in HACCP?",
    "How should a food defense plan address intentional contamination?",
    "What sampling method is most appropriate for microbiological testing?",
  ],
  4: [
    "How should risk assessment be conducted for emerging food safety hazards?",
    "What are the key elements of an effective food safety culture program?",
    "How does FSMA differ from traditional HACCP approaches?",
    "What statistical process control methods apply to food safety monitoring?",
    "How should root cause analysis be conducted for food safety incidents?",
  ],
};

function generateQuestion(level: number, index: number, category: string) {
  const topics = levelTopics[level];
  const baseQ = topics[index % topics.length];
  const qNum = (level - 1) * 100 + index + 1;

  return {
    level,
    category,
    textEn: `[L${level} Q${qNum}] ${baseQ}`,
    textAr: `[مستوى ${level} س${qNum}] ${baseQ}`,
    optionAEn: "Correct food safety practice",
    optionAAr: "ممارسة سلامة غذاء صحيحة",
    optionBEn: "Incorrect handling procedure",
    optionBAr: "إجراء معالجة غير صحيح",
    optionCEn: "Outdated regulatory requirement",
    optionCAr: "متطلب تنظيمي قديم",
    optionDEn: "Non-applicable standard",
    optionDAr: "معيار غير قابل للتطبيق",
    correctAnswer: "A",
    isActive: true,
  };
}

async function main() {
  console.log("Seeding BTX database...");

  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const demoPassword = await bcrypt.hash("Demo@123", 12);

  await prisma.user.upsert({
    where: { email: "admin@btx-excellence.com" },
    update: {
      password: adminPassword,
      role: "ADMIN",
      status: "APPROVED",
    },
    create: {
      email: "admin@btx-excellence.com",
      password: adminPassword,
      fullName: "BTX Administrator",
      mobile: "+971500000001",
      companyName: "Bin Tuwaym Excellence",
      jobTitle: "System Administrator",
      role: "ADMIN",
      status: "APPROVED",
    },
  });

  await prisma.user.upsert({
    where: { email: "demo@btx-excellence.com" },
    update: {
      password: demoPassword,
      role: "PARTICIPANT",
      status: "APPROVED",
    },
    create: {
      email: "demo@btx-excellence.com",
      password: demoPassword,
      fullName: "Demo Participant",
      mobile: "+971500000002",
      companyName: "Demo Food Company",
      jobTitle: "Food Safety Officer",
      role: "PARTICIPANT",
      status: "APPROVED",
    },
  });

  const existingQuestions = await prisma.question.count();
  if (existingQuestions === 0) {
    const questions = [];
    for (let level = 1; level <= 4; level++) {
      for (let i = 0; i < 100; i++) {
        const category = QUESTION_CATEGORIES[i % QUESTION_CATEGORIES.length];
        questions.push(generateQuestion(level, i, category));
      }
    }
    await prisma.question.createMany({ data: questions });
    console.log(`Created ${questions.length} questions`);
  }

  const existingThreshold = await prisma.competencyThreshold.findFirst();
  if (!existingThreshold) {
    await prisma.competencyThreshold.create({ data: {} });
  }

  const existingSlots = await prisma.examSlot.count();
  if (existingSlots === 0) {
    const now = new Date();
    const slots = [];
    for (let i = 1; i <= 8; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i * 7);
      slots.push({
        date,
        startTime: "09:00",
        endTime: "17:00",
        maxParticipants: 20,
        isActive: true,
      });
    }
    await prisma.examSlot.createMany({ data: slots });
    console.log(`Created ${slots.length} exam slots`);
  }

  console.log("Seed completed!");
  console.log("Admin: admin@btx-excellence.com / Admin@123");
  console.log("Demo:  demo@btx-excellence.com / Demo@123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
