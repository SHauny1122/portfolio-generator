import { useState } from 'react';
import { PayPalButton } from './PayPalButton';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export function PremiumModal({ isOpen, onClose, userId }: PremiumModalProps) {
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSuccess = () => {
    onClose();
    window.location.reload(); // Refresh to update UI with premium status
  };

  const handleError = (error: Error) => {
    setError(error.message);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 border border-gray-800 shadow-xl">
        <div className="absolute top-4 right-4">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="mb-4 text-yellow-500">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Upgrade to Premium</h2>
          <p className="text-gray-400">
            You've reached the limit of 3 free portfolios. Upgrade to premium for unlimited access!
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="text-2xl font-bold text-white mb-1">3</div>
              <div className="text-sm text-gray-400">Free Limit</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="text-2xl font-bold text-white mb-1">∞</div>
              <div className="text-sm text-gray-400">Premium</div>
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <PayPalButton 
            userId={userId}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </div>
      </div>
    </div>
  );
}
