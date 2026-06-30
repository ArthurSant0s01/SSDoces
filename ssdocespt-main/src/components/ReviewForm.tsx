'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Star, Send } from 'lucide-react';
import { motion } from 'framer-motion';

interface ReviewFormProps {
  productId: string;
  onSubmit?: (review: ReviewData) => Promise<void>;
}

export interface ReviewData {
  rating: number;
  title: string;
  content: string;
  name?: string;
  email?: string;
}

export function ReviewForm({ productId, onSubmit }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setLoading(true);
    try {
      if (onSubmit) {
        await onSubmit({ rating, title, content, name, email });
      }
      setSubmitted(true);
      setTimeout(() => {
        setRating(0);
        setTitle('');
        setContent('');
        setName('');
        setEmail('');
        setSubmitted(false);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        className="text-center py-8"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <p className="text-green-600 font-semibold text-lg">✓ Avaliação enviada com sucesso!</p>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
          Obrigado por sua avaliação. Ela será revisada e publicada em breve.
        </p>
      </motion.div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deixe sua Avaliação</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <Label className="mb-2 block">Classificação</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      value <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Título da Avaliação</Label>
            <Input
              id="title"
              placeholder="Resumo da sua avaliação"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="content">Sua Avaliação</Label>
            <Textarea
              id="content"
              placeholder="Conte-nos mais sobre sua experiência..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              required
            />
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="name">Seu Nome</Label>
            <Input
              id="name"
              placeholder="João Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button type="submit" disabled={loading || rating === 0} className="w-full">
            <Send className="w-4 h-4 mr-2" />
            {loading ? 'Enviando...' : 'Enviar Avaliação'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
