import React, { useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { generateRandomEvent } from '../../constants';

function AdminPanel() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return null;
  }

  // Create test event
  const handleCreateTestEvent = async () => {
    try {
      setLoading(true);
      setMessage({ text: '', type: '' });

      const testEvent = generateRandomEvent();
      await addDoc(collection(db, 'events'), {
        ...testEvent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        registrations: []
      });

      setMessage({ text: 'Test event created successfully!', type: 'success' });
    } catch (error) {
      setMessage({ text: `Error creating test event: ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Delete all events
  const deleteAllEvents = async () => {
    if (!window.confirm('Are you sure you want to delete ALL events? This action cannot be undone!')) {
      return;
    }

    try {
      setLoading(true);
      setMessage({ text: '', type: '' });

      const querySnapshot = await getDocs(collection(db, 'events'));
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      setMessage({ text: 'All events deleted successfully!', type: 'success' });
    } catch (error) {
      setMessage({ text: `Error deleting events: ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {message.text && (
        <div
          className={`p-3 rounded-md mb-6 w-full max-w-sm ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-6 w-full max-w-sm mx-auto">
        <button
          onClick={handleCreateTestEvent}
          disabled={loading}
          className="w-full px-4 py-3 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-transform duration-150 hover:scale-105"
        >
          {loading ? 'Creating...' : 'Create Test Event'}
        </button>

        <button
          onClick={deleteAllEvents}
          disabled={loading}
          className="w-full px-4 py-3 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-transform duration-150 hover:scale-105"
        >
          {loading ? 'Deleting...' : 'Delete All Events'}
        </button>
      </div>
    </div>
  );
}

export default AdminPanel;
