import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useRole } from '../hooks/useRole';
import { useNavigate } from 'react-router-dom';
import { generateRandomEvent } from '../constants';
import EventForm from './EventForm';
import { format } from 'date-fns';

function EventDashboard() {
  const [events, setEvents] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const { user, logout } = useAuth();
  const { isAdmin } = useRole();
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
    if (!isAdmin()) {
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
    if (!isAdmin()) {
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
    if (!isAdmin()) {
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

  const handleCreateTestEvent = async () => {
    if (!isAdmin()) {
      alert('Only administrators can create test events');
      return;
    }

    try {
      const randomEvent = generateRandomEvent();
      const eventData = {
        ...randomEvent,
        createdAt: new Date().toISOString(),
        registrations: []
      };
      await addDoc(collection(db, 'events'), eventData);
    } catch (error) {
      console.error('Error creating test event: ', error);
      alert('Error creating test event. Please try again.');
    }
  };

  const handleRegisterForEvent = async (eventId) => {
    if (isAdmin()) {
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
    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        registrations: arrayRemove({
          userId: user.uid,
          fullName: user.fullName || user.email
        })
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
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-semibold text-gray-800">Event Dashboard</h1>
              <span className="text-sm text-gray-500">|</span>
              <span className="text-sm text-gray-600">
                Welcome, {user.email} ({isAdmin() ? 'Admin' : 'User'})
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {isAdmin() && (
                <>
                  <button
                    onClick={handleCreateTestEvent}
                    className="btn-secondary"
                  >
                    Create Test Event
                  </button>
                  <button
                    onClick={() => setIsFormOpen(true)}
                    className="btn-primary"
                  >
                    Add Event
                  </button>
                </>
              )}
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
              >
                <svg 
                  className="w-4 h-4 mr-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                  />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">No events yet</h2>
              {isAdmin() ? (
                <p className="text-gray-500">Click the "Add Event" button to create your first event!</p>
              ) : (
                <p className="text-gray-500">There are no events to display at this time.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center rounded-t-lg">
                      <span className="text-white text-xl font-semibold">{event.title[0]}</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    {event.registrations?.length || 0} registered
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{event.title}</h3>
                  
                  <div className="flex items-center text-gray-600 mb-4">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{format(new Date(event.date), 'MMMM d, yyyy')}</span>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                  
                  <div className="flex justify-between items-center">
                    {!isAdmin() && (
                      <button
                        onClick={() => isUserRegistered(event) 
                          ? handleUnregisterFromEvent(event.id)
                          : handleRegisterForEvent(event.id)
                        }
                        disabled={isUserRegistered(event)}
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${
                          isUserRegistered(event)
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200`}
                      >
                        {isUserRegistered(event) ? 'Registered' : 'Register'}
                      </button>
                    )}
                    
                    {isAdmin() && (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => setEditingEvent(event)}
                          className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors duration-200"
                        >
                          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="inline-flex items-center text-red-600 hover:text-red-700 transition-colors duration-200"
                        >
                          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  );
}

export default EventDashboard;
