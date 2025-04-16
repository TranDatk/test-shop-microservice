'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    name: string;
    price: number;
    imageUrl: string;
  };
}

interface Cart {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
}

const fetchCart = async (): Promise<Cart> => {
  const response = await api.get('/api/cart/items');
  return response.data;
};

const updateCartItem = async ({ id, quantity }: { id: string; quantity: number }) => {
  const response = await api.put(`/api/cart/items/${id}`, { quantity });
  return response.data;
};

const removeCartItem = async (id: string) => {
  const response = await api.delete(`/api/cart/items/${id}`);
  return response.data;
};

export default function CartPage() {
  const queryClient = useQueryClient();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const { data: cart, isLoading, error } = useQuery({
    queryKey: ['cart'],
    queryFn: fetchCart,
  });

  const updateMutation = useMutation({
    mutationFn: updateCartItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: () => {
      toast.error('Failed to update item quantity');
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeCartItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Item removed from cart');
    },
    onError: () => {
      toast.error('Failed to remove item');
    },
  });

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateMutation.mutate({ id, quantity: newQuantity });
  };

  const handleRemoveItem = (id: string) => {
    removeMutation.mutate(id);
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    
    // Simulate checkout process
    setTimeout(() => {
      toast.success('Order placed successfully!');
      // In a real app, we would redirect to the checkout page or process the order
      setIsCheckingOut(false);
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="py-8">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        <div className="grid grid-cols-1 gap-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg shadow">
              <Skeleton className="h-24 w-24 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Unable to Load Cart</h1>
        <p className="mb-6 text-muted-foreground">
          There was a problem loading your cart. Please try again later.
        </p>
        <Button asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="mb-6 text-muted-foreground">
          You haven't added any items to your cart yet.
        </p>
        <Button asChild>
          <Link href="/products">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <main className="py-8">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md p-4 flex flex-col sm:flex-row gap-4">
              <div className="h-24 w-24 relative overflow-hidden rounded-md">
                <img
                  src={item.product.imageUrl || 'https://via.placeholder.com/100'}
                  alt={item.product.name}
                  className="object-cover w-full h-full"
                />
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{item.product.name}</h3>
                <p className="text-primary font-medium">${item.product.price.toFixed(2)}</p>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-l border flex items-center justify-center bg-gray-50 hover:bg-gray-100"
                      disabled={updateMutation.isPending}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <div className="w-10 h-8 border-t border-b flex items-center justify-center">
                      {item.quantity}
                    </div>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-r border flex items-center justify-center bg-gray-50 hover:bg-gray-100"
                      disabled={updateMutation.isPending}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                    disabled={removeMutation.isPending}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
            <h2 className="text-xl font-semibold border-b pb-4">Order Summary</h2>
            
            <div className="mt-4 space-y-3">
              <div className="flex justify-between">
                <span>Subtotal ({cart.totalItems} items)</span>
                <span>${cart.subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${(cart.subtotal * 0.1).toFixed(2)}</span>
              </div>
              
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${(cart.subtotal * 1.1).toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <Button 
              className="w-full mt-6"
              onClick={handleCheckout}
              disabled={isCheckingOut}
            >
              {isCheckingOut ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Checkout
                </span>
              )}
            </Button>
            
            <div className="mt-4">
              <Button variant="outline" asChild className="w-full">
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 