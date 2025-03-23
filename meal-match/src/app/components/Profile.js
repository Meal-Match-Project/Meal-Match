'use client';

import { useState, useEffect } from 'react';
import { Camera, User, Mail, Pizza, AlertTriangle, Save, CheckCircle, X } from 'lucide-react';
import Image from 'next/image';
import EmptyProfile from '../../../public/empty_profile.png';

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
  'Whole30',
  'Intermittent fasting'
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
  'Sulfites',
  'Mustard',
  'Celery'
];


export default function Profile({ userId }) {
  const [profile, setProfile] = useState({
    profilePicture: '',
    username: '',
    password: '',
    email: '',
    dietary_preferences: [],
    allergies: []
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordModified, setPasswordModified] = useState(false);

  // Fetch user data on component mount
  useEffect(() => {
    async function fetchUserData() {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/users/${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const userData = await response.json();
        
        // Get profile picture from UserProfile model
        const profileResponse = await fetch(`/api/userprofile/${userId}`);
        let profilePicture = '';
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          profilePicture = profileData.profilePicture;
        }
  
        const dietaryPrefs = userData.dietary_preferences ? 
          userData.dietary_preferences.split(',').map(item => item.trim()) : 
          [];
          
        const allergyList = userData.allergies ? 
          userData.allergies.split(',').map(item => item.trim()) : 
          [];
        
        // Only set profile once with correct array values
        setProfile({
          profilePicture,
          username: userData.username,
          email: userData.email,
          password: '••••••••',  // Mask the actual password
          dietary_preferences: dietaryPrefs, // Use the array
          allergies: allergyList // Use the array
        });
        
        setOriginalPassword('••••••••'); // Store the masked password
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUserData();
  }, [userId]);
  
  // Add safety checks in the render methods for dietary preferences and allergies
  // For displaying dietary preferences:
  {Array.isArray(profile.dietary_preferences) && profile.dietary_preferences.length > 0 
    ? profile.dietary_preferences.join(', ') 
    : 'No preferences specified'}
  
  // For displaying allergies:
  {Array.isArray(profile.allergies) && profile.allergies.length > 0 
    ? profile.allergies.join(', ') 
    : 'No allergies specified'}
  
  // For mapping dietary preferences:
  {Array.isArray(profile.dietary_preferences) && profile.dietary_preferences.map((pref) => (
    <div key={pref} className="bg-orange-100 text-orange-800 px-2 py-1 rounded-md flex items-center">
      {pref}
      <button
        type="button"
        onClick={() => {
          setProfile({
            ...profile,
            dietary_preferences: profile.dietary_preferences.filter((p) => p !== pref)
          });
        }}
        className="ml-1 text-orange-600 hover:text-orange-800"
      >
        <X size={14} />
      </button>
    </div>
  ))}
  
  // For mapping allergies:
  {Array.isArray(profile.allergies) && profile.allergies.map((allergy) => (
    <div key={allergy} className="bg-red-100 text-red-800 px-2 py-1 rounded-md flex items-center">
      {allergy}
      <button
        type="button"
        onClick={() => {
          setProfile({
            ...profile,
            allergies: profile.allergies.filter((a) => a !== allergy)
          });
        }}
        className="ml-1 text-red-600 hover:text-red-800"
      >
        <X size={14} />
      </button>
    </div>
  ))}

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'password') {
      // Track that the password field was explicitly modified
      setPasswordModified(true);
    }
    
    if (name === 'dietary_preferences' || name === 'allergies') {
      // For multi-select, create an array from the selected options
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setProfile({ ...profile, [name]: selectedOptions });
    } else {
      setProfile({ ...profile, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, profilePicture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    
    try {      
      // Update user data
      const userData = {
        username: profile.username,
        email: profile.email,
        dietary_preferences: profile.dietary_preferences.join(', '),
        allergies: profile.allergies.join(', ')
      };
  
      // Only include password if it was modified by the user
      if (passwordModified) {
        userData.password = profile.password;
      }
      
      const userResponse = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (!userResponse.ok) {
        throw new Error('Failed to update user data');
      }
      
      // Update profile picture if there is one
      if (profile.profilePicture && !profile.profilePicture.startsWith('https://')) {
        const profileResponse = await fetch(`/api/userprofile/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profilePicture: profile.profilePicture
          })
        });
        
        if (!profileResponse.ok) {
          throw new Error('Failed to update profile picture');
        }
      }
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsEditing(false);
      }, 2000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <p>{error}</p>
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <p>Profile updated successfully!</p>
            </div>
          </div>
        )}
        
        <div className="md:flex">
          {/* Left sidebar with profile picture */}
          <div className="md:w-1/3 bg-orange-50 p-8 flex flex-col items-center">
            <div className="relative">
              <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                {profile.profilePicture ? (
                  <Image 
                    src={profile.profilePicture} 
                    alt="Profile" 
                    width={160} 
                    height={160} 
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <Image 
                    src={EmptyProfile.src} 
                    alt="Empty Profile" 
                    width={160} 
                    height={160} 
                    className="object-cover w-full h-full"
                  />
                )}
              </div>
              
              {isEditing && (
                <label htmlFor="profile-upload" className="absolute bottom-0 right-0 bg-orange-500 text-white p-2 rounded-full cursor-pointer shadow-md hover:bg-orange-600 transition">
                  <Camera size={20} />
                  <input 
                    id="profile-upload" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="hidden" 
                  />
                </label>
              )}
            </div>
            
            <h2 className="mt-6 text-2xl font-bold text-gray-800">{profile.username}</h2>
            <p className="text-gray-500">{profile.email}</p>
            
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="mt-6 bg-orange-500 hover:bg-orange-600 text-white py-2 px-6 rounded-md shadow transition flex items-center"
              >
                <User size={18} className="mr-2" />
                Edit Profile
              </button>
            )}
          </div>
          
          {/* Main content area */}
          <div className="md:w-2/3 p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              {isEditing ? 'Edit Your Profile' : 'Profile Information'}
            </h1>
            
            {!isEditing ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Email</h3>
                  <p className="mt-1 flex items-center text-gray-800">
                    <Mail size={18} className="mr-2 text-orange-500" />
                    {profile.email}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Dietary Preferences</h3>
                  <p className="mt-1 flex items-center text-gray-800">
                    <Pizza size={18} className="mr-2 text-orange-500" />
                    {profile.dietary_preferences.length > 0 
                      ? profile.dietary_preferences.join(', ') 
                      : 'No preferences specified'}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Allergies</h3>
                  <p className="mt-1 flex items-center text-gray-800">
                    <AlertTriangle size={18} className="mr-2 text-orange-500" />
                    {profile.allergies.length > 0 
                      ? profile.allergies.join(', ') 
                      : 'No allergies specified'}
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={profile.username}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Password</label>
                  <div className="relative">
                    <input
                      type={passwordVisible ? "text" : "password"}
                      name="password"
                      value={profile.password}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    />
                    <button 
                      type="button" 
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                    >
                      {passwordVisible ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Leave as is if you don't want to change your password.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Dietary Preferences</label>
                  <div className="mt-1 border border-gray-300 rounded-md shadow-sm p-2 focus-within:ring-1 focus-within:ring-orange-500 focus-within:border-orange-500">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {profile.dietary_preferences.map((pref) => (
                        <div key={pref} className="bg-orange-100 text-orange-800 px-2 py-1 rounded-md flex items-center">
                          {pref}
                          <button
                            type="button"
                            onClick={() => {
                              setProfile({
                                ...profile,
                                dietary_preferences: profile.dietary_preferences.filter((p) => p !== pref)
                              });
                            }}
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
                        if (e.target.value && !profile.dietary_preferences.includes(e.target.value)) {
                          setProfile({
                            ...profile,
                            dietary_preferences: [...profile.dietary_preferences, e.target.value]
                          });
                        }
                        e.target.value = "";  // Reset select after selection
                      }}
                      className="w-full border-0 focus:ring-0 p-0 text-gray-500"
                    >
                      <option value="" disabled>Select preferences...</option>
                      {DIETARY_PREFERENCES.filter(pref => !profile.dietary_preferences.includes(pref)).map(pref => (
                        <option key={pref} value={pref}>{pref}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700">Allergies</label>
                  <div className="mt-1 border border-gray-300 rounded-md shadow-sm p-2 focus-within:ring-1 focus-within:ring-orange-500 focus-within:border-orange-500">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {profile.allergies.map((allergy) => (
                        <div key={allergy} className="bg-red-100 text-red-800 px-2 py-1 rounded-md flex items-center">
                          {allergy}
                          <button
                            type="button"
                            onClick={() => {
                              setProfile({
                                ...profile,
                                allergies: profile.allergies.filter((a) => a !== allergy)
                              });
                            }}
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
                        if (e.target.value && !profile.allergies.includes(e.target.value)) {
                          setProfile({
                            ...profile,
                            allergies: [...profile.allergies, e.target.value]
                          });
                        }
                        e.target.value = "";  // Reset select after selection
                      }}
                      className="w-full border-0 focus:ring-0 p-0 text-gray-500"
                    >
                      <option value="" disabled>Select allergies...</option>
                      {ALLERGIES.filter(allergy => !profile.allergies.includes(allergy)).map(allergy => (
                        <option key={allergy} value={allergy}>{allergy}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    <X size={18} className="inline mr-1" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-orange-500 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    <Save size={18} className="inline mr-1" />
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}