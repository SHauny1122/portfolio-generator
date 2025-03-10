import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: import.meta.env.VITE_GITHUB_TOKEN
});

export interface RepoData {
  name: string;
  description: string;
  url: string;
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
        images.push(item.download_url);
      } else if (recursive && item.type === 'dir') {
        // Recursively search in subdirectories
        const subImages = await searchImagesInPath(owner, repo, item.path, recursive, depth + 1);
        images.push(...subImages);
      }
    }

    return images;
  } catch (error) {
    return [];
  }
};

const findImagesInRepo = async (owner: string, repo: string): Promise<string[]> => {
  try {
    const images = new Set<string>();

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
    const { data: rootContents } = await octokit.repos.getContent({
      owner,
      repo,
      path: ''
    });

    // 3. Search in root directory
    if (Array.isArray(rootContents)) {
      for (const file of rootContents) {
        // Add images from root
        if (file.type === 'file' && /\.(png|jpe?g|gif|svg|webp)$/i.test(file.name) && file.download_url) {
          images.add(file.download_url);
        }

        // Check if any of our common directories exist and search them
        if (file.type === 'dir') {
          const lowerName = file.name.toLowerCase();
          if (commonDirs.some(dir => lowerName.includes(dir.toLowerCase()))) {
            const dirImages = await searchImagesInPath(owner, repo, file.path, true);
            dirImages.forEach(img => images.add(img));
          }
        }
      }
    }

    // 4. Check README.md for image references
    try {
      const { data: readme } = await octokit.repos.getReadme({
        owner,
        repo,
      });

      // Extract image URLs from markdown content
      const content = atob(readme.content);
      const markdownImageRegex = /!\[.*?\]\((.*?)\)/g;
      const htmlImageRegex = /<img.*?src=["'](.*?)["']/g;

      let match;
      while ((match = markdownImageRegex.exec(content)) !== null) {
        const imageUrl = match[1];
        if (imageUrl.startsWith('http')) {
          images.add(imageUrl);
        } else if (!imageUrl.startsWith('#')) {
          // Handle relative paths by constructing full GitHub raw URL
          const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${imageUrl.replace(/^\//, '')}`;
          images.add(rawUrl);
        }
      }
      while ((match = htmlImageRegex.exec(content)) !== null) {
        const imageUrl = match[1];
        if (imageUrl.startsWith('http')) {
          images.add(imageUrl);
        } else if (!imageUrl.startsWith('#')) {
          const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${imageUrl.replace(/^\//, '')}`;
          images.add(rawUrl);
        }
      }
    } catch (error) {
      // Ignore README errors
    }

    // 5. Check for repository avatar/logo
    try {
      const { data: repoData } = await octokit.repos.get({
        owner,
        repo,
      });
      
      if (repoData.owner?.avatar_url) {
        // Only add avatar if we don't have any other images
        if (images.size === 0) {
          images.add(repoData.owner.avatar_url);
        }
      }
    } catch (error) {
      // Ignore avatar errors
    }

    return Array.from(images);
  } catch (error) {
    console.error('Error finding images:', error);
    return [];
  }
};

export const fetchRepoData = async (url: string): Promise<RepoData | null> => {
  const repoInfo = extractRepoInfoFromUrl(url);
  if (!repoInfo) return null;

  try {
    const [repoResponse, languagesResponse] = await Promise.all([
      octokit.repos.get({
        owner: repoInfo.owner,
        repo: repoInfo.repo
      }),
      octokit.repos.listLanguages({
        owner: repoInfo.owner,
        repo: repoInfo.repo
      })
    ]);

    const { data: repo } = repoResponse;
    const { data: languages } = languagesResponse;

    // Find images in the repository
    const images = await findImagesInRepo(repoInfo.owner, repoInfo.repo);

    return {
      name: repo.name,
      description: repo.description ?? '',
      url: repo.html_url,
      homepage: repo.homepage ?? '',
      language: repo.language ?? '',
      languages,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      watchers: repo.watchers_count,
      createdAt: repo.created_at,
      updatedAt: repo.updated_at,
      topics: repo.topics ?? [],
      isTemplate: repo.is_template ?? false,
      visibility: repo.visibility ?? 'public',
      defaultBranch: repo.default_branch ?? 'main',
      images
    };
  } catch (error) {
    console.error('Error fetching repository data:', error);
    return null;
  }
};
