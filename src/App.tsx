import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { MainApp } from './components/MainApp';
import { ProjectDisplay } from './components/ProjectDisplay';
import { AuthModal } from './components/AuthModal';
import { PremiumModal } from './components/PremiumModal';
import { useAuth } from './contexts/AuthContext';
import { AuthCallback } from './components/AuthCallback';
import { motion } from 'framer-motion';
import { DevToolsButton } from './components/DevToolsButton';
import { DevTools } from './pages/DevTools';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RepoData } from './services/github';
import { AccountMenu } from './components/AccountMenu';
import { ToastContainer } from './components/Toast';
import Account from './pages/Account';
import './styles/glass.css';

const queryClient = new QueryClient();

export default function App() {
  const { user, loading } = useAuth();
  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const navigate = useNavigate();

  const handleRepoData = (data: RepoData) => {
    setRepoData(data);
    navigate('/project');
  };

  const handleBack = () => {
    setRepoData(null);
    navigate('/');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // If not authenticated and not on auth callback, show auth
  if (!user && window.location.pathname !== '/auth/callback') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Portfolio Generator
            </h1>
            <AuthModal 
              isOpen={true}
              onClose={() => {}} // Keep open if not authenticated
            />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        {user && (
          <div className="fixed top-0 right-0 p-4 flex items-center gap-4 z-50">
            <DevToolsButton />
            <AccountMenu />
          </div>
        )}

        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route 
            path="/account" 
            element={
              loading ? (
                <LoadingSpinner />
              ) : user ? (
                <Account />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route 
            path="/project" 
            element={
              loading ? (
                <LoadingSpinner />
              ) : user && repoData ? (
                <ProjectDisplay repoData={repoData} onBack={handleBack} />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route 
            path="/dev-tools" 
            element={
              loading ? (
                <LoadingSpinner />
              ) : user ? (
                <DevTools />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route 
            path="/" 
            element={
              <div className="container mx-auto px-4 py-16">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-2xl mx-auto text-center"
                >
                  <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Portfolio Generator
                  </h1>
                  <MainApp 
                    onRepoData={handleRepoData}
                    onShowAuth={() => setShowAuthModal(true)}
                    onShowPremium={() => setShowPremiumModal(true)}
                  />
                </motion.div>
              </div>
            } 
          />
        </Routes>

        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
        {user && (
          <PremiumModal
            isOpen={showPremiumModal}
            onClose={() => setShowPremiumModal(false)}
            userId={user.id}
          />
        )}
        <ToastContainer />
      </div>
    </QueryClientProvider>
  );
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4" />
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>
  );
}
