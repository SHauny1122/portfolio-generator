import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

declare global {
  interface Window {
    paypal?: any;
  }
}

interface PayPalButtonProps {
  userId: string;
  onSuccess: () => void;
  onError: (error: Error) => void;
}

export function PayPalButton({ userId, onSuccess, onError }: PayPalButtonProps) {
  useEffect(() => {
    const loadPayPalScript = async () => {
      try {
        // Load PayPal SDK
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID}&currency=USD`;
        script.async = true;
        
        script.onload = () => {
          if (window.paypal) {
            window.paypal.Buttons({
              createOrder: () => {
                return window.paypal.createOrder({
                  purchase_units: [{
                    amount: {
                      value: '19.99',
                      currency_code: 'USD'
                    },
                    description: 'Lifetime Premium Access - Portfolio Generator'
                  }]
                });
              },
              onApprove: async (data: any, actions: any) => {
                try {
                  await actions.order.capture();
                  
                  // Update user to premium in Supabase
                  const { error } = await supabase
                    .from('user_profiles')
                    .update({ 
                      is_premium: true,
                      payment_id: data.orderID 
                    })
                    .eq('id', userId);

                  if (error) throw error;
                  onSuccess();
                } catch (error) {
                  onError(error instanceof Error ? error : new Error('Payment processing failed'));
                }
              },
              onError: (err: Error) => {
                onError(err);
              }
            }).render('#paypal-button-container');
          }
        };

        document.body.appendChild(script);

        return () => {
          document.body.removeChild(script);
        };
      } catch (error) {
        onError(error instanceof Error ? error : new Error('Failed to load PayPal'));
      }
    };

    loadPayPalScript();
  }, [userId, onSuccess, onError]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-2">Upgrade to Premium</h3>
        <p className="text-gray-400 mb-4">
          Get unlimited portfolio generations for a one-time payment
        </p>
        <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">Price</span>
            <span className="text-white font-bold">$19.99</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Type</span>
            <span className="text-white">Lifetime Access</span>
          </div>
        </div>
        <div id="paypal-button-container" />
      </div>
    </div>
  );
}
