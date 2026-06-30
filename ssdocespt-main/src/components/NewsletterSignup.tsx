'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface NewsletterSignupProps {
  onSubscribe?: (email: string) => Promise<void>;
  title?: string;
  description?: string;
}

export function NewsletterSignup({
  onSubscribe,
  title = 'Fique Atualizado',
  description = 'Receba ofertas exclusivas e novidades diretamente no seu email',
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');

    try {
      if (onSubscribe) {
        await onSubscribe(email);
      } else {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      setStatus('success');
      setMessage('Obrigado por se inscrever!');
      setEmail('');
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Erro ao inscrever');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <Card className="border-2 border-blue-600">
        <CardHeader className="text-center">
          <Mail className="w-10 h-10 mx-auto text-blue-600 mb-2" />
          <CardTitle className="text-2xl">{title}</CardTitle>
          <p className="text-slate-600 dark:text-slate-400 mt-2">{description}</p>
        </CardHeader>
        <CardContent>
          {status === 'success' ? (
            <motion.div
              className="text-center space-y-2 py-8"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
              <p className="text-green-600 font-semibold">{message}</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === 'loading'}
                  required
                />
                <Button type="submit" disabled={status === 'loading'} className="px-6">
                  {status === 'loading' ? 'Inscrevendo...' : 'Inscrever'}
                </Button>
              </div>
              {status === 'error' && (
                <motion.div
                  className="flex items-center gap-2 text-red-600 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <AlertCircle className="w-4 h-4" />
                  <p>{message}</p>
                </motion.div>
              )}
              <p className="text-xs text-slate-500 text-center">
                Prometemos não enviar spam. Desinscreva-se a qualquer momento.
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
