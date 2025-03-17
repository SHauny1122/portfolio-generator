import PayPalButton from './PayPalButton';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export function PremiumModal({ isOpen, onClose, userId }: PremiumModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 p-8 rounded-xl shadow-2xl border border-white/10 max-w-lg w-full mx-4 transform transition-all">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
            Unlock Premium Features
          </h2>
          <p className="text-gray-300 mb-6">
            One-time payment, lifetime access to unlimited portfolios
          </p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm p-4 rounded-lg border border-white/10">
              <div className="text-2xl font-bold text-white mb-1">3</div>
              <div className="text-sm text-gray-300">Free Limit</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm p-4 rounded-lg border border-white/10">
              <div className="text-2xl font-bold text-white mb-1">∞</div>
              <div className="text-sm text-gray-300">Premium</div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="text-sm text-gray-400 line-through">$29.99</span>
            <span className="text-xl font-bold text-white">$19.99</span>
          </div>
          <ul className="text-sm text-gray-300 space-y-2 mb-6 text-left">
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Unlimited Portfolio Generation
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Priority Support
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Lifetime Updates
            </li>
          </ul>
        </div>
        
        <PayPalButton 
          userId={userId}
          amount="19.99"
          onSuccess={() => {
            onClose();
            window.location.reload(); // Refresh to update UI with premium status
          }}
        />
      </div>
    </div>
  );
}
