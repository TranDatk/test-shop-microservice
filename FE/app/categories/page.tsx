import Link from "next/link";
import { Button } from "@/components/ui/button";

const categories = [
  {
    id: "electronics",
    name: "Electronics",
    description: "Smartphones, laptops, and other electronic devices",
    productCount: 15,
    imageUrl: "https://via.placeholder.com/400x200?text=Electronics",
  },
  {
    id: "clothing",
    name: "Clothing",
    description: "T-shirts, jeans, and other apparel",
    productCount: 25,
    imageUrl: "https://via.placeholder.com/400x200?text=Clothing",
  },
  {
    id: "books",
    name: "Books",
    description: "Fiction, non-fiction, and educational books",
    productCount: 20,
    imageUrl: "https://via.placeholder.com/400x200?text=Books",
  },
  {
    id: "home",
    name: "Home & Kitchen",
    description: "Furniture, kitchen appliances, and home decor",
    productCount: 18,
    imageUrl: "https://via.placeholder.com/400x200?text=Home+%26+Kitchen",
  },
  {
    id: "beauty",
    name: "Beauty & Personal Care",
    description: "Skincare, makeup, and personal care products",
    productCount: 12,
    imageUrl: "https://via.placeholder.com/400x200?text=Beauty",
  },
  {
    id: "sports",
    name: "Sports & Outdoors",
    description: "Sports equipment and outdoor gear",
    productCount: 10,
    imageUrl: "https://via.placeholder.com/400x200?text=Sports",
  },
];

export default function CategoriesPage() {
  return (
    <main className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Product Categories</h1>
        <p className="text-muted-foreground">
          Browse our wide range of product categories to find exactly what you're looking for.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img 
              src={category.imageUrl} 
              alt={category.name} 
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{category.name}</h2>
              <p className="text-gray-600 mb-2">{category.description}</p>
              <p className="text-sm text-muted-foreground mb-4">{category.productCount} products</p>
              <Link href={`/categories/${category.id}`}>
                <Button className="w-full">Browse {category.name}</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
} 