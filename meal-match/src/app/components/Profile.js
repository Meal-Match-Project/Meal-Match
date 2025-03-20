'use client';

import { useState } from 'react';
import EmptyProfile from '../../../public/empty_profile.png';

export default function Profile() {
  const [profile, setProfile] = useState({
    profilePicture: '',
    userName: '',
    password: '',
    email: '',
    dietaryPreferences: '',
    allergies: ''
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Profile updated:', profile);
    setIsEditing(false);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-orange-600 mb-4">Profile</h1>
      
      {!isEditing && (
        <div className="flex w-3/4 mx-auto gap-8 items-start">
          {/* Left side: profile pic & username */}
          <div className="flex flex-col items-center">
            <img
              src={profile.profilePicture || EmptyProfile.src}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover"
            />
            <p className="text-xl font-bold mt-3">
              {profile.userName || 'No username found'}
            </p>
          </div>
          
          {/* Right side: other profile fields */}
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-md font-semibold mb-2">Email</label>
              <p>{profile.email || 'No email found'}</p>
            </div>
            <div>
              <label className="block text-md font-semibold mb-2">
                Dietary Preferences
              </label>
              <p>{profile.dietaryPreferences || 'No dietary preferences'}</p>
            </div>
            <div>
              <label className="block text-md font-semibold mb-2">Allergies</label>
              <p>{profile.allergies || 'No allergies'}</p>
            </div>
            <button
              className="bg-orange-600 text-white rounded-md py-2 px-4"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          </div>
        </div>
      )}

      {isEditing && (
        <form onSubmit={handleSubmit} className="space-y-4 w-1/2 mx-auto">
          <div>
            <label className="block text-md font-semibold mb-2">
              Profile Picture
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-md"
            />
            {profile.profilePicture && (
              <img
                src={profile.profilePicture}
                alt="Profile"
                className="mt-2 w-32 h-32 rounded-full object-cover"
              />
            )}
          </div>
          <div>
            <label className="block text-md font-semibold mb-2">User Name</label>
            <input
              type="text"
              name="userName"
              value={profile.userName}
              onChange={handleChange}
              className="border p-2 w-full rounded-md"
            />
          </div>
          <div>
            <label className="block text-md font-semibold mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={profile.password}
              onChange={handleChange}
              className="border p-2 w-full rounded-md"
            />
          </div>
          <div>
            <label className="block text-md font-semibold mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              className="border p-2 w-full rounded-md"
            />
          </div>
          <div>
            <label className="block text-md font-semibold mb-2">
              Dietary Preferences
            </label>
            <textarea
              name="dietaryPreferences"
              value={profile.dietaryPreferences}
              onChange={handleChange}
              className="border p-2 w-full rounded-md"
            />
          </div>
          <div>
            <label className="block text-md font-semibold mb-2">Allergies</label>
            <textarea
              name="allergies"
              value={profile.allergies}
              onChange={handleChange}
              className="border p-2 w-full rounded-md"
            />
          </div>
          <div className="space-x-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      )}
    </div>
  );
}