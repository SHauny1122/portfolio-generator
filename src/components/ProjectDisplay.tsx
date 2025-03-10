import { RepoData } from '../services/github';

interface ProjectDisplayProps {
  repoData: RepoData;
}

const getLanguageColor = (language: string): string => {
  const colors: { [key: string]: string } = {
    TypeScript: '#3178c6',
    JavaScript: '#f1e05a',
    Python: '#3572A5',
    Java: '#b07219',
    CSS: '#563d7c',
    HTML: '#e34c26',
    Ruby: '#701516',
    Go: '#00ADD8',
    PHP: '#4F5D95',
    'C++': '#f34b7d',
    C: '#555555',
    'C#': '#178600',
    Shell: '#89e051',
    PowerShell: '#012456',
    CMake: '#DA3434',
    Batchfile: '#C1F12E',
    Rust: '#dea584',
    Swift: '#F05138',
    Kotlin: '#A97BFF',
    Dart: '#00B4AB',
    PLpgSQL: '#336790',
    Other: '#ededed'
  };
  return colors[language] || colors.Other;
};

export function ProjectDisplay({ repoData }: ProjectDisplayProps) {
  const totalBytes = Object.values(repoData.languages).reduce((a, b) => a + b, 0);
  
  const sortedLanguages = Object.entries(repoData.languages)
    .sort(([, a], [, b]) => b - a)
    .map(([lang, bytes]) => ({
      name: lang,
      percentage: (bytes / totalBytes) * 100,
      bytes
    }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 z-0" />
        {repoData.images[0] && (
          <div className="absolute inset-0 opacity-10">
            <img
              src={repoData.images[0]}
              alt="Project Background"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="relative z-10 text-center px-6 md:px-8 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 leading-tight">
            {repoData.name}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mb-12">
            {repoData.description}
          </p>
          <div className="flex flex-wrap gap-6 justify-center mt-8">
            <a
              href={repoData.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition-all hover:scale-105 flex items-center gap-3 shadow-lg shadow-blue-500/20"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              View on GitHub
            </a>
            {repoData.homepage && (
              <a
                href={repoData.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl font-medium transition-all hover:scale-105 flex items-center gap-3 shadow-lg shadow-purple-500/20"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Live Demo
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Project Info */}
          <div className="space-y-8">
            {/* Timeline Card */}
            <div className="bg-gray-800/50 rounded-2xl p-6 backdrop-blur-sm border border-gray-700/50">
              <h2 className="text-2xl font-semibold mb-4 text-blue-400">Project Timeline</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Started</span>
                  <span>{new Date(repoData.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Last Update</span>
                  <span>{new Date(repoData.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Status</span>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-gray-800/50 rounded-2xl p-6 backdrop-blur-sm border border-gray-700/50">
              <h2 className="text-2xl font-semibold mb-4 text-purple-400">Project Stats</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-700/30 rounded-xl">
                  <div className="text-2xl font-bold text-yellow-400">{repoData.stars}</div>
                  <div className="text-sm text-gray-400">Stars</div>
                </div>
                <div className="text-center p-4 bg-gray-700/30 rounded-xl">
                  <div className="text-2xl font-bold text-blue-400">{repoData.forks}</div>
                  <div className="text-sm text-gray-400">Forks</div>
                </div>
                <div className="text-center p-4 bg-gray-700/30 rounded-xl">
                  <div className="text-2xl font-bold text-purple-400">{repoData.watchers}</div>
                  <div className="text-sm text-gray-400">Watchers</div>
                </div>
              </div>
            </div>

            {/* Technologies Card */}
            <div className="bg-gray-800/50 rounded-2xl p-6 backdrop-blur-sm border border-gray-700/50">
              <h2 className="text-2xl font-semibold mb-4 text-green-400">Technologies</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">Main Language:</span>{' '}
                  <span 
                    className="px-3 py-1 rounded-full text-sm font-medium" 
                    style={{ 
                      backgroundColor: `${getLanguageColor(repoData.language)}20`,
                      color: getLanguageColor(repoData.language) 
                    }}
                  >
                    {repoData.language}
                  </span>
                </div>
                {sortedLanguages.length > 0 && (
                  <div className="space-y-4">
                    <div className="h-3 rounded-full overflow-hidden flex">
                      {sortedLanguages.map((lang) => (
                        <div
                          key={lang.name}
                          style={{
                            width: `${lang.percentage}%`,
                            backgroundColor: getLanguageColor(lang.name)
                          }}
                          className="h-full first:rounded-l-full last:rounded-r-full relative group"
                        >
                          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {sortedLanguages.map((lang) => (
                        <div 
                          key={lang.name} 
                          className="flex items-center gap-2 px-3 py-2 rounded-lg"
                          style={{
                            backgroundColor: `${getLanguageColor(lang.name)}15`
                          }}
                        >
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getLanguageColor(lang.name) }}
                          />
                          <span className="text-sm flex-1 truncate">
                            {lang.name}
                          </span>
                          <span 
                            className="text-sm font-medium"
                            style={{ color: getLanguageColor(lang.name) }}
                          >
                            {lang.percentage.toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Project Screenshots */}
          <div className="space-y-8">
            {repoData.images.length > 0 && (
              <div className="bg-gray-800/50 rounded-2xl p-6 backdrop-blur-sm border border-gray-700/50">
                <h2 className="text-2xl font-semibold mb-4 text-pink-400">Project Screenshots</h2>
                <div className="grid gap-4">
                  {repoData.images.map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden group"
                    >
                      <img
                        src={image}
                        alt={`${repoData.name} screenshot ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Topics */}
            {repoData.topics.length > 0 && (
              <div className="bg-gray-800/50 rounded-2xl p-6 backdrop-blur-sm border border-gray-700/50">
                <h2 className="text-2xl font-semibold mb-4 text-orange-400">Topics</h2>
                <div className="flex flex-wrap gap-2">
                  {repoData.topics.map((topic) => (
                    <span
                      key={topic}
                      className="px-4 py-2 bg-orange-500/10 text-orange-400 rounded-full text-sm border border-orange-500/20"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
