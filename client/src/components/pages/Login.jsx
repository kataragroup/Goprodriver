import React, { useState } from 'react';
import axios from 'axios';
import { Lock, Mail, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const LIVE_BASE = 'http://13.206.124.146:7000/api';

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await axios.post(`${LIVE_BASE}/admin/auth/login`, { 
                email, 
                password 
            });

            if (res.data?.token || res.data?.success) {
                const token = res.data.token || res.data.accessToken;

                // Purane sab clear kar do
                localStorage.clear();

                // Token dono keys mein save karo (safety ke liye)
                localStorage.setItem('adminToken', token);
                localStorage.setItem('token', token);

                console.log("✅ Token Saved Successfully:", token?.slice(0, 40) + "...");

                navigate('/dashboard');
            } else {
                setError('Login failed — Token not received');
            }
        } catch (err) {
            console.error("❌ Login Error:", err.response?.data || err.message);
            setError(err.response?.data?.message || "Invalid credentials or server error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-[#121215] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/10 blur-[80px]"></div>
                
                <div className="relative z-10">
                    <div className="flex justify-center mb-8">
                        <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                            <ShieldCheck size={40} className="text-indigo-500" />
                        </div>
                    </div>
                    
                    <h2 className="text-3xl font-bold text-white text-center italic">
                        Rudra <span className="text-indigo-500 not-italic">Admin</span>
                    </h2>
                    <p className="text-gray-500 text-center text-xs mt-2 uppercase tracking-widest font-mono">
                        Security Clearance Required
                    </p>

                    {error && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-2xl text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="mt-10 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Email Terminal</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@gmail.com"
                                    className="w-full bg-[#0a0a0c] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-indigo-500/50 outline-none transition-all"
                                    required 
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Access Key</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input 
                                    type="password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="w-full bg-[#0a0a0c] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-indigo-500/50 outline-none transition-all"
                                    required 
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? "Authenticating..." : "Establish Connection"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;