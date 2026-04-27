'use client';

import React from 'react';
import { ProductCard } from './ProductCard';
import type { ProductResponse } from '@/types/product';

interface ProductGridProps {
  products: ProductResponse[];
  onAddToCart: (product: ProductResponse) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products, onAddToCart }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={String(product.productId)}
          product={{
            id: String(product.productId),
            title: product.name,
            price: product.salePrice ?? product.price,
            originalPrice: product.salePrice != null && product.salePrice < product.price ? product.price : null,
            img: product.imageUrls?.[0] ?? 'https://placehold.co/400',
            tag: product.discountPercentage ? `-${product.discountPercentage}%` : undefined,
            inStock: product.quantity > 0,
          }}
          onAddToCart={() => onAddToCart(product)}
        />
      ))}
    </div>
  );
};
