import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import EventForm from './EventForm';
import AdminPanel from './admin/AdminPanel';
import RegistrationsModal from './admin/RegistrationsModal';
import Footer from './Footer';
import FeedbackButton from './FeedbackButton';
import LanguageSelector from './LanguageSelector';
import { format } from 'date-fns';
import { sendRegistrationNotification } from '../services/emailService';

function EventDashboard() {
  const [events, setEvents] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isRegistrationsModalOpen, setIsRegistrationsModalOpen] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      }
    };
    fetchUserData();
  }, [user]);

  useEffect(() => {
    if (!user?.uid) return;

    const eventsQuery = query(
      collection(db, 'events'),
      orderBy('date', 'desc')
    );
    
    const unsubscribe = onSnapshot(eventsQuery, 
      (querySnapshot) => {
        const eventsData = [];
        querySnapshot.forEach((doc) => {
          eventsData.push({ 
            id: doc.id, 
            ...doc.data(),
            registrations: doc.data().registrations || [],
            standbyRegistrations: doc.data().standbyRegistrations || []
          });
        });
        setEvents(eventsData);
      },
      (error) => {
        console.error("Error fetching events: ", error);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const handleAddEvent = async (newEvent) => {
    if (!isAdmin) {
      alert('Only administrators can create events');
      return;
    }

    try {
      const eventData = {
        ...newEvent,
        createdAt: new Date().toISOString(),
        registrations: [],
        standbyRegistrations: [],
        capacity: parseInt(newEvent.capacity),
        standbyCapacity: parseInt(newEvent.standbyCapacity)
      };
      await addDoc(collection(db, 'events'), eventData);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error adding event: ', error);
      alert('Error adding event. Please try again.');
    }
  };

  const handleEditEvent = async (eventData) => {
    if (!isAdmin) {
      alert('Only administrators can edit events');
      return;
    }

    try {
      const eventRef = doc(db, 'events', eventData.id);
      // Only remove id and createdAt, keep other fields for update
      const { id, createdAt, ...updateData } = eventData;
      
      // Ensure capacity fields are numbers
      updateData.capacity = parseInt(updateData.capacity);
      updateData.standbyCapacity = parseInt(updateData.standbyCapacity);
      
      console.log('Updating event with data:', updateData);
      await updateDoc(eventRef, updateData);
      setEditingEvent(null);
    } catch (error) {
      console.error('Error updating event: ', error);
      alert('Error updating event. Please try again.');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!isAdmin) {
      alert('Only administrators can delete events');
      return;
    }

    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteDoc(doc(db, 'events', eventId));
      } catch (error) {
        console.error('Error deleting event: ', error);
        alert('Error deleting event. Please try again.');
      }
    }
  };

  const handleRegisterForEvent = async (eventId) => {
    if (!user) {
      alert('Please log in to register for events');
      return;
    }

    if (isAdmin) {
      alert('Administrators cannot register for events');
      return;
    }

    try {
      const eventRef = doc(db, 'events', eventId);
      const eventDoc = await getDoc(eventRef);
      
      if (!eventDoc.exists()) {
        alert('Event not found');
        return;
      }

      const eventData = eventDoc.data();
      const registrationData = {
        userId: user.uid,
        registeredAt: new Date().toISOString()
      };

      const isUserRegistered = eventData.registrations?.some(reg => reg.userId === user.uid);
      const isUserStandby = eventData.standbyRegistrations?.some(reg => reg.userId === user.uid);

      if (isUserRegistered || isUserStandby) {
        alert('You are already registered for this event');
        return;
      }

      // Check if regular capacity is available
      if (eventData.registrations?.length < eventData.capacity) {
        await updateDoc(eventRef, {
          registrations: arrayUnion(registrationData)
        });
        
        // Send email notification for regular registration
        try {
          await sendRegistrationNotification(eventData, userData, 'regular');
        } catch (error) {
          console.error('Failed to send email notification:', error);
          // Don't block the registration process if email fails
        }
        
        alert('Successfully registered for the event!');
      } 
      // Check if standby capacity is available
      else if (eventData.standbyRegistrations?.length < eventData.standbyCapacity) {
        await updateDoc(eventRef, {
          standbyRegistrations: arrayUnion(registrationData)
        });
        
        // Send email notification for standby registration
        try {
          await sendRegistrationNotification(eventData, userData, 'standby');
        } catch (error) {
          console.error('Failed to send email notification:', error);
          // Don't block the registration process if email fails
        }
        
        alert('You have been added to the standby list.');
      } 
      else {
        alert('Sorry, this event is full.');
      }
    } catch (error) {
      console.error('Error registering for event: ', error);
      alert('Error registering for event. Please try again.');
    }
  };

  const handleUnregisterFromEvent = async (eventId) => {
    if (!user) return;

    try {
      const eventRef = doc(db, 'events', eventId);
      const eventDoc = await getDoc(eventRef);
      
      if (!eventDoc.exists()) {
        alert('Event not found');
        return;
      }

      const eventData = eventDoc.data();
      const userRegistration = eventData.registrations?.find(reg => reg.userId === user.uid);
      const userStandby = eventData.standbyRegistrations?.find(reg => reg.userId === user.uid);

      if (userRegistration) {
        await updateDoc(eventRef, {
          registrations: arrayRemove(userRegistration)
        });

        // If there are people in standby, move the first one to regular registration
        if (eventData.standbyRegistrations?.length > 0) {
          const firstStandbyUser = eventData.standbyRegistrations[0];
          await updateDoc(eventRef, {
            registrations: arrayUnion(firstStandbyUser),
            standbyRegistrations: arrayRemove(firstStandbyUser)
          });
        }

        alert('Successfully unregistered from the event');
      } 
      else if (userStandby) {
        await updateDoc(eventRef, {
          standbyRegistrations: arrayRemove(userStandby)
        });
        alert('Successfully removed from the standby list');
      }
    } catch (error) {
      console.error('Error unregistering from event: ', error);
      alert('Error unregistering from event. Please try again.');
    }
  };

  const isUserRegistered = (event) => {
    return event.registrations?.some(reg => reg.userId === user?.uid) || false;
  };

  const isUserStandby = (event) => {
    return event.standbyRegistrations?.some(reg => reg.userId === user?.uid) || false;
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/signin');
    } catch (error) {
      console.error('Failed to log out', error);
      alert('Failed to log out. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex flex-col min-h-screen pb-16">
        <nav className="bg-white shadow-lg border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              {/* Logo and Title */}
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center">
                  <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h1 className="ml-2 text-xl font-bold text-gray-800">{t('dashboard')}</h1>
                </div>
              </div>

              {/* Mobile menu button */}
              <div className="flex items-center sm:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
                >
                  <span className="sr-only">Open main menu</span>
                  {!isMobileMenuOpen ? (
                    <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  ) : (
                    <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Desktop menu */}
              <div className="hidden sm:flex sm:items-center sm:space-x-4">
                {isAdmin && (
                  <button
                    onClick={() => setIsFormOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {t('add_event')}
                  </button>
                )}

                <div className="flex items-center space-x-3 border-l pl-4 border-gray-200">
                  <LanguageSelector />
                  
                  <div className="flex items-center space-x-2">
                    {userData?.profilePicture ? (
                      <img
                        src={userData.profilePicture}
                        alt="Profile"
                        className="h-8 w-8 rounded-full object-cover ring-2 ring-white"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {user.email}
                      <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800">
                        {isAdmin ? t('admin') : t('user')}
                      </span>
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-3 py-2 border border-gray-200 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
                  >
                    <svg className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {t('sign_out')}
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile menu */}
            <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} sm:hidden border-t border-gray-200 py-2`}>
              <div className="space-y-3 px-2 pb-3 pt-2">
                <div className="flex items-center space-x-2 px-3 py-2">
                  {userData?.profilePicture ? (
                    <img
                      src={userData.profilePicture}
                      alt="Profile"
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-white"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">{user.email}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 w-fit">
                      {isAdmin ? t('admin') : t('user')}
                    </span>
                  </div>
                </div>

                <LanguageSelector />

                {isAdmin && (
                  <button
                    onClick={() => {
                      setIsFormOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {t('add_event')}
                  </button>
                )}

                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full inline-flex items-center px-3 py-2 border border-gray-200 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
                >
                  <svg className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {t('sign_out')}
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isAdmin && <AdminPanel />}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
            {events.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[50vh] sm:h-[60vh] text-center">
                <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm w-full sm:w-auto">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2">{t('no_events_yet')}</h2>
                  {isAdmin ? (
                    <p className="text-gray-500">{t('click_add_event')}</p>
                  ) : (
                    <p className="text-gray-500">{t('no_events_to_display')}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {events.map((event) => (
                  <div 
                    key={event.id} 
                    className="bg-white rounded-lg shadow-sm overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-md"
                  >
                    <div className="aspect-w-16 aspect-h-9 relative">
                      {event.imageUrl ? (
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-full h-40 sm:h-48 object-cover rounded-t-lg"
                        />
                      ) : (
                        <div className="w-full h-40 sm:h-48 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center rounded-t-lg">
                          <span className="text-white text-xl font-semibold">{event.title[0]}</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        {event.registrations?.length || 0} registered
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                        {isAdmin && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedEvent(event);
                                setIsRegistrationsModalOpen(true);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                              title="View Registrations"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setEditingEvent(event)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="mb-4">
                        <p className="text-gray-600">{event.description}</p>
                      </div>

                      <div className="flex flex-wrap gap-4 mb-4">
                        <div className="flex items-center text-gray-600">
                          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{format(new Date(event.date), 'MMMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{event.startTime} - {event.endTime}</span>
                        </div>
                      </div>

                      {/* Capacity Information - Only visible to admin */}
                      {isAdmin && (
                        <div className="mb-4 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">{t('regular_registration')}:</span>
                            <span className="text-sm font-medium">
                              {event.registrations?.length || 0} / {event.capacity}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${(event.registrations?.length || 0) / event.capacity * 100}%` }}
                            ></div>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">{t('standby_list')}:</span>
                            <span className="text-sm font-medium">
                              {event.standbyRegistrations?.length || 0} / {event.standbyCapacity}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{ width: `${(event.standbyRegistrations?.length || 0) / event.standbyCapacity * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Registration Button - Only visible to non-admin users */}
                      {!isAdmin && (
                        <div className="mt-4">
                          {isUserRegistered(event) ? (
                            <button
                              onClick={() => handleUnregisterFromEvent(event.id)}
                              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                            >
                              {t('unregister')}
                            </button>
                          ) : isUserStandby(event) ? (
                            <button
                              onClick={() => handleUnregisterFromEvent(event.id)}
                              className="w-full bg-yellow-400 text-gray-900 py-2 px-4 rounded-lg hover:bg-yellow-500 transition-colors"
                            >
                              {t('leave_standby_list')}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRegisterForEvent(event.id)}
                              className={`w-full py-2 px-4 rounded-lg transition-colors ${
                                event.registrations?.length >= event.capacity &&
                                event.standbyRegistrations?.length >= event.standbyCapacity
                                  ? 'bg-gray-400 cursor-not-allowed'
                                  : event.registrations?.length >= event.capacity
                                  ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-900'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                              }`}
                              disabled={
                                event.registrations?.length >= event.capacity &&
                                event.standbyRegistrations?.length >= event.standbyCapacity
                              }
                            >
                              {event.registrations?.length >= event.capacity
                                ? event.standbyRegistrations?.length >= event.standbyCapacity
                                  ? t('full')
                                  : t('register_for_standby')
                                : t('register')}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <EventForm 
              open={isFormOpen || !!editingEvent} 
              onClose={() => {
                setIsFormOpen(false);
                setEditingEvent(null);
              }}
              onSubmit={editingEvent ? handleEditEvent : handleAddEvent}
              initialData={editingEvent}
            />
            {/* Registrations Modal */}
            <RegistrationsModal
              isOpen={isRegistrationsModalOpen}
              onClose={() => {
                setIsRegistrationsModalOpen(false);
                setSelectedEvent(null);
              }}
              event={selectedEvent}
            />
          </main>
        </div>
        <Footer />
        <FeedbackButton />
      </div>
    </div>
  );
}

export default EventDashboard;
