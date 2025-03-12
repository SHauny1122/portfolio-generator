import { useState } from 'react';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase';
import '../styles/glass.css';

export function AccountMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      window.location.reload();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="glass-button px-3 py-2 rounded-lg flex items-center gap-2"
      >
        <FaUser />
        <span className="hidden sm:inline">Account</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-48 glass-card rounded-lg shadow-lg py-1 z-50"
          >
            <motion.button
              whileHover={{ x: 2 }}
              onClick={handleSignOut}
              className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-blue-500/20"
            >
              <FaSignOutAlt />
              Sign Out
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
