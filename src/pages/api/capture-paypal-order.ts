import { supabase } from '../../services/supabase';

export async function POST(req: Request) {
  try {
    // Verify authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ') || 
        authHeader.split(' ')[1] !== import.meta.env.VITE_PAYPAL_SECRET_KEY) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { orderId, userId } = await req.json();

    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('is_premium')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Capture PayPal order
    const response = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(
          `${import.meta.env.VITE_PAYPAL_CLIENT_ID}:${import.meta.env.VITE_PAYPAL_SECRET_KEY}`
        ).toString('base64')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('PayPal capture error:', error);
      return new Response(JSON.stringify(error), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const captureData = await response.json();

    // Update user to premium with a subtle animation delay
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        is_premium: true,
        payment_id: orderId,
        payment_completed_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Database update error:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to update user status' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Welcome to Premium! Your account has been upgraded.',
      data: captureData
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error capturing PayPal payment:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to capture payment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
