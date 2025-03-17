import { Octokit } from '@octokit/rest';

// Create a shared Octokit instance with the token
const octokit = new Octokit({
  auth: import.meta.env.VITE_GITHUB_TOKEN
});

export interface RepoData {
  owner: string;
  name: string;
  description: string | null;
  url: string;
  defaultBranch: string;
  language: string | null;
  stars: number;
  visibility: string;
  error?: string;
}

export const extractRepoInfoFromUrl = (url: string): { owner: string; repo: string } | null => {
  try {
    const urlObj = new URL(url);
    const [, owner, repo] = urlObj.pathname.split('/');
    return { owner, repo };
  } catch (error) {
    return null;
  }
}

export const fetchRepoData = async (repoUrl: string): Promise<RepoData> => {
  try {
    const repoInfo = extractRepoInfoFromUrl(repoUrl);
    if (!repoInfo) {
      throw new Error('Invalid repository URL');
    }

    const { owner, repo } = repoInfo;
    const { data: repoData } = await octokit.repos.get({ owner, repo });

    return {
      owner: repoData.owner.login,
      name: repoData.name,
      description: repoData.description || null,
      url: repoData.html_url,
      defaultBranch: repoData.default_branch || 'main',
      language: repoData.language || null,
      stars: repoData.stargazers_count,
      visibility: repoData.visibility || 'private',
    };
  } catch (error) {
    console.error('Error fetching repo data:', error);
    throw error;
  }
}
