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
import Header from './layout/Header';
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
        <Header
          user={user}
          userData={userData}
          isAdmin={isAdmin}
          onAddEvent={() => setIsFormOpen(true)}
          onOpenArchive={() => navigate('/admin/archive')}
          onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
          onLogout={handleLogout}
        />
        {/* Legacy inline header removed; using <Header /> */}

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
      <div className="fixed inset-0 bg-black/50 backdrop-blur-[1px]" aria-hidden="true"></div>
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
