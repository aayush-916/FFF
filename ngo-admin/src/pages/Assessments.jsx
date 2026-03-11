import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter,
  HeartPulse,
  School as SchoolIcon,
  MapPin,
  Calendar,
  Award,
  BarChart3,
  ClipboardCheck
} from 'lucide-react';
import api from '../api/axios';

const Assessments = () => {
  // Data States
  const [assessments, setAssessments] = useState([]);
  const [schools, setSchools] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCluster, setFilterCluster] = useState('All');
  const [filterSchool, setFilterSchool] = useState('All');
  const [filterPhase, setFilterPhase] = useState('All');
  const [filterRecognition, setFilterRecognition] = useState('All');

  // Fetch Data
  useEffect(() => {
    const fetchBaseData = async () => {
      setLoading(true);
      try {
        const [assessmentsRes, schoolsRes, clustersRes] = await Promise.all([
          api.get('/assessments'),
          api.get('/schools'),
          api.get('/clusters')
        ]);
        
        setAssessments(assessmentsRes.data.data || assessmentsRes.data);
        setSchools(schoolsRes.data.data || schoolsRes.data);
        setClusters(clustersRes.data.data || clustersRes.data);
      } catch (error) {
        console.error('Failed to load assessment data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBaseData();
  }, []);

  // Handle Cascading Filter Changes
  const handleClusterChange = (e) => {
    setFilterCluster(e.target.value);
    setFilterSchool('All'); // Reset school when cluster changes
  };

  // Derived Filter Options (Cascading Dropdowns)
  const availableSchools = filterCluster === 'All' 
    ? schools 
    : schools.filter(s => s.cluster_id?.toString() === filterCluster);

  // Helper Functions to get names
  const getSchoolInfo = (schoolId) => {
    const school = schools.find(s => s.id === schoolId);
    if (!school) return { name: 'Unknown School', clusterId: null, clusterName: 'Unknown' };
    
    const cluster = clusters.find(c => c.id === school.cluster_id);
    return { 
      name: school.name, 
      clusterId: school.cluster_id, 
      clusterName: cluster ? cluster.name : 'Unassigned' 
    };
  };

  // Frontend Filtering Logic
  const processedAssessments = assessments.filter(assessment => {
    const schoolInfo = getSchoolInfo(assessment.school_id);
    
    // Search Query
    const matchesSearch = schoolInfo.name.toLowerCase().includes(searchQuery.toLowerCase());

    // Dropdown Filters
    const matchesCluster = filterCluster === 'All' || schoolInfo.clusterId?.toString() === filterCluster;
    const matchesSchool = filterSchool === 'All' || assessment.school_id?.toString() === filterSchool;
    const matchesPhase = filterPhase === 'All' || assessment.phase?.toLowerCase() === filterPhase.toLowerCase();
    const matchesRecognition = filterRecognition === 'All' || assessment.recognition_level?.toLowerCase() === filterRecognition.toLowerCase();

    return matchesSearch && matchesCluster && matchesSchool && matchesPhase && matchesRecognition;
  });

  // UI Formatters
  const formatRecognitionBadge = (level) => {
    const l = level?.toLowerCase();
    if (l === 'gold') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (l === 'silver') return 'bg-slate-100 text-slate-700 border-slate-300';
    if (l === 'bronze') return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-slate-50 text-slate-500 border-slate-200';
  };

  const formatPhaseBadge = (phase) => {
    const p = phase?.toLowerCase();
    if (p === 'baseline') return 'bg-blue-50 text-blue-700 border-blue-100';
    if (p === 'midline') return 'bg-purple-50 text-purple-700 border-purple-100';
    if (p === 'endline') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    return 'bg-slate-50 text-slate-600 border-slate-100';
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen bg-[#fafafa] text-slate-800 font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
              <HeartPulse size={14} /> Evaluation
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            Wellbeing Assessments
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Read-only view of structural assessments submitted by schools.</p>
        </div>
      </div>

      {/* MAIN CONTENT CARD */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        
        {/* Filters & Toolbar */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 space-y-4">
          
          <div className="flex flex-col xl:flex-row justify-between items-center gap-4">
            
            {/* Search */}
            <div className="relative w-full xl:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by school name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-full bg-white transition-shadow"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
              
              {/* Cluster Filter */}
              <div className="relative w-full sm:w-auto">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select 
                  value={filterCluster} onChange={handleClusterChange}
                  className="pl-9 pr-8 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full bg-white appearance-none font-medium text-slate-600 truncate"
                >
                  <option value="All">All Clusters</option>
                  {clusters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* School Filter */}
              <div className="relative w-full sm:w-auto">
                <SchoolIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select 
                  value={filterSchool} onChange={(e) => setFilterSchool(e.target.value)}
                  className="pl-9 pr-8 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full bg-white appearance-none font-medium text-slate-600 truncate"
                >
                  <option value="All">All Schools</option>
                  {availableSchools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              {/* Phase Filter */}
              <div className="relative w-full sm:w-auto">
                <BarChart3 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select 
                  value={filterPhase} onChange={(e) => setFilterPhase(e.target.value)}
                  className="pl-9 pr-8 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full bg-white appearance-none font-medium text-slate-600"
                >
                  <option value="All">All Phases</option>
                  <option value="baseline">Baseline</option>
                  <option value="midline">Midline</option>
                  <option value="endline">Endline</option>
                </select>
              </div>

              {/* Recognition Filter */}
              <div className="relative w-full sm:w-auto">
                <Award className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select 
                  value={filterRecognition} onChange={(e) => setFilterRecognition(e.target.value)}
                  className="pl-9 pr-8 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full bg-white appearance-none font-medium text-slate-600"
                >
                  <option value="All">All Tiers</option>
                  <option value="gold">Gold</option>
                  <option value="silver">Silver</option>
                  <option value="bronze">Bronze</option>
                </select>
              </div>

            </div>
          </div>
          <div className="bg-white inline-block px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 tracking-wider">
            Displaying {processedAssessments.length} Records
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider sticky left-0 bg-slate-50 z-10">School Info</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Phase</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Food Env.</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Daily Habits</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Activities</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Teacher Eng.</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Family Part.</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-800 uppercase tracking-wider text-center bg-emerald-50/50">Total Score</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Recognition Level</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Submitted Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                // LOADING SKELETON
                [...Array(5)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4 sticky left-0 bg-white z-10"><div className="h-4 bg-slate-200 rounded w-48 mb-1"></div><div className="h-3 bg-slate-100 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-16 bg-slate-200 rounded-full mx-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-8 bg-slate-200 rounded mx-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-8 bg-slate-200 rounded mx-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-8 bg-slate-200 rounded mx-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-8 bg-slate-200 rounded mx-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-8 bg-slate-200 rounded mx-auto"></div></td>
                    <td className="px-6 py-4 bg-emerald-50/20"><div className="h-6 w-12 bg-slate-200 rounded-lg mx-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-16 bg-slate-200 rounded-full mx-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                  </tr>
                ))
              ) : processedAssessments.length === 0 ? (
                // EMPTY STATE
                <tr>
                  <td colSpan="10" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <ClipboardCheck size={48} className="mb-4 opacity-20" />
                      <p className="text-lg font-semibold text-slate-600">No wellbeing assessments submitted yet.</p>
                      <p className="text-sm mt-1">Schools will appear here once they complete their assessments.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                // ACTUAL DATA
                processedAssessments.map((assessment) => {
                  const schoolInfo = getSchoolInfo(assessment.school_id);
                  return (
                    <tr key={assessment.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 sticky left-0 bg-white group-hover:bg-slate-50/80 transition-colors z-10 border-r border-slate-50">
                        <div className="font-bold text-slate-800 truncate max-wxs">{schoolInfo.name}</div>
                        <div className="text-xs font-medium text-slate-400 mt-1 flex items-center gap-1">
                          <MapPin size={12} className="text-emerald-500" /> {schoolInfo.clusterName}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${formatPhaseBadge(assessment.phase)}`}>
                          {assessment.phase || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-slate-600">
                        {assessment.food_environment_score ?? '-'}
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-slate-600">
                        {assessment.daily_habits_score ?? '-'}
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-slate-600">
                        {assessment.wellbeing_activities_score ?? '-'}
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-slate-600">
                        {assessment.teacher_engagement_score ?? '-'}
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-slate-600">
                        {assessment.family_partnership_score ?? '-'}
                      </td>
                      <td className="px-6 py-4 text-center bg-emerald-50/30">
                        <span className="inline-flex items-center justify-center px-3 py-1 bg-white border border-emerald-200 rounded-lg text-emerald-800 font-black shadow-sm">
                          {assessment.total_score ?? '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {assessment.recognition_level ? (
                          <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${formatRecognitionBadge(assessment.recognition_level)}`}>
                            {assessment.recognition_level}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs font-medium">Unranked</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                          <Calendar size={14} className="text-slate-400" />
                          {new Date(assessment.created_at || Date.now()).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric'
                          })}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default Assessments;