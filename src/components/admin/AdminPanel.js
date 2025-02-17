import React, { useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { generateRandomEvent } from '../../constants';

function AdminPanel() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isOpen, setIsOpen] = useState(false);
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
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-20 right-4 z-50 bg-purple-600 text-white p-2 rounded-full shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transform transition-transform duration-150 hover:scale-105"
      >
        <svg
          className={`w-6 h-6 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16m-7 6h7"
          />
        </svg>
      </button>

      {/* Admin Panel */}
      <div
        className={`fixed right-4 top-32 z-50 transition-transform duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="bg-white rounded-lg shadow-xl p-4 w-64">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Admin Panel</h2>
            <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>

          {message.text && (
            <div
              className={`p-3 rounded-md mb-4 ${
                message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleCreateTestEvent}
              disabled={loading}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-transform duration-150 hover:scale-105"
            >
              {loading ? 'Creating...' : 'Create Test Event'}
            </button>

            <button
              onClick={deleteAllEvents}
              disabled={loading}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-transform duration-150 hover:scale-105"
            >
              {loading ? 'Deleting...' : 'Delete All Events'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminPanel;
