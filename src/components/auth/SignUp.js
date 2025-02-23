import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { PROFILE_PICTURES } from '../../constants';

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('user');
  const [selectedPicture, setSelectedPicture] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (!selectedPicture) {
      return setError('Please select a profile picture');
    }

    try {
      setError('');
      setLoading(true);
      const { user } = await signup(email, password);

      // Create a user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        fullName: fullName,
        role: role,
        phoneNumber: phoneNumber,
        profilePicture: selectedPicture.url,
        createdAt: new Date().toISOString()
      });

      navigate('/');
    } catch (error) {
      setError('Failed to create an account. ' + error.message);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-bl from-pink-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background patterns */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large floating circles */}
        <div className="absolute -left-10 top-1/4 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
        <div className="absolute right-1/3 top-1/3 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-delay-2"></div>
        <div className="absolute -right-10 bottom-1/4 w-72 h-72 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-delay-4"></div>
        
        {/* Small decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-pink-400 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-4 h-4 bg-purple-400 rounded-full animate-pulse delay-300"></div>
        <div className="absolute bottom-1/4 left-1/2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse delay-700"></div>
        
        {/* Gradient mesh */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-100/20 via-transparent to-purple-100/20 backdrop-blur-[100px]"></div>
        
        {/* Animated lines */}
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(90deg, rgba(236, 72, 153, 0.1) 1px, transparent 1px), linear-gradient(rgba(236, 72, 153, 0.1) 1px, transparent 1px)', backgroundSize: '48px 48px' }}></div>
      </div>

      <div className="max-w-md w-full bg-white/90 rounded-3xl shadow-xl overflow-hidden relative z-10 backdrop-blur-sm">
        {/* Pink curved shape */}
        <div className="absolute top-0 right-0 left-0 h-72 bg-gradient-to-br from-pink-400 to-pink-500 transform skew-y-6 origin-top-right"></div>
        
        {/* Purple accent */}
        <div className="absolute bottom-20 left-0 w-32 h-32 bg-purple-600 rounded-full transform -translate-x-16"></div>
        
        <div className="relative pt-16 pb-8 px-8">
          <div className="text-center mb-8">
            <button onClick={() => navigate(-1)} className="absolute top-4 left-4 text-white hover:text-gray-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
          </div>

          {error && (
            <div className="mb-4 text-center text-sm text-red-600 bg-red-50 rounded-lg py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mt-8">
            <div>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                placeholder="Full Name"
              />
            </div>

            <div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                placeholder="Email"
              />
            </div>

            <div>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                placeholder="Phone Number"
              />
            </div>

            <div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>

            <div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                placeholder="Confirm Password"
              />
            </div>

            <div>
              <input
                type="hidden"
                id="role"
                name="role"
                value="user"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose your profile picture
              </label>
              <div className="grid grid-cols-3 gap-4">
                {PROFILE_PICTURES.map((picture) => (
                  <div
                    key={picture.id}
                    className={`relative rounded-lg overflow-hidden cursor-pointer transform transition-transform duration-200 hover:scale-105 ${
                      selectedPicture?.id === picture.id ? 'ring-2 ring-purple-500 ring-offset-2' : ''
                    }`}
                    onClick={() => setSelectedPicture(picture)}
                  >
                    <img
                      src={picture.url}
                      alt={picture.alt}
                      className="w-full h-24 object-cover"
                    />
                    {selectedPicture?.id === picture.id && (
                      <div className="absolute inset-0 bg-purple-500 bg-opacity-20 flex items-center justify-center">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-pink-500 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transform transition-transform duration-150 hover:scale-105"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <span className="flex items-center">
                    Sign up
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                )}
              </button>
            </div>

            <div className="text-center text-sm">
              <Link to="/signin" className="text-pink-600 hover:text-pink-500">
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
