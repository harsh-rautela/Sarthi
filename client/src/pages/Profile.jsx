import { useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import { CheckCircle2, User, ShieldCheck, HelpCircle } from 'lucide-react';

const initial = {
  age: '',
  gender: '',
  state: '',
  district: '',
  occupation: '',
  annualIncome: '',
  education: '',
  socialCategory: '',
  ruralUrban: '',
  disability: false,
  farmer: false,
  employmentStatus: '',
  maritalStatus: '',
  minority: false,
  bplCard: false,
  student: false
};

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState(initial);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm({ ...initial, ...user?.profile });
  }, [user]);

  const change = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const save = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        age: form.age === '' ? null : Number(form.age),
        annualIncome: form.annualIncome === '' ? null : Number(form.annualIncome)
      };
      const r = await api.put('/profile', payload);
      setUser({ ...user, profile: r.data.profile });
      setMsg('Profile updated successfully! Recommendation engine has recalculated your matches.');
      setTimeout(() => setMsg(''), 5000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const options = {
    gender: ['Male', 'Female', 'Other'],
    maritalStatus: ['Single', 'Married', 'Widowed', 'Divorced'],
    occupation: ['Student', 'Farmer', 'Salaried', 'Self-employed', 'Entrepreneur', 'Business Owner', 'Unemployed', 'Job Seeker'],
    education: ['School', 'Undergraduate', 'Postgraduate', 'Diploma', 'Doctorate'],
    socialCategory: ['General', 'OBC', 'SC', 'ST', 'EWS'],
    ruralUrban: ['Rural', 'Urban'],
    employmentStatus: ['Student', 'Employed', 'Unemployed', 'Job Seeker', 'Self-employed']
  };

  // Indian States & UTs
  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
    'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh'
  ];

  return (
    <form onSubmit={save} className="mx-auto max-w-4xl space-y-6">
      <div className="card p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
            <User size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Citizen Profile</h1>
            <p className="text-sm text-slate-500">
              Deterministic matching checks your profile directly against official government eligibility rules.
            </p>
          </div>
        </div>

        {msg && (
          <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 border border-emerald-200">
            <CheckCircle2 size={18} className="shrink-0" />
            <span>{msg}</span>
          </div>
        )}

        {/* Section 1: Basic Information */}
        <div className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-800">1. Basic Demographics</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <label>
              <span className="label">Age</span>
              <input
                className="input mt-1"
                name="age"
                type="number"
                min="0"
                max="120"
                value={form.age ?? ''}
                onChange={change}
                placeholder="e.g. 25"
              />
            </label>

            <label>
              <span className="label">Gender</span>
              <select className="input mt-1" name="gender" value={form.gender || ''} onChange={change}>
                <option value="">Select Gender</option>
                {options.gender.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </label>

            <label>
              <span className="label">Marital Status</span>
              <select className="input mt-1" name="maritalStatus" value={form.maritalStatus || ''} onChange={change}>
                <option value="">Select Marital Status</option>
                {options.maritalStatus.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Section 2: Location */}
        <div className="mt-8 border-t border-slate-100 pt-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-800">2. Geographic Location</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <label>
              <span className="label">State / UT</span>
              <select className="input mt-1" name="state" value={form.state || ''} onChange={change}>
                <option value="">Select State / UT</option>
                {states.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>

            <label>
              <span className="label">District</span>
              <input
                className="input mt-1"
                name="district"
                value={form.district || ''}
                onChange={change}
                placeholder="e.g. Sehore, Pune"
              />
            </label>

            <label>
              <span className="label">Area Type</span>
              <select className="input mt-1" name="ruralUrban" value={form.ruralUrban || ''} onChange={change}>
                <option value="">Select Area Type</option>
                {options.ruralUrban.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Section 3: Socio-Economic */}
        <div className="mt-8 border-t border-slate-100 pt-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-800">3. Socio-Economic Profile</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <label>
              <span className="label">Annual Family Income (₹)</span>
              <input
                className="input mt-1"
                name="annualIncome"
                type="number"
                min="0"
                step="5000"
                value={form.annualIncome ?? ''}
                onChange={change}
                placeholder="e.g. 180000"
              />
            </label>

            <label>
              <span className="label">Occupation</span>
              <select className="input mt-1" name="occupation" value={form.occupation || ''} onChange={change}>
                <option value="">Select Occupation</option>
                {options.occupation.map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </label>

            <label>
              <span className="label">Education Level</span>
              <select className="input mt-1" name="education" value={form.education || ''} onChange={change}>
                <option value="">Select Education</option>
                {options.education.map(e => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </label>

            <label>
              <span className="label">Social Category</span>
              <select className="input mt-1" name="socialCategory" value={form.socialCategory || ''} onChange={change}>
                <option value="">Select Category</option>
                {options.socialCategory.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>

            <label>
              <span className="label">Employment Status</span>
              <select className="input mt-1" name="employmentStatus" value={form.employmentStatus || ''} onChange={change}>
                <option value="">Select Status</option>
                {options.employmentStatus.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Section 4: Special Status & Affirmative Action */}
        <div className="mt-8 border-t border-slate-100 pt-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-800">4. Special Categories & Attributes</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                name="farmer"
                checked={!!form.farmer}
                onChange={change}
                className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm font-medium text-slate-800">Active Farmer / Landholder</span>
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                name="disability"
                checked={!!form.disability}
                onChange={change}
                className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm font-medium text-slate-800">Person with Disability (PwD)</span>
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                name="bplCard"
                checked={!!form.bplCard}
                onChange={change}
                className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm font-medium text-slate-800">BPL / AAY Cardholder</span>
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                name="student"
                checked={!!form.student}
                onChange={change}
                className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm font-medium text-slate-800">Currently Enrolled Student</span>
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                name="minority"
                checked={!!form.minority}
                onChange={change}
                className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm font-medium text-slate-800">Minority Community Member</span>
            </label>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-emerald-700" />
            Your data is stored securely and only evaluated for scheme recommendations.
          </p>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving…' : 'Save Profile & Recalculate'}
          </button>
        </div>
      </div>
    </form>
  );
}
