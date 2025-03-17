import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RepoData } from '../services/github';
import { SiVercel, SiNetlify } from 'react-icons/si';
import { ReadmeGenerator } from '../components/ReadmeGenerator';
import { useLocation, Navigate } from 'react-router-dom';

export const DevTools = () => {
  const location = useLocation();
  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [hasGithubToken, setHasGithubToken] = useState(false);

  useEffect(() => {
    // Check if GitHub token is available
    const token = import.meta.env.VITE_GITHUB_TOKEN;
    console.log('GitHub token status:', !!token);
    setHasGithubToken(!!token);

    // Handle repository data passed from RepositoryExplorer
    if (location.state?.repoUrl && location.state?.repoData) {
      console.log('Received repository data:', location.state.repoData);
      setRepoData(location.state.repoData);
    }
  }, [location]);

  // Redirect to account page if no repository data is provided
  if (!location.state?.repoData) {
    return <Navigate to="/account" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Developer Tools
        </h1>

        {!hasGithubToken && (
          <div className="glass-card p-4 mb-6 border border-yellow-500/30 bg-yellow-500/10 rounded-lg">
            <p className="text-yellow-200">
              ⚠️ GitHub token not found. Please make sure your <code className="bg-black/30 px-1 rounded">.env</code> file 
              contains <code className="bg-black/30 px-1 rounded">VITE_GITHUB_TOKEN</code> with your GitHub personal access token.
            </p>
          </div>
        )}

        {repoData && (
          <div className="space-y-6">
            {/* Repository Info */}
            <div className="glass-card p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-4">Repository Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400">Owner: <span className="text-white">{repoData.owner}</span></p>
                  <p className="text-gray-400">Name: <span className="text-white">{repoData.name}</span></p>
                  <p className="text-gray-400">Language: <span className="text-white">{repoData.language || 'Not specified'}</span></p>
                </div>
                <div>
                  <p className="text-gray-400">Stars: <span className="text-white">{repoData.stars}</span></p>
                  <p className="text-gray-400">Visibility: <span className="text-white">{repoData.visibility}</span></p>
                  <p className="text-gray-400">Default Branch: <span className="text-white">{repoData.defaultBranch}</span></p>
                </div>
              </div>
              {repoData.description && (
                <p className="text-gray-400 mt-4">Description: <span className="text-white">{repoData.description}</span></p>
              )}
            </div>

            {/* Available Tools Section */}
            <div className="glass-card p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-4">Available Tools</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.a
                  href="https://vercel.com/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  className="glass-button px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-500/30 transition-all duration-300"
                >
                  <SiVercel className="text-xl" />
                  Deploy to Vercel
                </motion.a>

                <motion.a
                  href="https://app.netlify.com/start"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  className="glass-button px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-500/30 transition-all duration-300"
                >
                  <SiNetlify className="text-xl" />
                  Deploy to Netlify
                </motion.a>
              </div>
            </div>

            {/* README Generator */}
            {hasGithubToken ? (
              <ReadmeGenerator repoUrl={location.state.repoUrl} repoData={repoData} />
            ) : (
              <div className="glass-card p-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10">
                <h3 className="text-xl font-semibold mb-2">README Generator</h3>
                <p className="text-yellow-200">
                  GitHub token is required to use the README generator. Please configure your token first.
                </p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
