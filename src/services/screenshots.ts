import { RepoData } from './github';

export interface LiveSiteScreenshots {
  desktop: string;
  mobile: string;
}

export function findLiveSiteUrl(repoData: RepoData): string | null {
  if (repoData.homepage) {
    return repoData.homepage;
  }
  return null;
}

export async function captureScreenshots(url: string): Promise<LiveSiteScreenshots | null> {
  try {
    // Ensure URL has protocol
    const targetUrl = url.startsWith('http') ? url : `https://${url}`;
    
    // Create screenshot URLs with Microlink
    // Desktop: 1920x1080 with better quality and wait time
    const desktopUrl = `https://api.microlink.io?url=${encodeURIComponent(targetUrl)}&screenshot=true&meta=false&embed=screenshot.url&waitForTimeout=1500&overlay.browser=false&force=true`;
    
    // Mobile: iPhone SE size (375x667)
    const mobileUrl = `https://api.microlink.io?url=${encodeURIComponent(targetUrl)}&screenshot=true&meta=false&embed=screenshot.url&waitForTimeout=1500&viewport.width=375&viewport.height=667&overlay.browser=false&force=true`;

    return {
      desktop: desktopUrl,
      mobile: mobileUrl
    };
  } catch (error) {
    console.error('Error with screenshot capture:', error);
    return null;
  }
}
