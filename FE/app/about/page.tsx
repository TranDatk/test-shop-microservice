import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

export default function AboutPage() {
  return (
    <main className="py-8">
      <section className="mb-12">
        <h1 className="text-4xl font-bold mb-4">About Shop Microservices</h1>
        <p className="text-xl text-muted-foreground mb-8">
          A modern e-commerce platform built with cutting-edge technology
        </p>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="relative h-80 w-full">
            <img
              src="https://via.placeholder.com/1200x400?text=Our+Story"
              alt="Our Story"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-4">Our Story</h2>
            <p className="mb-4">
              Founded in 2023, Shop Microservices was created with a vision to revolutionize
              the e-commerce experience by leveraging modern technology. Our team of passionate
              developers and business experts came together to build a platform that offers
              seamless shopping experiences for customers while providing powerful tools for
              merchants.
            </p>
            <p>
              We believe in the power of microservices architecture to create scalable, robust,
              and flexible applications that can evolve with changing requirements and growing
              user demands. Our platform demonstrates how complex e-commerce systems can be
              built using independent services that work together harmoniously.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Our Mission</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-2">Quality Products</h3>
              <p className="text-muted-foreground">
                Curate the best products from around the world, ensuring only the highest
                quality items reach our customers.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-2">Customer Satisfaction</h3>
              <p className="text-muted-foreground">
                Put our customers first in everything we do, providing exceptional service
                and support throughout their shopping journey.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-2">Innovation</h3>
              <p className="text-muted-foreground">
                Continuously innovate and improve our platform, embracing new technologies
                and methodologies to enhance the shopping experience.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Our Technology Stack</h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="mb-4">
            Our platform is built using a modern microservices architecture with the following technologies:
          </p>
          <ul className="list-disc pl-6 mb-4 grid grid-cols-1 md:grid-cols-2 gap-2">
            <li>Next.js for the frontend</li>
            <li>Node.js for the backend services</li>
            <li>PostgreSQL for relational data</li>
            <li>Redis for caching and cart service</li>
            <li>RabbitMQ for inter-service communication</li>
            <li>Docker for containerization</li>
            <li>Kubernetes for orchestration</li>
            <li>Keycloak for authentication</li>
          </ul>
          <p>
            This architecture allows us to scale individual components independently, 
            deploy updates with minimal risk, and maintain high availability of the platform.
          </p>
        </div>
      </section>
    </main>
  );
} 