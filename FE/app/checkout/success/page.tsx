'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export default function OrderSuccessPage() {
  const [orderId, setOrderId] = useState<string>('');
  
  useEffect(() => {
    // Generate a random order ID
    const randomId = Math.random().toString(36).substring(2, 10).toUpperCase();
    setOrderId(`ORD-${randomId}`);
  }, []);

  return (
    <div className="container max-w-2xl mx-auto px-4 py-16">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold">Thank You for Your Order!</h1>
        
        <p className="text-muted-foreground">
          Your order has been placed successfully. We have sent a confirmation email with order details.
        </p>
        
        <div className="bg-gray-50 p-6 rounded-lg border mt-8 text-left">
          <h2 className="text-xl font-semibold mb-4">Order Information</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground">Order ID</span>
              <span className="font-medium">{orderId}</span>
            </div>
            
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">{new Date().toLocaleDateString()}</span>
            </div>
            
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground">Total Amount</span>
              <span className="font-medium">$784.97</span>
            </div>
            
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="font-medium">Credit Card</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Shipping Method</span>
              <span className="font-medium">Standard Shipping</span>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-6">
          <p className="text-blue-700 text-sm">
            Your order will be processed and shipped within 1-2 business days. 
            You will receive tracking information once your order has been shipped.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <Link href="/products">
            <Button variant="outline">Continue Shopping</Button>
          </Link>
          <Link href="/">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 