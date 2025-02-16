import React, { useState } from 'react';
import EventDashboard from './components/EventDashboard';
import EventForm from './components/EventForm';

function App() {
  const [events, setEvents] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleAddEvent = (newEvent) => {
    setEvents([...events, { ...newEvent, id: Date.now() }]);
    setIsFormOpen(false);
  };

  const handleDeleteEvent = (eventId) => {
    setEvents(events.filter(event => event.id !== eventId));
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
