import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { generateRandomEvent } from '../constants';
import EventDashboard from './EventDashboard';
import EventForm from './EventForm';

function Dashboard() {
  const [events, setEvents] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(
      collection(db, 'events'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(eventsList);
    });

    return () => unsubscribe();
  }, [user.uid]);

  const handleAddEvent = async (newEvent) => {
    try {
      await addDoc(collection(db, 'events'), {
        ...newEvent,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error adding event: ', error);
      alert('Error adding event. Please try again.');
    }
  };

  const handleEditEvent = async (eventData) => {
    try {
      const eventRef = doc(db, 'events', eventData.id);
      const { id, createdAt, userId, ...updateData } = eventData;
      await updateDoc(eventRef, updateData);
      setEditingEvent(null);
    } catch (error) {
      console.error('Error updating event: ', error);
      alert('Error updating event. Please try again.');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await deleteDoc(doc(db, 'events', eventId));
    } catch (error) {
      console.error('Error deleting event: ', error);
      alert('Error deleting event. Please try again.');
    }
  };

  const handleCreateTestEvent = async () => {
    try {
      const randomEvent = generateRandomEvent();
      await addDoc(collection(db, 'events'), {
        ...randomEvent,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error creating test event: ', error);
      alert('Error creating test event. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/signin');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-800">Event Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user.displayName}</span>
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
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-800"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EventDashboard 
          events={events} 
          onDeleteEvent={handleDeleteEvent}
          onEditEvent={(event) => setEditingEvent(event)}
        />
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

export default Dashboard;
