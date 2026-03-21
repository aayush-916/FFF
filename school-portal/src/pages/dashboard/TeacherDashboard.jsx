import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  CheckCircle,
  PlayCircle,
  GraduationCap,
  Loader2,
  ChevronDown,
  ChevronRight,
  Users,
  X,
  FileText,
  ClipboardList,
  Download,
  Maximize2,
  Minimize2,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import api from "../../services/api";

/* ─── Design tokens ────────────────────────────────────────────────── */
const T = {
  bg: "#f7f4ef",
  card: "#ffffff",
  border: "#ede9e1",
  pri: "#1c1917",
  sec: "#78716c",
  hint: "#a8a29e",
  green: "#16a34a",
  greenBg: "#dcfce7",
  greenLt: "#bbf7d0",
  orange: "#ea580c",
  orangeBg: "#ffedd5",
  blue: "#2563eb",
  blueBg: "#dbeafe",
};

/* Section palette — extends gracefully for any letter */
const SEC_PAL = {
  A: { bg: "#dcfce7", color: "#15803d" },
  B: { bg: "#dbeafe", color: "#1d4ed8" },
  C: { bg: "#fce7f3", color: "#be185d" },
  D: { bg: "#fef3c7", color: "#b45309" },
  E: { bg: "#ede9fe", color: "#6d28d9" },
};
const secPal = (s) =>
  SEC_PAL[s?.toUpperCase?.()] || { bg: "#f1f5f9", color: "#475569" };

