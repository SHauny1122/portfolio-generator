import { Octokit } from '@octokit/rest';
import { supabase } from '../lib/supabase';

const octokit = new Octokit({
  auth: import.meta.env.VITE_GITHUB_TOKEN,
});

export interface RepoData {
  name: string;
  description: string;
  url: string;
  htmlUrl: string;
  homepage: string;
  language: string;
  languages: { [key: string]: number };
  stars: number;
  forks: number;
  watchers: number;
  createdAt: string;
  updatedAt: string;
  topics: string[];
  isTemplate: boolean;
  visibility: string;
  defaultBranch: string;
  images: string[];
  screenshots?: string[];
  error?: 'LIMIT_REACHED';
}

export const extractRepoInfoFromUrl = (url: string): { owner: string; repo: string } | null => {
  try {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return null;
    return {
      owner: match[1],
      repo: match[2].replace('.git', '')
    };
  } catch {
    return null;
  }
};

const isDirectoryExists = async (owner: string, repo: string, path: string): Promise<boolean> => {
  try {
    await octokit.repos.getContent({
      owner,
      repo,
      path
    });
    return true;
  } catch (error) {
    return false;
  }
};

const searchImagesInPath = async (
  owner: string,
  repo: string,
  path: string,
  recursive = false,
  depth = 0
): Promise<string[]> => {
  if (depth > 3) return []; // Limit recursion depth

  try {
    // First check if directory exists
    if (!(await isDirectoryExists(owner, repo, path))) {
      console.log('Directory does not exist:', path);
      return [];
    }

    const { data: contents } = await octokit.repos.getContent({
      owner,
      repo,
      path
    });

    const images: string[] = [];

    for (const item of Array.isArray(contents) ? contents : [contents]) {
      if (item.type === 'file' && /\.(png|jpe?g|gif|svg|webp)$/i.test(item.name) && item.download_url) {
        console.log('Found image in', path + ':', item.name);
        images.push(item.download_url);
      } else if (recursive && item.type === 'dir') {
        // Recursively search in subdirectories
        console.log('Searching subdirectory:', item.path);
        const subImages = await searchImagesInPath(owner, repo, item.path, recursive, depth + 1);
        if (subImages.length > 0) {
          console.log('Found', subImages.length, 'images in', item.path);
        }
        images.push(...subImages);
      }
    }

    return images;
  } catch (error) {
    console.error('Error searching path:', path, error);
    return [];
  }
};

