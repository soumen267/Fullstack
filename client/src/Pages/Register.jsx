import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function Register() {

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const sendConfirmationEmail = async (email, username) => {
        try {
            const res = await axios.post('http://localhost:5000/send-confirmation', {
                email,
                username,
            });
            console.log(res.data.message);
        } catch (err) {
            console.error('Email send failed', err);
            toast.error('Failed to send confirmation email');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({}); // Clear previous errors
        setServerError('');

        try {
            const response = await axios.post('http://localhost:5000/register', formData); // Replace with your API endpoint
            console.log('Registration successful:', response.data);
            await sendConfirmationEmail(formData.email, formData.name);
            toast.success('Registration successful!');
            // ✅ Clear the form fields
            setFormData({
                name: '',
                email: '',
                password: '',
                password_confirmation: '',
            });
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors || {});
            }else if (error.response && error.response.data.message) {
                // ✅ Set general server error message
                setServerError(error.response.data.message);
            } else {
                console.error('An error occurred:', error);
                toast.error('Something went wrong!');
            }
        }
    };

    return (
    <>
    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-12 text-center text-white">
            <h1 className="text-4xl font-bold">Create an Account</h1>
            {serverError && (
            <div className="mt-4 bg-red-600 text-white py-2 px-4 rounded-md inline-block">
                {serverError}
            </div>
            )}
        </div>

        <div className="max-w-xl mx-auto bg-white shadow-lg rounded-lg mt-10 p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name */}
            <div>
                <label htmlFor="name" className="block text-gray-700 font-medium">
                Name
                </label>
                <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={`mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.name
                    ? 'border-red-500 focus:ring-red-300'
                    : 'border-gray-300 focus:ring-indigo-300'
                }`}
                />
                {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name[0]}</p>
                )}
            </div>

            {/* Email */}
            <div>
                <label htmlFor="email" className="block text-gray-700 font-medium">
                Email
                </label>
                <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.email
                    ? 'border-red-500 focus:ring-red-300'
                    : 'border-gray-300 focus:ring-indigo-300'
                }`}
                />
                {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email[0]}</p>
                )}
            </div>

            {/* Password */}
            <div>
                <label htmlFor="password" className="block text-gray-700 font-medium">
                Password
                </label>
                <input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={`mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.password
                    ? 'border-red-500 focus:ring-red-300'
                    : 'border-gray-300 focus:ring-indigo-300'
                }`}
                />
                {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password[0]}</p>
                )}
            </div>

            {/* Confirm Password */}
            <div>
                <label
                htmlFor="password_confirmation"
                className="block text-gray-700 font-medium"
                >
                Confirm Password
                </label>
                <input
                type="password"
                name="password_confirmation"
                id="password-confirm"
                value={formData.password_confirmation}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
            </div>

            {/* Submit Button */}
            <div className="text-center">
                <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300"
                >
                Create Account
                </button>
            </div>
            </form>
        </div>
    </>
    )
}

export default Register;