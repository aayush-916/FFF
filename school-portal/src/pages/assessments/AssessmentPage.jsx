import { useState, useEffect } from "react";
import {
  Award, CheckCircle, AlertCircle, Loader2,
  Lock, ChevronRight, Apple, Leaf, Heart,
  BookOpen, Users, Flame
} from "lucide-react";
import api from "../../services/api";

const CATEGORIES = [
  { key: "foodEnvironment",    label: "Food Environment & Access", desc: "Meals, canteen practices & food hygiene",       icon: Apple,    max: 30, color: "text-orange-500", bar: "bg-orange-400", iconBg: "bg-orange-50",  inputBorder: "border-orange-400",  inputText: "text-orange-500"  },
  { key: "dailyHabits",        label: "Daily Habit-Building",      desc: "Assemblies, timetables & daily routines",       icon: Leaf,     max: 30, color: "text-emerald-500",bar: "bg-emerald-400",iconBg: "bg-emerald-50", inputBorder: "border-emerald-400", inputText: "text-emerald-500" },
  { key: "wellbeingActivities",label: "Wellbeing Activities",      desc: "Physical activity, mental health & nutrition",  icon: Heart,    max: 20, color: "text-rose-500",   bar: "bg-rose-400",   iconBg: "bg-rose-50",    inputBorder: "border-rose-400",    inputText: "text-rose-500"    },
  { key: "teacherEngagement",  label: "Teacher Engagement",        desc: "Role-modelling & leadership support",           icon: BookOpen, max: 10, color: "text-violet-500", bar: "bg-violet-400", iconBg: "bg-violet-50",  inputBorder: "border-violet-400",  inputText: "text-violet-500"  },
  { key: "familyPartnership",  label: "Family Partnership",        desc: "Parent awareness & participation",              icon: Users,    max: 10, color: "text-sky-500",    bar: "bg-sky-400",    iconBg: "bg-sky-50",     inputBorder: "border-sky-400",     inputText: "text-sky-500"     },
];

const PHASES = ["baseline", "midline", "endline"];

