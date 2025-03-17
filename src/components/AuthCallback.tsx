import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks';
import { FaSpinner } from 'react-icons/fa';

export function AuthCallback() {
  const navigate = useNavigate();
  const { supabase } = useAuth();
  const { showToast } = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // First check for error parameters in the URL
        const params = new URLSearchParams(window.location.hash.substring(1));
        const urlError = params.get('error');
        const errorDescription = params.get('error_description');

        if (urlError) {
          console.error('Auth error:', { error: urlError, description: errorDescription });
          showToast(errorDescription || 'Authentication failed', 'error');
          setError(errorDescription || 'Authentication failed');
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          showToast('Failed to get session', 'error');
          setError('Failed to get session');
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        if (!session) {
          // No session found, try to exchange the code for a session
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(window.location.href);
          
          if (exchangeError) {
            console.error('Code exchange error:', exchangeError);
            showToast('Failed to complete authentication', 'error');
            setError('Failed to complete authentication');
            setTimeout(() => navigate('/'), 3000);
            return;
          }

          if (!data.session) {
            showToast('No session created - please try again', 'error');
            setError('No session created - please try again');
            setTimeout(() => navigate('/'), 3000);
            return;
          }
        }

        // Final session check
        const { data: { session: finalSession } } = await supabase.auth.getSession();
        
        if (finalSession?.provider_token) {
          console.log('Successfully obtained GitHub token');
          showToast('Successfully connected to GitHub!', 'success');
          navigate('/account');
        } else {
          // One last retry after a short delay
          await new Promise(resolve => setTimeout(resolve, 2000));
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          
          if (retrySession?.provider_token) {
            console.log('Successfully obtained GitHub token on retry');
            showToast('Successfully connected to GitHub!', 'success');
            navigate('/account');
          } else {
            console.error('No provider token found in session');
            showToast('GitHub connection failed - please try again', 'error');
            setError('GitHub connection failed - please try again');
            setTimeout(() => navigate('/'), 3000);
          }
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        showToast('An unexpected error occurred', 'error');
        setError('An unexpected error occurred');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleCallback();
  }, [navigate, showToast, supabase.auth]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <div className="space-y-4">
            <div className="text-red-500 text-xl">{error}</div>
            <div className="text-gray-400">Redirecting you back...</div>
          </div>
        ) : (
          <div className="space-y-4">
            <FaSpinner className="animate-spin w-8 h-8 mx-auto text-blue-500" />
            <div className="text-xl">Connecting to GitHub...</div>
          </div>
        )}
      </div>
    </div>
  );
}
