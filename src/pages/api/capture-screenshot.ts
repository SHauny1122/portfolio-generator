import { Request, Response } from 'express';
import puppeteer from 'puppeteer';
import { supabase } from '../../lib/supabase';

interface ScreenshotRequest {
  url: string;
  viewport: {
    width: number;
    height: number;
  };
}

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, viewport } = req.body as ScreenshotRequest;

    // Launch browser with specific options for better compatibility
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080'
      ]
    });

    try {
      const page = await browser.newPage();
      await page.setViewport(viewport);
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

      // Add glass-morphism effect overlay for better visual consistency
      await page.evaluate(() => {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0));
          backdrop-filter: blur(10px);
          pointer-events: none;
          z-index: 9999;
        `;
        document.body.appendChild(overlay);
      });

      const screenshot = await page.screenshot({
        type: 'png',
        fullPage: false
      });

      // Upload to Supabase with a clean filename
      const timestamp = Date.now();
      const cleanUrl = new URL(url).hostname.replace(/[^a-z0-9]/gi, '-');
      const fileName = `${cleanUrl}-${viewport.width}x${viewport.height}-${timestamp}.png`;
      
      const { error } = await supabase.storage
        .from('project-screenshots')
        .upload(fileName, screenshot, {
          contentType: 'image/png',
          cacheControl: '3600'
        });

      if (error) throw error;

      // Get the public URL for social sharing
      const { data: { publicUrl } } = supabase.storage
        .from('project-screenshots')
        .getPublicUrl(fileName);

      res.status(200).json({ 
        screenshotUrl: publicUrl,
        success: true 
      });
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error('Screenshot capture error:', error);
    res.status(500).json({ 
      error: 'Failed to capture screenshot',
      success: false
    });
  }
}
