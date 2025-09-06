import React, { useState, useEffect } from 'react';
// Import the toast library
import toast from 'react-hot-toast';
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
import { SkeletonGrid } from './common/Skeleton';
import Header from './layout/Header';
import { format } from 'date-fns';
import { sendRegistrationNotification } from '../services/emailService';
import { fetchEventImage } from '../services/imageService';

function EventDashboard() {
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
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
        
        const sortedEvents = eventsData.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          
          if (dateA.getTime() !== dateB.getTime()) {
            return dateA - dateB;
          }
          
          return a.startTime.localeCompare(b.startTime);
        });
        
        setEvents(sortedEvents);
        setLoadingEvents(false);
      },
      (error) => {
        console.error("Error fetching events: ", error);
        toast.error(t('error_fetching_events')); // Toast for error
        setLoadingEvents(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid, t]);

  const handleAddEvent = async (newEvent) => {
    if (!isAdmin) {
      toast.error(t('only_administrators_can_create_events'));
      return;
    }

    const toastId = toast.loading(t('adding_event')); // Loading toast

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
      toast.success(t('event_added_successfully'), { id: toastId }); // Success toast
    } catch (error) {
      console.error('Error adding event: ', error);
      toast.error(t('error_adding_event'), { id: toastId }); // Error toast
    }
  };

  const handleEditEvent = async (eventData) => {
    if (!isAdmin) {
      toast.error(t('only_administrators_can_edit_events'));
      return;
    }

    const toastId = toast.loading(t('updating_event')); // Loading toast

    try {
      const eventRef = doc(db, 'events', eventData.id);
      const { id, createdAt, ...updateData } = eventData;
      
      updateData.capacity = parseInt(updateData.capacity);
      updateData.standbyCapacity = parseInt(updateData.standbyCapacity);
      
      await updateDoc(eventRef, updateData);
      setEditingEvent(null);
      toast.success(t('event_updated_successfully'), { id: toastId }); // Success toast
    } catch (error) {
      console.error('Error updating event: ', error);
      toast.error(t('error_updating_event'), { id: toastId }); // Error toast
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!isAdmin) {
      toast.error(t('only_administrators_can_delete_events'));
      return;
    }

    // Custom confirmation toast (RTL)
    toast((toastInstance) => (
      <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-lg rtl text-right" dir="rtl">
        <p className="font-semibold mb-3">{t('are_you_sure_delete_event')}</p>
        <div className="flex gap-2 flex-row-reverse">
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
            onClick={async () => {
              toast.dismiss(toastInstance.id);
              const deletingToastId = toast.loading(t('deleting_event'));
              try {
                await deleteDoc(doc(db, 'events', eventId));
                toast.success(t('event_deleted_successfully'), { id: deletingToastId });
              } catch (error) {
                console.error('Error deleting event: ', error);
                toast.error(t('error_deleting_event'), { id: deletingToastId });
              }
            }}
          >
            {t('delete')}
          </button>
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
            onClick={() => toast.dismiss(toastInstance.id)}
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    ), {
      duration: Infinity, // Keep open until user interacts
      position: 'top-center',
    });
  };

  const handleRegisterForEvent = async (eventId) => {
    if (!user) {
      toast.error(t('please_log_in_to_register'));
      return;
    }

    if (isAdmin) {
      toast.error(t('administrators_cannot_register'));
      return;
    }
    
    const toastId = toast.loading(t('registering'));

    try {
      const eventRef = doc(db, 'events', eventId);
      const eventDoc = await getDoc(eventRef);
      
      if (!eventDoc.exists()) {
        toast.error(t('event_not_found'), { id: toastId });
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
        toast.error(t('already_registered_for_event'), { id: toastId });
        return;
      }

      if (eventData.registrations?.length < eventData.capacity) {
        await updateDoc(eventRef, {
          registrations: arrayUnion(registrationData)
        });
        
        try {
          await sendRegistrationNotification(eventData, userData, 'regular');
        } catch (error) {
          console.error('Failed to send email notification:', error);
        }
        
        toast.success(t('successfully_registered'), { id: toastId });
      } 
      else if (eventData.standbyRegistrations?.length < eventData.standbyCapacity) {
        await updateDoc(eventRef, {
          standbyRegistrations: arrayUnion(registrationData)
        });
        
        try {
          await sendRegistrationNotification(eventData, userData, 'standby');
        } catch (error) {
          console.error('Failed to send email notification:', error);
        }
        
        toast.success(t('added_to_standby_list'), { id: toastId });
      } 
      else {
        toast.error(t('event_is_full'), { id: toastId });
      }
    } catch (error) {
      console.error('Error registering for event: ', error);
      toast.error(t('error_registering_for_event'), { id: toastId });
    }
  };

  const handleUnregisterFromEvent = async (eventId) => {
    if (!user) return;
    
    const toastId = toast.loading(t('unregistering'));

    try {
      const eventRef = doc(db, 'events', eventId);
      const eventDoc = await getDoc(eventRef);
      
      if (!eventDoc.exists()) {
        toast.error(t('event_not_found'), { id: toastId });
        return;
      }

      const eventData = eventDoc.data();
      const userRegistration = eventData.registrations?.find(reg => reg.userId === user.uid);
      const userStandby = eventData.standbyRegistrations?.find(reg => reg.userId === user.uid);

      if (userRegistration) {
        await updateDoc(eventRef, {
          registrations: arrayRemove(userRegistration)
        });

        if (eventData.standbyRegistrations?.length > 0) {
          const firstStandbyUser = eventData.standbyRegistrations[0];
          await updateDoc(eventRef, {
            registrations: arrayUnion(firstStandbyUser),
            standbyRegistrations: arrayRemove(firstStandbyUser)
          });
        }

        toast.success(t('successfully_unregistered'), { id: toastId });
      } 
      else if (userStandby) {
        await updateDoc(eventRef, {
          standbyRegistrations: arrayRemove(userStandby)
        });
        toast.success(t('successfully_removed_from_standby'), { id: toastId });
      }
    } catch (error) {
      console.error('Error unregistering from event: ', error);
      toast.error(t('error_unregistering_from_event'), { id: toastId });
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
      toast.error(t('failed_to_log_out'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Global Toaster moved to App.jsx */}
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
            {loadingEvents ? (
              <SkeletonGrid count={6} />
            ) : events.length === 0 ? (
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

        {isAdmin && isAdminPanelOpen && (
          <div className={`fixed inset-0 z-50 overflow-y-auto transition-opacity duration-200 ease-out ${isAdminPanelClosing ? 'opacity-0' : 'opacity-100'}`}>
            <div className="flex items-center justify-center min-h-screen p-4 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-black/50 backdrop-blur-[1px]" aria-hidden="true"></div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
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
