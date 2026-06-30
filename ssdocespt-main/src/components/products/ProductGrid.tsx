'use client';

import { useState, useCallback, useMemo } from 'react';
import { Product } from '@/lib/database.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CardContent, Card } from '@/components/ui/card';
import { Heart, Star, Search } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { motion } from 'framer-motion';

const euro = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' });

interface ProductGridProps {
  products: Product[];
  categories: Array<{ id: string; name: string; slug: string }>;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onFilterChange: (filters: ProductFilters) => void;
}

export interface ProductFilters {
  search: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  sortBy: 'newest' | 'price_asc' | 'price_desc' | 'rating';
}

export function ProductGrid({
  products,
  categories,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onFilterChange,
}: ProductGridProps) {
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    category: '',
    minPrice: 0,
    maxPrice: 100,
    sortBy: 'newest',
  });

  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const { addItem } = useCartStore();

  const handleFilterChange = useCallback(
    (newFilters: Partial<ProductFilters>) => {
      const updated = { ...filters, ...newFilters };
      setFilters(updated);
      onFilterChange(updated);
    },
    [filters, onFilterChange]
  );

  const toggleFavorite = useCallback((productId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  }, []);

  const handleAddToCart = useCallback((product: Product) => {
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      discountPrice: product.discount_price,
      imageUrl: product.image_url,
      quantity: 1,
    });
  }, [addItem]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-lg">Filtros</h3>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar produtos..."
            className="pl-10"
            value={filters.search}
            onChange={(e) => handleFilterChange({ search: e.target.value })}
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-sm font-medium mb-2 block">Categoria</label>
          <Select value={filters.category} onValueChange={(value) => handleFilterChange({ category: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as categorias</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Preço: €0 - €100</label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Mín"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange({ minPrice: parseFloat(e.target.value) || 0 })}
              className="w-20"
            />
            <Input
              type="number"
              placeholder="Máx"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange({ maxPrice: parseFloat(e.target.value) || 100 })}
              className="w-20"
            />
          </div>
        </div>

        {/* Sort */}
        <div>
          <label className="text-sm font-medium mb-2 block">Ordenar por</label>
          <Select value={filters.sortBy} onValueChange={(value: any) => handleFilterChange({ sortBy: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mais Recentes</SelectItem>
              <SelectItem value="price_asc">Menor Preço</SelectItem>
              <SelectItem value="price_desc">Maior Preço</SelectItem>
              <SelectItem value="rating">Melhor Avaliados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Grid */}
      <div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          {totalCount} produtos encontrados
        </p>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400">Nenhum produto encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    )}
                    {product.discount_price && (
                      <Badge className="absolute top-2 left-2 bg-red-500">
                        {Math.round((1 - product.discount_price / product.price) * 100)}% OFF
                      </Badge>
                    )}
                    <button
                      onClick={() => toggleFavorite(product.id)}
                      className={`absolute top-2 right-2 p-2 rounded-full transition ${
                        favorites.has(product.id)
                          ? 'bg-red-100 dark:bg-red-900'
                          : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          favorites.has(product.id) ? 'fill-red-500 text-red-500' : 'text-slate-400'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Content */}
                  <CardContent className="flex-1 flex flex-col p-4">
                    <a href={`/produtos/${product.slug}`}>
                      <h3 className="font-semibold line-clamp-2 hover:text-blue-600 transition">
                        {product.name}
                      </h3>
                    </a>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mt-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.round(product.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-slate-300 dark:text-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        ({product.rating_count})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mt-4 mb-4">
                      {product.discount_price ? (
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-blue-600">
                            {euro.format(product.discount_price)}
                          </span>
                          <span className="text-sm text-slate-500 line-through">
                            {euro.format(product.price)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold">{euro.format(product.price)}</span>
                      )}
                    </div>

                    {/* Add to Cart Button */}
                    <Button
                      onClick={() => handleAddToCart(product)}
                      className="w-full mt-auto"
                      size="sm"
                    >
                      Adicionar ao Carrinho
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Anterior
          </Button>

          {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
            const page = currentPage <= 3 ? idx + 1 : currentPage + idx - 2;
            if (page > totalPages) return null;
            return (
              <Button
                key={page}
                variant={page === currentPage ? 'default' : 'outline'}
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            );
          })}

          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}
