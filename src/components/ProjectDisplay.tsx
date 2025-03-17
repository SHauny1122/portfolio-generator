import { useState, useEffect } from 'react';
import { RepoData } from '../services/github';
import { FaGithub, FaLink, FaArrowLeft, FaExternalLinkAlt } from 'react-icons/fa';
import { ShareButtons } from './ShareButtons';
import { ActivityGrid } from './ActivityGrid';
import { motion } from 'framer-motion';
import { captureScreenshots, findLiveSiteUrl, LiveSiteScreenshots } from '../services/screenshots';
import '../styles/glass.css';

interface ProjectDisplayProps {
  repoData: RepoData;
  onBack: () => void;
  className?: string;
}

export function ProjectDisplay({ repoData, onBack }: ProjectDisplayProps) {
  const [screenshots, setScreenshots] = useState<LiveSiteScreenshots | null>(null);

  useEffect(() => {
    const liveSiteUrl = findLiveSiteUrl(repoData);
    if (liveSiteUrl) {
      const getScreenshots = async () => {
        try {
          const screenshots = await captureScreenshots(liveSiteUrl);
          setScreenshots(screenshots);
        } catch (error) {
          console.error('Failed to capture screenshots:', error);
        }
      };
      getScreenshots();
    }
  }, [repoData]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back and Account */}
        <div className="flex justify-between items-center mb-8">
          <motion.button
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBack}
            className="glass-button px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FaArrowLeft />
            Back
          </motion.button>
          <div className="flex items-center gap-4">
          </div>
        </div>

        <div className="space-y-8">
          {/* Project Info Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 rounded-xl"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-6 max-w-3xl">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  {repoData.name}
                </h1>
                
                {/* Enhanced Description Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-card bg-gradient-to-r from-blue-500/5 to-purple-500/5 backdrop-blur-sm p-6 rounded-lg border border-blue-500/10"
                >
                  <p className="text-lg text-gray-300 leading-relaxed">
                    {repoData.description || "No description available. Add a description to your GitHub repository to make it more appealing!"}
                  </p>
                </motion.div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 pt-2">
                  <motion.a
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    href={repoData.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-button px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <FaGithub />
                    View on GitHub
                  </motion.a>
                  {repoData.homepage && (
                    <motion.a
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      href={repoData.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass-button px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <FaLink />
                      Live Site
                    </motion.a>
                  )}
                </div>
              </div>

              {/* Share Buttons - Kept in original position */}
              <div className="flex gap-2">
                <ShareButtons url={repoData.htmlUrl} title={repoData.name} />
              </div>
            </div>

            <div className="mt-8">
              {/* Languages Section */}
              <div className="glass-card p-4 rounded-lg mb-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Languages</span>
                </div>
                {Object.keys(repoData.languages).length > 0 ? (
                  <>
                    <div className="h-2 rounded-full bg-gray-800/50 backdrop-blur-sm overflow-hidden">
                      {Object.entries(repoData.languages).map(([language, bytes]) => {
                        const totalBytes = Object.values(repoData.languages).reduce((a, b) => a + b, 0);
                        const percentage = (bytes / totalBytes) * 100;
                        const languageColors: { [key: string]: string } = {
                          TypeScript: 'bg-[#007ACC]', // Bright blue
                          JavaScript: 'bg-[#F7DF1E]', // Bright yellow
                          Python: 'bg-[#3776AB]', // Python blue
                          Java: 'bg-[#ED8B00]', // Java orange
                          PHP: 'bg-[#777BB4]', // PHP purple
                          Ruby: 'bg-[#CC342D]', // Ruby red
                          CSS: 'bg-[#563D7C]', // Bootstrap purple
                          HTML: 'bg-[#E34F26]', // HTML orange
                          'C++': 'bg-[#00599C]', // C++ blue
                          'C#': 'bg-[#239120]', // C# green
                          Go: 'bg-[#00ADD8]', // Go blue
                          Rust: 'bg-[#DEA584]', // Rust orange
                          Swift: 'bg-[#FA7343]', // Swift orange
                          Kotlin: 'bg-[#A97BFF]', // Kotlin purple
                          Dart: 'bg-[#00B4AB]', // Dart teal
                          Vue: 'bg-[#4FC08D]', // Vue green
                          React: 'bg-[#61DAFB]', // React blue
                          Shell: 'bg-[#89E051]', // Shell green
                          PostgreSQL: 'bg-[#336791]', // PostgreSQL blue
                          MySQL: 'bg-[#4479A1]', // MySQL blue
                        };
                        
                        const fallbackColors = [
                          'bg-[#FF0080]', // Hot pink
                          'bg-[#7928CA]', // Bright purple
                          'bg-[#0070F3]', // Bright blue
                          'bg-[#00DFD8]', // Cyan
                          'bg-[#FF4D4D]', // Bright red
                          'bg-[#F5A623]', // Orange
                          'bg-[#50E3C2]', // Mint
                          'bg-[#7ED321]', // Green
                          'bg-[#B4EC51]', // Lime
                          'bg-[#A389F4]'  // Purple
                        ];

                        return (
                          <div
                            key={language}
                            className={`h-full float-left first:rounded-l-full last:rounded-r-full ${languageColors[language] || fallbackColors[Object.keys(repoData.languages).indexOf(language) % fallbackColors.length]}`}
                            style={{
                              width: `${percentage}%`,
                            }}
                            title={`${language}: ${percentage.toFixed(1)}%`}
                          />
                        );
                      })}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3">
                      {Object.entries(repoData.languages).map(([language, bytes]) => {
                        const totalBytes = Object.values(repoData.languages).reduce((a, b) => a + b, 0);
                        const percentage = (bytes / totalBytes) * 100;
                        return (
                          <div key={language} className="flex items-center gap-2">
                            <span className="text-sm text-gray-300">{language}</span>
                            <span className="text-xs text-gray-400">{percentage.toFixed(1)}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-400">No language data available</div>
                )}
              </div>

              {/* Stats and Activity Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {/* Repository Stats */}
                <div className="glass-card p-4 rounded-lg backdrop-blur-sm">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Stars:</span>
                      <span className="text-gray-300">{repoData.stars}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Contributors:</span>
                      <span className="text-gray-300">{repoData.contributorsCount ? `${repoData.contributorsCount}+` : '0'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Updated:</span>
                      <span className="text-gray-300">{new Date(repoData.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Activity Grid */}
                {repoData.commitActivity && repoData.commitActivity.length > 0 && (
                  <ActivityGrid commitActivity={repoData.commitActivity} />
                )}
              </div>

              {/* Screenshots Section */}
              {repoData.homepage && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="glass-card p-8 rounded-xl relative mt-4"
                >
                  <div className="flex items-center mb-6">
                    <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                      Live Site Preview
                    </h2>
                  </div>

                  {/* Screenshot Display with Glass Effect */}
                  <div className="relative w-full overflow-hidden rounded-lg bg-gray-900/50 backdrop-blur-sm">
                    {screenshots ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="relative w-full"
                      >
                        <motion.img
                          src={screenshots.desktop}
                          alt={`${repoData.name} preview`}
                          className="w-full h-auto rounded-lg shadow-xl transition-all duration-300"
                          style={{
                            minHeight: '400px',
                            objectFit: 'cover',
                            objectPosition: 'top'
                          }}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.style.display = 'none';
                            console.error('Error loading screenshot');
                          }}
                        />
                      </motion.div>
                    ) : (
                      <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-gray-400 flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          Loading preview...
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Visit Site Button */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <motion.a
                      href={repoData.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass-button px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-500/30 transition-all duration-300"
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FaExternalLinkAlt className="text-sm" />
                      Visit Site
                    </motion.a>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
