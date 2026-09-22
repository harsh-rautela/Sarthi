import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  UserCheck,
  Building2,
  SlidersHorizontal,
  Unlock,
  ChevronRight
} from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import SchemeCard from '../components/SchemeCard';

export default function Dashboard() {
  const { user } = useAuth();
  const [recs, setRecs] = useState([]);
  const [stats, setStats] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/recommendations?limit=6'),
      api.get('/recommendations/insights')
    ])
      .then(([recsRes, insightsRes]) => {
        setRecs(recsRes.data.recommendations || []);
        setStats(recsRes.data.stats || null);
        setInsights(insightsRes.data || null);
      })
      .catch(err => {
        console.error('Failed to load dashboard data:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const profile = user?.profile || {};
  const completedFields = ['age', 'gender', 'state', 'occupation', 'annualIncome', 'education', 'socialCategory', 'ruralUrban']
    .filter(k => profile[k] != null && profile[k] !== '');
  const profilePercentage = Math.round((completedFields.length / 8) * 100);

  const eligibleCount = stats?.eligibleCount ?? recs.filter(r => r.evaluation?.status === 'eligible').length;
  const needsVerificationCount = stats?.needsVerificationCount ?? recs.filter(r => r.evaluation?.status === 'needs_verification').length;

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 p-8 text-white shadow-md">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <Sparkles size={13} className="text-emerald-200" />
            <span>Smart Citizen Dashboard</span>
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            Welcome back, {user?.name || 'Citizen'}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-emerald-100 max-w-2xl leading-relaxed">
            Deterministic rule matching has identified <strong className="text-white underline">{eligibleCount} schemes</strong> you are 100% eligible for right now.
          </p>

          {/* Profile Strength Bar */}
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="h-2.5 w-60 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${profilePercentage}%` }}
              />
            </div>
            <span className="text-xs font-bold text-emerald-100">
              Profile Strength: {profilePercentage}% ({completedFields.length}/8 key criteria)
            </span>
            <Link
              to="/profile"
              className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-white hover:text-emerald-200 underline"
            >
              <span>Manage Profile</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
      </section>

      {/* Quick Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5 border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>100% Eligible</span>
            <CheckCircle2 size={16} className="text-emerald-700" />
          </div>
          <div className="mt-2 text-3xl font-black text-slate-900">{eligibleCount}</div>
          <Link to="/recommendations" className="mt-2 inline-flex items-center text-xs font-bold text-emerald-700 hover:text-emerald-800">
            View eligible schemes <ChevronRight size={13} />
          </Link>
        </div>

        <div className="card p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Needs Verification</span>
            <AlertCircle size={16} className="text-amber-700" />
          </div>
          <div className="mt-2 text-3xl font-black text-slate-900">{needsVerificationCount}</div>
          <Link to="/recommendations" className="mt-2 inline-flex items-center text-xs font-bold text-amber-700 hover:text-amber-800">
            Review missing criteria <ChevronRight size={13} />
          </Link>
        </div>

        <div className="card p-5">
          <div className="text-xs font-semibold text-slate-500">Registered State</div>
          <div className="mt-2 text-2xl font-black text-slate-900 line-clamp-1">
            {profile.state || 'Not specified'}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {profile.district ? `${profile.district} district` : 'Used for state quotas'}
          </p>
        </div>

        <div className="card p-5">
          <div className="text-xs font-semibold text-slate-500">Primary Occupation</div>
          <div className="mt-2 text-2xl font-black text-slate-900 line-clamp-1">
            {profile.occupation || 'Not specified'}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {profile.employmentStatus || 'Affects category affinity'}
          </p>
        </div>
      </div>

      {/* Actionable Profile Gap Alert */}
      {insights?.highImpactFields?.length > 0 && (
        <div className="card p-5 bg-gradient-to-r from-emerald-50/60 to-white border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white">
              <Unlock size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Unlock {insights.highImpactFields[0].schemesWaitingCount} more schemes
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Providing your <strong>{insights.highImpactFields[0].label}</strong> will help verify additional central and state programs.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link to="/recommendations" className="btn-secondary text-xs py-2 px-3">
              <SlidersHorizontal size={14} className="mr-1" />
              What-If Simulator
            </Link>
            <Link to="/profile" className="btn-primary text-xs py-2 px-3">
              Complete Field
            </Link>
          </div>
        </div>
      )}

      {/* Top Recommended Schemes Section */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Top Schemes Recommended For You</h2>
            <p className="text-sm text-slate-500">
              Ranked with multi-factor legal eligibility and category affinity scoring.
            </p>
          </div>
          <Link
            to="/recommendations"
            className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 text-sm"
          >
            <span>Explore All Recommendations</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map(n => (
              <div key={n} className="card p-6 h-64 animate-pulse bg-slate-100/60" />
            ))}
          </div>
        ) : recs.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recs.map(r => (
              <SchemeCard
                key={r.scheme._id}
                scheme={r.scheme}
                evaluation={r.evaluation}
                compositeScore={r.compositeScore}
              />
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <p className="text-slate-600 font-medium">
              Complete your citizen profile to unlock personalized recommendations.
            </p>
            <Link className="btn-primary mt-4 inline-flex text-xs py-2 px-4" to="/profile">
              Update Profile Now
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
