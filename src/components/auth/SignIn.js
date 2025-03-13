import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import welcomeIcon from '../../assets/welcome-icon.png';

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      // Added a small delay to ensure authentication state is updated before navigation
      setTimeout(() => {
        navigate('/dashboard');
        setLoading(false);
      }, 500);
    } catch (error) {
      setError(t('failed_to_sign_in'));
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background patterns */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large floating circles */}
        <div className="absolute -left-10 top-1/4 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
        <div className="absolute right-1/3 top-1/3 w-72 h-72 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-delay-2"></div>
        <div className="absolute -right-10 bottom-1/4 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-delay-4"></div>
        
        {/* Small decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-purple-400 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-4 h-4 bg-pink-400 rounded-full animate-pulse delay-300"></div>
        <div className="absolute bottom-1/4 left-1/2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse delay-700"></div>
        
        {/* Gradient mesh */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-100/20 via-transparent to-pink-100/20 backdrop-blur-[100px]"></div>
        
        {/* Animated lines */}
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px)', backgroundSize: '48px 48px' }}></div>
      </div>

      <div className={`max-w-md w-full bg-white/90 rounded-3xl shadow-xl overflow-hidden relative z-10 backdrop-blur-sm ${language === 'he' ? 'text-right' : 'text-left'}`}>
        {/* Purple curved shape */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-br from-purple-600 to-purple-700 transform -skew-y-6 origin-top-left"></div>
        
        {/* Yellow accent */}
        <div className="absolute top-20 right-0 w-32 h-32 bg-yellow-200 rounded-full transform translate-x-16"></div>
        
        <div className="relative pt-16 pb-8 px-8">
          <div className="text-center mb-8">
            <button onClick={() => navigate(-1)} className="absolute top-4 left-4 text-white hover:text-gray-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-3xl font-bold text-white mb-2">{t('welcome_back')}</h2>
            {/* Welcome image */}
            <img 
              src={welcomeIcon}
              alt="Welcome" 
              className="w-36 h-36 mx-auto mt-1 mb-4 object-contain rounded-lg sm:w-56 sm:h-56 md:w-64 md:h-64 xl:w-72 xl:h-72"
              />
          </div>

          {error && (
            <div className="mb-4 text-center text-sm text-red-600 bg-red-50 rounded-lg py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            <div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder={t('email')}
                dir={language === 'he' ? 'rtl' : 'ltr'}
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
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder={t('password')}
                dir={language === 'he' ? 'rtl' : 'ltr'}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transform transition-transform duration-150 hover:scale-105"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <span className="flex items-center justify-center">
                    {t('sign_in')}
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                )}
              </button>
            </div>

            <div className="text-center mt-6">
              <Link 
                to="/signup" 
                className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-full text-purple-600 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transform transition-transform duration-150 hover:scale-105"
              >
                {t('create_new_account')}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
