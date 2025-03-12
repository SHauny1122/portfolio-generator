import { useState, useEffect } from 'react';
import { fetchRepoData, RepoData } from '../services/github';
import { setupStorage } from '../services/storage';
import { ProjectDisplay } from './ProjectDisplay';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import '../styles/glass.css';

interface MainAppProps {
  onRepoData: (data: RepoData) => void;
  onShowAuth: () => void;
  onShowPremium: () => void;
}

export function MainApp({ onRepoData, onShowAuth, onShowPremium }: MainAppProps) {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    // Initialize storage for screenshots
    setupStorage().catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!user) {
        onShowAuth();
        return;
      }

      const data = await fetchRepoData(repoUrl, user.id);
      if (!data) {
        throw new Error('Failed to fetch repository data');
      }
      
      // Check if user has reached their limit
      if (data.error === 'LIMIT_REACHED') {
        onShowPremium();
        return;
      }
      
      setRepoData(data);
      onRepoData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setRepoData(null);
    setRepoUrl('');
  };

  if (repoData) {
    return <ProjectDisplay repoData={repoData} onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="relative min-h-screen">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        
        {/* Content */}
        <div className="relative max-w-4xl mx-auto px-4 py-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Portfolio Generator
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-4">
              Transform your GitHub repositories into beautiful portfolio pieces with just one click
            </p>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Share your work in a way that's easy to understand, even for non-technical viewers
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card p-8 rounded-xl backdrop-blur-md"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="repoUrl" className="block text-sm font-medium text-gray-300 mb-2">
                  GitHub Repository URL
                </label>
                <div className="relative">
                  <input
                    id="repoUrl"
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/username/repository"
                    className="glass-input w-full px-4 py-3 rounded-lg focus:outline-none placeholder-gray-500 text-white pr-12"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-400">
                  Paste your GitHub repository URL to create a beautiful portfolio showcase with descriptions and live previews
                </p>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400"
                >
                  {error}
                </motion.div>
              )}

              <div className="flex justify-end">
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || !repoUrl.trim()}
                  className="glass-button px-6 py-3 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    'Generate Portfolio'
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
