import { useState, useEffect } from 'react';
import { RepoData } from '../services/github';
import { FaGithub, FaLink, FaArrowLeft } from 'react-icons/fa';
import { ShareButtons } from './ShareButtons';

interface ProjectDisplayProps {
  repoData: RepoData;
  onBack: () => void;
}

export function ProjectDisplay({ repoData, onBack }: ProjectDisplayProps) {
  const screenshots = repoData.screenshots || [];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    if (screenshots.length) {
      setCurrentImageIndex((current) => (current + 1) % screenshots.length);
    }
  };

  const prevImage = () => {
    if (screenshots.length) {
      setCurrentImageIndex((current) => 
        current === 0 ? screenshots.length - 1 : current - 1
      );
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Hero Section */}
      <div className="relative h-[600px] bg-gradient-to-br from-blue-900 to-purple-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900"></div>
        
        {/* Content */}
        <div className="relative max-w-[90rem] mx-auto px-4 py-12 h-full flex flex-col">
          <div className="flex items-start justify-between w-full mb-auto">
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <FaArrowLeft />
              Back to Generator
            </button>
            <ShareButtons 
              title={repoData.name}
              description={repoData.description}
              url={repoData.htmlUrl}
            />
          </div>
          
          <div className="mb-48">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-200 mb-4 opacity-80">{repoData.name}</h1>
            <p className="text-xl text-gray-300 max-w-3xl mb-12 opacity-80">{repoData.description}</p>
            
            <div className="flex gap-4 relative z-10">
              <a
                href={repoData.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-blue-600/90 text-white rounded-lg hover:bg-blue-700 transition-colors backdrop-blur-sm"
              >
                <FaGithub size={20} />
                View on GitHub
              </a>
              {repoData.homepage && (
                <a
                  href={repoData.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600/90 text-white rounded-lg hover:bg-purple-700 transition-colors backdrop-blur-sm"
                >
                  <FaLink size={20} />
                  Live Demo
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[90rem] mx-auto px-4 -mt-48">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - 8 cols */}
          <div className="lg:col-span-8">
            {/* Screenshots */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-gray-700/50">
              <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Project Screenshots
              </h2>
              <div className="aspect-video bg-gray-900/50 rounded-lg overflow-hidden">
                {screenshots.length > 0 ? (
                  <div className="relative w-full h-full group">
                    <img
                      src={screenshots[currentImageIndex]}
                      alt={`${repoData.name} screenshot`}
                      className="w-full h-full object-contain"
                    />
                    {screenshots.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/75"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/75"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-500">No screenshots available</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - 4 cols */}
          <div className="lg:col-span-4 space-y-6">
            {/* Project Timeline */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-gray-700/50">
              <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Project Timeline
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Started</span>
                  <span className="text-white">{new Date(repoData.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Update</span>
                  <span className="text-white">{new Date(repoData.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Project Stats */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-gray-700/50">
              <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Project Stats
              </h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">{repoData.stars}</div>
                  <div className="text-sm text-gray-400">Stars</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{repoData.forks}</div>
                  <div className="text-sm text-gray-400">Forks</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{repoData.watchers}</div>
                  <div className="text-sm text-gray-400">Watchers</div>
                </div>
              </div>
            </div>

            {/* Technologies */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-gray-700/50">
              <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Technologies
              </h2>
              <div className="space-y-4">
                {Object.entries(repoData.languages || {}).map(([lang, bytes]) => {
                  const totalBytes = Object.values(repoData.languages || {}).reduce((a, b) => a + b, 0);
                  const percentage = totalBytes > 0 ? (bytes / totalBytes * 100).toFixed(1) : '0';
                  return (
                    <div key={lang}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white">{lang}</span>
                        <span className="text-gray-400">{percentage}%</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
