import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, updateDoc, arrayUnion, arrayRemove, getDoc, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import EventForm from './EventForm';
import EventCard from './EventCard';
import AdminPanel from './admin/AdminPanel';
import RegistrationsModal from './admin/RegistrationsModal';
import Footer from './layout/Footer';
import DashboardHeader from './layout/DashboardHeader';
import { format } from 'date-fns';
import { sendRegistrationNotification } from '../services/emailService';
import { fetchEventImage } from '../services/imageService';

function EventDashboard() {
  const [events, setEvents] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [userData, setUserData] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isRegistrationsModalOpen, setIsRegistrationsModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isAdminPanelClosing, setIsAdminPanelClosing] = useState(false);
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

    // Get current date in ISO format (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    
    const eventsQuery = query(
      collection(db, 'events'),
      where('date', '>=', today),
      orderBy('date', 'asc')
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
        
        // Sort events: first by date (ascending), then by start time (ascending)
        const sortedEvents = eventsData.sort((a, b) => {
          // First compare dates
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          
          if (dateA.getTime() !== dateB.getTime()) {
            return dateA - dateB;
          }
          
          // If dates are the same, compare start times
          return a.startTime.localeCompare(b.startTime);
        });
        
        setEvents(sortedEvents);
      },
      (error) => {
        console.error("Error fetching events: ", error);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const handleAddEvent = async (newEvent) => {
    if (!isAdmin) {
      alert(t('only_administrators_can_create_events'));
      return;
    }

    try {
      let imageUrl = newEvent.imageUrl;
      if (!imageUrl && import.meta?.env?.VITE_ENABLE_AUTO_EVENT_IMAGE === 'true') {
        try {
          const img = await fetchEventImage(newEvent.title || newEvent.description || 'event');
          imageUrl = img?.url || null;
        } catch (e) {
          console.warn('Auto image fetch failed:', e?.message || e);
        }
      }
      const eventData = {
        ...newEvent,
        createdAt: new Date().toISOString(),
        registrations: [],
        standbyRegistrations: [],
        capacity: parseInt(newEvent.capacity),
        standbyCapacity: parseInt(newEvent.standbyCapacity),
        ...(imageUrl ? { imageUrl } : {})
      };
      await addDoc(collection(db, 'events'), eventData);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error adding event: ', error);
      alert(t('error_adding_event'));
    }
  };

  const handleEditEvent = async (eventData) => {
    if (!isAdmin) {
      alert(t('only_administrators_can_edit_events'));
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
      alert(t('error_updating_event'));
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!isAdmin) {
      alert(t('only_administrators_can_delete_events'));
      return;
    }

    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteDoc(doc(db, 'events', eventId));
      } catch (error) {
        console.error('Error deleting event: ', error);
        alert(t('error_deleting_event'));
      }
    }
  };

  const handleRegisterForEvent = async (eventId) => {
    if (!user) {
      alert(t('please_log_in_to_register'));
      return;
    }

    if (isAdmin) {
      alert(t('administrators_cannot_register'));
      return;
    }

    try {
      const eventRef = doc(db, 'events', eventId);
      const eventDoc = await getDoc(eventRef);
      
      if (!eventDoc.exists()) {
        alert(t('event_not_found'));
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
        alert(t('already_registered_for_event'));
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
        
        alert(t('successfully_registered'));
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
        
        alert(t('added_to_standby_list'));
      } 
      else {
        alert(t('event_is_full'));
      }
    } catch (error) {
      console.error('Error registering for event: ', error);
      alert(t('error_registering_for_event'));
    }
  };

  const handleUnregisterFromEvent = async (eventId) => {
    if (!user) return;

    try {
      const eventRef = doc(db, 'events', eventId);
      const eventDoc = await getDoc(eventRef);
      
      if (!eventDoc.exists()) {
        alert(t('event_not_found'));
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

        alert(t('successfully_unregistered'));
      } 
      else if (userStandby) {
        await updateDoc(eventRef, {
          standbyRegistrations: arrayRemove(userStandby)
        });
        alert(t('successfully_removed_from_standby'));
      }
    } catch (error) {
      console.error('Error unregistering from event: ', error);
      alert(t('error_unregistering_from_event'));
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
      alert(t('failed_to_log_out'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex flex-col min-h-screen pb-16">
        <DashboardHeader
          user={user}
          userData={userData}
          isAdmin={isAdmin}
          onAddEvent={() => setIsFormOpen(true)}
          onOpenArchive={() => navigate('/admin/archive')}
          onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
          onLogout={handleLogout}
        />
        {false && (
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
              <div className={`hidden sm:flex sm:items-center ${'sm:space-x-reverse sm:space-x-6'}`}>
                {isAdmin && (
                  <div className={`flex items-center ${'space-x-reverse space-x-4'}`}>
                    <button
                      onClick={() => setIsFormOpen(true)}
                      className={`flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${'rtl:space-x-reverse'}`}
                    >
                      <>
                        <span className="mx-1">{t('add_event')}</span>
                        <svg className="h-5 w-5 ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                      </>
                    </button>
                    <button
                      onClick={() => navigate('/admin/archive')}
                      className={`flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${'rtl:space-x-reverse'}`}
                    >
                      <>
                        <span className="mx-1">{t('events_archive')}</span>
                        <svg className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                      </>
                    </button>
                    <button
                      onClick={() => setIsAdminPanelOpen(true)}
                      className={`flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${'rtl:space-x-reverse'}`}
                    >
                      <>
                        <span className="mx-1">{t('system_admin_panel')}</span>
                        <svg className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </>
                    </button>
                  </div>
                )}
                <div className={`flex items-center ${'space-x-reverse space-x-5 border-r pr-4'} border-gray-200`}>
                  
                  <div className={`flex items-center ${'space-x-reverse space-x-3'}`}>
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
                      {userData?.fullName || user.email}
                      <span className={`${'mr-1'} px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800`}>
                        {isAdmin ? t('admin') : t('user')}
                      </span>
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className={`inline-flex items-center justify-center w-full sm:w-auto px-4 py-3 border border-gray-200 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 ${'rtl:space-x-reverse'}`}
                  >
                    <>
                      {t('sign_out')}
                      <svg className="h-4 w-4 ml-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </>
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile menu */}
            {isMobileMenuOpen && (
              <div className="sm:hidden bg-white border-b border-gray-200 pb-3 pt-2">
                <div className="px-4 space-y-3">
                  <div className={`flex items-center ${'space-x-reverse'} space-x-3 py-2`}>
                    {userData?.profilePicture ? (
                      <img
                        src={userData.profilePicture}
                        alt="Profile"
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-700">{userData?.fullName || user.email}</div>
                      <div className="text-xs text-gray-500">
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                          {isAdmin ? t('admin') : t('user')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`border-t border-gray-200 pt-3 px-4 ${'space-y-4'}`}>
                    <div className="grid grid-cols-1 gap-3">
                    
                      {isAdmin && (
                        <div className="flex flex-col space-y-3">
                          <button
                            onClick={() => {
                              setIsFormOpen(true);
                              setIsMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200 ${'rtl:space-x-reverse'}`}
                          >
                            <>
                              {t('add_event')}
                              <svg className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </>
                          </button>
                          <button
                            onClick={() => {
                              navigate('/admin/archive');
                              setIsMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-center  px-4 py-3 rounded-md text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200 ${'rtl:space-x-reverse'}`}
                          >
                            <>
                              <span className="mx-2">{t('events_archive')}</span>
                              <svg className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                              </svg>
                            </>
                          </button>
                          <button
                            onClick={() => {
                              setIsAdminPanelOpen(true);
                              setIsMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-center  px-4 py-3 rounded-md text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200 ${'rtl:space-x-reverse'}`}
                          >
                            <>
                              <span className="mx-2">{t('system_admin_panel')}</span>
                              <svg className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </>
                          </button>
                        </div>
                      )}
                      
                      <div className="flex justify-start">
                      </div>
                      
                      <button
                        onClick={handleLogout}
                        className={`w-full flex items-center justify-center  px-4 py-3 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 ${'rtl:space-x-reverse'}`}
                      >
                        <>
                          {t('sign_out')}
                          <svg className="h-4 w-4 ml-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                        </>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    isAdmin={isAdmin}
                    isUserRegistered={isUserRegistered(event)}
                    isUserStandby={isUserStandby(event)}
                    onRegister={handleRegisterForEvent}
                    onUnregister={handleUnregisterFromEvent}
                    onEdit={() => {
                      setEditingEvent(event);
                      setIsFormOpen(true);
                    }}
                    onDelete={handleDeleteEvent}
                    onViewRegistrations={() => {
                      setSelectedEvent(event);
                      setIsRegistrationsModalOpen(true);
                    }}
                  />
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

        {/* Admin Panel Modal */}
{isAdmin && isAdminPanelOpen && (
  <div className={`fixed inset-0 z-50 overflow-y-auto transition-opacity duration-200 ease-out ${isAdminPanelClosing ? 'opacity-0' : 'opacity-100'}`}>
    <div className="flex items-center justify-center min-h-screen p-4 text-center sm:block sm:p-0">
      {/* Overlay */}
      <div className="fixed inset-0 bg-gray-500/75" aria-hidden="true"></div>
      <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      {/* Panel with scale/opacity */}
      <div className={`inline-block align-bottom transform transition-all duration-200 ease-out sm:my-8 sm:align-middle ${isAdminPanelClosing ? 'opacity-0 scale-95 translate-y-2' : 'opacity-100 scale-100 translate-y-0'}`}>
        <AdminPanel onClose={() => {
          setIsAdminPanelClosing(true);
          setTimeout(() => {
            setIsAdminPanelClosing(false);
            setIsAdminPanelOpen(false);
          }, 180);
        }} />
      </div>
    </div>
  </div>
)}



        <Footer />
      </div>
    </div>
  );
}

export default EventDashboard;
