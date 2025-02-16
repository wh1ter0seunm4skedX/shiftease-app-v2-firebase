import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { generateRandomEvent } from './constants';
import EventDashboard from './components/EventDashboard';
import EventForm from './components/EventForm';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Dashboard from './components/Dashboard';

function App() {
  const [events, setEvents] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('date', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(eventsList);
    });

    return () => unsubscribe();
  }, []);

  const handleAddEvent = async (newEvent) => {
    try {
      await addDoc(collection(db, 'events'), {
        ...newEvent,
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
      const { id, createdAt, ...updateData } = eventData;
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
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error creating test event: ', error);
      alert('Error creating test event. Please try again.');
    }
  };

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50">
                  <nav className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="flex justify-between items-center h-16">
                        <h1 className="text-xl font-semibold text-gray-800">Event Dashboard</h1>
                        <div className="flex space-x-4">
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
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
