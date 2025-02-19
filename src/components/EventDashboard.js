import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import EventForm from './EventForm';
import AdminPanel from './admin/AdminPanel';
import { format } from 'date-fns';

function EventDashboard() {
  const [events, setEvents] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

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
            registrations: doc.data().registrations || []
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
        registrations: []
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
      const { id, createdAt, registrations, ...updateData } = eventData;
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
    if (isAdmin) {
      alert('Administrators cannot register for events');
      return;
    }

    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        registrations: arrayUnion({
          userId: user.uid,
          fullName: user.fullName || user.email,
          registeredAt: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error registering for event: ', error);
      alert('Error registering for event. Please try again.');
    }
  };

  const handleUnregisterFromEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to unregister from this event?')) {
      return;
    }

    try {
      const eventRef = doc(db, 'events', eventId);
      const event = events.find(e => e.id === eventId);
      const registration = event.registrations.find(reg => reg.userId === user.uid);
      
      await updateDoc(eventRef, {
        registrations: arrayRemove(registration)
      });
    } catch (error) {
      console.error('Error unregistering from event: ', error);
      alert('Error unregistering from event. Please try again.');
    }
  };

  const isUserRegistered = (event) => {
    return event.registrations?.some(reg => reg.userId === user.uid) || false;
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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h1 className="ml-2 text-xl font-bold text-gray-800">Dashboard</h1>
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
                  Add Event
                </button>
              )}

              <div className="flex items-center space-x-3 border-l pl-4 border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user.email}
                    <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800">
                      {isAdmin ? 'Admin' : 'User'}
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
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} sm:hidden border-t border-gray-200 py-2`}>
            <div className="space-y-3 px-2 pb-3 pt-2">
              <div className="flex items-center space-x-2 px-3 py-2">
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">{user.email}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 w-fit">
                    {isAdmin ? 'Admin' : 'User'}
                  </span>
                </div>
              </div>

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
                  Add Event
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
                Sign Out
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
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2">No events yet</h2>
                {isAdmin ? (
                  <p className="text-gray-500">Click the "Add Event" button to create your first event!</p>
                ) : (
                  <p className="text-gray-500">There are no events to display at this time.</p>
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
                  
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">{event.title}</h3>
                    
                    <div className="flex items-center text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{format(new Date(event.date), 'MMMM d, yyyy')}</span>
                      <span className="mx-2">|</span>
                      <span>{event.startTime ? format(new Date(`1970-01-01T${event.startTime}:00`), 'HH:mm') : 'N/A'}</span>
                      <span className="mx-2">-</span>
                      <span>{event.endTime ? format(new Date(`1970-01-01T${event.endTime}:00`), 'HH:mm') : 'N/A'}</span>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2 text-sm sm:text-base">{event.description}</p>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                      {!isAdmin && (
                        <button
                          onClick={() => isUserRegistered(event) 
                            ? handleUnregisterFromEvent(event.id)
                            : handleRegisterForEvent(event.id)
                          }
                          className={`w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${
                            isUserRegistered(event)
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200`}
                        >
                          {isUserRegistered(event) ? 'Unregister' : 'Register'}
                        </button>
                      )}
                      
                      {isAdmin && (
                        <div className="flex space-x-3 w-full sm:w-auto justify-end">
                          <button
                            onClick={() => setEditingEvent(event)}
                            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors duration-200 text-sm sm:text-base"
                          >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="inline-flex items-center text-red-600 hover:text-red-700 transition-colors duration-200 text-sm sm:text-base"
                          >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
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
        </main>
      </div>
    </div>
  );
}

export default EventDashboard;
