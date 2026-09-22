import { createContext, useContext, useEffect, useState } from 'react';
import api from './api';
const AuthContext=createContext(null);
export function AuthProvider({children}){
 const [user,setUser]=useState(null); const [loading,setLoading]=useState(true);
 useEffect(()=>{api.get('/auth/me').then(r=>setUser(r.data.user)).catch(()=>setUser(null)).finally(()=>setLoading(false));},[]);
 const login=async(payload)=>{const r=await api.post('/auth/login',payload);setUser(r.data.user);return r.data.user};
 const register=async(payload)=>{const r=await api.post('/auth/register',payload);setUser(r.data.user);return r.data.user};
 const logout=async()=>{await api.post('/auth/logout');setUser(null)};
 return <AuthContext.Provider value={{user,setUser,loading,login,register,logout}}>{children}</AuthContext.Provider>
}
export const useAuth=()=>useContext(AuthContext);
