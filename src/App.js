import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import EventDashboard from './components/EventDashboard';
import EventForm from './components/EventForm';

function App() {
  const [events, setEvents] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    // Create a query to get events ordered by date
    const q = query(collection(db, 'events'), orderBy('date', 'desc'));
    
    // Set up real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(eventsList);
    });

    // Cleanup subscription on unmount
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

  const handleDeleteEvent = async (eventId) => {
    try {
      await deleteDoc(doc(db, 'events', eventId));
    } catch (error) {
      console.error('Error deleting event: ', error);
      alert('Error deleting event. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-800">Event Dashboard</h1>
            <button
              onClick={() => setIsFormOpen(true)}
              className="btn-primary"
            >
              Add Event
            </button>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EventDashboard events={events} onDeleteEvent={handleDeleteEvent} />
        <EventForm open={isFormOpen} onClose={() => setIsFormOpen(false)} onSubmit={handleAddEvent} />
      </main>
    </div>
  );
}

export default App;
