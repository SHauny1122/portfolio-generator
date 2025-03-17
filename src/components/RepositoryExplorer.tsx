import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks';
import { FaStar, FaCodeBranch, FaBook, FaTools, FaExternalLinkAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  default_branch: string;
  language: string | null;
  stargazers_count: number;
  visibility: string;
  owner: {
    login: string;
  };
}

interface ReadmeContent {
  content: string;
  encoding: string;
}

export function RepositoryExplorer() {
  const { supabase } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [readme, setReadme] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching GitHub session...');
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Failed to get session');
      }

      if (!session) {
        console.error('No session found');
        throw new Error('No session found');
      }

      console.log('Session found, checking provider token...');
      const providerToken = session.provider_token;
      
      if (!providerToken) {
        console.error('No provider token found in session');
        throw new Error('GitHub token not found. Please reconnect your GitHub account.');
      }

      console.log('Fetching repositories from GitHub...');
      const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
        headers: {
          Authorization: `Bearer ${providerToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('GitHub API error:', response.status, errorText);
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Found ${data.length} repositories`);
      setRepos(data);
    } catch (error) {
      console.error('Error in fetchRepositories:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch repositories';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchReadme = async (repo: GitHubRepo) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.provider_token) {
        throw new Error('GitHub token not found');
      }

      const response = await fetch(
        `https://api.github.com/repos/${repo.owner.login}/${repo.name}/readme`,
        {
          headers: {
            Authorization: `Bearer ${session.provider_token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      if (!response.ok) {
        setReadme('No README found for this repository.');
        return;
      }

      const data: ReadmeContent = await response.json();
      const decodedContent = atob(data.content);
      setReadme(decodedContent);
    } catch (error) {
      console.error('Error fetching README:', error);
      setReadme('Failed to load README.');
    }
  };

  const handleRepoClick = async (repo: GitHubRepo) => {
    setSelectedRepo(repo);
    await fetchReadme(repo);
  };

  const handleEditWithAI = (repo: GitHubRepo) => {
    navigate('/dev-tools', { 
      state: { 
        repoUrl: repo.html_url,
        repoData: {
          owner: repo.owner.login,
          name: repo.name,
          description: repo.description,
          url: repo.html_url,
          defaultBranch: repo.default_branch,
          language: repo.language,
          stars: repo.stargazers_count,
          visibility: repo.visibility
        }
      } 
    });
  };

  const handleRetry = () => {
    fetchRepositories();
  };

  const getLanguageColor = (language: string | null) => {
    const colors: { [key: string]: string } = {
      TypeScript: 'bg-blue-500',
      JavaScript: 'bg-yellow-500',
      Python: 'bg-green-500',
      Java: 'bg-red-500',
      // Add more languages as needed
      default: 'bg-gray-500',
    };
    return colors[language || ''] || colors.default;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
        <div className="text-red-400 mb-4">{error}</div>
        <button
          onClick={handleRetry}
          className="glass-button px-4 py-2 rounded-lg hover:bg-white/5"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (repos.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        <p>No repositories found.</p>
        <p className="mt-2">Make sure you have granted access to your repositories.</p>
        <button
          onClick={handleRetry}
          className="glass-button px-4 py-2 rounded-lg hover:bg-white/5 mt-4"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Repository List */}
      <div className="space-y-4">
        <div className="space-y-4">
          {repos.map((repo) => (
            <div
              key={repo.id}
              className={`p-4 rounded-lg transition-all ${
                selectedRepo?.id === repo.id
                  ? 'bg-blue-500 bg-opacity-10 border border-blue-500'
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-white">{repo.name}</h3>
                <div className="flex items-center space-x-4">
                  <span className="flex items-center text-gray-400">
                    <FaStar className="mr-1" />
                    {repo.stargazers_count}
                  </span>
                  {repo.language && (
                    <span className="flex items-center text-gray-400">
                      <span
                        className={`w-3 h-3 rounded-full mr-1 ${getLanguageColor(
                          repo.language
                        )}`}
                      />
                      {repo.language}
                    </span>
                  )}
                </div>
              </div>
              {repo.description && (
                <p className="text-gray-400 mb-3">{repo.description}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => handleRepoClick(repo)}
                  className="glass-button px-3 py-1.5 rounded flex items-center gap-1 hover:bg-white/5 transition-colors text-sm"
                >
                  <FaBook className="w-4 h-4" />
                  View README
                </button>
                <button
                  onClick={() => handleEditWithAI(repo)}
                  className="glass-button px-3 py-1.5 rounded flex items-center gap-1 hover:bg-white/5 transition-colors text-sm"
                >
                  <FaTools className="w-4 h-4" />
                  Edit with AI
                </button>
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-button px-3 py-1.5 rounded flex items-center gap-1 hover:bg-white/5 transition-colors text-sm"
                >
                  <FaExternalLinkAlt className="w-3 h-3" />
                  View on GitHub
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* README Viewer */}
      <div className="bg-gray-800 rounded-lg p-6">
        {selectedRepo ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <FaBook className="mr-2" />
                README
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditWithAI(selectedRepo)}
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <FaTools className="w-4 h-4" />
                  Edit with AI
                </button>
                <a
                  href={selectedRepo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <FaCodeBranch className="w-4 h-4" />
                  View on GitHub
                </a>
              </div>
            </div>
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown>{readme}</ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-12">
            <FaBook className="mx-auto text-4xl mb-4" />
            <p>Select a repository to view its README</p>
          </div>
        )}
      </div>
    </div>
  );
}
