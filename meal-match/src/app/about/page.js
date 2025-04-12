import Navbar from "@/components/Navbar";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-orange-500 text-white py-20 px-6 text-center">
        <h1 className="text-5xl font-bold mb-4">Meal Prep Revolutionized.</h1>
        <p className="text-xl max-w-2xl mx-auto">
          Personalized meal planning that fits your preferences
        </p>
      </section>

      {/* About Description Section */}
      <section className="bg-white max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-orange-600 mb-6">Our Mission</h2>
        <p className="text-lg mb-4">
          Meal Match is a website that simplifies and enhances the meal planning experience through an intuitive, component-based approach. Unlike traditional meal planning apps, which rely on fixed recipes, Meal Match allows users to prepare versatile meal components that can be combined in countless ways throughout the week. This approach maximizes variety, reduces food waste, and makes meal preparation both cost-effective and efficient.
        </p>
        <p className="text-lg mb-4">
          By integrating AI, Meal Match goes beyond standard meal prep, offering personalized suggestions and innovative combinations based on ingredients users have on hand. Whether you&apos;re a busy professional, a student on a budget, or a family looking for meal inspiration, Meal Match provides a flexible and intelligent solution to make meal planning seamless, enjoyable, and fun.
        </p>
      </section>

      {/* Features */}
      <section className="bg-stone-100 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-orange-600 mb-10 text-center">Why Meal Match?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h3 className="text-xl font-semibold mb-2">Component-Based</h3>
              <p>Prepare flexible ingredients you can mix and match throughout the week.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h3 className="text-xl font-semibold mb-2">AI-Powered Suggestions</h3>
              <p>Get smart combinations based on what’s in your fridge.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h3 className="text-xl font-semibold mb-2">Saves Time & Money</h3>
              <p>Maximize variety and reduce food waste.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Closing Section */}
      <section className="bg-orange-100 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-orange-600 mb-6">Who We Are</h2>
          <p className="text-lg mb-4">
            Meal Match was born from a simple idea: what if meal prepping becomes flexible and personalized as your lifestyle?
          </p>
          <p className="text-lg mb-4">
            Whether you&apos;re a fitness enthusiast, a busy professional or student, or someone who simply wants to eat better without the daily hassle of meal planning,
            we provide Meal Match to give you the tools that customize your meals exactly how you want.
          </p>
          <p className="text-lg mb-4">
            With our intuitive templates, mix-and-match food ingredients, and personalized recommendations, we aim to make your meal prepping enjoyable.
          </p>
        </div>
      </section>
    </div>
  );
} 