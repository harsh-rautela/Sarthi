import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Bell, Bookmark, Bot, Home, LogOut, Search, UserRound, ShieldCheck } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
const nav=[['/dashboard','Dashboard',Home],['/schemes','Explore Schemes',Search],['/recommendations','Recommendations',ShieldCheck],['/bookmarks','Bookmarks',Bookmark],['/assistant','AI Assistant',Bot],['/profile','Profile',UserRound],['/notifications','Notifications',Bell]];
export default function Layout(){
 const {user,logout}=useAuth(); const navigate=useNavigate();
 const doLogout=async()=>{await logout();navigate('/');};
 return <div className="min-h-screen bg-slate-50">
  <header className="sticky top-0 z-20 border-b border-emerald-100 bg-white/95 backdrop-blur">
   <div className="container-page flex h-16 items-center justify-between">
    <Link to="/dashboard" className="flex items-center gap-3 font-bold text-emerald-800"><div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-700 text-white">S</div><span>SchemeSathi</span></Link>
    <div className="flex items-center gap-3"><span className="hidden text-sm text-slate-600 sm:block">{user?.name}</span><button onClick={doLogout} className="btn-secondary !px-3"><LogOut size={17}/></button></div>
   </div>
  </header>
  <div className="container-page grid gap-6 py-6 lg:grid-cols-[230px_1fr]">
   <aside className="card h-fit p-3 lg:sticky lg:top-24">
    <nav className="space-y-1">{nav.map(([to,label,Icon])=><NavLink key={to} to={to} className={({isActive})=>`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${isActive?'bg-emerald-700 text-white':'text-slate-700 hover:bg-emerald-50'}`}><Icon size={18}/>{label}</NavLink>)}</nav>
    {user?.role==='admin'&&<NavLink to="/admin" className={({isActive})=>`mt-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${isActive?'bg-slate-900 text-white':'bg-slate-100 text-slate-800'}`}>Admin</NavLink>}
   </aside>
   <main><Outlet/></main>
  </div>
 </div>
}
