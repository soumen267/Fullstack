import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const UserProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    avatar: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (activeTab === 'profile') {
    axios.get(`http://localhost:5000/user/${id}`)
     .then(res => {
        console.log('Fetched user profile:', res.data); // ✅ console log here
        setProfile(res.data);
        })
    .catch(() => {
        // fallback if user not found
        setProfile({ name: '', email: '', phone: '', address: '', avatar: '' });
        });
    }
    }, [id, activeTab]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('avatar', file);

    const res = await axios.post('http://localhost:5000/upload', formData);
    const uploadedUrl = res.data.url;
    setProfile(prev => ({ ...prev, avatar: uploadedUrl }));
    setPreviewImage(uploadedUrl);
  };

  const handleSave = () => {
    // Basic validation
    if (!profile.name || !profile.email) {
        alert('Name and Email are required');
        return;
    }

    axios.put(`http://localhost:5000/edit/${id}`, profile)
        .then(() => {
            setIsEditing(false);
            toast.success('Profile updated successfully!');
        })
        .catch(() =>
            toast.error('Error updating profile!')
        );
    };

  // Function to render content based on activeTab
  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            {/* Conditional file input for editing mode */}
            {isEditing && (
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-sm text-gray-600 block mb-4"
              />
            )}
            {['name', 'email', 'phone', 'address'].map((field) => (
              <div key={field}>
                <label className="block text-gray-700 font-medium mb-1 capitalize">
                  {field}
                </label>
                {field !== 'address' ? (
                  <input
                    type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                    name={field}
                    value={profile[field] || ''}
                    disabled={!isEditing}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm"
                  />
                ) : (
                  <textarea
                    name="address"
                    rows="3"
                    value={profile.address || ''}
                    disabled={!isEditing}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm"
                  />
                )}
              </div>
            ))}

            <div className="flex justify-end gap-4 pt-4">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg shadow hover:shadow-xl transition duration-300"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg shadow hover:shadow-xl transition duration-300"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      // Consider resetting form fields here if you want to discard changes on cancel
                    }}
                    className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        );
      case 'orders':
        return (
          <div className="p-4 text-gray-700">
            <h3 className="text-xl font-bold mb-4">Your Orders</h3>
            <p>Order history will appear here. (Content for Orders tab)</p>
            {/* Replace with your actual Orders component/content */}
          </div>
        );
      case 'settings':
        return (
          <div className="p-4 text-gray-700">
            <h3 className="text-xl font-bold mb-4">Account Settings</h3>
            <p>Manage your account settings. (Content for Settings tab)</p>
            {/* Replace with your actual Settings component/content */}
          </div>
        );
      default:
        return null;
    }
  };


  return (
    <div className="max-w-7xl mx-auto mt-20 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row gap-8">

        {/* Left Column: Navigation Menu */}
        <div className="w-full md:w-1/4 bg-white/70 backdrop-blur-md rounded-2xl shadow-2xl p-6 h-fit">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-6">
            <div className="w-28 h-28 rounded-full overflow-hidden shadow-lg border-4 border-blue-500">
              <img
                src={
                  previewImage ||
                  (profile.avatar ? `${profile.avatar}` : 'https://i.pravatar.cc/150')
                }
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">{profile.name}</h3>
            <p className="text-sm text-gray-500">{profile.email}</p>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center px-4 py-3 rounded-lg text-lg font-medium transition-all duration-200
                         hover:bg-blue-100 hover:text-blue-700
                         ${activeTab === 'profile' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center px-4 py-3 rounded-lg text-lg font-medium transition-all duration-200
                         hover:bg-blue-100 hover:text-blue-700
                         ${activeTab === 'orders' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Orders
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center px-4 py-3 rounded-lg text-lg font-medium transition-all duration-200
                         hover:bg-blue-100 hover:text-blue-700
                         ${activeTab === 'settings' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.827 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.827 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.827-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.827-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </button>
            {/* Add more menu items here if needed */}
          </nav>
        </div>

        {/* Right Column: Dynamic Content Area */}
        <div className="w-full md:w-3/4 bg-white/70 backdrop-blur-md rounded-2xl shadow-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center md:text-left">
            {activeTab === 'profile' && 'User Profile'}
            {activeTab === 'orders' && 'Your Orders'}
            {activeTab === 'settings' && 'Account Settings'}
          </h2>
          {renderContent()}
        </div>

      </div>
    </div>
  )
};

export default UserProfile;