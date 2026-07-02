"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Download, Upload, Search } from "lucide-react";

interface Question {
  id: string;
  level: number;
  category: string;
  textEn: string;
  correctAnswer: string;
  isActive: boolean;
}

interface QuestionManagementProps {
  questions: Question[];
  levelCounts: Record<number, number>;
  totalActive: number;
}

export function QuestionManagement({ questions, levelCounts, totalActive }: QuestionManagementProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);

  const filtered = questions.filter((q) => {
    const matchesSearch = q.textEn.toLowerCase().includes(search.toLowerCase()) ||
      q.category.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = levelFilter === "ALL" || q.level === parseInt(levelFilter);
    return matchesSearch && matchesLevel;
  });

  const toggleActive = async (id: string, isActive: boolean) => {
    await fetch(`/api/admin/questions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    router.refresh();
  };

  const handleExport = () => {
    window.open("/api/admin/questions/export", "_blank");
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-btx-primary">Question Management</h1>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn-primary text-sm !py-2 flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => setShowForm(!showForm)} className="btn-accent text-sm !py-2 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Question
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 card-shadow col-span-2 lg:col-span-1">
          <p className="text-sm text-gray-500">Total Active</p>
          <p className="text-2xl font-bold text-btx-primary">{totalActive}</p>
        </div>
        {[1, 2, 3, 4].map((level) => (
          <div key={level} className="bg-white rounded-xl p-4 card-shadow">
            <p className="text-sm text-gray-500">Level {level}</p>
            <p className="text-2xl font-bold text-btx-accent">{levelCounts[level] || 0}</p>
          </div>
        ))}
      </div>

      {showForm && <AddQuestionForm onClose={() => { setShowForm(false); router.refresh(); }} />}

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="input-field w-auto">
          <option value="ALL">All Levels</option>
          <option value="1">Level 1</option>
          <option value="2">Level 2</option>
          <option value="3">Level 3</option>
          <option value="4">Level 4</option>
        </select>
      </div>

      <div className="bg-white rounded-xl card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-btx-primary text-white">
              <tr>
                <th className="text-left p-4">Level</th>
                <th className="text-left p-4">Category</th>
                <th className="text-left p-4">Question</th>
                <th className="text-left p-4">Answer</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q) => (
                <tr key={q.id} className="border-b border-border/50 hover:bg-muted/50">
                  <td className="p-4">L{q.level}</td>
                  <td className="p-4 text-gray-600">{q.category}</td>
                  <td className="p-4 max-w-md truncate">{q.textEn}</td>
                  <td className="p-4 font-mono">{q.correctAnswer}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${q.isActive ? "bg-btx-accent/10 text-btx-accent" : "bg-gray-100 text-gray-500"}`}>
                      {q.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleActive(q.id, q.isActive)}
                      className="text-xs text-btx-accent hover:underline"
                    >
                      {q.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AddQuestionForm({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    await fetch("/api/admin/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        level: parseInt(form.get("level") as string),
        category: form.get("category"),
        textEn: form.get("textEn"),
        textAr: form.get("textAr"),
        optionAEn: form.get("optionAEn"),
        optionAAr: form.get("optionAAr"),
        optionBEn: form.get("optionBEn"),
        optionBAr: form.get("optionBAr"),
        optionCEn: form.get("optionCEn"),
        optionCAr: form.get("optionCAr"),
        optionDEn: form.get("optionDEn"),
        optionDAr: form.get("optionDAr"),
        correctAnswer: form.get("correctAnswer"),
      }),
    });

    setLoading(false);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 card-shadow mb-6 space-y-4">
      <h3 className="font-bold text-btx-primary">Add New Question</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <select name="level" required className="input-field">
          <option value="1">Level 1 - Fundamentals</option>
          <option value="2">Level 2 - Intermediate</option>
          <option value="3">Level 3 - Advanced</option>
          <option value="4">Level 4 - Expert</option>
        </select>
        <input name="category" placeholder="Category" required className="input-field" />
      </div>
      <input name="textEn" placeholder="Question (English)" required className="input-field" />
      <input name="textAr" placeholder="Question (Arabic)" required className="input-field" />
      <div className="grid sm:grid-cols-2 gap-4">
        <input name="optionAEn" placeholder="Option A (EN)" required className="input-field" />
        <input name="optionAAr" placeholder="Option A (AR)" required className="input-field" />
        <input name="optionBEn" placeholder="Option B (EN)" required className="input-field" />
        <input name="optionBAr" placeholder="Option B (AR)" required className="input-field" />
        <input name="optionCEn" placeholder="Option C (EN)" required className="input-field" />
        <input name="optionCAr" placeholder="Option C (AR)" required className="input-field" />
        <input name="optionDEn" placeholder="Option D (EN)" required className="input-field" />
        <input name="optionDAr" placeholder="Option D (AR)" required className="input-field" />
      </div>
      <select name="correctAnswer" required className="input-field w-auto">
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="C">C</option>
        <option value="D">D</option>
      </select>
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="btn-accent">{loading ? "..." : "Save Question"}</button>
        <button type="button" onClick={onClose} className="btn-primary !bg-gray-500">Cancel</button>
      </div>
    </form>
  );
}
