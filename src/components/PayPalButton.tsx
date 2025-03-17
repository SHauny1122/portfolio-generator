import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks';

declare global {
  interface Window {
    paypal: any;
  }
}

interface PayPalButtonProps {
  userId: string;
  amount: string;
  onSuccess?: () => void;
}

export default function PayPalButton({ userId, amount, onSuccess }: PayPalButtonProps) {
  const paypalButtonRef = useRef<HTMLDivElement>(null);
  const { supabase } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID}&currency=USD`;
    script.async = true;

    script.onload = () => {
      if (!paypalButtonRef.current || !window.paypal) return;

      window.paypal.Buttons({
        createOrder: (_data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              description: 'Portfolio Generator Premium',
              amount: {
                value: amount
              }
            }]
          });
        },
        onApprove: async (_data: any, actions: any) => {
          const order = await actions.order.capture();
          
          try {
            const { error } = await supabase
              .from('user_profiles')
              .update({ 
                is_premium: true,
                payment_id: order.id,
                payment_completed_at: new Date().toISOString()
              })
              .eq('id', userId);

            if (error) throw error;

            showToast('Payment successful!', 'success');
            onSuccess?.();
          } catch (error) {
            console.error('Error recording payment:', error);
            showToast('Error recording payment', 'error');
          }
        },
        onError: (err: any) => {
          console.error('PayPal error:', err);
          showToast('Payment failed', 'error');
        }
      }).render(paypalButtonRef.current);
    };

    document.body.appendChild(script);

    return () => {
      const script = document.querySelector('script[src*="paypal"]');
      if (script) script.remove();
    };
  }, [userId, amount, onSuccess, showToast]);

  return (
    <div className="w-full">
      <div ref={paypalButtonRef} className="min-h-[45px]" />
    </div>
  );
}
