import { FaTools } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export function DevToolsButton() {
  const navigate = useNavigate();

  return (
    <motion.button
      onClick={() => navigate('/dev-tools')}
      className="glass-button px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-500/30 transition-all duration-300"
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
    >
      <FaTools className="text-lg" />
      <span className="hidden sm:inline">Dev Tools</span>
    </motion.button>
  );
}
