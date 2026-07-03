"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Clock, AlertTriangle, Shield } from "lucide-react";

interface Question {
  id: string;
  text: string;
  options: { key: string; text: string }[];
}

interface ExamInterfaceProps {
  sessionId: string;
  questions: Question[];
  timeLimit: number;
  locale: string;
  initialAnswers: Record<string, string>;
  initialIndex: number;
}

export function ExamInterface({
  sessionId,
  questions,
  timeLimit,
  locale,
  initialAnswers,
  initialIndex,
}: ExamInterfaceProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [tabWarnings, setTabWarnings] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const startedRef = useRef(false);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const selectedAnswer = answers[currentQuestion?.id];

  const submitExam = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);

    const res = await fetch(`/api/exam/${sessionId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });

    const data = await res.json();
    if (data.result?.id) {
      router.push(`/${locale}/portal/results/${data.result.id}`);
    } else {
      router.push(`/${locale}/portal/results`);
    }
    router.refresh();
  }, [sessionId, answers, locale, router, submitting]);

  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      fetch(`/api/exam/${sessionId}/start`, { method: "POST" });
    }
  }, [sessionId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [submitExam]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setTabWarnings((w) => w + 1);
        fetch(`/api/exam/${sessionId}/activity`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "tab_switch" }),
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [sessionId]);

  useEffect(() => {
    const requestFullscreen = async () => {
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        // Fullscreen may be blocked
      }
    };
    requestFullscreen();
  }, []);

  useEffect(() => {
    const preventCopy = (e: ClipboardEvent) => e.preventDefault();
    const preventContext = (e: Event) => e.preventDefault();
    document.addEventListener("copy", preventCopy);
    document.addEventListener("paste", preventCopy);
    document.addEventListener("contextmenu", preventContext);
    return () => {
      document.removeEventListener("copy", preventCopy);
      document.removeEventListener("paste", preventCopy);
      document.removeEventListener("contextmenu", preventContext);
    };
  }, []);

  const saveAnswer = async (questionId: string, answer: string) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);
    await fetch(`/api/exam/${sessionId}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: newAnswers, currentIndex }),
    });
  };

  const handleNext = () => {
    if (!selectedAnswer) return;
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      submitExam();
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-btx-primary text-white select-none">
      <div className="sticky top-0 z-10 bg-btx-primary/95 backdrop-blur border-b border-white/10 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-btx-secondary" />
            <span className="font-bold text-sm">BTX Secure Examination</span>
          </div>
          <div className="flex items-center gap-4">
            {tabWarnings > 0 && (
              <div className="flex items-center gap-1 text-amber-400 text-xs">
                <AlertTriangle className="w-4 h-4" />
                Tab switches: {tabWarnings}
              </div>
            )}
            <div className="flex items-center gap-2 font-mono text-lg">
              <Clock className="w-5 h-5 text-btx-secondary" />
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto mt-2">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-btx-secondary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-white/50 mt-1">
            Question {currentIndex + 1} of {questions.length}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl p-6 lg:p-8 text-btx-primary card-shadow-lg">
          <p className="text-lg lg:text-xl font-medium leading-relaxed mb-8">
            {currentQuestion.text}
          </p>

          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <button
                key={option.key}
                onClick={() => saveAnswer(currentQuestion.id, option.key)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedAnswer === option.key
                    ? "border-btx-accent bg-btx-accent/5"
                    : "border-gray-200 hover:border-btx-primary/30"
                }`}
              >
                <span className="font-medium text-btx-secondary mr-3">{option.key}.</span>
                {option.text}
              </button>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleNext}
              disabled={!selectedAnswer || submitting}
              className="btn-primary disabled:opacity-50"
            >
              {submitting
                ? "Submitting..."
                : currentIndex < questions.length - 1
                ? "Next Question"
                : "Submit Exam"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
