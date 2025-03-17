import { Octokit } from '@octokit/rest';
import { extractRepoInfoFromUrl } from './github';

interface ReadmeContent {
  title: string;
  description: string;
  technologies: string[];
  features: string[];
  screenshots: string[];
  installation: string;
  usage: string;
  contributing: string;
  license: string;
  badges: string[];
  demo?: string;
  quickStart?: string;
}

interface ReadmeFile {
  content: string;
  sha: string;
}

// Helper function to convert string to base64
function toBase64(str: string): string {
  try {
    const encoded = window.btoa(unescape(encodeURIComponent(str)));
    console.log('Successfully encoded content, length:', encoded.length);
    return encoded;
  } catch (error) {
    console.error('Base64 encoding error:', error);
    throw new Error('Failed to encode content: ' + (error instanceof Error ? error.message : String(error)));
  }
}

// Helper function to decode base64
function fromBase64(str: string): string {
  try {
    return decodeURIComponent(escape(window.atob(str)));
  } catch (error) {
    console.error('Base64 decoding error:', error);
    throw new Error('Failed to decode content: ' + (error instanceof Error ? error.message : String(error)));
  }
}

export async function fetchExistingReadme(repoUrl: string): Promise<ReadmeFile | null> {
  try {
    const repoInfo = extractRepoInfoFromUrl(repoUrl);
    if (!repoInfo) {
      throw new Error('Invalid repository URL');
    }

    const { owner, repo } = repoInfo;
    console.log('Fetching README for:', { owner, repo });

    const octokit = new Octokit({
      auth: import.meta.env.VITE_GITHUB_TOKEN
    });

    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path: 'README.md'
      });

      if ('content' in data && 'sha' in data) {
        return {
          content: fromBase64(data.content),
          sha: data.sha
        };
      }
    } catch (error) {
      // README doesn't exist
      console.log('No existing README found');
      return null;
    }

    return null;
  } catch (error) {
    console.error('Error fetching README:', error);
    throw error;
  }
}

export async function generateReadmeContent(repoUrl: string, repoData: any): Promise<ReadmeContent> {
  const repoInfo = extractRepoInfoFromUrl(repoUrl);
  if (!repoInfo) throw new Error('Invalid repository URL');

  // Extract basic info
  const technologies = Object.keys(repoData.languages || {});
  
  return {
    title: repoData.name,
    description: repoData.description || 'A awesome project built with modern technologies.',
    technologies,
    features: [], // Will be customizable by user
    screenshots: repoData.images || [],
    badges: [],
    installation: `
## Installation

1. Clone the repository:
\`\`\`bash
git clone ${repoUrl}
cd ${repoData.name}
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
# or
yarn install
\`\`\`
`,
    usage: `
## Usage

\`\`\`bash
npm start
# or
yarn start
\`\`\`
`,
    contributing: `
## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
`,
    license: `
## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
`
  };
}

