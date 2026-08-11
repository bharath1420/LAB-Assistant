import { createClient } from '@supabase/supabase-js';

const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as unknown as { env?: Record<string, string> }).env : undefined;

// Retrieve Supabase credentials from Vite environment variables or process environment fallbacks
const supabaseUrl =
  metaEnv?.VITE_SUPABASE_URL ||
  (typeof process !== 'undefined' ? process.env?.SUPABASE_URL : undefined) ||
  'https://ais-dbms-lab.supabase.co';

const supabaseAnonKey =
  metaEnv?.VITE_SUPABASE_ANON_KEY ||
  (typeof process !== 'undefined' ? process.env?.SUPABASE_ANON_KEY : undefined) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRibXMtbGFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQwOTYwMDAsImV4cCI6MjAyMDY3MjAwMH0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function loginWithSupabase(email: string, password: string, role: string) {
  try {
    // Attempt Supabase Auth sign in
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });

    if (authError && authError.message && !authError.message.includes('Invalid API key')) {
      // If Supabase returned explicit Auth error like Invalid login credentials
      return { user: null, error: authError.message };
    }

    // If Supabase auth succeeded or returned user session
    if (authData?.user) {
      const sbUser = authData.user;
      const userRole = sbUser.user_metadata?.role || (role === 'admin' ? 'admin' : 'student');
      
      const userProfile = {
        id: sbUser.id,
        name: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || email.split('@')[0],
        email: sbUser.email || email,
        role: userRole,
        studentId: sbUser.user_metadata?.student_id || undefined,
        department: sbUser.user_metadata?.department || 'Computer Science & Eng',
        loginTime: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        chatCount: 0,
        status: 'active'
      };

      return { user: userProfile, error: null };
    }
  } catch (err: any) {
    console.warn('Supabase Auth client note:', err?.message || err);
  }

  return { user: null, error: null };
}

export async function registerStudentWithSupabase(name: string, email: string, password: string, studentId?: string, department?: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: {
          full_name: name,
          name: name,
          student_id: studentId || ('CS2026-' + Math.floor(100 + Math.random() * 900)),
          department: department || 'Computer Science & Eng',
          role: 'student'
        }
      }
    });

    if (error && !error.message.includes('Invalid API key')) {
      console.warn('Supabase Auth signUp note:', error.message);
    }

    if (data?.user) {
      await syncStudentToSupabase({
        id: data.user.id,
        name: name,
        email: email,
        role: 'student',
        student_id: studentId,
        department: department,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
        status: 'active'
      });
    }

    return { user: data?.user || null, error: error?.message || null };
  } catch (err: any) {
    console.warn('Supabase SignUp exception:', err);
    return { user: null, error: err?.message || null };
  }
}

export async function syncStudentToSupabase(student: {
  id: string;
  name: string;
  email: string;
  role: string;
  student_id?: string;
  department?: string;
  created_at?: string;
  last_login?: string;
  status?: string;
}) {
  try {
    const { data, error } = await supabase
      .from('students')
      .upsert({
        id: student.id,
        name: student.name,
        email: student.email,
        role: student.role,
        student_id: student.student_id || null,
        department: student.department || 'Computer Science & Eng',
        created_at: student.created_at || new Date().toISOString(),
        last_login: student.last_login || new Date().toISOString(),
        status: student.status || 'active'
      }, { onConflict: 'email' });
    
    if (error) {
      console.warn('Supabase DB sync note:', error.message);
    }
    return { data, error };
  } catch (err) {
    console.warn('Supabase connection note:', err);
    return { data: null, error: err };
  }
}

