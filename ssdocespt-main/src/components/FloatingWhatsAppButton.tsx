'use client';

import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface FloatingWhatsAppProps {
  phoneNumber?: string;
  message?: string;
}

export function FloatingWhatsAppButton({
  phoneNumber = '351930935667',
  message = 'Olá! Eu gostaria de receber atualizações da minha encomenda.',
}: FloatingWhatsAppProps) {
  const handleClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');
  };

  return (
    <motion.button
      onClick={handleClick}
      className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg z-50 flex items-center justify-center transition-all duration-300"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <MessageCircle className="w-6 h-6" />
      </motion.div>
    </motion.button>
  );
}
