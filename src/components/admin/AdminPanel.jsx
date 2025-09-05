import React, { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, CommandLineIcon, ShieldExclamationIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { db } from '../../firebase';
import { collection, addDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { generateRandomEvent } from '../../constants';

function AdminPanel({ onClose }) {
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

  // Optional: allow closing on Escape
  useEffect(() => {
    if (!onClose) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

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
    <div className="w-full" dir="rtl">
      <div className="max-w-md mx-auto">
        <div className="relative p-[1px] rounded-xl bg-gradient-to-br from-slate-700 to-slate-900">
          <div className="relative bg-slate-900 text-slate-100 rounded-xl shadow-xl p-5 overflow-hidden">
            {/* Close button inside AdminPanel */}
            {onClose && (
              <button
                type="button"
                aria-label={t('close')}
                onClick={onClose}
                className="absolute top-3 left-3 inline-flex items-center justify-center rounded-md p-2 text-slate-300 hover:text-white hover:bg-slate-700/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
              >
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            )}

            <div
              className="pointer-events-none absolute inset-0 opacity-[0.06]"
              aria-hidden="true"
              style={{ backgroundImage: 'radial-gradient(1px 1px at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '16px 16px' }}
            ></div>
            <div className="absolute -top-3 -left-3 h-12 w-12 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <CommandLineIcon className="h-5 w-5" aria-hidden="true" />
            </div>

            {message.text ? (
              <div
                role="status"
                aria-live="polite"
                className={`p-3 rounded-md mb-5 w-full flex items-start gap-2 ${
                  message.type === 'success'
                    ? 'bg-emerald-900/40 text-emerald-200 ring-1 ring-emerald-700/40'
                    : 'bg-rose-900/40 text-rose-200 ring-1 ring-rose-700/40'
                }`}
              >
                <span
                  className={`mt-0.5 inline-block h-2.5 w-2.5 rounded-full ${
                    message.type === 'success' ? 'bg-emerald-400' : 'bg-rose-400'
                  }`}
                  aria-hidden="true"
                />
                <p className="text-sm">{message.text}</p>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                <ShieldExclamationIcon className="h-4 w-4 text-amber-300" aria-hidden="true" />
                <span>כלי פיתוח — למשתמשים מתקדמים בלבד</span>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleCreateTestEvent}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-slate-900 bg-amber-300 rounded-md hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <PlusIcon className="h-4 w-4" aria-hidden="true" />
                {loading ? t('creating_ellipsis') : t('create_test_event')}
              </button>

              <button
                onClick={deleteAllEvents}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <TrashIcon className="h-4 w-4" aria-hidden="true" />
                {loading ? t('deleting_ellipsis') : t('delete_all_events')}
              </button>
            </div>

            {/* Optional secondary close button at bottom (comment out if not wanted)
            {onClose && (
              <div className="mt-4">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-slate-200 bg-transparent hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                  onClick={onClose}
                >
                  {t('close')}
                </button>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
