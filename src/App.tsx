import { useState, useEffect } from 'react';
import { fetchRepoData } from './services/github';
import { ProjectDisplay } from './components/ProjectDisplay';
import { RepoData } from './services/github';

function App() {
  const [url, setUrl] = useState('');
  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to encode and decode GitHub URLs for sharing
  const encodeGitHubUrl = (url: string) => encodeURIComponent(url);
  const decodeGitHubUrl = (encoded: string) => decodeURIComponent(encoded);

  // Function to generate shareable links
  const getShareableLink = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}?repo=${encodeGitHubUrl(url)}`;
  };

  // Share functions
  const shareToTwitter = () => {
    const text = `Check out this GitHub project: ${repoData?.name}\n\n`;
    const shareableLink = getShareableLink();
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareableLink)}`,
      '_blank'
    );
  };

  const shareToLinkedIn = () => {
    const shareableLink = getShareableLink();
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareableLink)}`,
      '_blank'
    );
  };

  const shareByEmail = () => {
    const subject = `Check out this GitHub project: ${repoData?.name}`;
    const body = `I found this interesting GitHub project:\n\n${repoData?.name}\n${repoData?.description}\n\nView it here: ${getShareableLink()}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getShareableLink());
      alert('Link copied to clipboard!');
    } catch (err) {
      alert('Failed to copy link. Please try again.');
    }
  };

  // Check for URL parameters on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const repoUrl = params.get('repo');
    if (repoUrl) {
      const decodedUrl = decodeGitHubUrl(repoUrl);
      setUrl(decodedUrl);
      handleSubmit(decodedUrl);
    }
  }, []);

  const handleSubmit = async (urlToFetch: string = url) => {
    if (!urlToFetch.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchRepoData(urlToFetch);
      if (data) {
        setRepoData(data);
        // Update URL with the repo parameter without triggering a page reload
        const newUrl = `${window.location.pathname}?repo=${encodeGitHubUrl(urlToFetch)}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
      } else {
        setError('Failed to fetch repository data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {!repoData ? (
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              GitHub Portfolio Generator
            </h1>
            <p className="text-gray-300 text-xl mb-8">
              Transform any GitHub repository into a beautiful portfolio page
            </p>
            <div className="space-y-4">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter GitHub repository URL"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
              />
              <button
                onClick={() => handleSubmit()}
                disabled={loading}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors text-white disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Generate Portfolio'}
              </button>
            </div>
            {error && <p className="mt-4 text-red-400">{error}</p>}
          </div>
        </div>
      ) : (
        <div>
          <div className="bg-gray-800/50 border-b border-gray-700/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <button
                onClick={() => {
                  setRepoData(null);
                  setUrl('');
                  window.history.pushState({}, '', window.location.pathname);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Back to Generator
              </button>
              <div className="flex gap-2">
                <button
                  onClick={shareToTwitter}
                  className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                  title="Share on Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </button>
                <button
                  onClick={shareToLinkedIn}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Share on LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </button>
                <button
                  onClick={shareByEmail}
                  className="p-2 text-gray-400 hover:text-purple-400 transition-colors"
                  title="Share via Email"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  onClick={copyToClipboard}
                  className="p-2 text-gray-400 hover:text-green-400 transition-colors"
                  title="Copy Link"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <ProjectDisplay repoData={repoData} />
        </div>
      )}
    </div>
  );
}

export default App;
