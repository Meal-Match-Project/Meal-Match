'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import CustomButton from "./ui/CustomButton";
import { XCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { signIn } from "next-auth/react"; // Update this import

const Login = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear errors for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset all messages
    setErrors({});
    setSuccessMessage("");
    
    // Basic validation
    if (!formData.email.trim()) {
      setErrors(prev => ({ ...prev, email: "Email or username is required" }));
      return;
    }
    
    if (!formData.password) {
      setErrors(prev => ({ ...prev, password: "Password is required" }));
      return;
    }
    
    setIsSubmitting(true);

    try {
      console.log("Attempting sign in with:", formData.email);
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });
      
      console.log("SignIn result:", result);
      
      if (!result?.error) {
        // Success - show message
        setSuccessMessage("Login successful! Redirecting to dashboard...");
        
        // Get user ID from session
        const res = await fetch("/api/auth/session");
        const session = await res.json();
        console.log("Session data:", session);
        const userId = session?.user?.id;
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          if (userId) {
            router.push(`/dashboard/grid/${userId}`);
          } else {
            // Fallback if we couldn't get the userId from session
            router.push("/");
          }
        }, 1000);
      } else {
        // Handle errors more specifically
        console.error("Login error:", result.error);
        
        if (result.error === "CredentialsSignin") {
          setErrors(prev => ({ 
            ...prev, 
            general: "Incorrect email or password. Please try again." 
          }));
        } else {
          setErrors(prev => ({ 
            ...prev, 
            general: result.error || "An error occurred during login" 
          }));
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors(prev => ({ 
        ...prev, 
        general: "Network error. Please check your connection and try again." 
      }));
    } finally {
      setIsSubmitting(false);
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

      <div className="bg-white p-8 rounded-lg shadow-md w-96 max-w-full">
        <h2 className="text-2xl font-bold text-center text-orange-600 mb-6">
          Login
        </h2>

        {/* Success Message */}
        {successMessage && (
          <div className="flex items-center p-4 mb-4 bg-green-100 border-l-4 border-green-500 rounded">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}

        {/* General Error Message */}
        {errors.general && (
          <div className="flex items-center p-4 mb-4 bg-red-100 border-l-4 border-red-500 rounded">
            <XCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">Email or Username</label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.email ? 'border-red-500' : ''
              }`}
              placeholder="Enter email or username"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.password ? 'border-red-500' : ''
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <CustomButton 
            type="submit" 
            className={`w-full ${isSubmitting ? 'bg-orange-400' : 'bg-orange-500'} text-white hover:bg-orange-600 flex justify-center items-center`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
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