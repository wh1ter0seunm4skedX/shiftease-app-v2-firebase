import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, where, getDocs, startAfter, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import EventCard from '../events/EventCard';
import placeholderImg from '../../assets/welcome.png';
import { doc, getDoc } from 'firebase/firestore';
import { SkeletonGrid } from '../common/Skeleton';
import Footer from '../layout/Footer';

function EventsArchive() {
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageSize] = useState(9);
  const [pageIndex, setPageIndex] = useState(0);
  const [cursors, setCursors] = useState([]); // array of lastVisible docs per page
  const [hasNext, setHasNext] = useState(false);
  const { currentUser: user, isAdmin } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const fetchPage = async (afterDoc = null, page = 0) => {
    setLoading(true);
    try {
      const baseQuery = query(
        collection(db, 'events'),
        where('date', '<', today),
        orderBy('date', 'desc'),
        limit(pageSize)
      );
      const q = afterDoc ? query(baseQuery, startAfter(afterDoc)) : baseQuery;
      const snap = await getDocs(q);
      const eventsData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPastEvents(eventsData);
      // determine next availability
      setHasNext(snap.docs.length === pageSize);
      setPageIndex(page);
      // store cursor for this page (last visible doc)
      const newCursors = [...cursors];
      newCursors[page] = snap.docs[snap.docs.length - 1] || null;
      setCursors(newCursors);
    } catch (e) {
      console.error('Error fetching archive page:', e);
      setPastEvents([]);
      setHasNext(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchPage(null, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const handleBackToDashboard = () => {
    navigate('/');
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${language === 'he' ? 'rtl' : 'ltr'}`} dir={language === 'he' ? 'rtl' : 'ltr'}>
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">{t('events_archive')}</h1>
              </div>
            </div>
            <div className="hidden sm:flex sm:items-center">
              <button
                onClick={handleBackToDashboard}
                className={`btn btn-neutral ${language === 'he' ? 'rtl:space-x-reverse' : ''}`}
              >
                {language === 'he' ? (
                  <>
                    <span className="mx-1">{t('back_to_dashboard')}</span>
                    <svg className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span className="mx-1">{t('back_to_dashboard')}</span>
                  </>
                )}
              </button>
            </div>
            <div className="flex items-center sm:hidden">
              <button
                onClick={handleBackToDashboard}
                className={`flex items-center justify-center p-2 rounded-md text-purple-600 hover:text-purple-900 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 ${language === 'he' ? 'rtl:space-x-reverse' : ''}`}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {loading ? (
            <SkeletonGrid count={6} />
          ) : pastEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] sm:h-[60vh] text-center">
              <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm w-full sm:w-auto">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2">{t('no_past_events')}</h2>
                <p className="text-gray-500">{t('no_past_events_to_display')}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pastEvents.map((event) => {
                const cloned = { ...event, imageUrl: placeholderImg };
                const handleExport = async (ev) => {
                  try {
                    const regs = (ev?.registrations || []).map((r) => ({ ...r, type: 'Regular' }));
                    const standbys = (ev?.standbyRegistrations || []).map((r) => ({ ...r, type: 'Standby' }));
                    const all = [...regs, ...standbys];
                    const users = await Promise.all(
                      all.map(async (r) => {
                        try {
                          const d = await getDoc(doc(db, 'users', r.userId));
                          return d.exists() ? { id: r.userId, ...d.data(), type: r.type, registeredAt: r.registeredAt } : { id: r.userId, type: r.type, registeredAt: r.registeredAt };
                        } catch {
                          return { id: r.userId, type: r.type, registeredAt: r.registeredAt };
                        }
                      })
                    );
                    const header = ['Type', 'First Name', 'Last Name', 'Email', 'User ID', 'Registered At'];
                    const rows = users.map((u) => [
                      u.type || '',
                      u.firstName || '',
                      u.lastName || '',
                      u.email || '',
                      u.id || '',
                      (() => { try { return new Date(u.registeredAt).toISOString(); } catch { return ''; } })(),
                    ]);
                    const csv = [header, ...rows]
                      .map((r) => r.map((v) => `"${(v ?? '').toString().replace(/"/g, '""')}"`).join(','))
                      .join('\n');
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${ev?.title || 'registrations'}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  } catch (e) {
                    console.error('Export CSV error:', e);
                  }
                };
                return (
                  <EventCard
                    key={event.id}
                    event={cloned}
                    isPastEvent={true}
                    isAdmin={isAdmin}
                    showRegistrationButton={false}
                    onViewRegistrations={(ev) => handleExport(ev || cloned)}
                  />
                );
              })}
            </div>
          )}
          {/* Pagination controls */}
          {!loading && pastEvents.length > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => {
                  if (pageIndex <= 0) return;
                  const prevCursor = pageIndex - 2 >= 0 ? cursors[pageIndex - 2] : null;
                  fetchPage(prevCursor || null, Math.max(0, pageIndex - 1));
                }}
                disabled={pageIndex === 0}
                className="px-4 py-2 rounded-md border text-sm disabled:opacity-50"
              >
                {t('prev')}
              </button>
              <div className="text-sm text-gray-600">{t('page') || 'עמוד'} {pageIndex + 1}</div>
              <button
                onClick={() => {
                  if (!hasNext) return;
                  const curCursor = cursors[pageIndex];
                  fetchPage(curCursor || null, pageIndex + 1);
                }}
                disabled={!hasNext}
                className="px-4 py-2 rounded-md border text-sm disabled:opacity-50"
              >
                {t('next')}
              </button>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default EventsArchive;
