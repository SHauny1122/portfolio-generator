import puppeteer from 'puppeteer';
import { uploadScreenshot } from '../../../services/storage';
import { supabase } from '../../../services/supabase';

export async function POST({ request }: { request: Request }) {
  try {
    // Get auth header from request
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify auth token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { url, viewport } = await request.json();

    // Validate input
    if (!url || !viewport || !viewport.width || !viewport.height) {
      return new Response(JSON.stringify({ error: 'Invalid input parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Launch browser with proper headless mode
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      await page.setViewport(viewport);
      
      // Add dark theme styles with glass-morphism effects
      await page.evaluateHandle(() => {
        const style = document.createElement('style');
        style.textContent = `
          :root {
            color-scheme: dark;
          }
          body {
            background-color: rgba(17, 24, 39, 0.95) !important;
            color: #fff !important;
            backdrop-filter: blur(8px);
          }
          /* Glass-morphism effects */
          .glass-card {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.15);
          }
          .glass-button {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2));
            backdrop-filter: blur(4px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            transition: all 0.3s ease;
          }
          .glass-button:hover {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3));
            transform: translateY(-1px);
          }
          /* Spacing utilities */
          .space-y-4 > * + * {
            margin-top: 1rem;
          }
          .space-x-4 > * + * {
            margin-left: 1rem;
          }
          /* Subtle animations */
          .fade-in {
            animation: fadeIn 0.3s ease-in-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `;
        document.head.appendChild(style);
      });

      // Navigate with proper error handling
      try {
        await page.goto(url, { 
          waitUntil: 'networkidle0',
          timeout: 30000
        });
      } catch (navigationError) {
        console.error('Navigation error:', navigationError);
        return new Response(JSON.stringify({ error: 'Failed to load the target website' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Take screenshot with high quality
      const screenshot = await page.screenshot({
        type: 'jpeg',
        quality: 90,
        encoding: 'binary'
      });

      // Convert screenshot to File object with user ID in filename
      const file = new File([screenshot], `screenshot-${user.id}-${Date.now()}.jpg`, {
        type: 'image/jpeg'
      });

      // Upload to Supabase with proper error handling
      const publicUrl = await uploadScreenshot(file);
      if (!publicUrl) {
        return new Response(JSON.stringify({ error: 'Failed to upload screenshot' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ url: publicUrl }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to capture screenshot',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
