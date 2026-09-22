import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookmarkPlus,
  BookmarkCheck,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import api from '../lib/api';

export default function SchemeCard({ scheme, evaluation, compositeScore, onBookmarked, onViewRules }) {
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);
  const [showQuickRules, setShowQuickRules] = useState(false);

  const bookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (bookmarking) return;
    setBookmarking(true);
    try {
      await api.post(`/bookmarks/${scheme._id}`);
      setBookmarked(true);
      onBookmarked?.();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not bookmark scheme');
    } finally {
      setBookmarking(false);
    }
  };

  const status = evaluation?.status;
  const score = compositeScore != null ? compositeScore : evaluation?.matchScore;

  // Status badge styling and text
  let statusBadge = null;
  if (status === 'eligible') {
    statusBadge = (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
        <CheckCircle2 size={13} className="text-emerald-700" />
        {score >= 95 ? '100% Eligible' : 'Eligible Match'}
      </span>
    );
  } else if (status === 'needs_verification') {
    const missingCount = evaluation.missingCount || evaluation.missingChecks?.length || 1;
    statusBadge = (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800 border border-amber-200">
        <AlertCircle size={13} className="text-amber-700" />
        {`Needs ${missingCount} Detail${missingCount > 1 ? 's' : ''}`}
      </span>
    );
  } else if (status === 'not_eligible') {
    statusBadge = (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 border border-red-200">
        <XCircle size={13} className="text-red-500" />
        Criteria Mismatch
      </span>
    );
  }

  return (
    <article className="card flex h-full flex-col p-5 hover:border-emerald-200 hover:shadow-md transition duration-200">
      {/* Category & Status Row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-100">
            {scheme.category}
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
            {scheme.level === 'State' && scheme.applicableStates?.length
              ? `State: ${scheme.applicableStates.slice(0, 2).join(', ')}`
              : 'Central'}
          </span>
        </div>
        {statusBadge}
      </div>

      {/* Scheme Title */}
      <h3 className="mt-3 text-lg font-bold text-slate-900 leading-snug group">
        <Link to={`/schemes/${scheme.slug}`} className="hover:text-emerald-700 transition">
          {scheme.name}
        </Link>
      </h3>

      {/* Ministry */}
      {scheme.ministry && (
        <p className="mt-1 text-xs font-medium text-slate-600 line-clamp-1">
          {scheme.ministry}
        </p>
      )}

      {/* Description */}
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
        {scheme.description}
      </p>

      {/* Match Progress Bar */}
      {evaluation && (
        <div className="mt-4 rounded-xl bg-slate-50 p-3 border border-slate-100">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600 flex items-center gap-1">
              <Sparkles size={12} className="text-emerald-700" />
              Relevance Match
            </span>
            <span className="font-black text-slate-800">{score}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full transition-all duration-500 ${
                status === 'eligible'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                  : status === 'needs_verification'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                  : 'bg-slate-400'
              }`}
              style={{ width: `${Math.max(5, score)}%` }}
            />
          </div>
          {evaluation.requirementSummary && (
            <p className="mt-2 text-[11px] font-medium text-slate-600 line-clamp-1">
              {evaluation.requirementSummary}
            </p>
          )}
        </div>
      )}

      {/* Quick Rule Accordion Toggle */}
      {evaluation?.checks?.length > 0 && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => {
              if (onViewRules) {
                onViewRules(scheme, evaluation);
              } else {
                setShowQuickRules(!showQuickRules);
              }
            }}
            className="flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-900 transition"
          >
            <span>{onViewRules ? 'View Rule Breakdown & Why' : showQuickRules ? 'Hide Rules' : 'Why am I eligible?'}</span>
            {!onViewRules && (showQuickRules ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
          </button>

          {!onViewRules && showQuickRules && (
            <div className="mt-2.5 rounded-xl bg-slate-50 p-3 text-xs space-y-2 border border-slate-200">
              {evaluation.checks.map((c, i) => (
                <div key={i} className="flex items-start justify-between gap-2 pb-1 border-b border-slate-100 last:border-0 last:pb-0">
                  <div>
                    <span className="font-semibold text-slate-700">{c.label}: </span>
                    <span className="text-slate-500 text-[11px]">Req: {c.required}</span>
                  </div>
                  <span
                    className={`shrink-0 font-bold ${
                      c.pass === true ? 'text-green-700' : c.pass === false ? 'text-red-600' : 'text-amber-700'
                    }`}
                  >
                    {c.pass === true ? '✓ Pass' : c.pass === false ? '✕ Mismatch' : '? Missing'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer Buttons */}
      <div className="mt-auto flex items-center gap-2 pt-4 border-t border-slate-100">
        <Link className="btn-primary flex-1 text-center text-sm py-2" to={`/schemes/${scheme.slug}`}>
          View Details
        </Link>
        <button
          type="button"
          className={`btn-secondary !px-2.5 py-2 ${bookmarked ? '!bg-emerald-50 !text-emerald-700' : ''}`}
          onClick={bookmark}
          title={bookmarked ? 'Saved to Bookmarks' : 'Bookmark Scheme'}
        >
          {bookmarked ? <BookmarkCheck size={18} className="text-emerald-600" /> : <BookmarkPlus size={18} />}
        </button>
        {scheme.officialUrl && (
          <a
            className="btn-secondary !px-2.5 py-2"
            href={scheme.officialUrl}
            target="_blank"
            rel="noreferrer"
            title="Open official portal"
          >
            <ExternalLink size={18} />
          </a>
        )}
      </div>
    </article>
  );
}
