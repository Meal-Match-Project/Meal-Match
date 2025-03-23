import Navbar from "@/app/components/Navbar";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-orange-500 text-white py-20 px-6 text-center">
        <h1 className="text-5xl font-bold mb-4">Welcome to Meal Match</h1>
        
      </section>

      {/* About Description Section */}
      <section className="bg-white max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-orange-600 mb-6">Our Mission</h2>
        <p className="text-lg mb-4">
          Meal Match is a website that simplifies and enhances the meal planning experience through an intuitive, component-based approach. Unlike traditional meal planning apps, which rely on fixed recipes, Meal Match allows users to prepare versatile meal components that can be combined in countless ways throughout the week. This approach maximizes variety, reduces food waste, and makes meal preparation both cost-effective and efficient.
        </p>
        <p className="text-lg mb-4">
          By integrating AI, Meal Match goes beyond standard meal prep, offering personalized suggestions and innovative combinations based on ingredients users have on hand. Whether you're a busy professional, a student on a budget, or a family looking for meal inspiration, Meal Match provides a flexible and intelligent solution to make meal planning seamless, enjoyable, and fun.
        </p>
      </section>
    </div>
  );
} 