export async function generateEnhancedReadme(repoUrl: string, repoData: any): Promise<ReadmeContent> {
  const repoInfo = extractRepoInfoFromUrl(repoUrl);
  if (!repoInfo) throw new Error('Invalid repository URL');

  // Extract technologies with badges
  const technologies = Object.keys(repoData.languages || {});
  const badges = technologies.map(tech => {
    const badgeUrl = `https://img.shields.io/badge/${tech}-${getTechColor(tech)}.svg?style=for-the-badge&logo=${tech.toLowerCase()}&logoColor=white`;
    return `![${tech}](${badgeUrl})`;
  });

  // Create quick start section if package.json exists
  let quickStart = '';
  if (repoData.name) {
    quickStart = `
## 🚀 Quick Start

\`\`\`bash
# Clone the repository
git clone ${repoUrl}

# Navigate to directory
cd ${repoData.name}

# Install dependencies
npm install   # or yarn install

# Start the project
npm start     # or yarn start
\`\`\``;
  }

  // Generate enhanced description
  const description = repoData.description || 
    `A powerful ${technologies.join('/')} project that ${repoData.name.replace(/-/g, ' ')}. Built with modern technologies and best practices.`;

  return {
    title: `${repoData.name} 🌟`,
    description: description,
    technologies,
    features: [],
    screenshots: repoData.images || [],
    badges,
    demo: repoData.homepage,
    quickStart,
    installation: `
## 📦 Installation

1. Ensure you have [Node.js](https://nodejs.org) installed
2. Clone this repository
3. Install dependencies:
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\``,
    usage: `
## 💡 Usage

This project ${repoData.name.includes('generator') ? 'generates' : 'provides'} ${repoData.name.replace(/-/g, ' ')}. 

${repoData.homepage ? `\n🔗 [Try it out here](${repoData.homepage})\n` : ''}

${repoData.images?.length ? '\n### 📸 Screenshots\n' : ''}`,
    contributing: `
## 👥 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create your feature branch: \`git checkout -b feature/amazing-feature\`
3. Commit your changes: \`git commit -m 'Add amazing feature'\`
4. Push to the branch: \`git push origin feature/amazing-feature\`
5. Open a Pull Request`,
    license: `
## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
<p align="center">Made with ❤️ and ${technologies[0]}</p>
`
  };
}

function getTechColor(tech: string): string {
  const colors: { [key: string]: string } = {
    TypeScript: '007ACC',
    JavaScript: 'F7DF1E',
    Python: '3776AB',
    React: '61DAFB',
    Vue: '4FC08D',
    Angular: 'DD0031',
    Node: '339933',
    HTML: 'E34F26',
    CSS: '1572B6',
    PHP: '777BB4',
    Ruby: 'CC342D',
    Go: '00ADD8',
    Rust: '000000',
    Java: '007396',
    Kotlin: '0095D5',
    Swift: 'FA7343',
    'C++': '00599C',
    'C#': '239120',
    R: '276DC3',
    Scala: 'DC322F',
    PLpgSQL: '336791',
  };
  return colors[tech] || '555555';
}

export function generateMarkdown(content: ReadmeContent): string {
  return `# ${content.title}

${content.description}

${content.technologies.length > 0 ? `
## Technologies

${content.technologies.map(tech => `- ${tech}`).join('\n')}
` : ''}

${content.features.length > 0 ? `
## Features

${content.features.map(feature => `- ${feature}`).join('\n')}
` : ''}

${content.screenshots.length > 0 ? `
## Screenshots

${content.screenshots.map(screenshot => `![Screenshot](${screenshot})`).join('\n')}
` : ''}

${content.badges.length > 0 ? `
## Badges

${content.badges.join('\n')}
` : ''}

${content.installation}

${content.usage}

${content.contributing}

${content.license}

---
<sub>Generated with 💙 by [Portfolio Generator](https://github.com/SHauny1122/portfolio-generator)</sub>
`;
}

export async function updateReadme(repoUrl: string, markdown: string, sha?: string): Promise<boolean> {
  try {
    console.log('Starting README update process...');
    
    const repoInfo = extractRepoInfoFromUrl(repoUrl);
    if (!repoInfo) {
      console.error('Invalid repository URL:', repoUrl);
      throw new Error('Invalid repository URL');
    }

    const { owner, repo } = repoInfo;
    console.log('Repository info:', { owner, repo });

    // Check GitHub token
    const token = import.meta.env.VITE_GITHUB_TOKEN;
    if (!token) {
      console.error('GitHub token is missing!');
      throw new Error('GitHub token is not configured. Please check your environment variables.');
    }
    console.log('GitHub token is present');

    // Initialize Octokit with the token
    const octokit = new Octokit({
      auth: token
    });

    // Create or update README
    console.log('Encoding content...');
    const encodedContent = toBase64(markdown);
    console.log('Content encoded, length:', encodedContent.length);

    console.log('Updating README file...');
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: 'README.md',
      message: 'Update README.md via Portfolio Generator',
      content: encodedContent,
      sha
    });

    console.log('README updated successfully!');
    return true;
  } catch (error) {
    console.error('Error updating README:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    return false;
  }
}
