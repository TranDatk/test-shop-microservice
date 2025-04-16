'use client';

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
}

const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await api.get('/api/products');
    
    // Handle the response format: { success: true, data: [...] }
    if (response.data?.success && Array.isArray(response.data.data)) {
      return response.data.data.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: parseFloat(item.price),
        imageUrl: item.image_url,
        category: item.category,
        stock: item.stock
      }));
    }
    
    // Fallback to checking if the response itself is an array
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export default function ProductList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts
  });

  // Ensure products is always an array
  const products = Array.isArray(data) ? data : [];

  const addToCart = async (productId: string) => {
    try {
      await api.post('/api/cart/items', {
        productId,
        quantity: 1
      });
      
      toast.success("Added to cart!");
    } catch (error) {
      // Error handling is done by the api interceptor
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-5 w-1/4 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error loading products</div>;
  }

  if (products.length === 0) {
    return <div className="text-center py-10">No products found</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      {products.map((product: Product) => (
        <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="relative h-48 w-full">
            <Image
              src={product.imageUrl || "https://via.placeholder.com/300"}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover"
            />
          </div>
          <div className="p-4">
            <Link href={`/products/${product.id}`}>
              <h3 className="text-lg font-semibold hover:text-blue-600 transition-colors">{product.name}</h3>
            </Link>
            <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
            <p className="text-lg font-bold mb-2">${product.price.toFixed(2)}</p>
            <Button 
              variant="default" 
              className="w-full flex items-center justify-center gap-2"
              onClick={() => addToCart(product.id)}
            >
              <ShoppingBag className="h-4 w-4" />
              Add to Cart
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
} 