import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { generateMarkdown, updateReadme, fetchExistingReadme, generateEnhancedReadme } from '../services/readme';
import { useToast } from '../hooks';
import ReactMarkdown from 'react-markdown';

interface ReadmeGeneratorProps {
  repoUrl: string;
  repoData: any;
}

export function ReadmeGenerator({ repoUrl, repoData }: ReadmeGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');
  const [currentReadme, setCurrentReadme] = useState<string>('');
  const [previewReadme, setPreviewReadme] = useState<string>('');
  const [readmeSha, setReadmeSha] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchCurrentReadme();
  }, [repoUrl]);

  const fetchCurrentReadme = async () => {
    try {
      const readme = await fetchExistingReadme(repoUrl);
      if (readme) {
        setCurrentReadme(readme.content);
        setReadmeSha(readme.sha);
      } else {
        setCurrentReadme('No README found');
      }
    } catch (error) {
      console.error('Error fetching README:', error);
      showToast('Failed to fetch current README', 'error');
    }
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleGenerateAIReadme = async () => {
    try {
      setLoading(true);
      const content = await generateEnhancedReadme(repoUrl, repoData);
      content.features = features;
      
      const markdown = generateMarkdown(content);
      setPreviewReadme(markdown);
      setShowPreview(true);
      showToast('Enhanced README generated!', 'success');
    } catch (error) {
      console.error('Error generating README:', error);
      showToast(error instanceof Error ? error.message : 'Error generating README', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReadme = async () => {
    try {
      setLoading(true);
      const success = await updateReadme(repoUrl, previewReadme, readmeSha);
      
      if (success) {
        showToast('README.md updated successfully!', 'success');
        fetchCurrentReadme(); // Refresh current README
      } else {
        showToast('Failed to update README.md', 'error');
      }
    } catch (error) {
      console.error('Error updating README:', error);
      showToast(error instanceof Error ? error.message : 'Error updating README', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddFeature();
    }
  };

  return (
    <div className="glass-card p-6 rounded-xl space-y-6">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          README Generator
        </h3>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-200">Add Features</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., Real-time data synchronization, AI-powered recommendations"
              className="flex-1 px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            <button
              onClick={handleAddFeature}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {features.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-200">Features List</label>
            <div className="space-y-2">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/30 border border-gray-700"
                >
                  <span className="flex-1">{feature}</span>
                  <button
                    onClick={() => handleRemoveFeature(index)}
                    className="p-1 text-red-400 hover:text-red-300 transition-colors"
                  >
                    ✕
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* README Preview Section */}
        <div className="space-y-4 mt-6">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-medium text-gray-200">Current README</h4>
            <div className="text-sm text-gray-400">
              {readmeSha ? 'Last updated: ' + new Date().toLocaleDateString() : 'No README found'}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700 prose prose-invert max-w-none">
            <ReactMarkdown>{currentReadme}</ReactMarkdown>
          </div>
        </div>

        {showPreview && (
          <div className="space-y-4 mt-6">
            <h4 className="text-lg font-medium text-gray-200">Preview</h4>
            <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700 prose prose-invert max-w-none">
              <ReactMarkdown>{previewReadme}</ReactMarkdown>
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <motion.button
            onClick={handleGenerateAIReadme}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex-1 py-3 px-4 rounded-lg transition-all duration-200 ${
              loading
                ? 'bg-gray-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </span>
            ) : (
              <>
                <span className="text-lg mr-2">🤖</span>
                Generate AI README
              </>
            )}
          </motion.button>

          <motion.button
            onClick={handleUpdateReadme}
            disabled={loading || !showPreview}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex-1 py-3 px-4 rounded-lg transition-all duration-200 ${
              loading || !showPreview
                ? 'bg-gray-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
            }`}
          >
            Update README
          </motion.button>
        </div>
      </div>
    </div>
  );
}
