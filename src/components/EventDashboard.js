import React from 'react';
import { format } from 'date-fns';

function EventDashboard({ events, onDeleteEvent }) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="bg-white p-8 rounded-xl shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">No events yet</h2>
          <p className="text-gray-500">Click the "Add Event" button to create your first event!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <div key={event.id} className="card animate-fade-in">
          <div className="aspect-w-16 aspect-h-9 relative">
            {event.imageUrl ? (
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <span className="text-white text-xl font-semibold">{event.title[0]}</span>
              </div>
            )}
            {event.createdAt && (
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                Added {format(new Date(event.createdAt), 'MMM d, yyyy')}
              </div>
            )}
          </div>
          
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{event.title}</h3>
            
            <div className="flex items-center text-gray-600 mb-2">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{format(new Date(event.date), 'MMMM d, yyyy')}</span>
            </div>
            
            <div className="flex items-center text-gray-600 mb-4">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{event.location}</span>
            </div>
            
            <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
            
            <div className="flex justify-end">
              <button
                onClick={() => onDeleteEvent(event.id)}
                className="inline-flex items-center text-red-600 hover:text-red-700 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default EventDashboard;
