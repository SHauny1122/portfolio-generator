import { useEffect, useState } from 'react';
import { FaGithub, FaSpinner } from 'react-icons/fa';
import { useToast } from '../hooks';
import { useAuth } from '../contexts/AuthContext';
import { RepositoryExplorer } from '../components/RepositoryExplorer';
import { useNavigate } from 'react-router-dom';

export default function Account() {
  const { user, supabase } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isConnectingGitHub, setIsConnectingGitHub] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleGitHubConnect = async () => {
    setLoading(true);
    setIsConnectingGitHub(true);
    try {
      showToast('Connecting to GitHub...', 'info');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: window.location.origin + '/auth/callback',
          scopes: 'repo read:user user:email',
          queryParams: {
            prompt: 'consent'
          }
        }
      });

      if (error) {
        console.error('GitHub OAuth error:', error);
        showToast('Failed to connect to GitHub', 'error');
        throw error;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('GitHub connection error:', error);
      showToast('Failed to connect to GitHub', 'error');
      setIsConnectingGitHub(false);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const isGitHubConnected = user?.app_metadata?.provider === 'github';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Profile</h1>
        
        {/* Profile Information */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          <div className="space-y-2">
            <p className="text-gray-300">
              Email: {user?.email}
            </p>
            <p className="text-gray-300">
              Member since: {new Date(user?.created_at || '').toLocaleDateString()}
            </p>
            <p className="text-gray-300">
              Connected accounts: {user?.app_metadata?.provider ? [user.app_metadata.provider].join(', ') : 'None'}
            </p>
          </div>
        </div>

        {/* GitHub Connection */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">GitHub Connection</h2>
          {isGitHubConnected && !isConnectingGitHub ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-400">
                <FaGithub />
                <span>Connected to GitHub</span>
              </div>
              <button
                onClick={handleGitHubConnect}
                disabled={loading}
                className="glass-button px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Reconnecting...</span>
                  </>
                ) : (
                  <>
                    <FaGithub className="w-4 h-4" />
                    <span>Reconnect</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={handleGitHubConnect}
              disabled={loading}
              className="glass-button w-full sm:w-auto px-6 py-3 rounded-lg flex items-center justify-center gap-3 hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <FaGithub className="w-5 h-5" />
                  <span>Connect GitHub Account</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Repository Explorer */}
        {isGitHubConnected && !isConnectingGitHub && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Your Repositories</h2>
            <RepositoryExplorer />
          </div>
        )}
      </div>
    </div>
  );
}
