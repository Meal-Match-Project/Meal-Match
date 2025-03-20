'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import CustomButton from "./ui/CustomButton";

const Login = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
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
            body: JSON.stringify({ ...formData, type: "login" }),
        });

        const data = await response.json();
        if (response.ok) {
            setMessage("Login successful!");

            // Store userId and token in localStorage for persistence
            localStorage.setItem("token", data.token);
            localStorage.setItem("userId", data.userId);

            // Redirect to dashboard
            router.push(`/dashboard/grid/${data.userId}`);
        } else {
            setMessage(data.error || "Invalid username/email or password");
        }
    } catch (error) {
        console.error("Login error:", error);
        setMessage("An error occurred while logging in");
    }
};

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 relative">
      <h1 className="text-4xl font-bold text-orange-600 mb-6">Meal Match</h1>

      <a href="/" className="absolute top-4 left-4 text-xl font-bold text-orange-600 hover:text-orange-800">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-8 h-8 inline-block mr-1"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9m0 0l9 9m-9-9v14"/>
        </svg>
        Home
      </a>

      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold text-center text-orange-600 mb-6">
          Login
        </h2>

        {message && <p className="text-center text-red-500">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">Email or Username</label>
            <input
              type="text" // Allows usernames too
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter email or username"
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

          <CustomButton type="submit" className="w-full bg-orange-500 text-white hover:bg-orange-600">
            Login
          </CustomButton>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Don't have an account?{" "}
          <a href="/register" className="text-orange-500 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
