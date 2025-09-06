import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { motion } from 'framer-motion';
import welcomeImage from '../../assets/welcome.png';

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
      toast.error(t('failed_to_sign_in'));
      setLoading(false);
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.15,
        duration: 0.5
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background patterns */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large floating circles */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: [0.5, 0.7, 0.5],
            scale: [1, 1.1, 1],
            x: [0, 10, 0],
            y: [0, -10, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, repeatType: "mirror" }}
          className="absolute -left-10 top-1/4 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70"
        ></motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: [0.5, 0.7, 0.5],
            scale: [1, 1.05, 1],
            x: [0, -15, 0],
            y: [0, 15, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "mirror", delay: 0.5 }}
          className="absolute right-1/3 top-1/3 w-72 h-72 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-70"
        ></motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: [0.5, 0.7, 0.5],
            scale: [1, 1.15, 1],
            x: [0, 15, 0],
            y: [0, 10, 0]
          }}
          transition={{ duration: 9, repeat: Infinity, repeatType: "mirror", delay: 1 }}
          className="absolute -right-10 bottom-1/4 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70"
        ></motion.div>
        
        {/* Small decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-purple-400 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-4 h-4 bg-pink-400 rounded-full animate-pulse delay-300"></div>
        <div className="absolute bottom-1/4 left-1/2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse delay-700"></div>
        
        {/* Gradient mesh */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-100/20 via-transparent to-pink-100/20 backdrop-blur-[100px]"></div>
        
        {/* Animated lines */}
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px)', backgroundSize: '48px 48px' }}></div>
      </div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className={`max-w-md w-full bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden relative z-10 ${language === 'he' ? 'text-right' : 'text-left'}`}
      >
        {/* Yellow accent */}
        <motion.div 
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 16, opacity: 0.8 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="absolute top-20 right-0 w-32 h-32 bg-yellow-200 rounded-full transform"
        ></motion.div>
        
        {/* Cool background elements for the card */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating geometric shapes */}
          <motion.div
            animate={{
              y: [0, -15, 0],
              rotate: [0, 10, 0]
            }}
            transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
            className="absolute top-1/4 right-1/4 w-8 h-8 border-4 border-yellow-400 opacity-20"
          ></motion.div>
          
          <motion.div
            animate={{
              y: [0, 20, 0],
              x: [0, 15, 0]
            }}
            transition={{ duration: 7, repeat: Infinity, repeatType: "reverse" }}
            className="absolute bottom-1/4 right-1/4 w-12 h-12 border-4 border-purple-400 rounded-full opacity-15"
          ></motion.div>
          
          {/* Animated stars/sparkles */}
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-1/3 left-1/4 w-3 h-3 bg-yellow-300 rotate-45"
          ></motion.div>
          
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            className="absolute top-2/3 right-1/3 w-3 h-3 bg-purple-300 rotate-45"
          ></motion.div>
          
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            className="absolute bottom-1/3 left-2/3 w-3 h-3 bg-pink-300 rotate-45"
          ></motion.div>
          
          {/* Wavy line decorations */}
          <svg className="absolute w-full h-16 left-0 top-1/3 opacity-5" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" 
                  fill="#8B5CF6"></path>
          </svg>
          
          <svg className="absolute w-full h-16 left-0 bottom-1/3 opacity-5" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" 
                  fill="#EAB308"></path>
          </svg>
        </div>
        
        <div className="relative pt-12 pb-8 px-8">
          
          {/* Welcome image*/}
          <motion.div 
            variants={itemVariants}
            className="relative mb-6 mt-2 flex justify-center"
          >
            <motion.div
              className="relative w-full h-80 overflow-hidden"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              whileHover={{ 
                scale: 1.03,
                transition: { duration: 0.2 } 
              }}
            >
              <img 
                src={welcomeImage}
                alt="Welcome" 
                className="w-full h-full object-contain"
              />
              
              {/* Animated overlay elements - more subtle */}
              <motion.div 
                className="absolute top-1/4 left-1/4 w-20 h-20 rounded-full bg-yellow-400/5 mix-blend-overlay z-10"
                animate={{ 
                  scale: [1, 1.2, 1],
                  x: [0, 10, 0],
                  y: [0, -10, 0]
                }}
                transition={{ duration: 5, repeat: Infinity, repeatType: "mirror" }}
              ></motion.div>
              <motion.div 
                className="absolute bottom-1/3 right-1/4 w-16 h-16 rounded-full bg-pink-400/5 mix-blend-overlay z-10"
                animate={{ 
                  scale: [1, 1.3, 1],
                  x: [0, -15, 0],
                  y: [0, 5, 0]
                }}
                transition={{ duration: 6, repeat: Infinity, repeatType: "mirror", delay: 1 }}
              ></motion.div>
            </motion.div>
          </motion.div>

          {/* Errors shown via toast notifications */}

          <motion.form 
            variants={containerVariants}
            onSubmit={handleSubmit} 
            className="space-y-6 mt-8"
          >
            <motion.div variants={itemVariants}>
              <motion.input
                whileFocus={{ scale: 1.02, boxShadow: "0 0 0 3px rgba(139, 92, 246, 0.3)" }}
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm transition-all duration-200"
                placeholder={t('email')}
                dir={language === 'he' ? 'rtl' : 'ltr'}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.input
                whileFocus={{ scale: 1.02, boxShadow: "0 0 0 3px rgba(139, 92, 246, 0.3)" }}
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm transition-all duration-200"
                placeholder={t('password')}
                dir={language === 'he' ? 'rtl' : 'ltr'}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transform transition-all duration-200 shadow-md"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <motion.span 
                    className="flex items-center justify-center"
                    initial={{ x: -5 }}
                    whileHover={{ x: 0 }}
                  >
                    {t('sign_in')}
                    <motion.svg 
                      initial={{ x: 0 }}
                      whileHover={{ x: 5 }}
                      transition={{ repeat: Infinity, repeatType: "mirror", duration: 0.5 }}
                      className="ml-2 w-4 h-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </motion.svg>
                  </motion.span>
                )}
              </motion.button>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="text-center mt-6"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to="/signup" 
                  className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-full text-purple-600 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transform transition-all duration-200 shadow-sm"
                >
                  {t('create_new_account')}
                </Link>
              </motion.div>
            </motion.div>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
}

export default SignIn;
