import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import puppeteer from 'https://deno.land/x/puppeteer@16.2.0/mod.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const supabaseUrl = Deno.env.get('URL')!;
const supabaseServiceKey = Deno.env.get('SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface RequestBody {
  url: string;
  viewport: 'desktop' | 'mobile';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract token and verify with Supabase
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { url, viewport } = await req.json() as RequestBody;
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Launch browser with modern viewport settings
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set viewport based on modern device sizes
    if (viewport === 'mobile') {
      await page.setViewport({ 
        width: 390,  // iPhone 12/13/14 width
        height: 844, // iPhone 12/13/14 height
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true
      });
    } else {
      await page.setViewport({ 
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1
      });
    }

    // Navigate and wait for network idle
    await page.goto(url, { 
      waitUntil: ['networkidle0', 'load', 'domcontentloaded'],
      timeout: 30000 
    });
    
    // Wait for any lazy-loaded images and animations
    await page.waitForTimeout(2500);

    // Take high-quality screenshot
    const screenshot = await page.screenshot({ 
      type: 'jpeg', 
      quality: 90,
      fullPage: false
    });
    
    await browser.close();

    // Upload to Supabase Storage with organized path
    const timestamp = new Date().getTime();
    const filename = `${user.id}/${viewport}-${timestamp}.jpg`;
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('project-screenshots')
      .upload(filename, screenshot, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Failed to upload screenshot: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('project-screenshots')
      .getPublicUrl(filename);

    return new Response(
      JSON.stringify({ url: publicUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Screenshot error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