/* ─── Reusable atoms ───────────────────────────────────────────────── */
const Ring = ({ pct = 0, color = T.green, size = 52, stroke = 5 }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const d = (c * pct) / 100;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ flexShrink: 0 }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={T.border}
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={pct > 0 ? color : T.border}
        strokeWidth={stroke}
        strokeDasharray={`${d} ${c - d}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dasharray 0.4s ease" }}
      />
      <text
        x={size / 2}
        y={size / 2 + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={size < 44 ? 9 : 11}
        fontWeight="700"
        fill={pct > 0 ? color : T.hint}
      >
        {pct}%
      </text>
    </svg>
  );
};

const Bar = ({ pct = 0, color = T.green, h = 4 }) => (
  <div
    style={{
      height: h,
      background: T.border,
      borderRadius: h,
      overflow: "hidden",
      flex: 1,
    }}
  >
    <div
      style={{
        height: "100%",
        width: `${pct}%`,
        background: color,
        borderRadius: h,
        transition: "width 0.4s ease",
      }}
    />
  </div>
);

/* ═══════════════════════════════════════════════════════════════════ */
const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [expandedClass, setExpandedClass] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [expandedHabit, setExpandedHabit] = useState(null);
  const [teachingLesson, setTeachingLesson] = useState(null);
  const [feedbackLesson, setFeedbackLesson] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  const getFileUrl = (fp) => {
    if (!fp) return "";
    if (fp.startsWith("http")) return fp;
    return `https://api.aanyasolutions.com/${fp.replace(/^\//, "")}`;
  };

  const fetchDashboardData = async () => {
    try {
      const res = await api.get("/dashboard/teacher");
      // console.log(res.data);
      setData(res.data.data || res.data);
    } catch {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);
  useEffect(() => {
    document.body.style.overflow = isFullscreen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  const groupedClasses = useMemo(
    () =>
      (data?.classes || []).reduce((acc, cls) => {
        (acc[cls.class_number] = acc[cls.class_number] || []).push(cls);
        return acc;
      }, {}),
    [data],
  );

  const allClassNumbers = useMemo(
    () =>
      Object.keys(groupedClasses)
        .map(Number)
        .sort((a, b) => a - b),
    [groupedClasses],
  );

  const toggleClass = (n) => {
    setExpandedClass((p) => (p === n ? null : n));
    setExpandedSection(null);
    setExpandedHabit(null);
  };
  const toggleSection = (k) => {
    setExpandedSection((p) => (p === k ? null : k));
    setExpandedHabit(null);
  };
  const toggleHabit = (k) => setExpandedHabit((p) => (p === k ? null : k));

  const openTeachingModal = (lesson, habit, cls) => {
    setIsFullscreen(false);
    setTeachingLesson({
      lesson,
      habit,
      cls,
      activeTab: lesson.pdf_url
        ? "material"
        : lesson.teacher_guide_url
          ? "guide"
          : null,
    });
  };
  const closeModal = () => {
    setTeachingLesson(null);
    setFeedbackLesson(null);
    setIsFullscreen(false);
  };

  const handleMarkComplete = async () => {
    if (!teachingLesson) return;
    setIsSubmitting(true);
    try {
      await api.post("/sessions/mark-complete", {
        habit_id: teachingLesson.habit.id,
        parent_lesson_id: teachingLesson.lesson.parent_lesson_id,
        material_id: teachingLesson.lesson.id,
        class_number: teachingLesson.cls.class_number,
        section: teachingLesson.cls.section,
      });
      await fetchDashboardData();
      alert("Lesson marked complete! ✅");
      closeModal();
    } catch {
      alert("Could not mark complete. Check backend logs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenFeedback = async () => {
    const cur = teachingLesson;
    setTeachingLesson(null);
    setFeedbackLesson(cur);
    setIsSubmitting(true);
    try {
      const res = await api.get(
        `/mcq?lesson_id=${cur.lesson.parent_lesson_id}`,
      );
      setQuestions(res.data.data || []);
      setAnswers({});
    } catch {
      alert("Could not load feedback questions.");
      closeModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (questions.some((q) => q.is_optional === 0 && !answers[q.id])) {
      alert("Please answer all required questions.");
      return;
    }
    setIsSubmitting(true);
    try {
      const sessionRes = await api.post("/sessions", {
        lesson_id: feedbackLesson.lesson.parent_lesson_id,
        habit_id: feedbackLesson.habit.id,
        class_number: feedbackLesson.cls.class_number,
        section: feedbackLesson.cls.section,
      });
      const sid =
        sessionRes.data?.id ||
        sessionRes.data?.data?.id ||
        sessionRes.data?.insertId;
      await api.post("/mcq/submit", {
        session_id: sid,
        responses: questions
          .filter((q) => answers[q.id]?.trim())
          .map((q) => ({
            question_id: q.id,
            selected_option: q.question_type === "mcq" ? answers[q.id] : null,
            text_answer: q.question_type === "text" ? answers[q.id] : null,
          })),
      });
      closeModal();
      alert("Feedback submitted! 🎉");
    } catch {
      alert("Failed to submit feedback.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Loading ── */
  if (loading)
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          background: T.bg,
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 20,
            background: T.greenBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Loader2
            size={28}
            style={{ color: T.green, animation: "spin 1s linear infinite" }}
          />
        </div>
        <p style={{ color: T.sec, fontSize: 14 }}>Loading curriculum…</p>
      </div>
    );

  if (error)
    return (
      <div
        style={{
          margin: 16,
          padding: "16px 20px",
          borderRadius: 16,
          background: "#fef2f2",
          border: "1px solid #fecaca",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <AlertCircle size={20} style={{ color: "#dc2626", flexShrink: 0 }} />
        <p style={{ color: "#991b1b", fontSize: 14 }}>{error}</p>
      </div>
    );

  /* ── Render ── */
  return (
    <div style={{ background: T.bg, minHeight: "100vh" }}>
      {/* ── Sticky page header ── */}
      <div
        style={{
          background: "#fff",
          borderBottom: `1px solid ${T.border}`,
          padding: "18px 18px 14px",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            maxWidth: 680,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 15,
              flexShrink: 0,
              background: "linear-gradient(135deg,#bbf7d0,#dcfce7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <GraduationCap size={22} style={{ color: T.green }} />
          </div>
          <div>
            <h1
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: T.pri,
                lineHeight: 1.2,
              }}
            >
              Master Curriculum
            </h1>
            <p style={{ fontSize: 12, color: T.sec, marginTop: 2 }}>
              Track progress & teach across all classes
            </p>
          </div>
        </div>
      </div>

      {/* ── Class list ── */}
      <div
        style={{
          padding: "14px 14px 80px",
          maxWidth: 680,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {allClassNumbers.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: T.hint,
              fontSize: 14,
            }}
          >
            No class data available
          </div>
        )}

        {allClassNumbers.map((classNum) => {
          const isOpen = expandedClass === classNum;
          const sections = groupedClasses[classNum] || [];
          const done = sections.reduce(
            (a, c) => a + (c.lessons_completed || 0),
            0,
          );
          const total = sections.reduce(
            (a, c) => a + (c.lessons_total || 0),
            0,
          );
          const pct = total ? Math.round((done / total) * 100) : 0;

          return (
            <div
              key={classNum}
              style={{
                background: T.card,
                borderRadius: 22,
                border: `1.5px solid ${isOpen ? T.greenLt : T.border}`,
                overflow: "hidden",
                boxShadow: isOpen
                  ? "0 6px 28px rgba(22,163,74,0.10)"
                  : "0 1px 6px rgba(0,0,0,0.05)",
                transition: "all 0.22s ease",
              }}
            >
              {/* Class header */}
              <button
                onClick={() => toggleClass(classNum)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 18px",
                  background: isOpen
                    ? "linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%)"
                    : "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.22s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  {/* Class badge */}
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 18,
                      flexShrink: 0,
                      background: isOpen ? T.green : "#f1f0ee",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.22s",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 8,
                        fontWeight: 800,
                        letterSpacing: "0.08em",
                        color: isOpen ? T.greenLt : T.hint,
                        lineHeight: 1,
                      }}
                    >
                      CLASS
                    </span>
                    <span
                      style={{
                        fontSize: 22,
                        fontWeight: 900,
                        color: isOpen ? "#fff" : T.pri,
                        lineHeight: 1.1,
                      }}
                    >
                      {classNum}
                    </span>
                  </div>
                  <div>
                    <p style={{ fontSize: 17, fontWeight: 800, color: T.pri }}>
                      Class {classNum}
                    </p>
                    <p style={{ fontSize: 12, color: T.sec, marginTop: 3 }}>
                      {sections.length} section
                      {sections.length !== 1 ? "s" : ""} · {done}/{total}{" "}
                      lessons
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {/* <Ring pct={pct} color={T.green} size={46} stroke={4} /> */}
                  {isOpen ? (
                    <ChevronDown size={18} style={{ color: T.green }} />
                  ) : (
                    <ChevronRight size={18} style={{ color: T.hint }} />
                  )}
                </div>
              </button>

              {/* ── Sections ── */}
              {isOpen && (
                <div
                  style={{
                    padding: "0 12px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {sections.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: 24,
                        color: T.hint,
                        border: `2px dashed ${T.border}`,
                        borderRadius: 16,
                        margin: "4px 0 0",
                      }}
                    >
                      No sections assigned
                    </div>
                  ) : (
                    sections.map((cls, idx) => {
                      const sk = `${classNum}-${cls.section}`;
                      const isSecOpen = expandedSection === sk;
                      const sPct = cls.progress_percentage ?? 0;
                      const sp = secPal(cls.section);

                      return (
                        <div
                          key={idx}
                          style={{
                            background: isSecOpen ? "#fafaf9" : T.card,
                            borderRadius: 18,
                            border: `1px solid ${isSecOpen ? "#e7e5e4" : T.border}`,
                            overflow: "hidden",
                          }}
                        >
                          {/* Section header */}
                          <button
                            onClick={() => toggleSection(sk)}
                            style={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "14px 16px",
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                              textAlign: "left",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                              }}
                            >
                              {/* Section letter avatar */}
                              <div
                                style={{
                                  width: 46,
                                  height: 46,
                                  borderRadius: 15,
                                  flexShrink: 0,
                                  background: sp.bg,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 22,
                                    fontWeight: 800,
                                    color: sp.color,
                                  }}
                                >
                                  {cls.section}
                                </span>
                              </div>
                              <div>
                                <p
                                  style={{
                                    fontSize: 15,
                                    fontWeight: 700,
                                    color: T.pri,
                                  }}
                                >
                                  Section {cls.section}
                                </p>
                                <p
                                  style={{
                                    fontSize: 11,
                                    color: T.sec,
                                    marginTop: 2,
                                  }}
                                >
                                  {cls.habits_completed || 0}/
                                  {cls.habits_total || 0} habits ·{" "}
                                  {cls.lessons_completed || 0}/
                                  {cls.lessons_total || 0} lessons
                                </p>
                              </div>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                flexShrink: 0,
                                marginLeft: 8,
                              }}
                            >
                              <div style={{ textAlign: "right" }}>
                                <span
                                  style={{
                                    fontSize: 16,
                                    fontWeight: 800,
                                    color: sp.color,
                                  }}
                                >
                                  {sPct}%
                                </span>
                                <div style={{ width: 56, marginTop: 5 }}>
                                  <Bar pct={sPct} color={sp.color} h={3} />
                                </div>
                              </div>
                              {isSecOpen ? (
                                <ChevronDown
                                  size={16}
                                  style={{ color: T.hint }}
                                />
                              ) : (
                                <ChevronRight
                                  size={16}
                                  style={{ color: T.hint }}
                                />
                              )}
                            </div>
                          </button>

                          {/* ── Habits ── */}
                          {isSecOpen && (
                            <div style={{ borderTop: `1px solid ${T.border}` }}>
                              {(cls.habits || []).length === 0 ? (
                                <p
                                  style={{
                                    textAlign: "center",
                                    color: T.hint,
                                    fontSize: 13,
                                    padding: 20,
                                  }}
                                >
                                  No habits found
                                </p>
                              ) : (
                                (cls.habits || []).map((habit, hIdx) => {
                                  const hk = `${sk}-${habit.id}`;
                                  const isHOpen = expandedHabit === hk;
                                  const lTotal =
                                    habit.lessons_total ||
                                    habit.lessons?.length ||
                                    0;
                                  const lDone = habit.lessons_completed || 0;
                                  const isComp = lTotal > 0 && lDone === lTotal;
                                  const hPct = lTotal
                                    ? Math.round((lDone / lTotal) * 100)
                                    : 0;
                                  const hColor = isComp
                                    ? T.green
                                    : lDone > 0
                                      ? T.orange
                                      : T.hint;

                                  return (
                                    <div
                                      key={habit.id}
                                      style={{
                                        borderBottom: `1px solid ${T.border}`,
                                      }}
                                    >
                                      {/* Habit row */}
                                      <button
                                        onClick={() => toggleHabit(hk)}
                                        style={{
                                          width: "100%",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "space-between",
                                          padding: "13px 16px",
                                          background: isHOpen
                                            ? "#f9f8f7"
                                            : "transparent",
                                          border: "none",
                                          cursor: "pointer",
                                          textAlign: "left",
                                          transition: "background 0.15s",
                                        }}
                                      >
                                        <div
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 12,
                                            flex: 1,
                                            minWidth: 0,
                                          }}
                                        >
                                          {/* Habit badge */}
                                          <div
                                            style={{
                                              width: 34,
                                              height: 34,
                                              borderRadius: 11,
                                              flexShrink: 0,
                                              background: isComp
                                                ? T.greenBg
                                                : "#f1f0ee",
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                            }}
                                          >
                                            {isComp ? (
                                              <CheckCircle
                                                size={16}
                                                style={{ color: T.green }}
                                              />
                                            ) : (
                                              <span
                                                style={{
                                                  fontSize: 10,
                                                  fontWeight: 800,
                                                  color: T.sec,
                                                }}
                                              >
                                                H{hIdx + 1}
                                              </span>
                                            )}
                                          </div>
                                          <div style={{ flex: 1, minWidth: 0 }}>
                                            <p
                                              style={{
                                                fontSize: 14,
                                                fontWeight: 600,
                                                color: isComp ? T.hint : T.pri,
                                                textDecoration: isComp
                                                  ? "line-through"
                                                  : "none",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                              }}
                                            >
                                              {habit.name}
                                            </p>
                                            <div
                                              style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 8,
                                                marginTop: 5,
                                              }}
                                            >
                                              <Bar
                                                pct={hPct}
                                                color={hColor}
                                                h={3}
                                              />
                                              <span
                                                style={{
                                                  fontSize: 10,
                                                  fontWeight: 700,
                                                  color: hColor,
                                                  flexShrink: 0,
                                                }}
                                              >
                                                {lDone}/{lTotal}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                        {isHOpen ? (
                                          <ChevronDown
                                            size={15}
                                            style={{
                                              color: T.hint,
                                              flexShrink: 0,
                                              marginLeft: 10,
                                            }}
                                          />
                                        ) : (
                                          <ChevronRight
                                            size={15}
                                            style={{
                                              color: T.hint,
                                              flexShrink: 0,
                                              marginLeft: 10,
                                            }}
                                          />
                                        )}
                                      </button>

                                      {/* ── Lessons ── */}
                                      {isHOpen && (
                                        <div
                                          style={{
                                            padding: "6px 14px 14px",
                                            background:
                                              "linear-gradient(to bottom,#f9f8f7,#f4f2ee)",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 8,
                                          }}
                                        >
                                          {(habit.lessons || []).length ===
                                          0 ? (
                                            <p
                                              style={{
                                                fontSize: 12,
                                                color: T.hint,
                                                textAlign: "center",
                                                padding: "12px 0",
                                              }}
                                            >
                                              No lessons yet
                                            </p>
                                          ) : (
                                            (habit.lessons || []).map(
                                              (lesson, lIdx) => {
                                                const isDone =
                                                  lesson.status === "completed";
                                                return (
                                                  <div
                                                    key={lesson.id ?? lIdx}
                                                    style={{
                                                      background: isDone
                                                        ? T.greenBg
                                                        : T.card,
                                                      borderRadius: 14,
                                                      border: `1px solid ${isDone ? T.greenLt : T.border}`,
                                                      padding: "12px 14px",
                                                      display: "flex",
                                                      alignItems: "center",
                                                      justifyContent:
                                                        "space-between",
                                                      gap: 10,
                                                    }}
                                                  >
                                                    <div
                                                      style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 12,
                                                        flex: 1,
                                                        minWidth: 0,
                                                      }}
                                                    >
                                                      <div
                                                        style={{
                                                          width: 32,
                                                          height: 32,
                                                          borderRadius: 10,
                                                          flexShrink: 0,
                                                          background: isDone
                                                            ? "#fff"
                                                            : "#f1f0ee",
                                                          border: `1px solid ${isDone ? T.greenLt : T.border}`,
                                                          display: "flex",
                                                          alignItems: "center",
                                                          justifyContent:
                                                            "center",
                                                        }}
                                                      >
                                                        {isDone ? (
                                                          <CheckCircle
                                                            size={15}
                                                            style={{
                                                              color: T.green,
                                                            }}
                                                          />
                                                        ) : (
                                                          <span
                                                            style={{
                                                              fontSize: 11,
                                                              fontWeight: 700,
                                                              color: T.sec,
                                                            }}
                                                          >
                                                            {lIdx + 1}
                                                          </span>
                                                        )}
                                                      </div>
                                                      <p
                                                        style={{
                                                          fontSize: 13,
                                                          fontWeight: isDone
                                                            ? 500
                                                            : 600,
                                                          color: isDone
                                                            ? T.sec
                                                            : T.pri,
                                                          textDecoration: isDone
                                                            ? "line-through"
                                                            : "none",
                                                          overflow: "hidden",
                                                          textOverflow:
                                                            "ellipsis",
                                                          whiteSpace: "nowrap",
                                                        }}
                                                      >
                                                        {lesson.title ||
                                                          `Lesson ${lIdx + 1}`}
                                                      </p>
                                                    </div>
                                                    <button
                                                      onClick={() =>
                                                        openTeachingModal(
                                                          lesson,
                                                          habit,
                                                          cls,
                                                        )
                                                      }
                                                      style={{
                                                        flexShrink: 0,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 6,
                                                        padding: "9px 15px",
                                                        borderRadius: 10,
                                                        border: isDone
                                                          ? `1.5px solid ${T.green}`
                                                          : "none",
                                                        cursor: "pointer",
                                                        fontSize: 12,
                                                        fontWeight: 700,
                                                        background: isDone
                                                          ? "#fff"
                                                          : T.green,
                                                        color: isDone
                                                          ? T.green
                                                          : "#fff",
                                                        boxShadow: isDone
                                                          ? "none"
                                                          : "0 3px 10px rgba(22,163,74,0.28)",
                                                        transition: "all 0.15s",
                                                        whiteSpace: "nowrap",
                                                      }}
                                                    >
                                                      <PlayCircle size={14} />
                                                      {isDone
                                                        ? "Review"
                                                        : "Teach"}
                                                    </button>
                                                  </div>
                                                );
                                              },
                                            )
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ════════════════════════════════════════════════════════════
          MODAL 1 — TEACHING VIEWER (bottom sheet)
      ════════════════════════════════════════════════════════════ */}
      {teachingLesson &&
        (() => {
          const { activeTab, lesson, habit, cls } = teachingLesson;
          const activeUrl =
            activeTab === "material"
              ? lesson.pdf_url
              : lesson.teacher_guide_url;
          return (
            <div
              onClick={(e) => e.target === e.currentTarget && closeModal()}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 90,
                display: "flex",
                alignItems: "flex-end",
                background: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(6px)",
              }}
            >
              <div
                style={{
                  background: T.card,
                  width: "100%",
                  height: isFullscreen ? "100%" : "92dvh",
                  borderRadius: isFullscreen ? 0 : "26px 26px 0 0",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  boxShadow: "0 -8px 48px rgba(0,0,0,0.22)",
                  transition: "height 0.25s ease, border-radius 0.25s ease",
                }}
              >
                {!isFullscreen && (
                  <>
                    {/* Drag handle */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        paddingTop: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 4,
                          borderRadius: 2,
                          background: T.border,
                        }}
                      />
                    </div>

                    {/* Modal header */}
                    <div
                      style={{
                        display: "flex",
                        alignItems:
                          "flex-start" /* Changed from center so the X button stays at the top if text wraps */,
                        justifyContent: "space-between",
                        padding:
                          "16px 18px" /* Gave it a tiny bit more breathing room */,
                        borderBottom: `1px solid ${T.border}`,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Title */}
                        <p
                          style={{
                            fontSize: 18,
                            fontWeight: 800,
                            color: T.pri,
                            lineHeight: 1.2,
                          }}
                        >
                          {lesson.title}
                        </p>

                        {/* Metadata */}
                        <p
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: T.sec,
                            marginTop: 6,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                          }}
                        >
                          Class {cls.class_number}
                          {cls.section} · {habit.name}
                        </p>

                        {/* Description */}
                        {lesson.description && (
                          <p
                            style={{
                              fontSize: 14 /* Larger, readable size */,
                              color:
                                "#57534e" /* Slightly darker than T.sec for contrast */,
                              marginTop: 10 /* Distinct separation from metadata */,
                              lineHeight: 1.5 /* Better vertical spacing for wrapping text */,
                              fontWeight: 400 /* Normal weight */,
                              fontFamily:
                                "Georgia, serif" /* Changed font family for a distinct look */,
                              whiteSpace:
                                "normal" /* Ensures it wraps properly */,
                            }}
                          >
                            {lesson.description}
                          </p>
                        )}
                      </div>

                      {/* Close Button */}
                      <button
                        onClick={closeModal}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          border: "none",
                          background: "#f1f0ee",
                          cursor: "pointer",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginLeft: 14,
                        }}
                      >
                        <X size={18} style={{ color: T.sec }} />
                      </button>
                    </div>

                    {/* Tabs */}
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        padding: "10px 14px",
                        background: T.bg,
                        borderBottom: `1px solid ${T.border}`,
                        overflowX: "auto",
                      }}
                    >
                      {lesson.pdf_url && (
                        <button
                          onClick={() =>
                            setTeachingLesson({
                              ...teachingLesson,
                              activeTab: "material",
                            })
                          }
                          style={{
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "9px 16px",
                            borderRadius: 10,
                            border: "none",
                            cursor: "pointer",
                            fontSize: 13,
                            fontWeight: 700,
                            transition: "all 0.15s",
                            background:
                              activeTab === "material" ? T.blue : T.card,
                            color: activeTab === "material" ? "#fff" : T.sec,
                            boxShadow:
                              activeTab === "material"
                                ? "none"
                                : `0 0 0 1px ${T.border}`,
                          }}
                        >
                          <FileText size={14} /> Student Material
                        </button>
                      )}
                      {lesson.teacher_guide_url && (
                        <button
                          onClick={() =>
                            setTeachingLesson({
                              ...teachingLesson,
                              activeTab: "guide",
                            })
                          }
                          style={{
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "9px 16px",
                            borderRadius: 10,
                            border: "none",
                            cursor: "pointer",
                            fontSize: 13,
                            fontWeight: 700,
                            transition: "all 0.15s",
                            background:
                              activeTab === "guide" ? T.orange : T.card,
                            color: activeTab === "guide" ? "#fff" : T.sec,
                            boxShadow:
                              activeTab === "guide"
                                ? "none"
                                : `0 0 0 1px ${T.border}`,
                          }}
                        >
                          <BookOpen size={14} /> Teacher Guide
                        </button>
                      )}
                      {!lesson.pdf_url && !lesson.teacher_guide_url && (
                        <p
                          style={{
                            fontSize: 13,
                            color: T.hint,
                            padding: "9px 4px",
                          }}
                        >
                          No materials attached
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* PDF viewer */}
                {activeTab && activeUrl && (
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      background: "#2d2d2d",
                      ...(isFullscreen
                        ? { position: "fixed", inset: 0, zIndex: 100 }
                        : {}),
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 14px",
                        background: "#1e1e1e",
                        borderBottom: "1px solid #444",
                      }}
                    >
                      <a
                        href={getFileUrl(activeUrl)}
                        download
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "7px 14px",
                          borderRadius: 8,
                          background: "#3a3a3a",
                          color: "#ccc",
                          textDecoration: "none",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        <Download size={14} /> Download
                      </a>
                      <button
                        onClick={() => setIsFullscreen((f) => !f)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "7px 14px",
                          borderRadius: 8,
                          border: "none",
                          background: T.blue,
                          color: "#fff",
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {isFullscreen ? (
                          <>
                            <Minimize2 size={14} /> Exit
                          </>
                        ) : (
                          <>
                            <Maximize2 size={14} /> Fullscreen
                          </>
                        )}
                      </button>
                    </div>
                    <div
                      style={{
                        flex: 1,
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <iframe
                        src={`https://docs.google.com/viewer?url=${encodeURIComponent(getFileUrl(activeUrl))}&embedded=true`}
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          border: "none",
                        }}
                        title="Document Viewer"
                      />
                    </div>
                  </div>
                )}

                {/* Bottom actions */}
                {!isFullscreen && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                      padding: "14px 16px 28px",
                      background: T.card,
                      borderTop: `1px solid ${T.border}`,
                      boxShadow: "0 -4px 24px rgba(0,0,0,0.07)",
                    }}
                  >
                    <button
                      onClick={handleMarkComplete}
                      disabled={isSubmitting}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        padding: "14px",
                        borderRadius: 14,
                        border: `1.5px solid ${T.greenLt}`,
                        background: T.greenBg,
                        color: T.green,
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: "pointer",
                        opacity: isSubmitting ? 0.5 : 1,
                        transition: "all 0.15s",
                      }}
                    >
                      {isSubmitting ? (
                        <Loader2
                          size={18}
                          style={{ animation: "spin 1s linear infinite" }}
                        />
                      ) : (
                        <CheckCircle size={18} />
                      )}
                      Mark Complete
                    </button>
                    <button
                      onClick={handleOpenFeedback}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        padding: "14px",
                        borderRadius: 14,
                        border: "none",
                        background: T.green,
                        color: "#fff",
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "0 4px 16px rgba(22,163,74,0.32)",
                      }}
                    >
                      <ClipboardList size={18} /> Feedback
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

      {/* ════════════════════════════════════════════════════════════
          MODAL 2 — FEEDBACK (bottom sheet)
      ════════════════════════════════════════════════════════════ */}
      {feedbackLesson && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "flex-end",
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(6px)",
          }}
        >
          <div
            style={{
              background: T.card,
              width: "100%",
              height: "92dvh",
              borderRadius: "26px 26px 0 0",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 -8px 48px rgba(0,0,0,0.22)",
              maxWidth: 680,
              margin: "0 auto",
            }}
          >
            {/* Handle */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                paddingTop: 10,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 4,
                  borderRadius: 2,
                  background: T.border,
                }}
              />
            </div>

            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 18px 14px",
                borderBottom: `1px solid ${T.border}`,
              }}
            >
              <div>
                <p style={{ fontSize: 17, fontWeight: 800, color: T.pri }}>
                  Lesson Feedback
                </p>
                <p style={{ fontSize: 12, color: T.sec, marginTop: 2 }}>
                  {feedbackLesson.lesson.title} · Class{" "}
                  {feedbackLesson.cls.class_number}
                  {feedbackLesson.cls.section}
                </p>
              </div>
              <button
                onClick={closeModal}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  border: "none",
                  background: "#f1f0ee",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={18} style={{ color: T.sec }} />
              </button>
            </div>

            {/* Questions scroll */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "14px 16px 8px",
                background: T.bg,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {isSubmitting && questions.length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: 40,
                  }}
                >
                  <Loader2
                    size={32}
                    style={{
                      color: T.green,
                      animation: "spin 1s linear infinite",
                    }}
                  />
                </div>
              ) : questions.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: 40,
                    color: T.hint,
                    fontSize: 14,
                  }}
                >
                  No feedback questions available
                </div>
              ) : (
                questions.map((q, idx) => (
                  <div
                    key={q.id}
                    style={{
                      background: T.card,
                      borderRadius: 18,
                      border: `1px solid ${T.border}`,
                      padding: "18px 16px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: T.pri,
                        marginBottom: 14,
                        lineHeight: 1.45,
                      }}
                    >
                      Q{idx + 1}.{" "}
                      <span style={{ fontWeight: 600 }}>{q.question_text}</span>
                      {q.is_optional === 1 && (
                        <span
                          style={{
                            marginLeft: 8,
                            fontSize: 10,
                            fontWeight: 700,
                            color: T.hint,
                            background: "#f1f0ee",
                            padding: "2px 8px",
                            borderRadius: 99,
                            textTransform: "uppercase",
                          }}
                        >
                          Optional
                        </span>
                      )}
                    </p>
                    {q.question_type === "text" ? (
                      <textarea
                        rows={3}
                        value={answers[q.id] || ""}
                        onChange={(e) =>
                          setAnswers((p) => ({ ...p, [q.id]: e.target.value }))
                        }
                        placeholder="Type your answer…"
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          borderRadius: 12,
                          border: `1.5px solid ${answers[q.id] ? T.green : T.border}`,
                          background: T.bg,
                          fontSize: 14,
                          color: T.pri,
                          outline: "none",
                          resize: "none",
                          fontFamily: "inherit",
                          transition: "border-color 0.15s",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        {(Array.isArray(q.options)
                          ? q.options
                          : JSON.parse(q.options || "[]")
                        ).map((opt) => {
                          const sel = answers[q.id] === opt;
                          return (
                            <label
                              key={opt}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                padding: "13px 14px",
                                borderRadius: 12,
                                cursor: "pointer",
                                border: `1.5px solid ${sel ? T.green : T.border}`,
                                background: sel ? T.greenBg : T.card,
                                transition: "all 0.15s",
                              }}
                            >
                              {/* Custom radio */}
                              <div
                                style={{
                                  width: 20,
                                  height: 20,
                                  borderRadius: 10,
                                  flexShrink: 0,
                                  border: `2px solid ${sel ? T.green : T.border}`,
                                  background: sel ? T.green : "transparent",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                {sel && (
                                  <div
                                    style={{
                                      width: 7,
                                      height: 7,
                                      borderRadius: 4,
                                      background: "#fff",
                                    }}
                                  />
                                )}
                              </div>
                              <input
                                type="radio"
                                name={`q-${q.id}`}
                                value={opt}
                                checked={sel}
                                onChange={() =>
                                  setAnswers((p) => ({ ...p, [q.id]: opt }))
                                }
                                style={{ display: "none" }}
                              />
                              <span
                                style={{
                                  fontSize: 14,
                                  fontWeight: sel ? 700 : 500,
                                  color: sel ? T.green : T.pri,
                                }}
                              >
                                {opt}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Submit */}
            <div
              style={{
                padding: "14px 16px 28px",
                background: T.card,
                borderTop: `1px solid ${T.border}`,
                boxShadow: "0 -4px 24px rgba(0,0,0,0.07)",
              }}
            >
              <button
                onClick={handleSubmitFeedback}
                disabled={isSubmitting || questions.length === 0}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  padding: "16px",
                  borderRadius: 16,
                  border: "none",
                  cursor: "pointer",
                  background: T.green,
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: 800,
                  boxShadow: "0 5px 20px rgba(22,163,74,0.35)",
                  opacity: isSubmitting || questions.length === 0 ? 0.5 : 1,
                  transition: "all 0.15s",
                }}
              >
                {isSubmitting ? (
                  <Loader2
                    size={20}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                ) : (
                  <Sparkles size={20} />
                )}
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
