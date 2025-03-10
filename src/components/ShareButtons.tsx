import { useState } from 'react';
import { FaTwitter, FaLinkedin, FaEnvelope, FaLink, FaCheck } from 'react-icons/fa';

interface ShareButtonsProps {
  title: string;
  description: string;
  url: string;
}

export function ShareButtons({ title, description, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  
  // For Vercel deployment, we'll use the window.location.href
  // but for now we'll use a placeholder URL that we'll update later
  const shareUrl = url || 'https://portfolio-generator.vercel.app';
  
  const shareText = `Check out this amazing project: ${title}${description ? ` - ${description}` : ''}`;
  
  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    email: `mailto:?subject=${encodeURIComponent(`Check out this project: ${title}`)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="flex items-center gap-4 bg-gray-800/30 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-700/50">
      <span className="text-gray-400 text-sm">Share:</span>
      <div className="flex gap-3">
        <button
          onClick={copyToClipboard}
          className={`text-gray-400 hover:text-white transition-colors ${copied ? 'text-green-400' : ''} p-1`}
          title="Copy link"
        >
          {copied ? <FaCheck size={18} /> : <FaLink size={18} />}
        </button>
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-blue-400 transition-colors p-1"
          title="Share on X (Twitter)"
        >
          <FaTwitter size={18} />
        </a>
        <a
          href={shareLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-blue-600 transition-colors p-1"
          title="Share on LinkedIn"
        >
          <FaLinkedin size={18} />
        </a>
        <a
          href={shareLinks.email}
          className="text-gray-400 hover:text-purple-400 transition-colors p-1"
          title="Share via Email"
        >
          <FaEnvelope size={18} />
        </a>
      </div>
    </div>
  );
}
