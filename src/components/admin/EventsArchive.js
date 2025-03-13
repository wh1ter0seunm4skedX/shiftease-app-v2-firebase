import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import EventCard from '../EventCard';
import Footer from '../Footer';

function EventsArchive() {
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser: user, isAdmin } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect non-admin users
    if (!isAdmin) {
      navigate('/');
      return;
    }

    // Get current date in ISO format (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    
    const pastEventsQuery = query(
      collection(db, 'events'),
      where('date', '<', today),
      orderBy('date', 'desc') // Show most recent past events first
    );
    
    const unsubscribe = onSnapshot(pastEventsQuery, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPastEvents(eventsData);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [user, isAdmin, navigate]);

  const handleBackToDashboard = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">{t('events_archive')}</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={handleBackToDashboard}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            {language === 'he' ? (
              <>
                <span className="mx-1">{t('back_to_dashboard')}</span>
                <svg className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </>
            ) : (
              <>
                <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="mx-1">{t('back_to_dashboard')}</span>
              </>
            )}
          </button>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : pastEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] sm:h-[60vh] text-center">
              <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm w-full sm:w-auto">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2">{t('no_past_events')}</h2>
                <p className="text-gray-500">{t('no_past_events_to_display')}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {pastEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isPastEvent={true}
                  isAdmin={isAdmin}
                  showRegistrationButton={false}
                  onViewRegistrations={() => {}} // Past events don't need registration functionality
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default EventsArchive;
