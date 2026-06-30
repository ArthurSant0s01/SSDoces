'use client';

import { useState } from 'react';
import { Product } from '@/lib/database.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Heart, Share2, Check } from 'lucide-react';
import Image from 'next/image';
import { useCartStore } from '@/store/cart';
import { motion } from 'framer-motion';

interface ProductDetailsProps {
  product: Product;
  relatedProducts?: Product[];
  reviews?: any[];
}

export function ProductDetails({ product, relatedProducts = [], reviews = [] }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(product.image_url);
  const { addItem } = useCartStore();

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      discountPrice: product.discount_price,
      imageUrl: product.image_url,
      quantity,
    });
  };

  const discount = product.discount_price
    ? Math.round((1 - product.discount_price / product.price) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Main Product */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-900">
            {selectedImage && (
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            )}
            {discount > 0 && (
              <Badge className="absolute top-4 left-4 bg-red-500 text-lg px-3 py-1">
                -{discount}%
              </Badge>
            )}
          </div>
          {product.images && product.images.length > 0 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition ${
                    selectedImage === img
                      ? 'border-blue-600'
                      : 'border-slate-200 dark:border-slate-700 hover:border-blue-400'
                  }`}
                >
                  <Image src={img} alt={`${product.name} ${idx}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">{product.description}</p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.round(product.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-slate-300 dark:text-slate-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-lg font-semibold">{product.rating.toFixed(1)}</span>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {product.rating_count} avaliações
            </span>
          </div>

          {/* Price */}
          <div className="space-y-2">
            {product.discount_price ? (
              <>
                <div className="text-sm text-slate-600 dark:text-slate-400 line-through">
                  R$ {product.price.toFixed(2)}
                </div>
                <div className="text-4xl font-bold text-blue-600">
                  R$ {product.discount_price.toFixed(2)}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  Você economiza R$ {(product.price - product.discount_price).toFixed(2)}
                </div>
              </>
            ) : (
              <div className="text-4xl font-bold">R$ {product.price.toFixed(2)}</div>
            )}
          </div>

          {/* Stock Status */}
          {product.quantity_in_stock > 0 ? (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <Check className="w-5 h-5" />
              <span>Em estoque ({product.quantity_in_stock} unidades disponíveis)</span>
            </div>
          ) : (
            <div className="text-red-600 dark:text-red-400 font-semibold">Fora de estoque</div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <span className="font-semibold">Quantidade:</span>
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                −
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 text-center border-l border-r dark:bg-slate-900"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                +
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              size="lg"
              className="flex-1"
              disabled={product.quantity_in_stock === 0}
              onClick={handleAddToCart}
            >
              Adicionar ao Carrinho
            </Button>
            <Button
              size="lg"
              variant={isFavorite ? 'default' : 'outline'}
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
            <Button size="lg" variant="outline">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>

          {/* Details */}
          <Card>
            <CardContent className="space-y-4 pt-4">
              {product.shelf_life_days && (
                <div>
                  <span className="font-semibold">Validade:</span>
                  <span className="ml-2">{product.shelf_life_days} dias após produção</span>
                </div>
              )}
              {product.ingredients && product.ingredients.length > 0 && (
                <div>
                  <span className="font-semibold">Ingredientes:</span>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {product.ingredients.join(', ')}
                  </p>
                </div>
              )}
              {product.allergens && product.allergens.length > 0 && (
                <div>
                  <span className="font-semibold text-red-600">Alérgenos:</span>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {product.allergens.join(', ')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="description">Descrição</TabsTrigger>
          <TabsTrigger value="reviews">Avaliações ({reviews.length})</TabsTrigger>
          <TabsTrigger value="shipping">Envio</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="space-y-4 mt-6">
          <p className="text-slate-600 dark:text-slate-400">{product.long_description}</p>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4 mt-6">
          {reviews.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-400">Nenhuma avaliação ainda</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review, idx) => (
                <Card key={idx}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{review.user_name}</h4>
                        <div className="flex gap-1 mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.is_verified_purchase && (
                        <Badge variant="outline">Compra Verificada</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                      {review.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="shipping" className="space-y-4 mt-6">
          <div className="space-y-3">
            <h4 className="font-semibold">Opções de entrega</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Retirada: Disponível em São Paulo
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Entrega: São Paulo (1-2 dias úteis)
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Envio: Brasil (7-15 dias úteis)
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">Produtos Relacionados</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedProducts.map((prod) => (
              <motion.div
                key={prod.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-900">
                    {prod.image_url && (
                      <Image
                        src={prod.image_url}
                        alt={prod.name}
                        fill
                        className="object-cover hover:scale-110 transition-transform"
                      />
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-semibold truncate">{prod.name}</h4>
                    <p className="text-lg font-bold mt-2">R$ {prod.price.toFixed(2)}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
