"use client";

import { useEffect, useState } from "react";
import timeline from "../data/timeline.json";
// If your page.tsx is inside src/app, change the line above to: "../../data/timeline.json"

type Milestone = {
  id: string;
  title: string;
  monthsBeforeIntake: number;
  why: string;
  sourceUrl: string;
  lastVerified: string;
  germanLevels?: string[];
};

const INTAKES: Record<string, { label: string; date: Date }> = {
  winter2027: { label: "Winter 2027 (starts Oct 2027)", date: new Date(Date.UTC(2027, 9, 1)) },
  summer2028: { label: "Summer 2028 (starts Apr 2028)", date: new Date(Date.UTC(2028, 3, 1)) },
};

const STORAGE_KEY = "germany-path-done";

function dueDate(intake: Date, monthsBefore: number): Date {
  const d = new Date(intake);
  d.setUTCMonth(d.getUTCMonth() - monthsBefore);
  return d;
}

function fmt(d: Date): string {
  return d.toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });
}

export default function Home() {
  const [intake, setIntake] = useState("winter2027");
  const [semester, setSemester] = useState("5");
  const [german, setGerman] = useState("none");
  const [course, setCourse] = useState("cs");
  const [done, setDone] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setDone(JSON.parse(saved));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(done));
    } catch {}
  }, [done, loaded]);

  const toggle = (id: string) =>
    setDone((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const items = (timeline as Milestone[])
    .filter((m) => !m.germanLevels || m.germanLevels.includes(german))
    .map((m) => ({ ...m, due: dueDate(INTAKES[intake].date, m.monthsBeforeIntake) }))
    .sort((a, b) => a.due.getTime() - b.due.getTime());

  const now = new Date();
  const completed = items.filter((m) => done.includes(m.id)).length;
  const percent = Math.round((completed / items.length) * 100);

  const selectClass = "w-full rounded-lg border border-gray-300 bg-white p-2 text-gray-900";

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-2xl p-6">
        <h1 className="text-3xl font-bold">Germany Masters Timeline</h1>
        <p className="mt-1 text-gray-600">
          Tell us where you are. Get your next steps, with dates.
        </p>

        <section className="mt-6 grid gap-4 rounded-xl bg-white p-4 shadow-sm sm:grid-cols-2">
          <label className="text-sm font-medium">
            Target intake
            <select className={selectClass} value={intake} onChange={(e) => setIntake(e.target.value)}>
              {Object.entries(INTAKES).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Current semester
            <select className={selectClass} value={semester} onChange={(e) => setSemester(e.target.value)}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>Semester {n}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            German level now
            <select className={selectClass} value={german} onChange={(e) => setGerman(e.target.value)}>
              <option value="none">None</option>
              <option value="a1">A1</option>
              <option value="a2">A2</option>
              <option value="b1">B1</option>
              <option value="b2">B2 or higher</option>
            </select>
          </label>
          <label className="text-sm font-medium">
            Course
            <select className={selectClass} value={course} onChange={(e) => setCourse(e.target.value)}>
              <option value="cs">Computer Science</option>
              <option value="eng">Engineering</option>
            </select>
          </label>
        </section>

        <section className="mt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{completed} of {items.length} done</span>
            <span>{percent}%</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-gray-200">
            <div className="h-2 rounded-full bg-black transition-all" style={{ width: `${percent}%` }} />
          </div>
        </section>

        <ul className="mt-6 space-y-3">
          {items.map((m) => {
            const isDone = done.includes(m.id);
            const overdue = !isDone && m.due < now;
            return (
              <li key={m.id} className="rounded-xl bg-white p-4 shadow-sm">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 h-5 w-5"
                    checked={isDone}
                    onChange={() => toggle(m.id)}
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`font-semibold ${isDone ? "text-gray-400 line-through" : ""}`}>
                        {m.title}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{fmt(m.due)}</span>
                      {overdue && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                          Past target date
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{m.why}</p>
                    <p className="mt-2 text-xs text-gray-500">
                      <a className="underline" href={m.sourceUrl} target="_blank" rel="noreferrer">
                        Official source
                      </a>
                      {" · "}Last verified: {m.lastVerified}
                    </p>
                  </div>
                </label>
              </li>
            );
          })}
        </ul>

        <p className="mt-6 text-xs text-gray-500">
          Dates are estimates. Always confirm exact deadlines on each university's website.
        </p>
      </div>
    </main>
  );
}