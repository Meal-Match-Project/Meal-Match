'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CustomButton from "./ui/CustomButton";
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';
import { signIn } from "next-auth/react";
import Link from "next/link";


// Add these option arrays
const DIETARY_PREFERENCES = [
  'Omnivore',
  'Vegetarian',
  'Vegan',
  'Pescatarian',
  'Keto',
  'Paleo',
  'Low-carb',
  'Low-fat',
  'Gluten-free',
  'Dairy-free',
  'Mediterranean',
  'Whole30'
];

const ALLERGIES = [
  'Peanuts',
  'Tree nuts',
  'Milk',
  'Eggs',
  'Fish',
  'Shellfish',
  'Soy',
  'Wheat',
  'Gluten',
  'Sesame',
  'Sulfites'
];

const Register = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    dietary_preferences: [],
    allergies: [],
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false); // Track if form has been submitted at least once

  // Validation patterns based on User schema
  const validations = {
    email: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    // Simpler password validation - just check for minimum length
    password: /.{8,}/
  };

  // Clear errors when form changes
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      // Only clear errors for fields that have changed
      const newErrors = { ...errors };
      Object.keys(formData).forEach(key => {
        if (newErrors[key] && 
            ((Array.isArray(formData[key]) && formData[key].length > 0) || 
             (!Array.isArray(formData[key]) && formData[key] !== ""))) {
          // For email, only clear if it's valid or we haven't submitted yet
          if (key === 'email' && !hasSubmitted) {
            delete newErrors[key];
          } else if (key === 'email' && validations.email.test(formData[key])) {
            delete newErrors[key];
          } else if (key !== 'email') {
            delete newErrors[key];
          }
        }
      });
      setErrors(newErrors);
    }
  }, [formData, hasSubmitted, errors, validations.email]);

  const validateForm = () => {
    const newErrors = {};
    
    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length > 32) {
      newErrors.username = "Username must be 32 characters or less";
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validations.email.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = "Password must contain at least 1 uppercase letter";
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = "Password must contain at least 1 lowercase letter";
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = "Password must contain at least 1 number";
    } else if (!/[!@#$%^&*]/.test(formData.password)) {
      newErrors.password = "Password must contain at least 1 special character (!@#$%^&*)";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle array fields separately
    if (name === 'dietary_preferences' || name === 'allergies') {
      return; // These are handled by their own functions
    }
    
    setFormData({ ...formData, [name]: value });
    
    // Real-time validation only for password, not email
    if (name === 'password' && value) {
      if (!validations.password.test(value)) {
        setErrors(prev => ({ 
          ...prev, 
          password: "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and a special character" 
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.password;
          return newErrors;
        });
      }
    }
  };

  // Add preference handler
  const handleAddPreference = (preference) => {
    if (preference && !formData.dietary_preferences.includes(preference)) {
      setFormData({
        ...formData,
        dietary_preferences: [...formData.dietary_preferences, preference]
      });
    }
  };

  // Remove preference handler
  const handleRemovePreference = (preference) => {
    setFormData({
      ...formData,
      dietary_preferences: formData.dietary_preferences.filter(p => p !== preference)
    });
  };

  // Add allergy handler
  const handleAddAllergy = (allergy) => {
    if (allergy && !formData.allergies.includes(allergy)) {
      setFormData({
        ...formData,
        allergies: [...formData.allergies, allergy]
      });
    }
  };

  // Remove allergy handler
  const handleRemoveAllergy = (allergy) => {
    setFormData({
      ...formData,
      allergies: formData.allergies.filter(a => a !== allergy)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setHasSubmitted(true); // Mark that the form has been submitted
    
    // Validate all fields before submission
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
  
    try {
      // Convert arrays to comma-separated strings for API
      const apiFormData = {
        username: formData.username,
        email: formData.email,
        password: formData.password.trim(),
        dietary_preferences: formData.dietary_preferences.join(', '),
        allergies: formData.allergies.join(', ')
      };
  
      // Use the NextAuth register endpoint
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiFormData),
      });
  
      const data = await response.json();
      
      if (response.ok) {
        setSuccessMessage("Account created successfully! Signing you in...");
  
        setTimeout(async () => {
          // Auto sign-in after successful registration using NextAuth
          const result = await signIn("credentials", {
            redirect: false,
            email: formData.email,
            password: formData.password.trim(),
          });
          
          console.log("Login attempt result:", result);
          
          if (result?.error) {
            // Handle sign-in error
            setErrors(prev => ({ 
              ...prev, 
              general: "Registration successful but couldn't sign in automatically. Please log in manually." 
            }));
            // Redirect to login page
            setTimeout(() => router.push("/login"), 2000);
          } else {
            // Registration and sign-in successful - redirect to dashboard
            setErrors({});
            // Redirect to dashboard with the user ID from the session
            setTimeout(async () => {
              // Fetch session to get user ID
              const res = await fetch("/api/auth/session");
              const session = await res.json();
              const userId = session?.user?.id;
              
              if (userId) {
                router.push(`/dashboard/grid/${userId}`);
              } else {
                router.push("/login");
              }
            }, 500);
          }
        }, 2000); // Added 2-second delay before login attempt
      } else {
        // Handle specific API error responses
        if (data.error === "Email already in use") {
          setErrors(prev => ({ 
            ...prev, 
            email: "A user with this email already exists" 
          }));
        } else {
          setErrors(prev => ({ 
            ...prev, 
            general: data.error || "Failed to register. Please try again." 
          }));
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrors(prev => ({ 
        ...prev, 
        general: "An error occurred while registering. Please try again later." 
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 relative">
      {/* Title */}
      <h1 className="text-4xl font-bold text-orange-600 mb-6">Meal Match</h1>

      {/* Home Button */}
      <Link href="/" className="absolute top-4 left-4 text-xl font-bold text-orange-600 hover:text-orange-800">
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
      </Link>

      <div className="bg-white p-8 rounded-lg shadow-md w-96 max-w-full">
        <h2 className="text-2xl font-bold text-center text-orange-600 mb-6">
          Sign Up
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
            <label className="block text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.username ? 'border-red-500' : ''
              }`}
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.email ? 'border-red-500' : ''
              }`}
            />
            {errors.email && hasSubmitted && (
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
            {errors.password && hasSubmitted && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
            <div className="mt-2 text-xs text-gray-600">
              <p>Password must contain:</p>
              <ul className="list-disc ml-5 mt-1">
                <li className={formData.password.length >= 6 ? 'text-green-600' : ''}>
                  At least 6 characters
                </li>
                <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>
                  At least 1 uppercase letter
                </li>
                <li className={/[a-z]/.test(formData.password) ? 'text-green-600' : ''}>
                  At least 1 lowercase letter
                </li>
                <li className={/[0-9]/.test(formData.password) ? 'text-green-600' : ''}>
                  At least 1 number
                </li>
                <li className={/[@#\-_$%^&+=§!\?]/.test(formData.password) ? 'text-green-600' : ''}>
                  At least 1 special character (@#-_$%^&+=§!?)
                </li>
              </ul>
            </div>
          </div>

          <div>
            <label className="block text-gray-700">Dietary Preferences</label>
            <div className="mt-1 border border-gray-300 rounded-md shadow-sm p-2 focus-within:ring-1 focus-within:ring-orange-500 focus-within:border-orange-500">
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.dietary_preferences.map((pref) => (
                  <div key={pref} className="bg-orange-100 text-orange-800 px-2 py-1 rounded-md flex items-center">
                    {pref}
                    <button
                      type="button"
                      onClick={() => handleRemovePreference(pref)}
                      className="ml-1 text-orange-600 hover:text-orange-800"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <select
                name="dietary_preferences"
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddPreference(e.target.value);
                    e.target.value = "";
                  }
                }}
                className="w-full border-0 focus:ring-0 p-0 text-gray-500"
              >
                <option value="" disabled>Select preferences...</option>
                {DIETARY_PREFERENCES
                  .filter(pref => !formData.dietary_preferences.includes(pref))
                  .map(pref => (
                    <option key={pref} value={pref}>{pref}</option>
                  ))
                }
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-700">Allergies</label>
            <div className="mt-1 border border-gray-300 rounded-md shadow-sm p-2 focus-within:ring-1 focus-within:ring-orange-500 focus-within:border-orange-500">
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.allergies.map((allergy) => (
                  <div key={allergy} className="bg-red-100 text-red-800 px-2 py-1 rounded-md flex items-center">
                    {allergy}
                    <button
                      type="button"
                      onClick={() => handleRemoveAllergy(allergy)}
                      className="ml-1 text-red-600 hover:text-red-800"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <select
                name="allergies"
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddAllergy(e.target.value);
                    e.target.value = "";
                  }
                }}
                className="w-full border-0 focus:ring-0 p-0 text-gray-500"
              >
                <option value="" disabled>Select allergies...</option>
                {ALLERGIES
                  .filter(allergy => !formData.allergies.includes(allergy))
                  .map(allergy => (
                    <option key={allergy} value={allergy}>{allergy}</option>
                  ))
                }
              </select>
            </div>
          </div>

          <CustomButton 
            type="submit" 
            className={`w-full ${isSubmitting ? 'bg-orange-400' : 'bg-orange-500'} text-white hover:bg-orange-600 flex justify-center items-center`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registering...' : 'Register'}
          </CustomButton>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-orange-500 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;