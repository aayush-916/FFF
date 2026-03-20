import { useState, useEffect, useMemo } from 'react';
import {
  BookOpen, Loader2, AlertCircle, Calendar,
  TrendingUp, CheckCircle, ChevronDown, ChevronRight,
  BarChart2, Layers, Sparkles, Award, History,
  GraduationCap, Circle,
} from 'lucide-react';
import api from '../../services/api';

/* ─── Design tokens ─────────────────────────────────────────────────── */
const T = {
  bg:       '#f7f4ef',
  card:     '#ffffff',
  border:   '#ede9e1',
  pri:      '#1c1917',
  sec:      '#78716c',
  hint:     '#a8a29e',
  green:    '#16a34a',
  greenBg:  '#dcfce7',
  greenLt:  '#bbf7d0',
  orange:   '#ea580c',
  orangeBg: '#ffedd5',
  blue:     '#2563eb',
  blueBg:   '#dbeafe',
  purple:   '#7c3aed',
  purpleBg: '#ede9fe',
};

const SEC_PAL = {
  A: { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' },
  B: { bg: '#dbeafe', color: '#1d4ed8', border: '#bfdbfe' },
  C: { bg: '#fce7f3', color: '#be185d', border: '#fbcfe8' },
  D: { bg: '#fef3c7', color: '#b45309', border: '#fde68a' },
  E: { bg: '#ede9fe', color: '#6d28d9', border: '#ddd6fe' },
};
const secPal = (s) => SEC_PAL[s?.toUpperCase?.()] || { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };

/* ─── Atoms ─────────────────────────────────────────────────────────── */
const Ring = ({ pct = 0, color = T.green, size = 72, stroke = 7 }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const d = (c * Math.min(pct, 100)) / 100;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.border} strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={pct > 0 ? color : T.border} strokeWidth={stroke}
        strokeDasharray={`${d} ${c - d}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dasharray 0.5s ease' }} />
      <text x={size/2} y={size/2 + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize={size < 56 ? 11 : 14} fontWeight="800"
        fill={pct > 0 ? color : T.hint}>{pct}%</text>
    </svg>
  );
};

const Bar = ({ pct = 0, color = T.green, h = 5 }) => (
  <div style={{ height: h, background: T.border, borderRadius: h, overflow: 'hidden', flex: 1 }}>
    <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: color,
      borderRadius: h, transition: 'width 0.5s ease' }} />
  </div>
);

const HeatCell = ({ pct }) => {
  const cfg =
    pct === 0 ? { bg: '#f1f0ee', color: T.hint } :
    pct < 25  ? { bg: '#ffedd5', color: T.orange } :
    pct < 50  ? { bg: '#fef3c7', color: '#b45309' } :
    pct < 75  ? { bg: T.greenBg, color: '#15803d' } :
                { bg: T.greenLt, color: '#14532d' };
  return (
    <div style={{ width: 34, height: 28, borderRadius: 7, background: cfg.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 9, fontWeight: 700, color: cfg.color, flexShrink: 0 }}>
      {pct}%
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════ */
const SessionHistory = () => {
  const [dashData, setDashData]         = useState(null);
  const [sessions, setSessions]         = useState([]);
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [activeTab, setActiveTab]       = useState('overview');
  const [expandedClass, setExpandedClass] = useState(null);   // classes tab
  const [expandedOvClass, setExpandedOvClass] = useState(null); // overview tab

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, sessRes, clsRes] = await Promise.all([
          api.get('/dashboard/teacher'),
          api.get('/sessions'),
          api.get('/teacher/classes'),
        ]);
        setDashData(dashRes.data.data || dashRes.data);
        setSessions(sessRes.data.data || sessRes.data || []);
        setAssignedClasses(clsRes.data.data || clsRes.data || []);
      } catch (err) {
        console.error('Failed to load report:', err);
        setError('Unable to load progress report. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ── Derived data ── */
  const allSections = useMemo(() => dashData?.classes || [], [dashData]);

  // Map class_number+section → section data from dashboard
  const sectionMap = useMemo(() => {
    const m = {};
    allSections.forEach(s => { m[`${s.class_number}-${s.section}`] = s; });
    return m;
  }, [allSections]);

  // Group dashboard sections by class_number
  const groupedClasses = useMemo(() =>
    allSections.reduce((acc, cls) => {
      (acc[cls.class_number] = acc[cls.class_number] || []).push(cls);
      return acc;
    }, {}), [allSections]);

  const classNumbers = useMemo(() =>
    Object.keys(groupedClasses).map(Number).sort((a, b) => a - b),
  [groupedClasses]);

  // Group assigned classes (from /teacher/classes) by class_number
  const assignedGrouped = useMemo(() =>
    assignedClasses.reduce((acc, c) => {
      (acc[c.class_number] = acc[c.class_number] || []).push(c);
      return acc;
    }, {}), [assignedClasses]);

  const assignedClassNumbers = useMemo(() =>
    Object.keys(assignedGrouped).map(Number).sort((a, b) => a - b),
  [assignedGrouped]);

  // Overall completion: habits done vs total habits (sections × habits_per_section)
  const overallStats = useMemo(() => {
    let habDone = 0, habTotal = 0, lessonsDone = 0, lessonsTotal = 0;

    assignedClasses.forEach(({ class_number, section }) => {
      const sec = sectionMap[`${class_number}-${section}`];
      if (sec) {
        habDone      += sec.habits_completed  || 0;
        habTotal     += sec.habits_total      || 0;
        lessonsDone  += sec.lessons_completed || 0;
        lessonsTotal += sec.lessons_total     || 0;
      } else {
        // Section exists in assignment but no dashboard data yet — count total from first known section
        const anySec = allSections.find(s => s.class_number === class_number);
        habTotal += anySec?.habits_total || 0;
      }
    });

    return {
      pct:      habTotal ? Math.round((habDone / habTotal) * 100) : 0,
      habits:   { done: habDone, total: habTotal },
      lessons:  { done: lessonsDone, total: lessonsTotal },
      sections: assignedClasses.length,
      classes:  assignedClassNumbers.length,
    };
  }, [assignedClasses, sectionMap, allSections, assignedClassNumbers]);

  /* ── Loading skeleton ── */
  if (loading) return (
    <div style={{ background: T.bg, minHeight: '100vh' }}>
      <div style={{ background: '#fff', padding: '18px 18px 14px',
        borderBottom: `1px solid ${T.border}` }}>
        <div style={{ height: 22, width: 160, background: T.border, borderRadius: 8, marginBottom: 6 }} />
        <div style={{ height: 13, width: 220, background: T.border, borderRadius: 6 }} />
      </div>
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ height: 90, background: T.card,
            borderRadius: 18, border: `1px solid ${T.border}` }} />
        ))}
      </div>
    </div>
  );

  if (error) return (
    <div style={{ margin: 16, padding: '16px 20px', borderRadius: 16,
      background: '#fef2f2', border: '1px solid #fecaca',
      display: 'flex', alignItems: 'center', gap: 12 }}>
      <AlertCircle size={20} style={{ color: '#dc2626', flexShrink: 0 }} />
      <p style={{ color: '#991b1b', fontSize: 14 }}>{error}</p>
    </div>
  );

  const TABS = [
    { id: 'overview', label: 'Overview', icon: <TrendingUp size={15} /> },
    { id: 'classes',  label: 'By Class',  icon: <Layers size={15} /> },
    { id: 'history',  label: 'History',   icon: <History size={15} /> },
  ];

  /* ══════════════════════════════════════════════════════════════════ */
  return (
    <div style={{ background: T.bg, minHeight: '100vh' }}>

      {/* ── Sticky header ── */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${T.border}`,
        padding: '18px 18px 0', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 15, flexShrink: 0,
              background: 'linear-gradient(135deg,#fecaca,#fef3c7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart2 size={22} style={{ color: T.orange }} />
            </div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 800, color: T.pri, lineHeight: 1.2 }}>
                Progress Report
              </h1>
              <p style={{ fontSize: 12, color: T.sec, marginTop: 2 }}>
                {overallStats.classes} class{overallStats.classes !== 1 ? 'es' : ''} ·{' '}
                {overallStats.sections} section{overallStats.sections !== 1 ? 's' : ''} assigned
              </p>
            </div>
          </div>
          <div style={{ display: 'flex' }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 6, padding: '10px 4px 11px',
                border: 'none',
                borderBottom: `2.5px solid ${activeTab === tab.id ? T.orange : 'transparent'}`,
                background: 'transparent', cursor: 'pointer',
                color: activeTab === tab.id ? T.orange : T.hint,
                fontSize: 13, fontWeight: activeTab === tab.id ? 700 : 500,
                transition: 'all 0.15s',
              }}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Page content ── */}
      <div style={{ padding: '14px 14px 80px', maxWidth: 680, margin: '0 auto',
        display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* ══════════════════════════════════════════
            OVERVIEW TAB
        ══════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <>
            {/* ── Overall completion hero card ── */}
            <div style={{ background: T.card, borderRadius: 22,
              border: `1px solid ${T.border}`, overflow: 'hidden',
              boxShadow: '0 4px 24px rgba(22,163,74,0.08)' }}>

              {/* Top gradient band */}
              <div style={{ background: 'linear-gradient(135deg,#f0fdf4 0%,#dcfce7 60%,#bbf7d0 100%)',
                padding: '20px 20px 18px', borderBottom: `1px solid ${T.greenLt}`,
                display: 'flex', alignItems: 'center', gap: 20 }}>
                <Ring pct={overallStats.pct} color={T.green} size={96} stroke={10} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: T.greenBg, borderRadius: 99, padding: '3px 10px', marginBottom: 8 }}>
                    <Sparkles size={11} style={{ color: T.green }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: T.green }}>
                      Overall Progress
                    </span>
                  </div>
                  <p style={{ fontSize: 30, fontWeight: 900, color: T.pri, lineHeight: 1 }}>
                    {overallStats.habits.done}
                    <span style={{ fontSize: 17, fontWeight: 600, color: T.sec }}>
                      /{overallStats.habits.total}
                    </span>
                  </p>
                  <p style={{ fontSize: 13, color: T.sec, marginTop: 4, fontWeight: 500 }}>
                    habits completed
                  </p>
                  <div style={{ marginTop: 10 }}>
                    <Bar pct={overallStats.pct} color={T.green} h={6} />
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
                {[
                  { label: 'Classes',   value: overallStats.classes,        color: T.blue   },
                  { label: 'Sections',  value: overallStats.sections,       color: T.purple },
                  { label: 'Lessons',   value: overallStats.lessons.done,   color: T.orange },
                ].map((s, i) => (
                  <div key={i} style={{ padding: '14px 0', textAlign: 'center',
                    borderRight: i < 2 ? `1px solid ${T.border}` : 'none' }}>
                    <p style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</p>
                    <p style={{ fontSize: 11, color: T.hint, marginTop: 2 }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Assigned classes ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8,
              padding: '4px 2px 0' }}>
              <GraduationCap size={15} style={{ color: T.hint }} />
              <p style={{ fontSize: 11, fontWeight: 700, color: T.hint,
                textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Assigned classes
              </p>
            </div>

            {assignedClassNumbers.length === 0 ? (
              <div style={{ background: T.card, borderRadius: 20,
                border: `1px solid ${T.border}`, padding: '32px 20px', textAlign: 'center' }}>
                <p style={{ fontSize: 14, color: T.hint }}>No classes assigned yet</p>
              </div>
            ) : assignedClassNumbers.map(cn => {
              const assignedSecs = assignedGrouped[cn] || [];
              const isOpen       = expandedOvClass === cn;

              // Aggregate stats for this class from dashboard data
              const classDone  = assignedSecs.reduce((a, { section }) =>
                a + (sectionMap[`${cn}-${section}`]?.habits_completed  || 0), 0);
              const classTotal = assignedSecs.reduce((a, { section }) =>
                a + (sectionMap[`${cn}-${section}`]?.habits_total      || 0), 0);
              const classPct   = classTotal ? Math.round((classDone / classTotal) * 100) : 0;
              const col        = classPct >= 75 ? T.green : classPct >= 40 ? T.orange : T.hint;

              return (
                <div key={cn} style={{ background: T.card, borderRadius: 20,
                  border: `1.5px solid ${isOpen ? T.greenLt : T.border}`, overflow: 'hidden',
                  boxShadow: isOpen ? '0 6px 24px rgba(22,163,74,0.09)' : '0 1px 4px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s ease' }}>

                  {/* Class row */}
                  <button
                    onClick={() => setExpandedOvClass(p => p === cn ? null : cn)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', padding: '16px 18px',
                      background: isOpen ? 'linear-gradient(135deg,#f0fdf4,#dcfce7)' : 'transparent',
                      border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s' }}>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      {/* Class badge */}
                      <div style={{ width: 54, height: 54, borderRadius: 18, flexShrink: 0,
                        background: isOpen ? T.green : '#f1f0ee',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', transition: 'all 0.22s' }}>
                        <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: '0.08em',
                          color: isOpen ? T.greenLt : T.hint, lineHeight: 1 }}>CLASS</span>
                        <span style={{ fontSize: 23, fontWeight: 900,
                          color: isOpen ? '#fff' : T.pri, lineHeight: 1.1 }}>{cn}</span>
                      </div>
                      <div>
                        <p style={{ fontSize: 16, fontWeight: 800, color: T.pri }}>Class {cn}</p>
                        {/* Section chips */}
                        <div style={{ display: 'flex', gap: 5, marginTop: 5, flexWrap: 'wrap' }}>
                          {assignedSecs.map(({ section }, si) => {
                            const sp  = secPal(section);
                            const sec = sectionMap[`${cn}-${section}`];
                            const sp2 = sec ? (sec.progress_percentage ?? 0) : 0;
                            return (
                              <span key={si} style={{ fontSize: 10, fontWeight: 700,
                                padding: '2px 8px', borderRadius: 99,
                                background: sp.bg, color: sp.color,
                                border: `1px solid ${sp.border}` }}>
                                {section} · {sp2}%
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <Ring pct={classPct} color={col} size={46} stroke={5} />
                      {isOpen
                        ? <ChevronDown  size={18} style={{ color: T.green }} />
                        : <ChevronRight size={18} style={{ color: T.hint }} />}
                    </div>
                  </button>

                  {/* Expanded: habits & lessons per section */}
                  {isOpen && (
                    <div style={{ borderTop: `1px solid ${T.border}` }}>
                      {assignedSecs.map(({ section }, si) => {
                        const sp      = secPal(section);
                        const sec     = sectionMap[`${cn}-${section}`];
                        const sPct    = sec?.progress_percentage ?? 0;
                        const habits  = sec?.habits || [];
                        const hDone   = sec?.habits_completed  || 0;
                        const hTotal  = sec?.habits_total      || 0;
                        const lDone   = sec?.lessons_completed || 0;
                        const lTotal  = sec?.lessons_total     || 0;

                        return (
                          <div key={si} style={{
                            borderBottom: si < assignedSecs.length - 1 ? `1px solid ${T.border}` : 'none',
                          }}>
                            {/* Section header */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12,
                              padding: '14px 18px 10px' }}>
                              <div style={{ width: 42, height: 42, borderRadius: 13, flexShrink: 0,
                                background: sp.bg, display: 'flex', alignItems: 'center',
                                justifyContent: 'center', fontSize: 20, fontWeight: 800, color: sp.color }}>
                                {section}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between',
                                  alignItems: 'center', marginBottom: 6 }}>
                                  <p style={{ fontSize: 14, fontWeight: 700, color: T.pri }}>
                                    Section {section}
                                  </p>
                                  <span style={{ fontSize: 13, fontWeight: 800, color: sp.color }}>
                                    {sPct}%
                                  </span>
                                </div>
                                <Bar pct={sPct} color={sp.color} h={4} />
                                {/* Quick stats */}
                                <div style={{ display: 'flex', gap: 12, marginTop: 7 }}>
                                  <span style={{ fontSize: 11, color: T.sec }}>
                                    <span style={{ fontWeight: 700, color: T.green }}>{hDone}</span>
                                    /{hTotal} habits
                                  </span>
                                  <span style={{ fontSize: 11, color: T.sec }}>
                                    <span style={{ fontWeight: 700, color: T.orange }}>{lDone}</span>
                                    /{lTotal} lessons
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Habit rows */}
                            {habits.length > 0 && (
                              <div style={{ padding: '0 18px 14px',
                                display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {habits.map((habit, hi) => {
                                  const lc   = habit.lessons_completed || 0;
                                  const lt   = habit.lessons_total     || habit.lessons?.length || 0;
                                  const hp   = lt ? Math.round((lc / lt) * 100) : 0;
                                  const done = lt > 0 && lc === lt;
                                  const hCol = done ? T.green : lc > 0 ? T.orange : T.hint;

                                  return (
                                    <div key={hi} style={{ background: done ? T.greenBg : T.bg,
                                      borderRadius: 14,
                                      border: `1px solid ${done ? T.greenLt : T.border}`,
                                      padding: '11px 14px' }}>
                                      <div style={{ display: 'flex', alignItems: 'center',
                                        gap: 10, marginBottom: lt > 0 ? 8 : 0 }}>
                                        {/* Habit badge */}
                                        <div style={{ width: 30, height: 30, borderRadius: 9,
                                          flexShrink: 0,
                                          background: done ? T.greenLt : '#ebe9e4',
                                          display: 'flex', alignItems: 'center',
                                          justifyContent: 'center' }}>
                                          {done
                                            ? <CheckCircle size={15} style={{ color: T.green }} />
                                            : <span style={{ fontSize: 10, fontWeight: 800,
                                                color: T.sec }}>H{hi + 1}</span>}
                                        </div>
                                        <p style={{ fontSize: 13, fontWeight: 600, flex: 1,
                                          color: done ? T.sec : T.pri,
                                          textDecoration: done ? 'line-through' : 'none',
                                          overflow: 'hidden', textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap' }}>
                                          {habit.name}
                                        </p>
                                        {/* Lesson count pill */}
                                        <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700,
                                          padding: '2px 9px', borderRadius: 99,
                                          background: done ? T.greenLt
                                            : lc > 0 ? T.orangeBg : '#ebe9e4',
                                          color: hCol }}>
                                          {lc}/{lt}
                                        </span>
                                      </div>

                                      {/* Lesson progress dots */}
                                      {lt > 0 && (
                                        <div style={{ display: 'flex', gap: 5, paddingLeft: 40 }}>
                                          {(habit.lessons || Array.from({ length: lt }))
                                            .map((lesson, li) => {
                                              const isDone = lesson
                                                ? lesson.status === 'completed'
                                                : li < lc;
                                              return (
                                                <div key={li} style={{
                                                  width: 26, height: 26, borderRadius: 50,
                                                  border: `1.5px solid ${isDone ? T.green : T.border}`,
                                                  background: isDone ? T.green : T.card,
                                                  display: 'flex', alignItems: 'center',
                                                  justifyContent: 'center', flexShrink: 0,
                                                }}>
                                                  {isDone
                                                    ? <CheckCircle size={12} style={{ color: '#fff' }} />
                                                    : <span style={{ fontSize: 9, fontWeight: 700,
                                                        color: T.hint }}>{li + 1}</span>}
                                                </div>
                                              );
                                            })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {/* ══════════════════════════════════════════
            BY CLASS TAB
        ══════════════════════════════════════════ */}
        {activeTab === 'classes' && (
          <>
            {classNumbers.map(cn => {
              const secs   = groupedClasses[cn] || [];
              const done   = secs.reduce((a, s) => a + (s.lessons_completed || 0), 0);
              const total  = secs.reduce((a, s) => a + (s.lessons_total     || 0), 0);
              const pct    = total ? Math.round((done / total) * 100) : 0;
              const isOpen = expandedClass === cn;
              const col    = pct >= 75 ? T.green : pct >= 40 ? T.orange : '#e11d48';

              return (
                <div key={cn} style={{ background: T.card, borderRadius: 22,
                  border: `1.5px solid ${isOpen ? T.greenLt : T.border}`, overflow: 'hidden',
                  boxShadow: isOpen ? '0 6px 24px rgba(22,163,74,0.09)' : '0 1px 4px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s ease' }}>

                  <button onClick={() => setExpandedClass(p => p === cn ? null : cn)} style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', padding: '16px 18px',
                    background: isOpen ? 'linear-gradient(135deg,#f0fdf4,#dcfce7)' : 'transparent',
                    border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 52, height: 52, borderRadius: 18, flexShrink: 0,
                        background: isOpen ? T.green : '#f1f0ee',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                        <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: '0.08em',
                          color: isOpen ? T.greenLt : T.hint, lineHeight: 1 }}>CLASS</span>
                        <span style={{ fontSize: 22, fontWeight: 900,
                          color: isOpen ? '#fff' : T.pri, lineHeight: 1.1 }}>{cn}</span>
                      </div>
                      <div>
                        <p style={{ fontSize: 17, fontWeight: 800, color: T.pri }}>Class {cn}</p>
                        <p style={{ fontSize: 12, color: T.sec, marginTop: 3 }}>
                          {secs.length} section{secs.length !== 1 ? 's' : ''} · {done}/{total} lessons
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {/* <Ring pct={pct} color={col} size={46} stroke={5} /> */}
                      {isOpen
                        ? <ChevronDown  size={18} style={{ color: T.green }} />
                        : <ChevronRight size={18} style={{ color: T.hint }} />}
                    </div>
                  </button>

                  {isOpen && (
                    <div style={{ padding: '0 14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {/* Section tiles */}
                      <div style={{ display: 'flex', gap: 8 }}>
                        {secs.map((sec, si) => {
                          const sp   = secPal(sec.section);
                          const sPct = sec.progress_percentage ?? 0;
                          return (
                            <div key={si} style={{ flex: 1, background: sp.bg,
                              borderRadius: 16, padding: '14px 10px', textAlign: 'center' }}>
                              <p style={{ fontSize: 26, fontWeight: 900, color: sp.color }}>{sec.section}</p>
                              <p style={{ fontSize: 18, fontWeight: 800, color: sp.color, marginTop: 4 }}>{sPct}%</p>
                              <p style={{ fontSize: 10, color: sp.color, opacity: 0.75, marginTop: 3 }}>
                                {sec.lessons_completed || 0}/{sec.lessons_total || 0} lessons
                              </p>
                              <div style={{ marginTop: 8 }}><Bar pct={sPct} color={sp.color} h={3} /></div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Habit heatmap */}
                      {secs.some(s => (s.habits || []).length > 0) && (
                        <div style={{ background: T.bg, borderRadius: 14, padding: '12px 14px' }}>
                          <p style={{ fontSize: 11, fontWeight: 700, color: T.hint,
                            textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                            Habit progress per section
                          </p>
                          {(() => {
                            const maxH = Math.max(...secs.map(s => (s.habits || []).length));
                            return (
                              <>
                                <div style={{ display: 'flex', gap: 4, marginBottom: 6, paddingLeft: 28 }}>
                                  {Array.from({ length: maxH }, (_, i) => (
                                    <div key={i} style={{ width: 34, textAlign: 'center',
                                      fontSize: 9, fontWeight: 700, color: T.hint, flexShrink: 0 }}>
                                      H{i + 1}
                                    </div>
                                  ))}
                                </div>
                                {secs.map((sec, si) => {
                                  const habits = sec.habits || [];
                                  if (!habits.length) return null;
                                  return (
                                    <div key={si} style={{ display: 'flex', alignItems: 'center',
                                      gap: 8, marginBottom: si < secs.length - 1 ? 6 : 0 }}>
                                      <span style={{ fontSize: 12, fontWeight: 700,
                                        color: secPal(sec.section).color, minWidth: 20 }}>
                                        {sec.section}
                                      </span>
                                      <div style={{ display: 'flex', gap: 4 }}>
                                        {habits.map((h, hi) => {
                                          const hp = (h.lessons_total || 0)
                                            ? Math.round(((h.lessons_completed || 0) / h.lessons_total) * 100)
                                            : 0;
                                          return <HeatCell key={hi} pct={hp} />;
                                        })}
                                      </div>
                                    </div>
                                  );
                                })}
                              </>
                            );
                          })()}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5,
                            marginTop: 12, justifyContent: 'flex-end' }}>
                            <span style={{ fontSize: 10, color: T.hint }}>0%</span>
                            {['#ffedd5', '#fef3c7', T.greenBg, T.greenLt].map((bg, i) => (
                              <div key={i} style={{ width: 14, height: 14, borderRadius: 4, background: bg }} />
                            ))}
                            <span style={{ fontSize: 10, color: T.hint }}>100%</span>
                          </div>
                        </div>
                      )}

                      {/* Section detail rows */}
                      <div style={{ background: T.card, borderRadius: 14,
                        border: `1px solid ${T.border}`, overflow: 'hidden' }}>
                        {secs.map((sec, si) => {
                          const sp   = secPal(sec.section);
                          const sPct = sec.progress_percentage ?? 0;
                          return (
                            <div key={si} style={{ display: 'flex', alignItems: 'center', gap: 12,
                              padding: '12px 16px',
                              borderBottom: si < secs.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                              <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                                background: sp.bg, display: 'flex', alignItems: 'center',
                                justifyContent: 'center', fontSize: 18, fontWeight: 800, color: sp.color }}>
                                {sec.section}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                  <p style={{ fontSize: 13, fontWeight: 700, color: T.pri }}>
                                    Section {sec.section}
                                  </p>
                                  <span style={{ fontSize: 12, fontWeight: 800, color: sp.color }}>
                                    {sPct}%
                                  </span>
                                </div>
                                <Bar pct={sPct} color={sp.color} h={4} />
                                <p style={{ fontSize: 10, color: T.hint, marginTop: 4 }}>
                                  {sec.habits_completed || 0}/{sec.habits_total || 0} habits ·{' '}
                                  {sec.lessons_completed || 0}/{sec.lessons_total || 0} lessons
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {/* ══════════════════════════════════════════
            HISTORY TAB
        ══════════════════════════════════════════ */}
        {activeTab === 'history' && (
          <>
            <div style={{ background: 'linear-gradient(135deg,#fff7ed,#ffedd5)',
              borderRadius: 22, padding: '16px 20px',
              border: `1px solid ${T.orange}33`,
              display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: T.orangeBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Award size={26} style={{ color: T.orange }} />
              </div>
              <div>
                <p style={{ fontSize: 24, fontWeight: 900, color: T.orange }}>{sessions.length}</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: T.pri }}>Total lessons taught</p>
                <p style={{ fontSize: 11, color: T.sec, marginTop: 2 }}>Your complete teaching history</p>
              </div>
            </div>

            {sessions.length === 0 ? (
              <div style={{ background: T.card, borderRadius: 22, border: `1px solid ${T.border}`,
                padding: '40px 24px', textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: T.orangeBg,
                  margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={30} style={{ color: T.orange }} />
                </div>
                <p style={{ fontSize: 16, fontWeight: 800, color: T.pri, marginBottom: 6 }}>
                  No sessions yet
                </p>
                <p style={{ fontSize: 13, color: T.sec }}>
                  Teach your first lesson to see history here
                </p>
              </div>
            ) : sessions.map((s, i) => (
              <div key={s.id || i} style={{ background: T.card, borderRadius: 18,
                border: `1px solid ${T.border}`, overflow: 'hidden',
                boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                    background: T.orangeBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={20} style={{ color: T.orange }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: T.pri,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.lesson_title || s.lessonName || s.title || 'Lesson'}
                    </p>
                    <p style={{ fontSize: 12, color: T.sec, marginTop: 3 }}>
                      Class {s.class_number || s.classNumber} – Section {s.section}
                    </p>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
                      background: T.greenBg, borderRadius: 99, padding: '3px 10px' }}>
                      <CheckCircle size={11} style={{ color: T.green }} />
                      <span style={{ fontSize: 10, fontWeight: 700, color: T.green }}>Taught</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 16px', background: T.bg, borderTop: `1px solid ${T.border}` }}>
                  <Calendar size={13} style={{ color: T.hint }} />
                  <span style={{ fontSize: 12, color: T.sec, fontWeight: 500 }}>
                    {new Date(s.created_at || s.date || new Date())
                      .toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </>
        )}

      </div>
    </div>
  );
};

export default SessionHistory;