import { useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';

interface PayPalButtonProps {
  userId: string;
  onSuccess?: () => void;
}

export default function PayPalButton({ userId, onSuccess }: PayPalButtonProps) {
  const paypalButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID}&currency=USD`;
    script.async = true;

    script.onload = () => {
      if (!paypalButtonRef.current) return;

      // @ts-ignore
      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          shape: 'rect',
          label: 'pay'
        },
        createOrder: (_data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              description: 'Portfolio Generator Premium',
              amount: {
                value: '19.99'
              }
            }]
          });
        },
        onApprove: async (_data: any, actions: any) => {
          const order = await actions.order.capture();
          
          const { error } = await supabase
            .from('user_profiles')
            .update({ 
              is_premium: true,
              payment_id: order.id,
              payment_completed_at: new Date().toISOString()
            })
            .eq('id', userId);

          if (error) {
            console.error('Failed to update user status:', error);
            return;
          }

          onSuccess?.();
        }
      }).render(paypalButtonRef.current);
    };

    document.body.appendChild(script);

    return () => {
      const script = document.querySelector('script[src*="paypal"]');
      if (script) script.remove();
    };
  }, [userId, onSuccess]);

  return (
    <div className="w-full">
      <div ref={paypalButtonRef} className="min-h-[45px]" />
    </div>
  );
}
