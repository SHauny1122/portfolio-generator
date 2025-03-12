import { useState } from 'react';
import { RepoData } from './services/github';
import { ProjectDisplay } from './components/ProjectDisplay';
import { MainApp } from './components/MainApp';
import { AuthModal } from './components/AuthModal';
import { PremiumModal } from './components/PremiumModal';
import { AccountMenu } from './components/AccountMenu';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthCallback } from './components/AuthCallback';
import { motion } from 'framer-motion';
import './styles/glass.css';

function AppContent() {
  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const { user } = useAuth();

  const handleBack = () => {
    setRepoData(null);
    window.history.pushState({}, '', '/');
  };

  if (window.location.pathname === '/auth/callback') {
    return <AuthCallback />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>

      {/* Header with Account Menu */}
      {!repoData && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 right-4 z-50"
        >
          <AccountMenu />
        </motion.div>
      )}

      {repoData ? (
        <ProjectDisplay repoData={repoData} onBack={handleBack} />
      ) : (
        <MainApp 
          onRepoData={setRepoData} 
          onShowAuth={() => setShowAuthModal(true)} 
          onShowPremium={() => setShowPremiumModal(true)} 
        />
      )}

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />

      {user && (
        <PremiumModal 
          isOpen={showPremiumModal}
          userId={user.id}
          onClose={() => setShowPremiumModal(false)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
