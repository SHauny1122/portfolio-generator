import { useState, useEffect } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDesktop, FaMobile } from 'react-icons/fa';
import { captureScreenshots } from '../services/screenshots';

interface LiveSitePreviewProps {
  url: string;
  className?: string;
}

export default function LiveSitePreview({ url, className = '' }: LiveSitePreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [desktopPreview, setDesktopPreview] = useState<string | null>(null);
  const [mobilePreview, setMobilePreview] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'desktop' | 'mobile'>('desktop');
  
  const session = useSession();

  useEffect(() => {
    async function loadPreviews() {
      setIsLoading(true);
      setError(null);

      try {
        if (!session) {
          throw new Error('Please sign in to view live site previews');
        }

        const screenshots = await captureScreenshots(url);
        if (!screenshots) {
          throw new Error('Failed to capture screenshots');
        }

        setDesktopPreview(screenshots.desktop);
        setMobilePreview(screenshots.mobile);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load previews');
      } finally {
        setIsLoading(false);
      }
    }

    if (url) {
      loadPreviews();
    }
  }, [url, session]);

  if (!session) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 text-center backdrop-blur-lg"
      >
        <p className="text-gray-300">Please sign in to view live site previews</p>
      </motion.div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <motion.h3 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
        >
          Live Site Preview
        </motion.h3>
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveView('desktop')}
            className={`glass-button px-4 py-2 flex items-center gap-2 transition-colors duration-200 ${
              activeView === 'desktop' ? 'bg-blue-500/30 border border-blue-500/50' : ''
            }`}
          >
            <FaDesktop /> Desktop
          </motion.button>
          <motion.button
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveView('mobile')}
            className={`glass-button px-4 py-2 flex items-center gap-2 transition-colors duration-200 ${
              activeView === 'mobile' ? 'bg-blue-500/30 border border-blue-500/50' : ''
            }`}
          >
            <FaMobile /> Mobile
          </motion.button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card p-6 rounded-xl overflow-hidden backdrop-blur-lg"
      >
        {isLoading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-64 space-y-4"
          >
            <div className="loading-spinner w-12 h-12 border-t-2 border-blue-500 rounded-full animate-spin"></div>
            <p className="text-gray-400">Capturing screenshots...</p>
          </motion.div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-4 rounded-lg bg-red-500/10 border border-red-500/20"
          >
            <p className="text-red-400">{error}</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              {activeView === 'desktop' ? (
                <img
                  src={desktopPreview || ''}
                  alt="Desktop preview"
                  className="w-full rounded-lg shadow-lg"
                />
              ) : (
                <img
                  src={mobilePreview || ''}
                  alt="Mobile preview"
                  className="w-full max-w-sm mx-auto rounded-lg shadow-lg"
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}
