import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import type { Product } from "@/data/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to="/produtos/$slug"
      params={{ slug: product.slug }}
      className="group block"
    >
      <div className="relative overflow-hidden rounded-3xl bg-secondary/40">
        <div className="aspect-square">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            width={1200}
            height={1200}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </div>
        {product.badge && (
          <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-foreground backdrop-blur">
            {product.badge}
          </span>
        )}
      </div>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-xl text-foreground">{product.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{product.tagline}</p>
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-accent text-accent" />
            ))}
            <span className="ml-1">5,0</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">desde</div>
          <div className="font-display text-xl text-foreground">€{product.price.toFixed(2)}</div>
        </div>
      </div>
    </Link>
  );
}
