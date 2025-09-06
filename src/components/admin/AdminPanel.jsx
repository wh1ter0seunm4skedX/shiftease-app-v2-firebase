import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { PlusIcon, TrashIcon, CommandLineIcon, ShieldExclamationIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { db } from '../../firebase';
import { collection, addDoc, deleteDoc, getDocs, updateDoc, doc, deleteField, onSnapshot, query, where, orderBy, arrayUnion, getDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { generateRandomEvent } from '../../constants';

function AdminPanel({ onClose }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' }); // type: 'success' | 'error'
  const { isAdmin } = useAuth();
  const { t } = useLanguage();

  // Active events for test tools
  const [activeEvents, setActiveEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [regFillCount, setRegFillCount] = useState('');
  const [standbyFillCount, setStandbyFillCount] = useState('');
  const [duplicateEventId, setDuplicateEventId] = useState('');

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

  // Subscribe to upcoming (active) events
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const qy = query(
      collection(db, 'events'),
      where('date', '>=', today),
      orderBy('date', 'asc')
    );
    const unsub = onSnapshot(qy, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setActiveEvents(data);
      setLoadingEvents(false);
    }, () => setLoadingEvents(false));
    return () => unsub();
  }, []);

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
    // Toast-based confirmation (RTL)
    toast((toastInstance) => (
      <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-lg rtl text-right" dir="rtl">
        <p className="font-semibold mb-3">{t('confirm_delete_all_events')}</p>
        <div className="flex gap-2 flex-row-reverse">
          <button
            className="px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-400"
            onClick={async () => {
              toast.dismiss(toastInstance.id);
              const deletingToastId = toast.loading(t('deleting_ellipsis'));
              try {
                const querySnapshot = await getDocs(collection(db, 'events'));
                const deletePromises = querySnapshot.docs.map((d) => deleteDoc(d.ref));
                await Promise.all(deletePromises);
                toast.success(t('all_events_deleted_success'), { id: deletingToastId });
              } catch (error) {
                toast.error(t('error_deleting_events'), { id: deletingToastId });
              }
            }}
          >
            {t('delete')}
          </button>
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
            onClick={() => toast.dismiss(toastInstance.id)}
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    ), { duration: Infinity, position: 'top-center' });
  };

  // Assign random avatarColor to all users missing it
  const assignAvatarColorsToUsers = async () => {
    const palette = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626', '#0ea5e9', '#14b8a6', '#f59e0b'];
    toast((ti) => (
      <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-lg rtl text-right" dir="rtl">
        <p className="font-semibold mb-3">{t('assigning_avatar_colors') || 'מקצה צבעי אבטר למשתמשים...'}</p>
      </div>
    ), { duration: 1500 });
    try {
      setLoading(true);
      const qs = await getDocs(collection(db, 'users'));
      const updates = qs.docs.map(async (d, idx) => {
        const color = palette[idx % palette.length];
        await updateDoc(doc(db, 'users', d.id), { avatarColor: color });
      });
      await Promise.all(updates);
      toast.success(t('avatar_colors_assigned_success') || 'צבעי אבטר הוקצו בהצלחה');
    } catch (e) {
      toast.error(t('error_assigning_avatar_colors') || 'שגיאה בהקצאת צבעי אבטר');
    } finally {
      setLoading(false);
    }
  };

  // Remove profilePicture field from all users
  const removeProfilePicturesFromUsers = async () => {
    try {
      setLoading(true);
      const qs = await getDocs(collection(db, 'users'));
      const updates = qs.docs.map(async (d) => {
        await updateDoc(doc(db, 'users', d.id), { profilePicture: deleteField() });
      });
      await Promise.all(updates);
      toast.success(t('removed_profile_pictures_success') || 'שדה תמונת פרופיל הוסר מכל המשתמשים');
    } catch (e) {
      toast.error(t('error_removing_profile_pictures') || 'שגיאה בהסרת שדה תמונת פרופיל');
    } finally {
      setLoading(false);
    }
  };

  // Migrate users: fullName -> firstName/lastName (Hebrew-safe)
  const migrateUsersFullName = async () => {
    try {
      setLoading(true);
      const qs = await getDocs(collection(db, 'users'));
      const updates = [];
      for (const d of qs.docs) {
        const data = d.data();
        const hasFirst = !!(data.firstName && data.firstName.trim());
        const hasLast = typeof data.lastName === 'string';
        if (hasFirst && hasLast) continue;
        const full = (data.fullName || '').toString();
        const { splitHebrewName } = await import('../../utils/user.js');
        const { firstName, lastName } = splitHebrewName(full);
        const payload = {};
        if (!hasFirst) payload.firstName = firstName || '';
        if (!hasLast) payload.lastName = lastName || '';
        if (Object.keys(payload).length) updates.push(updateDoc(doc(db, 'users', d.id), payload));
      }
      await Promise.all(updates);
      toast.success(t('migrated_fullname_success') || 'שמות הוסבו בהצלחה');
    } catch (e) {
      toast.error(t('migrated_fullname_error') || 'שגיאה בהמרת שמות');
    } finally {
      setLoading(false);
    }
  };

  // Fill selected event with real users (role: 'user')
  const handleFillSelectedEvent = async () => {
    if (!selectedEventId) {
      toast.error(t('please_select_event') || 'אנא בחרו אירוע');
      return;
    }
    const evt = activeEvents.find((e) => e.id === selectedEventId);
    if (!evt) return;

    const cap = parseInt(evt.capacity || 0, 10) || 0;
    const standbyCap = parseInt(evt.standbyCapacity || 0, 10) || 0;
    const wantReg = Math.max(0, Math.min(parseInt(regFillCount || 0, 10) || 0, cap));
    const wantStandby = Math.max(0, Math.min(parseInt(standbyFillCount || 0, 10) || 0, standbyCap));

    const currentReg = (evt.registrations || []).length;
    const currentStandby = (evt.standbyRegistrations || []).length;

    const needReg = Math.max(0, wantReg - currentReg);
    const needStandby = Math.max(0, wantStandby - currentStandby);

    if (needReg === 0 && needStandby === 0) {
      toast.success(t('nothing_to_fill') || 'אין מה למלא – המספרים כבר הושגו');
      return;
    }

    setLoading(true);
    const eventRef = doc(db, 'events', evt.id);
    const nowIso = new Date().toISOString();
    const chunk = (arr, size) => arr.reduce((acc, _, i) => (i % size ? acc : [...acc, arr.slice(i, i + size)]), []);
    const shuffle = (arr) => {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    try {
      // Pull candidate users with role === 'user'
      const usersSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'user')));
      const allUsers = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const existingRegIds = new Set((evt.registrations || []).map((r) => r.userId));
      const existingStandbyIds = new Set((evt.standbyRegistrations || []).map((r) => r.userId));
      const candidates = shuffle(allUsers.filter((u) => !existingRegIds.has(u.id) && !existingStandbyIds.has(u.id)));

      const pickedReg = candidates.slice(0, needReg);
      const pickedStandby = candidates.slice(needReg, needReg + needStandby);

      let addedReg = 0;
      let addedStandby = 0;

      if (pickedReg.length) {
        const regs = pickedReg.map((u) => ({ userId: u.id, registeredAt: nowIso }));
        for (const batch of chunk(regs, 10)) {
          await updateDoc(eventRef, { registrations: arrayUnion(...batch) });
          addedReg += batch.length;
        }
      }

      if (pickedStandby.length) {
        const standbys = pickedStandby.map((u) => ({ userId: u.id, registeredAt: nowIso }));
        for (const batch of chunk(standbys, 10)) {
          await updateDoc(eventRef, { standbyRegistrations: arrayUnion(...batch) });
          addedStandby += batch.length;
        }
      }

      toast.success(`${t('filled_registrations_success') || 'הרשמות מולאו בהצלחה'} (${addedReg} רגילות, ${addedStandby} ממתינים)`);
    } catch (e) {
      toast.error(t('error_filling_registrations') || 'שגיאה במילוי הרשמות');
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

            {/* Developer Panel Sections */}
            <div className="space-y-6">
              {/* Events (CRUD) */}
              <div>
                <h3 className="text-sm font-bold text-slate-300 mb-2">{t('category_events')}</h3>
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
                onClick={assignAvatarColorsToUsers}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-slate-900 bg-amber-200 rounded-md hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                🎨 {t('assign_avatar_colors')}
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
                {/* Duplicate + Delete old */}
                <div className="mt-4 p-4 rounded-md bg-slate-800/40 ring-1 ring-slate-700/40">
                  <div className="text-sm font-semibold text-slate-200 mb-3">{t('duplicate_event_title')}</div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">{t('select_event_to_duplicate')}</label>
                      <select
                        value={duplicateEventId}
                        onChange={(e) => setDuplicateEventId(e.target.value)}
                        className="w-full bg-slate-900/50 text-slate-200 border border-slate-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      >
                        <option value="" disabled>{loadingEvents ? (t('loading_events') ): (t('choose_event'))}</option>
                        {activeEvents.map((ev) => (
                          <option key={ev.id} value={ev.id}>
                            {`${ev.title || '—'} — ${ev.date || ''}`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={async () => {
                        if (!duplicateEventId) {
                          toast.error(t('please_select_event'));
                          return;
                        }
                        try {
                          setLoading(true);
                          const loadingId = toast.loading(t('duplicating_event'));
                          const ref = doc(db, 'events', duplicateEventId);
                          const snap = await getDoc(ref);
                          if (!snap.exists()) {
                            toast.error(t('event_not_found'), { id: loadingId });
                            setLoading(false);
                            return;
                          }
                          const data = snap.data();
                          const { id, ...rest } = { id: duplicateEventId, ...data };
                          // Ensure registrations are preserved; update createdAt timestamp
                          const newData = {
                            ...rest,
                            createdAt: new Date().toISOString(),
                          };
                          const col = collection(db, 'events');
                          const newDocRef = await addDoc(col, newData);
                          await deleteDoc(ref);
                          setDuplicateEventId('');
                          toast.success(t('event_duplicated_successfully'), { id: loadingId });
                        } catch (e) {
                          console.error('Duplicate event error:', e);
                          toast.error(t('error_duplicating_event'), { id: undefined });
                        } finally {
                          setLoading(false);
                        }
                      }}
                      disabled={loading || !duplicateEventId}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-slate-900 bg-indigo-300 rounded-md hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      📄 {t('duplicate_and_delete_old') }
                    </button>
                  </div>
                </div>
              </div>

              {/* Users (Maintenance) */}
              <div>
                <h3 className="text-sm font-bold text-slate-300 mb-2">{t('category_users') || 'משתמשים'}</h3>
                <div className="space-y-3">
                  <button
                    onClick={removeProfilePicturesFromUsers}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-slate-700 rounded-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                🧹 {t('remove_profile_pictures')}
              </button>
                </div>
              </div>
              <div>
                <button
                  onClick={migrateUsersFullName}
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  🧭 {t('migrate_fullname_button') || 'הסב שם מלא לשם פרטי/משפחה'}
                </button>
              </div>

              {/* Testing / Data seeding */}
              <div>
                <h3 className="text-sm font-bold text-slate-300 mb-2">{t('category_testing') || 'בדיקות / נתוני דמה'}</h3>
                <div className="p-4 rounded-md bg-slate-800/40 ring-1 ring-slate-700/40">
                  <div className="text-sm font-semibold text-slate-200 mb-3">{t('fill_event_registrations') || 'מילוי הרשמות לאירוע (בדיקות)'}</div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">{t('select_event_to_fill') || 'בחרו אירוע למילוי'}</label>
                    <select
                      value={selectedEventId}
                      onChange={(e) => setSelectedEventId(e.target.value)}
                      className="w-full bg-slate-900/50 text-slate-200 border border-slate-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      <option value="" disabled>{loadingEvents ? (t('loading_events') || 'טוען אירועים...') : (t('choose_event') || 'בחרו אירוע')}</option>
                      {activeEvents.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {`${ev.title || '—'} — ${ev.date || ''} (${(ev.registrations?.length || 0)}/${ev.capacity || 0} • ${(ev.standbyRegistrations?.length || 0)}/${ev.standbyCapacity || 0})`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">{t('regular_fill_count') || 'מספר הרשמות רגילות למלא'}</label>
                      <input
                        type="number"
                        min="0"
                        value={regFillCount}
                        onChange={(e) => setRegFillCount(e.target.value)}
                        placeholder={t('regular_fill_count_placeholder') || 'מ-0 עד הקיבולת'}
                        className="w-full bg-slate-900/50 text-slate-200 border border-slate-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">{t('standby_fill_count') || 'מספר ממתינים למלא'}</label>
                      <input
                        type="number"
                        min="0"
                        value={standbyFillCount}
                        onChange={(e) => setStandbyFillCount(e.target.value)}
                        placeholder={t('standby_fill_count_placeholder') || 'מ-0 עד קיבולת המתנה'}
                        className="w-full bg-slate-900/50 text-slate-200 border border-slate-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleFillSelectedEvent}
                    disabled={loading || !selectedEventId}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-slate-900 bg-amber-300 rounded-md hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ⚙️ {loading ? (t('filling_registrations_ellipsis') || 'ממלא הרשמות…') : (t('fill_registrations') || 'מלא הרשמות')}
                  </button>
                </div>
                </div>
              </div>
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
