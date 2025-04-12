import Navbar from "@/components/Navbar";
import Image from "next/image";
import banner1 from "@/../public/mixnmatch1.jpg";
import banner2 from "@/../public/mixnmatch2.jpg";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-orange-500 text-white py-20 px-6 text-center">
        <h1 className="text-5xl font-bold mb-4">Welcome to Meal Match</h1>
        <p className="text-xl max-w-2xl mx-auto">
          Flexible, intelligent, and efficient meal planning.
        </p>
      </section>

      {/* Image Banner Section 1 */}
      <section className="bg-white max-w-6xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center gap-10">
        <div className="w-full md:w-1/2 min-h-[400px] flex items-center justify-center">
          <Image src={banner1} alt="Prepared Meals" className="rounded-xl shadow-md" height={300} />
        </div>
        <div className="w-full md:w-1/2 text-left">
          <h2 className="text-3xl md:text-4xl font-bold text-orange-600 mb-4">Start with the basics</h2>
          <p className="text-lg">
            Prepare core components like grains, proteins, and veggies – then mix and match throughout the week to keep meals fresh and exciting.
          </p>
        </div>
      </section>

      {/* Image Banner Section 2 */}
      <section className="bg-stone-100 py-16">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row-reverse items-center gap-10">
          <div className="w-full md:w-1/2 min-h-[400px] flex items-center justify-center">
            <Image src={banner2} alt="Component bowls" className="rounded-xl shadow-md" height={300} />
          </div>
          <div className="w-full md:w-1/2 text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-orange-600 mb-4">Mix and match components</h2>
            <p className="text-lg">
              Whether you’re meal prepping for one or a family, you can effortlessly create dozens of combinations – no more boring leftovers.
            </p>
          </div>
        </div>
      </section>

      {/* AI Benefits Section */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-orange-600 mb-4">How AI Enhances Your Meal Planning</h2>
          <p className="text-lg mb-12 max-w-3xl mx-auto">
            Our intelligent AI engine learns from your preferences, inventory, and goals - delivering smarter meal suggestions and ingredient combos every week.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-stone-100 p-6 rounded-2xl shadow-md">
              <h3 className="text-xl font-semibold mb-2">Personalized Meals</h3>
              <p>Get recommendations based on your tastes, dietary restrictions, and what's in your fridge.</p>
            </div>
            <div className="bg-stone-100 p-6 rounded-2xl shadow-md">
              <h3 className="text-xl font-semibold mb-2">Ingredient Optimization</h3>
              <p>Reduce waste by repurposing leftover ingredients into new meal ideas you’ll actually enjoy.</p>
            </div>
            <div className="bg-stone-100 p-6 rounded-2xl shadow-md">
              <h3 className="text-xl font-semibold mb-2">Prep Smarter</h3>
              <p>Let AI suggest which components to batch cook based on your week’s schedule and macros.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-orange-100 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-orange-600 text-center mb-8">Why Choose Meal Match?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h3 className="text-xl font-semibold mb-2">Flexible Meal Prep</h3>
              <p>Plan with ingredients instead of rigid recipes - total freedom in your kitchen.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h3 className="text-xl font-semibold mb-2">Smart Suggestions</h3>
              <p>AI recommends meals based on what’s in your fridge and your dietary preferences.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h3 className="text-xl font-semibold mb-2">Time-Saving</h3>
              <p>Prepare all at once, eat differently every day. No more weekday stress.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