const findImagesInRepo = async (owner: string, repo: string): Promise<string[]> => {
  try {
    const images = new Set<string>();
    console.log('Searching for images in:', owner, repo);

    // 1. Common image directories to search
    const commonDirs = [
      'screenshots',
      'images',
      'assets',
      'public',
      'docs',
      '.github',
      'src/assets',
      'static',
      'media',
      'resources',
      'img',
      'public/images',
      'public/assets',
      'src/images',
      'documentation/images',
      'examples',
      'demo'
    ];

    // 2. Get repository content for root directory
    console.log('Checking root directory...');
    const { data: rootContents } = await octokit.repos.getContent({
      owner,
      repo,
      path: ''
    });

    // 3. Search in root directory
    if (Array.isArray(rootContents)) {
      console.log('Found files in root:', rootContents.length);
      for (const file of rootContents) {
        // Add images from root
        if (file.type === 'file' && /\.(png|jpe?g|gif|svg|webp)$/i.test(file.name) && file.download_url) {
          console.log('Found image in root:', file.name);
          images.add(file.download_url);
        }

        // Check if any of our common directories exist and search them
        if (file.type === 'dir') {
          const lowerName = file.name.toLowerCase();
          if (commonDirs.some(dir => lowerName.includes(dir.toLowerCase()))) {
            console.log('Searching directory:', file.path);
            const dirImages = await searchImagesInPath(owner, repo, file.path, true);
            console.log('Found images in directory:', dirImages.length);
            dirImages.forEach(img => images.add(img));
          }
        }
      }
    }

    // 4. Check README.md for image references
    try {
      console.log('Checking README...');
      const { data: readme } = await octokit.repos.getReadme({
        owner,
        repo,
      });

      // Extract image URLs from markdown content
      const content = atob(readme.content);
      const markdownImageRegex = /!\[.*?\]\((.*?)\)/g;
      const htmlImageRegex = /<img.*?src=["'](.*?)["']/g;

      let match;
      let readmeImages = 0;
      while ((match = markdownImageRegex.exec(content)) !== null) {
        const imageUrl = match[1];
        if (imageUrl.startsWith('http')) {
          images.add(imageUrl);
          readmeImages++;
        } else if (!imageUrl.startsWith('#')) {
          // Handle relative paths by constructing full GitHub raw URL
          const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${imageUrl.replace(/^\//, '')}`;
          images.add(rawUrl);
          readmeImages++;
        }
      }
      while ((match = htmlImageRegex.exec(content)) !== null) {
        const imageUrl = match[1];
        if (imageUrl.startsWith('http')) {
          images.add(imageUrl);
          readmeImages++;
        } else if (!imageUrl.startsWith('#')) {
          const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${imageUrl.replace(/^\//, '')}`;
          images.add(rawUrl);
          readmeImages++;
        }
      }
      console.log('Found images in README:', readmeImages);
    } catch (error) {
      console.log('No README found or error reading README');
    }

    // 5. Check for repository avatar/logo
    try {
      console.log('Checking repository avatar...');
      const { data: repoData } = await octokit.repos.get({
        owner,
        repo,
      });
      
      if (repoData.owner?.avatar_url) {
        // Only add avatar if we don't have any other images
        if (images.size === 0) {
          console.log('Using repository avatar as fallback');
          images.add(repoData.owner.avatar_url);
        }
      }
    } catch (error) {
      console.log('Error getting repository avatar');
    }

    const foundImages = Array.from(images);
    console.log('Total images found:', foundImages.length);
    console.log('Image URLs:', foundImages);
    return foundImages;
  } catch (error) {
    console.error('Error finding images:', error);
    return [];
  }
};

async function incrementPortfolioCount(userId: string): Promise<boolean> {
  try {
    const { data: profile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('portfolios_generated, is_premium')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    // Check if user has reached the limit
    if (!profile.is_premium && profile.portfolios_generated >= 3) {
      return false;
    }

    // Increment the counter
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ portfolios_generated: profile.portfolios_generated + 1 })
      .eq('id', userId);

    if (updateError) throw updateError;
    return true;
  } catch (error) {
    console.error('Error updating portfolio count:', error);
    return false;
  }
}

export async function fetchRepoData(repoUrl: string, userId?: string): Promise<RepoData | null> {
  try {
    // Check portfolio count limit if userId is provided
    if (userId) {
      const hasReachedLimit = !(await incrementPortfolioCount(userId));
      if (hasReachedLimit) {
        return {
          name: '',
          description: '',
          url: '',
          htmlUrl: '',
          homepage: '',
          language: '',
          languages: {},
          stars: 0,
          forks: 0,
          watchers: 0,
          createdAt: '',
          updatedAt: '',
          topics: [],
          isTemplate: false,
          visibility: '',
          defaultBranch: '',
          images: [],
          error: 'LIMIT_REACHED'
        };
      }
    }

    const repoInfo = extractRepoInfoFromUrl(repoUrl);
    if (!repoInfo) {
      throw new Error('Invalid GitHub repository URL');
    }

    const { owner, repo } = repoInfo;

    const [{ data: repoData }, { data: languageData }] = await Promise.all([
      octokit.repos.get({ owner, repo }),
      octokit.repos.listLanguages({ owner, repo })
    ]);

    const images = await findImagesInRepo(owner, repo);

    return {
      name: repoData.name,
      description: repoData.description || '',
      url: repoData.git_url,
      htmlUrl: repoData.html_url,
      homepage: repoData.homepage || '',
      language: repoData.language || '',
      languages: languageData,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      watchers: repoData.watchers_count,
      createdAt: repoData.created_at,
      updatedAt: repoData.updated_at,
      topics: repoData.topics || [],
      isTemplate: repoData.is_template || false,
      visibility: repoData.visibility || 'public',
      defaultBranch: repoData.default_branch || 'main',
      images,
      screenshots: images
    };
  } catch (error) {
    console.error('Error fetching repository data:', error);
    throw error;
  }
};
