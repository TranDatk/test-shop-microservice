import Link from "next/link";
import ProductList from "@/components/product-list";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

export default function Home() {
  return (
    <main className="py-8">
      <section className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Shop Microservices</h1>
          <p className="text-gray-500 mt-2">
            Explore our latest products and special offers
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/cart">
            <Button variant="outline" size="icon">
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Shopping Cart</span>
            </Button>
          </Link>
          <Link href="/products">
            <Button>View All Products</Button>
          </Link>
        </div>
      </section>

      <section className="mb-12">
        <div className="bg-gradient-to-r from-gray-900 to-gray-600 text-white rounded-lg p-8 shadow-lg">
          <h2 className="text-3xl font-bold mb-4">Summer Sale</h2>
          <p className="text-lg mb-6">
            Get up to 40% off on selected electronics and accessories.
          </p>
          <Button variant="secondary">Shop Now</Button>
        </div>
      </section>

      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Link href="/products">
            <Button variant="link">See all</Button>
          </Link>
        </div>
        <ProductList />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Why Choose Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
            <p className="text-gray-600">
              Get your products delivered to your doorstep within 2-3 business days.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Quality Products</h3>
            <p className="text-gray-600">
              We ensure that all our products meet the highest quality standards.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
            <p className="text-gray-600">
              Our customer support team is available round the clock to assist you.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
