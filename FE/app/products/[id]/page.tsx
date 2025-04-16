'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Heart, Share2, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import api from '@/lib/axios';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  features?: string[];
  specifications?: Record<string, string>;
}

async function fetchProductById(id: string): Promise<Product> {
  try {
    const response = await api.get(`/api/products/${id}`);
    
    // Handle the response format: { success: true, data: {...} }
    if (response.data?.success && response.data?.data) {
      const productData = response.data.data;
      return {
        id: productData.id,
        name: productData.name,
        description: productData.description,
        price: parseFloat(productData.price),
        imageUrl: productData.image_url,
        category: productData.category,
        stock: productData.stock,
        // Add optional fields if they exist
        features: productData.features,
        specifications: productData.specifications
      };
    }
    
    // Fallback to direct response if it matches the Product interface
    return response.data;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => fetchProductById(productId),
  });

  const addToCart = async () => {
    try {
      await api.post('/api/cart/items', {
        productId,
        quantity,
      });
      
      toast.success(`${product?.name} added to cart!`);
    } catch (error) {
      // Error handling is done by the api interceptor
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-[400px] w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-8 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Product Not Found</h1>
        <p className="mb-6">The product you're looking for could not be found or has been removed.</p>
        <Link href="/products">
          <Button>View All Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <main className="py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg overflow-hidden border">
          <img
            src={product.imageUrl || 'https://via.placeholder.com/500'}
            alt={product.name}
            className="w-full h-auto object-cover"
          />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center mt-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground ml-2">4.0 (24 reviews)</span>
            </div>
            <p className="text-2xl font-bold">${product.price.toFixed(2)}</p>
            {product.stock > 0 ? (
              <span className="text-sm text-green-600">In stock ({product.stock} available)</span>
            ) : (
              <span className="text-sm text-red-500">Out of stock</span>
            )}
          </div>

          <div>
            <p className="text-gray-600">{product.description}</p>
            
            {product.features && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Features</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {product.features.map((feature, index) => (
                    <li key={index} className="text-gray-600">{feature}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center mb-4">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-l-md border flex items-center justify-center bg-gray-50 hover:bg-gray-100"
                disabled={quantity <= 1}
              >
                -
              </button>
              <div className="w-16 h-10 border-t border-b flex items-center justify-center">
                {quantity}
              </div>
              <button
                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                className="w-10 h-10 rounded-r-md border flex items-center justify-center bg-gray-50 hover:bg-gray-100"
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="flex-1" onClick={addToCart} disabled={product.stock <= 0}>
                <ShoppingBag className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
              <Button variant="outline" size="icon">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {product.specifications && (
            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold mb-3">Specifications</h3>
              <div className="space-y-2">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-2 gap-2">
                    <div className="text-gray-600">{key}</div>
                    <div>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 