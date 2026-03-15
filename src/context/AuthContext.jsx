import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Safety timeout: if loading takes more than 3s, force it to false
    // to prevent getting stuck on a white screen
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 3000);

    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id, session.user);
      else setLoading(false);
      clearTimeout(timeout);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id, session.user);
      } else {
        setProfile(null);
        setLoading(false);
      }
      clearTimeout(timeout);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const fetchProfile = async (userId, authUser = user) => {
    try {
      const normalizedEmail = authUser?.email?.trim().toLowerCase() ?? null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        const newProfile = {
          id: userId,
          email: normalizedEmail,
          username: normalizedEmail?.split('@')[0] ?? 'aventureiro',
          updated_at: new Date().toISOString(),
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .upsert(newProfile, { onConflict: 'id' })
          .select('*')
          .single();

        if (createError) {
          throw createError;
        }

        setProfile(createdProfile);
        return;
      }

      // Sync email if missing/outdated to ensure partner linking works
      if (normalizedEmail && data.email !== normalizedEmail) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ email: normalizedEmail, updated_at: new Date().toISOString() })
          .eq('id', userId);

        if (!updateError) {
          data.email = normalizedEmail;
        }
      }
      
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = () => fetchProfile(user?.id);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
