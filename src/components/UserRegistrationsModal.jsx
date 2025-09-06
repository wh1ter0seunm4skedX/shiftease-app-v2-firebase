import React, { useEffect, useMemo, useRef, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useLanguage } from '../contexts/LanguageContext';
import { getUserInitials, getAvatarColor, displayName } from '../utils/user';
import Spinner from './common/Spinner';

export default function UserRegistrationsModal({ isOpen, onClose, event }) {
  const { t, language } = useLanguage();
  const isRtl = language === 'he';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const overlayRef = useRef(null);

  const requestClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose?.();
    }, 160);
  };

  useEffect(() => {
    if (!isOpen || !event) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    let alive = true;
    const load = async () => {
      setLoading(true);
      try {
        const ids = (event?.registrations || []).map((r) => r.userId).filter(Boolean);
        const docs = await Promise.all(
          ids.map(async (id) => {
            try {
              const d = await getDoc(doc(db, 'users', id));
              return d.exists() ? { id, ...d.data() } : { id };
            } catch {
              return { id };
            }
          })
        );
        if (alive) setUsers(docs);
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => { alive = false; document.body.style.overflow = prev; };
  }, [isOpen, event]);

  if (!isOpen) return null;

  const count = (event?.registrations || []).length;

  return (
    <div
      ref={overlayRef}
      onMouseDown={(e) => { if (e.target === overlayRef.current) requestClose(); }}
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 transition-opacity duration-200 ease-out ${isClosing ? 'opacity-0' : 'opacity-100'}`}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`relative bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden transform transition-all duration-200 ease-out ${isClosing ? 'opacity-0 scale-95 translate-y-2' : 'opacity-100 scale-100 translate-y-0'}`}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-base font-semibold text-gray-800 truncate">
            {t('event_registrations')}: {event?.title}
          </h3>
          <button
            type="button"
            onClick={requestClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label={t('close')}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-4 py-2 text-xs text-gray-500 border-b" dir="rtl">
          {count} {t('total_registrations')}
        </div>

        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="py-10">
              <Spinner label={t('loading_events') || 'טוען…'} size={56} />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center text-gray-500 py-10">{t('no_registrations')}</div>
          ) : (
            <ul className="grid grid-cols-1 gap-3">
              {users.map((u) => (
                <li key={u.id} className="flex items-center gap-3">
                  <span
                    className="inline-flex h-9 w-9 rounded-full overflow-hidden items-center justify-center text-white ring-2 ring-white shadow-sm flex-shrink-0"
                    style={{ backgroundColor: getAvatarColor(u) }}
                  >
                    <span className="text-xs font-semibold leading-none">{getUserInitials(u)}</span>
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{displayName(u) || '—'}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
