import { useState } from 'react';
import { fetchRepoData, RepoData } from '../services/github';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile } from '../services/profiles';

interface MainAppProps {
  onRepoData: (data: RepoData) => void;
  onShowAuth: () => void;
  onShowPremium: () => void;
}

export function MainApp({ onRepoData, onShowAuth, onShowPremium }: MainAppProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, signOut } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!user) {
        onShowAuth();
        setLoading(false);
        return;
      }

      const userProfile = await getUserProfile(user.id);
      if (!userProfile) {
        setError('Failed to fetch user profile');
        return;
      }

      if (!userProfile.is_premium && userProfile.portfolios_generated >= 3) {
        onShowPremium();
        setLoading(false);
        return;
      }

      const data = await fetchRepoData(url, user.id);
      if (!data) {
        setError('Failed to fetch repository data. Please check the URL and try again.');
        return;
      }

      onRepoData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          GitHub Portfolio Generator
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="repo-url" className="block text-sm font-medium text-gray-300 mb-2">
              GitHub Repository URL
            </label>
            <input
              id="repo-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/username/repository"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !url.trim()}
            className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
              loading || !url.trim()
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </div>
            ) : (
              'Generate Portfolio'
            )}
          </button>
        </form>

        {user && (
          <div className="mt-8 text-center text-gray-400 flex items-center justify-center gap-4">
            <span>Signed in as {user.email}</span>
            <button
              onClick={() => signOut()}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
