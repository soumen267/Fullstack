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

  useEffect(() => {
    axios.get(`http://localhost:5000/user/${id}`)
        .then(res => {
        console.log('Fetched user profile:', res.data); // ✅ console log here
        setProfile(res.data.data);
        })
        .catch(() => {
        // fallback if user not found
        setProfile({ name: '', email: '', phone: '', address: '' });
        });
    }, [id]);

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

  return (
    <div className="max-w-5xl mx-auto mt-20 px-6">
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-2xl p-8 md:p-12 grid md:grid-cols-2 gap-10 transition-all duration-300">
        
        {/* Left: Profile Image */}
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="w-44 h-44 rounded-full overflow-hidden shadow-lg border-4 border-blue-500">
            <img
                src={
                    previewImage ||
                    (profile.avatar ? `${profile.avatar}` : 'https://via.placeholder.com/150')
                }
                alt="Profile"
                className="w-full h-full object-cover"
            />
            </div>
            {isEditing && (
            <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-sm text-gray-600"
            />
            )}
            <h3 className="text-xl font-semibold text-gray-800">{profile.name}</h3>
            <p className="text-sm text-gray-500">{profile.email}</p>
        </div>

        {/* Right: Form */}
        <div className="space-y-6">
            {['name', 'email', 'phone', 'address'].map((field) => (
            <div key={field}>
                <label className="block text-gray-700 font-medium mb-1 capitalize">
                {field}
                </label>
                {field !== 'address' ? (
                <input
                    type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                    name={field}
                    value={profile[field]}
                    disabled={!isEditing}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm"
                />
                ) : (
                <textarea
                    name="address"
                    rows="3"
                    value={profile.address}
                    disabled={!isEditing}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm"
                />
                )}
            </div>
            ))}

            {/* Buttons */}
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
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                >
                    Cancel
                </button>
                </>
            )}
            </div>
        </div>
        </div>
    </div>
    );
};

export default UserProfile;