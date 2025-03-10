import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { RepoData } from './services/github';
import { ProjectDisplay } from './components/ProjectDisplay';
import { MainApp } from './components/MainApp';
import { AuthModal } from './components/AuthModal';
import { PremiumModal } from './components/PremiumModal';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthCallback } from './components/AuthCallback';

function AppContent() {
  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const { user } = useAuth();

  const handleBack = () => {
    setRepoData(null);
    // Reset URL to base path
    window.history.pushState({}, '', '/');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {repoData ? (
        <ProjectDisplay repoData={repoData} onBack={handleBack} />
      ) : (
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route 
            path="/*" 
            element={
              <MainApp 
                onRepoData={setRepoData} 
                onShowAuth={() => setShowAuthModal(true)} 
                onShowPremium={() => setShowPremiumModal(true)} 
              />
            } 
          />
        </Routes>
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
