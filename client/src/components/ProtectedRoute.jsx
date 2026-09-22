import { Navigate } from 'react-router-dom'; import { useAuth } from '../lib/AuthContext';
export default function ProtectedRoute({children,admin=false}){const {user,loading}=useAuth(); if(loading)return <div className="p-10 text-center">Loading…</div>; if(!user)return <Navigate to="/login" replace/>; if(admin&&user.role!=='admin')return <Navigate to="/dashboard" replace/>; return children;}
