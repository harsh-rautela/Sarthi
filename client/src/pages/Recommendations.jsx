import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  SlidersHorizontal,
  Search,
  CheckCircle2,
  AlertCircle,
  XCircle,
  X,
  ExternalLink,
  RotateCcw,
  ArrowRight,
  Unlock,
  Building2,
  GraduationCap,
  Layers,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import SchemeCard from '../components/SchemeCard';

export default function Recommendations() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all', 'eligible', 'needs_verification', 'not_eligible'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [sortBy, setSortBy] = useState('matchScore');

  // Simulator Drawer State
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [simProfile, setSimProfile] = useState({});
  const [simResults, setSimResults] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [isSimActive, setIsSimActive] = useState(false);

  // Rule Breakdown Modal State
  const [selectedRuleScheme, setSelectedRuleScheme] = useState(null);

  // Fetch initial recommendations & profile insights
  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const [recsRes, insightsRes] = await Promise.all([
        api.get('/recommendations?limit=60&includeIneligible=true'),
        api.get('/recommendations/insights')
      ]);
      setItems(recsRes.data.recommendations || []);
      setStats(recsRes.data.stats || null);
      setInsights(insightsRes.data || null);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  // Initialize simulator profile from user saved profile
  useEffect(() => {
    if (user?.profile) {
      setSimProfile({
        age: user.profile.age ?? 25,
        annualIncome: user.profile.annualIncome ?? 200000,
        gender: user.profile.gender || 'Female',
        state: user.profile.state || 'Delhi',
        occupation: user.profile.occupation || 'Student',
        education: user.profile.education || 'Undergraduate',
        socialCategory: user.profile.socialCategory || 'General',
        ruralUrban: user.profile.ruralUrban || 'Urban',
        employmentStatus: user.profile.employmentStatus || 'Student',
        disability: Boolean(user.profile.disability),
        farmer: Boolean(user.profile.farmer),
        bplCard: Boolean(user.profile.bplCard),
        student: Boolean(user.profile.student)
      });
    }
  }, [user]);

  // Handle Simulator Change
  const handleSimChange = (name, value) => {
    setSimProfile(prev => ({ ...prev, [name]: value }));
  };

  // Run What-If Simulation
  const runSimulation = async () => {
    setSimulating(true);
    try {
      const res = await api.post('/recommendations/simulate', {
        profile: {
          ...simProfile,
          age: Number(simProfile.age),
          annualIncome: Number(simProfile.annualIncome)
        }
      });
      setSimResults(res.data);
      setIsSimActive(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Simulation error');
    } finally {
      setSimulating(false);
    }
  };

  // Reset Simulation back to saved profile
  const resetSimulation = () => {
    if (user?.profile) {
      setSimProfile({
        age: user.profile.age ?? 25,
        annualIncome: user.profile.annualIncome ?? 200000,
        gender: user.profile.gender || 'Female',
        state: user.profile.state || 'Delhi',
        occupation: user.profile.occupation || 'Student',
        education: user.profile.education || 'Undergraduate',
        socialCategory: user.profile.socialCategory || 'General',
        ruralUrban: user.profile.ruralUrban || 'Urban',
        employmentStatus: user.profile.employmentStatus || 'Student',
        disability: Boolean(user.profile.disability),
        farmer: Boolean(user.profile.farmer),
        bplCard: Boolean(user.profile.bplCard),
        student: Boolean(user.profile.student)
      });
    }
    setSimResults(null);
    setIsSimActive(false);
  };

  // Active list of recommendations (either regular or simulated)
  const activeItems = useMemo(() => {
    return isSimActive && simResults ? simResults.recommendations : items;
  }, [isSimActive, simResults, items]);

  // Categories list extracted from data
  const categories = useMemo(() => {
    const set = new Set();
    activeItems.forEach(item => {
      if (item.scheme.category) set.add(item.scheme.category);
    });
    return Array.from(set).sort();
  }, [activeItems]);

  // Filtered & Sorted recommendations
  const displayedItems = useMemo(() => {
    let result = [...activeItems];

    // Status Filter
    if (selectedStatus !== 'all') {
      result = result.filter(item => item.evaluation?.status === selectedStatus);
    }

    // Category Filter
    if (selectedCategory !== 'all') {
      result = result.filter(item => item.scheme.category === selectedCategory);
    }

    // Level Filter
    if (selectedLevel !== 'all') {
      result = result.filter(item => item.scheme.level === selectedLevel);
    }

    // Search query
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(item =>
        item.scheme.name?.toLowerCase().includes(q) ||
        item.scheme.description?.toLowerCase().includes(q) ||
        item.scheme.ministry?.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'name') {
        return (a.scheme.name || '').localeCompare(b.scheme.name || '');
      }
      if (sortBy === 'category') {
        return (a.scheme.category || '').localeCompare(b.scheme.category || '');
      }
      // matchScore
      const pOrder = { eligible: 0, needs_verification: 1, not_eligible: 2 };
      const pDiff = (pOrder[a.evaluation?.status] ?? 3) - (pOrder[b.evaluation?.status] ?? 3);
      if (pDiff !== 0) return pDiff;
      const scoreA = a.compositeScore ?? a.evaluation?.matchScore ?? 0;
      const scoreB = b.compositeScore ?? b.evaluation?.matchScore ?? 0;
      return scoreB - scoreA;
    });

    return result;
  }, [activeItems, selectedStatus, selectedCategory, selectedLevel, search, sortBy]);

  // Summary counts
  const currentStats = useMemo(() => {
    if (isSimActive && simResults) {
      return simResults.stats;
    }
    return stats || {
      eligibleCount: items.filter(i => i.evaluation?.status === 'eligible').length,
      needsVerificationCount: items.filter(i => i.evaluation?.status === 'needs_verification').length,
      notEligibleCount: items.filter(i => i.evaluation?.status === 'not_eligible').length,
      total: items.length
    };
  }, [isSimActive, simResults, stats, items]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black text-slate-900">Personalized Recommendations</h1>
            <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
              AI Multi-Factor Engine
            </span>
          </div>
          <p className="mt-1 text-slate-500 max-w-2xl text-sm">
            Deterministic rule matching combines legal eligibility verification with category and demographic affinity scoring.
          </p>
        </div>

        {/* What-If Simulator Trigger Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSimulatorOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 px-4 py-2.5 font-bold text-white shadow-sm hover:from-emerald-800 hover:to-teal-800 transition"
          >
            <SlidersHorizontal size={18} />
            <span>What-If Simulator</span>
            {isSimActive && (
              <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">Active</span>
            )}
          </button>
        </div>
      </div>

      {/* Simulator Active Notification Banner */}
      {isSimActive && simResults && (
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-amber-500/10 border border-amber-300 p-4 text-amber-900">
          <div className="flex items-center gap-3">
            <Sparkles size={20} className="text-amber-600 shrink-0" />
            <div>
              <p className="font-bold text-sm">
                What-If Simulation Active: Showing matches for hypothetical profile ({simProfile.occupation}, {simProfile.state}, ₹{Number(simProfile.annualIncome).toLocaleString('en-IN')})
              </p>
              {simResults.simulationStats?.newlyEligibleCount > 0 && (
                <p className="text-xs font-semibold text-amber-800">
                  🎉 {simResults.simulationStats.newlyEligibleCount} newly unlocked schemes compared to your permanent profile!
                </p>
              )}
            </div>
          </div>
          <button
            onClick={resetSimulation}
            className="flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-950 underline shrink-0"
          >
            <RotateCcw size={14} />
            Reset to Saved Profile
          </button>
        </div>
      )}

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="card p-4 border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>100% Eligible</span>
            <CheckCircle2 size={16} className="text-emerald-700" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {currentStats?.eligibleCount ?? 0}
          </div>
          <p className="text-[11px] text-emerald-800 font-medium mt-1">Ready for application</p>
        </div>

        <div className="card p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Needs Verification</span>
            <AlertCircle size={16} className="text-amber-700" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {currentStats?.needsVerificationCount ?? 0}
          </div>
          <p className="text-[11px] text-amber-800 font-medium mt-1">1–2 profile fields missing</p>
        </div>

        <div className="card p-4 border-l-4 border-l-teal-600">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Catalog Schemes</span>
            <Building2 size={16} className="text-teal-700" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {currentStats?.total ?? 0}
          </div>
          <p className="text-[11px] text-teal-800 font-medium mt-1">Central & State portals</p>
        </div>

        <div className="card p-4 border-l-4 border-l-purple-600">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Profile Match Power</span>
            <GraduationCap size={16} className="text-purple-700" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {insights?.profileCompleteness ?? 85}%
          </div>
          <p className="text-[11px] text-purple-800 font-medium mt-1">
            {insights?.completedCount ?? 7}/{insights?.totalTrackedFields ?? 8} fields populated
          </p>
        </div>
      </div>

      {/* Profile Gap Insights & Unlock Alert Banner */}
      {!isSimActive && insights?.highImpactFields?.length > 0 && (
        <div className="card p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-white border border-emerald-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white">
                <Unlock size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Profile Unlock Opportunity
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Completing <strong className="text-emerald-800">{insights.highImpactFields[0].label}</strong> in your profile can instantly verify{' '}
                  <strong className="text-emerald-800">{insights.highImpactFields[0].schemesWaitingCount} more schemes</strong>!
                </p>
                {insights.highImpactFields[0].sampleSchemes?.length > 0 && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    Waiting schemes include: {insights.highImpactFields[0].sampleSchemes.join(', ')}
                  </p>
                )}
              </div>
            </div>
            <Link
              to="/profile"
              className="btn-primary shrink-0 text-xs py-2 px-4 self-start sm:self-auto"
            >
              <span>Update Profile</span>
              <ArrowRight size={14} className="ml-1" />
            </Link>
          </div>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="card p-4 space-y-3">
        {/* Top Row: Search and Status Tabs */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search recommended schemes by name, ministry, or keyword..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-10 text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-100 p-1">
            {[
              { id: 'all', label: 'All Status' },
              { id: 'eligible', label: '100% Eligible' },
              { id: 'needs_verification', label: 'Needs Verification' },
              { id: 'not_eligible', label: 'Disqualified' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  selectedStatus === tab.id
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Second Row: Category Pills & Sort Select */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Category Pill Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-slate-500 mr-1">Category:</span>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                selectedCategory === 'all'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Categories
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Level & Sort Filters */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Level:</span>
              <select
                value={selectedLevel}
                onChange={e => setSelectedLevel(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-emerald-600"
              >
                <option value="all">All Levels</option>
                <option value="Central">Central</option>
                <option value="State">State</option>
              </select>
            </label>

            <label className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-emerald-600"
              >
                <option value="matchScore">Highest Match</option>
                <option value="name">Scheme Name</option>
                <option value="category">Category</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="card p-6 h-64 animate-pulse bg-slate-100/60" />
          ))}
        </div>
      ) : displayedItems.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {displayedItems.map(r => (
            <SchemeCard
              key={r.scheme._id}
              scheme={r.scheme}
              evaluation={r.evaluation}
              compositeScore={r.compositeScore}
              onViewRules={(scheme, evalData) => setSelectedRuleScheme({ scheme, evalData })}
            />
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <p className="text-lg font-bold text-slate-800">No schemes match your selected filters</p>
          <p className="mt-1 text-sm text-slate-500">
            Try adjusting your category or status filters, or launch the What-If Simulator to preview different criteria.
          </p>
          <button
            onClick={() => {
              setSelectedStatus('all');
              setSelectedCategory('all');
              setSelectedLevel('all');
              setSearch('');
            }}
            className="btn-secondary mt-4 text-xs py-2 px-4"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* What-If Eligibility Simulator Drawer / Panel */}
      {simulatorOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm transition-opacity">
          <div className="relative w-full max-w-xl bg-white shadow-2xl overflow-y-auto p-6 sm:p-8 flex flex-col h-full">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                  <SlidersHorizontal size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">What-If Eligibility Simulator</h2>
                  <p className="text-xs text-slate-500">Preview scheme matches without altering your saved profile.</p>
                </div>
              </div>
              <button
                onClick={() => setSimulatorOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Simulator Form Inputs */}
            <div className="space-y-5 my-6 flex-1">
              {/* Income Slider & Number Input */}
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase text-slate-700">Annual Family Income</span>
                  <span className="text-sm font-black text-emerald-800">
                    ₹{Number(simProfile.annualIncome || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1500000"
                  step="25000"
                  value={simProfile.annualIncome ?? 200000}
                  onChange={e => handleSimChange('annualIncome', Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>₹0 (BPL)</span>
                  <span>₹5 Lakh</span>
                  <span>₹10 Lakh</span>
                  <span>₹15 Lakh+</span>
                </div>
              </div>

              {/* Age & Gender */}
              <div className="grid grid-cols-2 gap-4">
                <label>
                  <span className="label text-xs">Age</span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={simProfile.age ?? 25}
                    onChange={e => handleSimChange('age', Number(e.target.value))}
                    className="input text-sm mt-1"
                  />
                </label>
                <label>
                  <span className="label text-xs">Gender</span>
                  <select
                    value={simProfile.gender || ''}
                    onChange={e => handleSimChange('gender', e.target.value)}
                    className="input text-sm mt-1"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
              </div>

              {/* State & Area */}
              <div className="grid grid-cols-2 gap-4">
                <label>
                  <span className="label text-xs">State / UT</span>
                  <select
                    value={simProfile.state || ''}
                    onChange={e => handleSimChange('state', e.target.value)}
                    className="input text-sm mt-1"
                  >
                    <option value="Delhi">Delhi</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Telangana">Telangana</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Bihar">Bihar</option>
                  </select>
                </label>
                <label>
                  <span className="label text-xs">Area Type</span>
                  <select
                    value={simProfile.ruralUrban || ''}
                    onChange={e => handleSimChange('ruralUrban', e.target.value)}
                    className="input text-sm mt-1"
                  >
                    <option value="Urban">Urban</option>
                    <option value="Rural">Rural</option>
                  </select>
                </label>
              </div>

              {/* Occupation & Education */}
              <div className="grid grid-cols-2 gap-4">
                <label>
                  <span className="label text-xs">Occupation</span>
                  <select
                    value={simProfile.occupation || ''}
                    onChange={e => handleSimChange('occupation', e.target.value)}
                    className="input text-sm mt-1"
                  >
                    <option value="Student">Student</option>
                    <option value="Farmer">Farmer</option>
                    <option value="Entrepreneur">Entrepreneur</option>
                    <option value="Business Owner">Business Owner</option>
                    <option value="Self-employed">Self-employed</option>
                    <option value="Job Seeker">Job Seeker</option>
                    <option value="Unemployed">Unemployed</option>
                    <option value="Salaried">Salaried</option>
                  </select>
                </label>
                <label>
                  <span className="label text-xs">Education</span>
                  <select
                    value={simProfile.education || ''}
                    onChange={e => handleSimChange('education', e.target.value)}
                    className="input text-sm mt-1"
                  >
                    <option value="School">School (Class 1-12)</option>
                    <option value="Undergraduate">Undergraduate Degree</option>
                    <option value="Postgraduate">Postgraduate Degree</option>
                    <option value="Diploma">Diploma / ITI</option>
                  </select>
                </label>
              </div>

              {/* Social Category */}
              <div>
                <label>
                  <span className="label text-xs">Social Category</span>
                  <select
                    value={simProfile.socialCategory || ''}
                    onChange={e => handleSimChange('socialCategory', e.target.value)}
                    className="input text-sm mt-1"
                  >
                    <option value="General">General</option>
                    <option value="OBC">OBC (Other Backward Class)</option>
                    <option value="SC">SC (Scheduled Caste)</option>
                    <option value="ST">ST (Scheduled Tribe)</option>
                    <option value="EWS">EWS (Economically Weaker Section)</option>
                  </select>
                </label>
              </div>

              {/* Special Checkboxes */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-2.5 hover:bg-slate-50 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!simProfile.farmer}
                    onChange={e => handleSimChange('farmer', e.target.checked)}
                    className="h-4 w-4 rounded text-emerald-600"
                  />
                  <span>Farmer / Landholder</span>
                </label>

                <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-2.5 hover:bg-slate-50 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!simProfile.disability}
                    onChange={e => handleSimChange('disability', e.target.checked)}
                    className="h-4 w-4 rounded text-emerald-600"
                  />
                  <span>Person with Disability</span>
                </label>

                <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-2.5 hover:bg-slate-50 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!simProfile.bplCard}
                    onChange={e => handleSimChange('bplCard', e.target.checked)}
                    className="h-4 w-4 rounded text-emerald-600"
                  />
                  <span>BPL Cardholder</span>
                </label>

                <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-2.5 hover:bg-slate-50 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!simProfile.student}
                    onChange={e => handleSimChange('student', e.target.checked)}
                    className="h-4 w-4 rounded text-emerald-600"
                  />
                  <span>Student Status</span>
                </label>
              </div>
            </div>

            {/* Drawer Footer Buttons */}
            <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={runSimulation}
                disabled={simulating}
                className="btn-primary flex-1 text-sm py-2.5"
              >
                {simulating ? 'Calculating Matches…' : 'Simulate & Preview Matches'}
              </button>
              <button
                type="button"
                onClick={resetSimulation}
                className="btn-secondary text-sm py-2.5"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rule Breakdown Explainability Modal */}
      {selectedRuleScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-100">
                  {selectedRuleScheme.scheme.category}
                </span>
                <h2 className="mt-2 text-xl font-black text-slate-900">
                  {selectedRuleScheme.scheme.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Detailed Deterministic Rule Evaluation Breakdown
                </p>
              </div>
              <button
                onClick={() => setSelectedRuleScheme(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Status Summary Banner */}
            <div className="mt-4 rounded-xl p-4 border flex items-center justify-between gap-4 bg-slate-50 border-slate-200">
              <div>
                <div className="text-xs uppercase font-bold text-slate-500">Evaluation Outcome</div>
                <div className="text-lg font-black text-slate-900 capitalize">
                  {selectedRuleScheme.evalData.status.replace('_', ' ')}
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  {selectedRuleScheme.evalData.requirementSummary}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-emerald-800">
                  {selectedRuleScheme.evalData.matchScore}%
                </div>
                <div className="text-[11px] font-semibold text-slate-500">Rule Match Score</div>
              </div>
            </div>

            {/* Critical Disqualification Reasons */}
            {selectedRuleScheme.evalData.criticalFailureReasons?.length > 0 && (
              <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-red-800 flex items-center gap-1.5">
                  <XCircle size={15} />
                  Disqualification Reasons
                </h3>
                <ul className="mt-2 space-y-1.5 text-xs text-red-700 pl-5 list-disc">
                  {selectedRuleScheme.evalData.criticalFailureReasons.map((reason, i) => (
                    <li key={i}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Granular Rules Table */}
            <div className="mt-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Criteria Checks Evaluation
              </h3>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {selectedRuleScheme.evalData.checks?.map((c, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 p-3 text-xs items-center hover:bg-slate-50">
                    <div className="col-span-4 font-bold text-slate-800">{c.label}</div>
                    <div className="col-span-3 text-slate-600">
                      <span className="text-[10px] text-slate-400 block">Required</span>
                      {c.required}
                    </div>
                    <div className="col-span-3 text-slate-600">
                      <span className="text-[10px] text-slate-400 block">Your Profile</span>
                      {c.actual}
                    </div>
                    <div className="col-span-2 text-right">
                      {c.pass === true ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                          <CheckCircle2 size={14} /> Passed
                        </span>
                      ) : c.pass === false ? (
                        <span className="inline-flex items-center gap-1 font-bold text-red-600">
                          <XCircle size={14} /> Failed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-amber-700">
                          <HelpCircle size={14} /> Missing
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actionable Recommendations */}
            {selectedRuleScheme.evalData.actionableRecommendations?.length > 0 && (
              <div className="mt-5 rounded-xl bg-emerald-50/70 border border-emerald-200 p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Recommended Actionable Next Steps
                </h3>
                <ul className="mt-2 space-y-1.5 text-xs text-emerald-900 pl-5 list-disc">
                  {selectedRuleScheme.evalData.actionableRecommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <Link
                to={`/schemes/${selectedRuleScheme.scheme.slug}`}
                className="btn-primary text-xs py-2 px-4"
              >
                Full Scheme Details
              </Link>
              {selectedRuleScheme.scheme.officialUrl && (
                <a
                  href={selectedRuleScheme.scheme.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary text-xs py-2 px-4 inline-flex items-center gap-1"
                >
                  <span>Official Portal</span>
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
