import React, { useEffect, useMemo, useRef, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { format } from 'date-fns';
import { useLanguage } from '../../contexts/LanguageContext';

function RegistrationsModal({ isOpen, onClose, event }) {
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [standbyUsers, setStandbyUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const closeBtnRef = useRef(null);
  const overlayRef = useRef(null);
  const { t, language } = useLanguage();
  const isRtl = language === 'he';

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!isOpen || !event) return;

      setLoading(true);
      try {
        // Fetch details for regular registrations
        const regularUsers = await Promise.all(
          (event.registrations || []).map(async (reg) => {
            const userDoc = await getDoc(doc(db, 'users', reg.userId));
            return {
              ...reg,
              userDetails: userDoc.exists() ? userDoc.data() : null
            };
          })
        );

        // Fetch details for standby registrations
        const standbyUsersData = await Promise.all(
          (event.standbyRegistrations || []).map(async (reg) => {
            const userDoc = await getDoc(doc(db, 'users', reg.userId));
            return {
              ...reg,
              userDetails: userDoc.exists() ? userDoc.data() : null
            };
          })
        );

        const sortByDate = (a, b) => {
          try {
            return new Date(a.registeredAt) - new Date(b.registeredAt);
          } catch (_) {
            return 0;
          }
        };
        setRegisteredUsers([...regularUsers].sort(sortByDate));
        setStandbyUsers([...standbyUsersData].sort(sortByDate));
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
      setLoading(false);
    };

    fetchUserDetails();
  }, [isOpen, event]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      // Focus the close button for accessibility
      setTimeout(() => closeBtnRef.current?.focus(), 0);
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isOpen]);

  // Handle Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const capacity = event?.capacity ?? 0;
  const standbyCapacity = event?.standbyCapacity ?? 0;

  const normalize = (s) => (s || '').toString().toLowerCase();
  const filteredRegistered = useMemo(() => {
    if (!query) return registeredUsers;
    const q = normalize(query);
    return registeredUsers.filter((reg) => normalize(reg.userDetails?.fullName).includes(q));
  }, [registeredUsers, query]);

  const filteredStandby = useMemo(() => {
    if (!query) return standbyUsers;
    const q = normalize(query);
    return standbyUsers.filter((reg) => normalize(reg.userDetails?.fullName).includes(q));
  }, [standbyUsers, query]);

  const occupancyPct = capacity ? Math.min(100, Math.round((registeredUsers.length / capacity) * 100)) : 0;
  const standbyPct = standbyCapacity ? Math.min(100, Math.round((standbyUsers.length / standbyCapacity) * 100)) : 0;

  const exportCSV = () => {
    const header = ['Type', 'Name', 'Registered At'];
    const rows = [];
    const formatDate = (ts) => {
      try {
        return format(new Date(ts), 'dd/MM/yyyy HH:mm');
      } catch (_) {
        return '';
      }
    };
    registeredUsers.forEach((reg) => {
      rows.push(['Regular', reg.userDetails?.fullName || 'N/A', formatDate(reg.registeredAt)]);
    });
    standbyUsers.forEach((reg) => {
      rows.push(['Standby', reg.userDetails?.fullName || 'N/A', formatDate(reg.registeredAt)]);
    });
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${(v ?? '').toString().replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event?.title || 'registrations'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) onClose?.();
      }}
      className="fixed inset-0 bg-black/50 backdrop-blur-[1px] flex items-end sm:items-center justify-center p-0 sm:p-4 z-50"
      aria-hidden={false}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="registrations-title"
        dir={isRtl ? 'rtl' : 'ltr'}
        className={`relative bg-white w-full sm:max-w-4xl sm:rounded-xl shadow-xl transform transition-all max-h-[95vh] sm:max-h-[90vh] overflow-hidden ${isRtl ? 'rtl' : 'ltr'}`}
      >
        {/* Top-right X close */}
        <button
          ref={closeBtnRef}
          onClick={onClose}
          className="absolute top-3 left-3 z-20 text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={t('close')}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b">
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 id="registrations-title" className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 truncate">
                {t('event_registrations')}: {event.title}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
                  <span>
                    {isRtl
                      ? `${capacity} / ${registeredUsers.length}`
                      : `${registeredUsers.length} / ${capacity}`}
                  </span>
                  <div className="w-24 sm:w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${occupancyPct}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
                  <span>
                    {isRtl
                      ? `${standbyCapacity} / ${standbyUsers.length}`
                      : `${standbyUsers.length} / ${standbyCapacity}`}
                  </span>
                  <div className="w-24 sm:w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: `${standbyPct}%` }} />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 pl-10">
              <div className="relative flex-1 sm:flex-initial">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('name')}
                  className={`w-full sm:w-56 md:w-64 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isRtl ? 'pl-8' : 'pr-8'}`}
                />
                <span className={`pointer-events-none absolute inset-y-0 ${isRtl ? 'left-3' : 'right-3'} flex items-center text-gray-400`}>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                  </svg>
                </span>
              </div>
              <button
                onClick={exportCSV}
                className="hidden sm:inline-flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 3a2 2 0 012-2h3a1 1 0 010 2H5v12h10V3h-3a1 1 0 110-2h3a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V3z" />
                  <path d="M7 7a1 1 0 011-1h1V3h2v3h1a1 1 0 011 1v1h3v2h-3v1a1 1 0 01-1 1h-1v3H9v-3H8a1 1 0 01-1-1V9H4V7h3V7z" />
                </svg>
                {t('export_registrations')}
              </button>
              {/* X button moved to top-right */}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto max-h-[calc(95vh-8rem)] sm:max-h-[calc(90vh-8rem)]">
          {loading ? (
            <div className="space-y-8">
              {[0, 1].map((section) => (
                <div key={section} className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-md" />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Regular Registrations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {isRtl ? (
                    <>
                      {t('regular_registration')} ({capacity} / {registeredUsers.length})
                    </>
                  ) : (
                    <>
                      {t('regular_registration')} ({registeredUsers.length} / {capacity})
                    </>
                  )}
                </h3>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  {/* Mobile cards */}
                  <div className="divide-y divide-gray-100 sm:hidden">
                    {filteredRegistered.map((reg) => (
                      <div key={reg.userId} className="p-4 flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                          {(reg.userDetails?.fullName || 'N/A').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate">{reg.userDetails?.fullName || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{format(new Date(reg.registeredAt), 'dd/MM/yyyy HH:mm')}</div>
                        </div>
                      </div>
                    ))}
                    {filteredRegistered.length === 0 && (
                      <div className="p-6 text-center text-sm text-gray-500">{t('no_registrations')}</div>
                    )}
                  </div>

                  {/* Desktop table */}
                  <div className="overflow-x-auto hidden sm:block">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRtl ? 'text-right' : 'text-left'}`}>
                            {t('name')}
                          </th>
                          <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRtl ? 'text-right' : 'text-left'}`}>
                            {t('registered_at')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {filteredRegistered.map((reg, index) => (
                          <tr key={reg.userId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {reg.userDetails?.fullName || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {format(new Date(reg.registeredAt), 'dd/MM/yyyy HH:mm')}
                            </td>
                          </tr>
                        ))}
                        {filteredRegistered.length === 0 && (
                          <tr>
                            <td colSpan="2" className="px-6 py-8 text-center text-sm text-gray-500">
                              {t('no_registrations')}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Standby Registrations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {isRtl ? (
                    <>
                      {t('standby_list')} ({standbyCapacity} / {standbyUsers.length})
                    </>
                  ) : (
                    <>
                      {t('standby_list')} ({standbyUsers.length} / {standbyCapacity})
                    </>
                  )}
                </h3>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  {/* Mobile cards */}
                  <div className="divide-y divide-gray-100 sm:hidden">
                    {filteredStandby.map((reg) => (
                      <div key={reg.userId} className="p-4 flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-semibold">
                          {(reg.userDetails?.fullName || 'N/A').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate">{reg.userDetails?.fullName || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{format(new Date(reg.registeredAt), 'dd/MM/yyyy HH:mm')}</div>
                        </div>
                      </div>
                    ))}
                    {filteredStandby.length === 0 && (
                      <div className="p-6 text-center text-sm text-gray-500">{t('no_standby_registrations')}</div>
                    )}
                  </div>

                  {/* Desktop table */}
                  <div className="overflow-x-auto hidden sm:block">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRtl ? 'text-right' : 'text-left'}`}>
                            {t('name')}
                          </th>
                          <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRtl ? 'text-right' : 'text-left'}`}>
                            {t('registered_at')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {filteredStandby.map((reg, index) => (
                          <tr key={reg.userId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {reg.userDetails?.fullName || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {format(new Date(reg.registeredAt), 'dd/MM/yyyy HH:mm')}
                            </td>
                          </tr>
                        ))}
                        {filteredStandby.length === 0 && (
                          <tr>
                            <td colSpan="2" className="px-6 py-8 text-center text-sm text-gray-500">
                              {t('no_standby_registrations')}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              <div className="sticky bottom-0 bg-gradient-to-t from-white to-transparent pt-3">
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={exportCSV}
                    className="inline-flex sm:hidden items-center justify-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex-1"
                  >
                    {t('export_registrations')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RegistrationsModal;
