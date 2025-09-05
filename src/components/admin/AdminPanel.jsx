import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { generateRandomEvent } from '../../constants';

function AdminPanel() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' }); // type: 'success' | 'error'
  const { isAdmin } = useAuth();
  const { t } = useLanguage();

  // Auto-dismiss success after 3s (errors stay until next action)
  useEffect(() => {
    if (message.type === 'success' && message.text) {
      const id = setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      return () => clearTimeout(id);
    }
  }, [message]);

  if (!isAdmin) return null;

  const handleCreateTestEvent = async () => {
    try {
      setLoading(true);
      setMessage({ text: '', type: '' });

      const testEvent = generateRandomEvent();
      const nowIso = new Date().toISOString();

      await addDoc(collection(db, 'events'), {
        ...testEvent,
        createdAt: nowIso,
        updatedAt: nowIso,
        registrations: [],
      });

      setMessage({ text: t('test_event_created_success'), type: 'success' });
    } catch (error) {
      setMessage({
        text: `${t('error_creating_test_event')}: ${error?.message || ''}`.trim(),
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteAllEvents = async () => {
    const ok = window.confirm(t('confirm_delete_all_events'));
    if (!ok) return;

    try {
      setLoading(true);
      setMessage({ text: '', type: '' });

      const querySnapshot = await getDocs(collection(db, 'events'));
      const deletePromises = querySnapshot.docs.map((d) => deleteDoc(d.ref));
      await Promise.all(deletePromises);

      setMessage({ text: t('all_events_deleted_success'), type: 'success' });
    } catch (error) {
      setMessage({
        text: `${t('error_deleting_events')}: ${error?.message || ''}`.trim(),
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Status banner */}
      {message.text ? (
        <div
          role="status"
          aria-live="polite"
          className={`p-3 rounded-md mb-6 w-full max-w-sm flex items-start gap-2
            ${message.type === 'success' ? 'bg-green-50 text-green-800 ring-1 ring-green-200' : 'bg-red-50 text-red-800 ring-1 ring-red-200'}
          `}
        >
          <span
            className={`mt-0.5 inline-block h-2.5 w-2.5 rounded-full
              ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}
            `}
            aria-hidden="true"
          />
          <p className="text-sm">{message.text}</p>
        </div>
      ) : null}

      <div className="space-y-4 w-full max-w-sm mx-auto">
        <button
          onClick={handleCreateTestEvent}
          disabled={loading}
          className="w-full px-4 py-3 text-sm font-medium text-white bg-indigo-600 rounded-md
                     hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                     disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-150 hover:scale-[1.02]"
        >
          {loading ? t('creating_ellipsis') : t('create_test_event')}
        </button>

        <button
          onClick={deleteAllEvents}
          disabled={loading}
          className="w-full px-4 py-3 text-sm font-medium text-white bg-red-600 rounded-md
                     hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
                     disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-150 hover:scale-[1.02]"
        >
          {loading ? t('deleting_ellipsis') : t('delete_all_events')}
        </button>
      </div>
    </div>
  );
}

export default AdminPanel;
