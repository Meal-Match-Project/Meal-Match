'use client';
import { useState } from "react";
import CustomButton from "./ui/CustomButton";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    dietary_preferences: "",
    allergies: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("User registered successfully!");
        setFormData({
          username: "",
          email: "",
          password: "",
          dietary_preferences: "",
          allergies: "",
        }); 
      } else {
        setMessage(data.error || "Failed to register");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setMessage("An error occurred while registering");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 relative">
      {/* Title */}
      <h1 className="text-4xl font-bold text-orange-600 mb-6">Meal Match</h1>
      
      {/* Home Button */}
      <a href="/" className="absolute top-4 left-4 text-xl font-bold text-orange-600 hover:text-orange-800">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-8 h-8 inline-block mr-1"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 12l9-9m0 0l9 9m-9-9v14"
          />
        </svg>
        Home
      </a>

      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold text-center text-orange-600 mb-6">
          Sign Up
        </h2>

        {message && <p className="text-center text-red-500">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-gray-700">Dietary Preferences</label>
            <input
              type="text"
              name="dietary_preferences"
              value={formData.dietary_preferences}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-gray-700">Allergies</label>
            <input
              type="text"
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <CustomButton type="submit" className="w-full bg-orange-500 text-white hover:bg-orange-600">
            Register
          </CustomButton>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-orange-500 hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
