import { useEffect } from 'react';
import { supabase } from '../services/supabase';

export function AuthCallback() {
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        console.log('Auth callback session:', { data, error }); // Debug log

        if (error) {
          console.error('Auth callback error:', error);
          // Redirect with error query param for debugging
          window.location.href = `http://localhost:5173/?error=${encodeURIComponent(error.message)}`;
          return;
        }
        
        if (!data.session) {
          console.error('No session found in callback');
          window.location.href = 'http://localhost:5173/?error=no_session';
          return;
        }

        // Successfully authenticated, redirect to home
        window.location.href = 'http://localhost:5173/';
      } catch (err) {
        console.error('Unexpected callback error:', err);
        window.location.href = 'http://localhost:5173/?error=unexpected';
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4" />
        <p className="text-gray-400">Completing sign in...</p>
      </div>
    </div>
  );
}