const BANDS = [
  { label: "Bronze", min: 40, max: 59,  emoji: "🥉", color: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-200"  },
  { label: "Silver", min: 60, max: 79,  emoji: "🥈", color: "text-slate-500",  bg: "bg-slate-50",  border: "border-slate-200"  },
  { label: "Gold",   min: 80, max: 100, emoji: "🥇", color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" },
];

const getBand   = score => BANDS.find(b => score >= b.min && score <= b.max) || null;
const TOTAL_MAX = CATEGORIES.reduce((s, c) => s + c.max, 0);

export default function AssessmentPage() {
  const [scores, setScores]               = useState(Object.fromEntries(CATEGORIES.map(c => [c.key, ""])));
  const [currentPhase, setCurrentPhase]   = useState(null);
  const [completedPhases, setCompleted]   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [submitting, setSubmitting]       = useState(false);
  const [success, setSuccess]             = useState(false);
  const [error, setError]                 = useState(null);

  useEffect(() => { loadAssessments(); }, []);

  const loadAssessments = async () => {
    try {
      const res   = await api.get("/assessments");
      const list  = res.data.data || res.data || [];
      const phases = list.map(a => a.phase);
      setCompleted(phases);
      if (!phases.includes("baseline"))  setCurrentPhase("baseline");
      else if (!phases.includes("midline")) setCurrentPhase("midline");
      else if (!phases.includes("endline")) setCurrentPhase("endline");
      else setCurrentPhase(null);
    } catch { setError("Failed to load assessments."); }
    finally { setLoading(false); }
  };

  const handleChange = (key, val) => {
    if (val !== "" && !/^\d+$/.test(val)) return;
    const n   = val === "" ? "" : parseInt(val, 10);
    const cat = CATEGORIES.find(c => c.key === key);
    if (n !== "" && n > cat.max) return;
    setScores(p => ({ ...p, [key]: n }));
    setSuccess(false);
    setError(null);
  };

  const totalScore  = CATEGORIES.reduce((s, c) => s + (scores[c.key] === "" ? 0 : Number(scores[c.key])), 0);
  const filledCount = Object.values(scores).filter(v => v !== "").length;
  const band        = getBand(totalScore);
  const progress    = Math.round((totalScore / TOTAL_MAX) * 100);

  const doSubmit = async (e) => {
    e?.preventDefault();
    if (filledCount < CATEGORIES.length) { setError("Please fill in all score fields."); return; }
    setSubmitting(true); setError(null);
    try {
      await api.post("/assessments", {
        phase: currentPhase,
        food_environment_score:      scores.foodEnvironment,
        daily_habits_score:          scores.dailyHabits,
        wellbeing_activities_score:  scores.wellbeingActivities,
        teacher_engagement_score:    scores.teacherEngagement,
        family_partnership_score:    scores.familyPartnership,
      });
      setSuccess(true);
      setScores(Object.fromEntries(CATEGORIES.map(c => [c.key, ""])));
      loadAssessments();
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed. Try again.");
    } finally { setSubmitting(false); }
  };

  /* ─── shared sub-components ─────────────────────────────── */

  const PhaseStepper = () => (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Assessment Phases</p>
      <div className="flex items-start">
        {PHASES.map((phase, i) => {
          const done   = completedPhases.includes(phase);
          const active = currentPhase === phase;
          const locked = !done && !active;
          return (
            <div key={phase} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={["w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold mb-2 transition-all border-2",
                  done   ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200" : "",
                  active ? "bg-white border-indigo-600 text-indigo-600 shadow-md shadow-indigo-100" : "",
                  locked ? "bg-gray-100 border-gray-100 text-gray-300" : "",
                ].join(" ")}>
                  {done ? <CheckCircle size={16} /> : locked ? <Lock size={12} /> : <span>{i + 1}</span>}
                </div>
                <p className={["text-xs font-semibold capitalize", done ? "text-indigo-600" : active ? "text-gray-900" : "text-gray-300"].join(" ")}>{phase}</p>
                <span className={["text-[10px] mt-0.5 font-medium", done ? "text-indigo-400" : active ? "text-indigo-500" : "text-gray-300"].join(" ")}>
                  {done ? "Done" : active ? "Active" : "Locked"}
                </span>
              </div>
              {i < PHASES.length - 1 && (
                <div className={["h-0.5 flex-1 mx-1 rounded-full mb-7", done ? "bg-indigo-500" : "bg-gray-100"].join(" ")} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const ScoreBanner = () => (
    <div className="bg-indigo-600 rounded-2xl p-6 overflow-hidden relative">
      <div className="absolute w-40 h-40 rounded-full bg-white/5 -top-10 -right-10 pointer-events-none" />
      <div className="absolute w-24 h-24 rounded-full bg-white/5 -bottom-8 right-12 pointer-events-none" />
      <div className="relative">
        <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest mb-2">Live Score</p>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-6xl font-black text-white leading-none">{totalScore}</span>
          <span className="text-indigo-300 text-lg font-semibold">/ {TOTAL_MAX}</span>
        </div>
        <p className="text-indigo-300 text-xs">{filledCount} of {CATEGORIES.length} fields filled</p>
        <div className="mt-4">
          {band ? (
            <div className="inline-flex items-center gap-2 bg-white/15 rounded-xl px-4 py-2.5">
              <span className="text-2xl">{band.emoji}</span>
              <span className="text-sm font-bold text-white">{band.label} Band</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2.5">
              <Flame size={16} className="text-indigo-300" />
              <span className="text-xs text-indigo-300">Score to unlock band</span>
            </div>
          )}
        </div>
        <div className="mt-5">
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between mt-1.5 text-[10px] text-indigo-300">
            <span>0</span><span>🥉 40 · 🥈 60 · 🥇 80</span><span>100</span>
          </div>
        </div>
      </div>
    </div>
  );

  const BandCards = () => (
    <div className="grid grid-cols-3 gap-2">
      {BANDS.map(b => (
        <div key={b.label} className={`${b.bg} ${b.border} border rounded-xl p-3 text-center`}>
          <p className="text-2xl leading-none">{b.emoji}</p>
          <p className={`text-xs font-bold ${b.color} mt-1.5`}>{b.label}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{b.min}–{b.max} pts</p>
        </div>
      ))}
    </div>
  );

  const ScoreInput = ({ cat, compact = false }) => {
    const Icon   = cat.icon;
    const val    = scores[cat.key];
    const pct    = val !== "" ? Math.round((Number(val) / cat.max) * 100) : 0;
    const filled = val !== "";
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 lg:p-5">
        <div className={`flex items-${compact ? "center" : "start"} gap-3 ${compact ? "" : "mb-0"}`}>
          <div className={`w-10 h-10 rounded-xl ${cat.iconBg} flex items-center justify-center shrink-0`}>
            <Icon size={18} className={cat.color} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 leading-snug">{cat.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{cat.desc}</p>
            {/* progress bar — inside label col on desktop */}
            <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full ${cat.bar} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
            </div>
            {filled && (
              <div className="flex justify-between mt-1">
                <span className={`text-[10px] font-semibold ${cat.color}`}>{pct}% used</span>
                <span className="text-[10px] text-gray-300">{val} / {cat.max} pts</span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-center shrink-0">
            <input
              type="number" inputMode="numeric" min="0" max={cat.max} value={val} placeholder="–"
              onChange={e => handleChange(cat.key, e.target.value)}
              className={["w-14 h-12 text-center text-xl font-black rounded-xl border-2 bg-gray-50 focus:outline-none focus:bg-white transition-colors",
                "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                filled ? `${cat.inputBorder} ${cat.inputText}` : "border-gray-200 text-gray-300",
              ].join(" ")}
            />
            <p className="text-[10px] text-gray-400 mt-1">/ {cat.max}</p>
          </div>
        </div>
      </div>
    );
  };

  const SubmitButton = ({ label }) => (
    <button
      type="button" onClick={doSubmit} disabled={submitting}
      className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-2xl py-4 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200/60 transition-all"
    >
      {submitting
        ? <><Loader2 size={17} className="animate-spin" /> Submitting…</>
        : <><CheckCircle size={17} /> {label || `Submit ${currentPhase?.charAt(0).toUpperCase()}${currentPhase?.slice(1)} Assessment`} <ChevronRight size={15} className="ml-1" /></>
      }
    </button>
  );

  const AllDone = () => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
      <div className="text-5xl mb-3">🎉</div>
      <h3 className="text-lg font-black text-gray-900">All Phases Complete!</h3>
      <p className="text-sm text-gray-400 mt-2 leading-relaxed">Your school has finished all three assessment phases successfully.</p>
    </div>
  );

  const AlertBar = () => (
    <>
      {error && (
        <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm font-medium">
          <AlertCircle size={16} className="shrink-0 mt-0.5" /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2.5 bg-green-50 border border-green-100 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
          <CheckCircle size={16} className="shrink-0 mt-0.5" /> Assessment submitted successfully!
        </div>
      )}
    </>
  );

  /* ─── loading ────────────────────────────────────────────── */
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-3">
      <Loader2 className="animate-spin text-indigo-500" size={28} />
      <p className="text-sm text-gray-400">Loading assessments…</p>
    </div>
  );

  /* ─── render ─────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Sticky header ── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Award size={15} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 leading-none uppercase tracking-wider">School</p>
              <p className="text-sm font-bold text-gray-900 leading-tight">Wellbeing Assessment</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentPhase && (
              <span className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full capitalize border border-indigo-100">
                {currentPhase} Phase
              </span>
            )}
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              {filledCount}/{CATEGORIES.length} scored
            </span>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════
          MOBILE  (< lg)  —  single column
      ════════════════════════════════════ */}
      <div className="lg:hidden max-w-xl mx-auto px-4 py-5 space-y-3 pb-12">
        <PhaseStepper />
        <AlertBar />
        {currentPhase ? (
          <form onSubmit={e => { e.preventDefault(); doSubmit(); }} className="space-y-3">
            <ScoreBanner />
            <div className="space-y-2.5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 pt-1">Score Entry</p>
              {CATEGORIES.map(cat => <ScoreInput key={cat.key} cat={cat} />)}
            </div>
            <BandCards />
            <SubmitButton />
          </form>
        ) : <AllDone />}
      </div>

      {/* ════════════════════════════════════
          DESKTOP  (≥ lg)  —  sidebar + main
      ════════════════════════════════════ */}
      <div className="hidden lg:block max-w-7xl mx-auto px-10 py-8 pb-12">

        {/* Page heading */}
        <div className="mb-7">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">School Wellbeing Score</h1>
          <p className="text-sm text-gray-400 mt-1.5">
            Self-evaluate your school across five core wellbeing dimensions and track progress across three phases.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6 items-start">

          {/* ── Left sidebar (sticky) ── */}
          <div className="col-span-4 space-y-4 sticky top-20">
            <PhaseStepper />
            <ScoreBanner />
            <BandCards />
            {currentPhase && <SubmitButton label={`Submit ${currentPhase.charAt(0).toUpperCase()}${currentPhase.slice(1)}`} />}
          </div>

          {/* ── Right main panel ── */}
          <div className="col-span-8 space-y-4">
            <AlertBar />

            {currentPhase ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Score Entry</p>
                    <p className="text-xs text-gray-400 mt-0.5">{filledCount} of {CATEGORIES.length} categories filled</p>
                  </div>
                  <span className={`text-sm font-bold ${filledCount === CATEGORIES.length ? "text-emerald-600" : "text-gray-300"}`}>
                    {filledCount === CATEGORIES.length ? "✓ Ready to submit" : `${CATEGORIES.length - filledCount} remaining`}
                  </span>
                </div>

                {/* 2-column grid of score cards */}
                <div className="grid grid-cols-2 gap-4">
                  {CATEGORIES.map(cat => <ScoreInput key={cat.key} cat={cat} />)}
                </div>
              </>
            ) : <AllDone />}
          </div>

        </div>
      </div>
    </div>
  );
}