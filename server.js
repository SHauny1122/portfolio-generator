const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Create PayPal Order
app.post('/create-paypal-order', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ') || 
        authHeader.split(' ')[1] !== process.env.VITE_PAYPAL_SECRET_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { userId, amount } = req.body;

    // Verify user exists and isn't already premium
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('is_premium')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.is_premium) {
      return res.status(400).json({ error: 'User is already premium' });
    }

    // Create PayPal order
    const response = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(
          `${process.env.VITE_PAYPAL_CLIENT_ID}:${process.env.VITE_PAYPAL_SECRET_KEY}`
        ).toString('base64')}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: amount,
            },
            description: 'Portfolio Generator Premium Access',
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('PayPal API error:', error);
      return res.status(response.status).json(error);
    }

    const order = await response.json();
    res.json(order);
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Capture PayPal Payment
app.post('/capture-paypal-order', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ') || 
        authHeader.split(' ')[1] !== process.env.VITE_PAYPAL_SECRET_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { orderId, userId } = req.body;

    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('is_premium')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Capture PayPal order
    const response = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(
          `${process.env.VITE_PAYPAL_CLIENT_ID}:${process.env.VITE_PAYPAL_SECRET_KEY}`
        ).toString('base64')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('PayPal capture error:', error);
      return res.status(response.status).json(error);
    }

    const captureData = await response.json();

    // Update user to premium
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
      return res.status(500).json({ error: 'Failed to update user status' });
    }

    res.json({
      success: true,
      message: 'Welcome to Premium! Your account has been upgraded.',
      data: captureData
    });
  } catch (error) {
    console.error('Error capturing PayPal payment:', error);
    res.status(500).json({ error: 'Failed to capture payment' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
