import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const AuthContext = createContext();

// Normalize Supabase user → app-compatible shape
// Preserves the same interface (user.id, user.email, user.name) the rest of the app uses
const normalizeUser = (supaUser) => {
  if (!supaUser) return null;
  return {
    ...supaUser,
    _id:   supaUser.id,
    name:  supaUser.user_metadata?.full_name
           || supaUser.email?.split('@')[0]
           || 'Hacker',
    email: supaUser.email,
  };
};

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from Supabase (handles token refresh automatically)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(normalizeUser(session?.user ?? null));
      setLoading(false);
    });

    // Reactively update user on login / logout / token refresh
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(normalizeUser(session?.user ?? null));
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── Auth methods (same interface — Login/Signup pages unchanged) ──

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, message: error.message };
    return { success: true };
  };

  const signup = async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) return { success: false, message: error.message };

    // If email confirmation is required, data.session will be null
    if (data.user && !data.session) {
      return {
        success: true,
        requiresConfirmation: true,
        message: 'Account created! Please check your email to confirm before logging in.',
      };
    }
    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {loading ? (
        <div className="min-h-screen bg-slate-50 flex justify-center items-center">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
              <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
              Verifying Session…
            </p>
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};
