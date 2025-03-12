import { useState } from 'react';
import { FaTwitter, FaLinkedin, FaEnvelope, FaLink } from 'react-icons/fa';

export interface ShareButtonsProps {
  url: string;
  title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareOnTwitter = () => {
    const text = `Check out ${title} on GitHub!`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
  };

  const shareOnLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedInUrl, '_blank');
  };

  const shareViaEmail = () => {
    const subject = `Check out ${title} on GitHub`;
    const body = `I found this interesting project: ${url}`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={shareOnTwitter}
        className="glass-button p-2 rounded-lg text-blue-400 hover:text-blue-300 transition-colors"
        title="Share on Twitter"
      >
        <FaTwitter size={20} />
      </button>
      <button
        onClick={shareOnLinkedIn}
        className="glass-button p-2 rounded-lg text-blue-400 hover:text-blue-300 transition-colors"
        title="Share on LinkedIn"
      >
        <FaLinkedin size={20} />
      </button>
      <button
        onClick={shareViaEmail}
        className="glass-button p-2 rounded-lg text-blue-400 hover:text-blue-300 transition-colors"
        title="Share via Email"
      >
        <FaEnvelope size={20} />
      </button>
      <button
        onClick={handleCopy}
        className={`glass-button p-2 rounded-lg transition-colors ${
          copied ? 'text-green-400' : 'text-blue-400 hover:text-blue-300'
        }`}
        title="Copy Link"
      >
        <FaLink size={20} />
      </button>
    </div>
  );
}
