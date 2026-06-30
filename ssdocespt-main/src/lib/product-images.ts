import type { Product as DatabaseProduct } from '@/lib/database.types';
import placeholderImage from '@/assets/product-placeholder.svg';

export function getPlaceholderProductImage() {
  return placeholderImage;
}

export function resolveProductImage(image?: string | null) {
  const normalized = image?.trim();
  if (!normalized) {
    return placeholderImage;
  }

  return normalized;
}

export function getProductGallery(product: Pick<DatabaseProduct, 'image_url' | 'images'>) {
  const candidates = [product.image_url, ...(product.images || [])]
    .map((image) => image?.trim())
    .filter((image): image is string => Boolean(image));

  const unique = Array.from(new Set(candidates));
  if (unique.length === 0) {
    return [placeholderImage];
  }

  return unique;
}

export function attachImageFallback(event: { currentTarget: HTMLImageElement }) {
  if (event.currentTarget.src !== placeholderImage) {
    event.currentTarget.src = placeholderImage;
  }
}