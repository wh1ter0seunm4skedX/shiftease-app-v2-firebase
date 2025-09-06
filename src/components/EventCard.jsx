import React, { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { displayName, getUserInitials, getAvatarColor } from '../utils/user';

function EventCard({ 
  event, 
  isPastEvent = false,
  onEdit, 
  onDelete, 
  onRegister, 
  onUnregister, 
  onViewRegistrations, 
  isUserRegistered = false, 
  isUserStandby = false,
  showRegistrationButton = true,
  showViewRegistrationsButton = true,
  isAdmin
}) {
  const { t, language } = useLanguage();
  const { /* isAdmin */ } = useAuth();
  const isRtl = language === 'he';

  const initialsOf = (u) => getUserInitials(u);

  // Registrations preview (avatars)
  const registrationIds = useMemo(() =>
    (event?.registrations || []).map((r) => r.userId).filter(Boolean),
  [event?.registrations]);

  const [previewUsers, setPreviewUsers] = useState([]); // up to 8
  // User modal moved to EventDashboard

  // No inline names for user cards per requirement

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        if (!registrationIds.length) {
          if (alive) setPreviewUsers([]);
          return;
        }
        const ids = registrationIds.slice(0, 8);
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
        // Debug: preview users fetched for card row
        try {
          const withComputed = docs.map((u) => ({
            id: u.id,
            firstName: u.firstName,
            lastName: u.lastName,
            initials: (typeof u === 'object' && u) ? (require('../utils/user').getUserInitials ? require('../utils/user').getUserInitials(u) : '') : '',
            color: (typeof u === 'object' && u) ? (require('../utils/user').getAvatarColor ? require('../utils/user').getAvatarColor(u) : '') : ''
          }));
          const missingNames = docs.filter((u) => !(u.firstName || u.lastName)).map((u) => u.id);
          // eslint-disable-next-line no-console
          console.log('[EventCard] previewUsers', {
            eventId: event?.id,
            registrationIds,
            users: docs,
            computed: withComputed,
            missingNames,
          });
        } catch (_) {}
        if (alive) setPreviewUsers(docs);
      } catch (e) {
        if (alive) setPreviewUsers([]);
      }
    };
    load();
    return () => { alive = false; };
  }, [registrationIds]);

  // Open handled by parent via onViewRegistrations

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden mb-6 transform transition-all duration-300 hover:shadow-lg hover:scale-105 ${isPastEvent ? 'border-l-4 border-gray-400' : ''}`}>
      <div className="aspect-w-16 aspect-h-9 relative">
        {isPastEvent && (
          <div className="absolute top-0 right-0 bg-gray-600 text-white px-3 py-1 text-xs font-medium z-10">
            {t('past_events')}
          </div>
        )}
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className={`w-full h-40 sm:h-48 object-cover ${isPastEvent ? 'opacity-80' : ''}`}
          />
        ) : (
          <div className={`w-full h-40 sm:h-48 bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center ${isPastEvent ? 'opacity-80' : ''}`}>
            <span className="text-white text-xl font-semibold">{event.title[0]}</span>
          </div>
        )}
      </div>
      
      <div className="px-6 py-4 sm:px-6 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 break-words line-clamp-1">{event.title}</h3>
            <p className="mt-1 text-sm text-gray-500 break-words line-clamp-2">{event.description}</p>
          </div>
          
          {isAdmin && (
            <div className={`flex ${language === 'he' ? 'space-x-reverse space-x-3' : 'space-x-2'}`}>
              {showViewRegistrationsButton && (
                <button 
                  onClick={() => onViewRegistrations(event)}
                  className="p-2 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 transition-colors"
                  aria-label={t('view_registrations')}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </button>
              )}
              
              {!isPastEvent && (
                <>
                  <button 
                    onClick={() => onEdit(event)}
                    className="p-2 bg-yellow-50 text-yellow-600 rounded-md hover:bg-yellow-100 transition-colors"
                    aria-label={t('edit')}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => onDelete(event.id)}
                    className="p-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                    aria-label={t('delete')}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex flex-wrap gap-4 mb-4">
          <div className={`flex items-center text-gray-600 ${language === 'he' ? 'rtl:space-x-reverse' : ''}`}>
            <svg className={`w-5 h-5 ${language === 'he' ? 'ml-2' : 'mr-2'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{format(new Date(event.date), 'dd/MM/yyyy')}</span>
          </div>
          <div className={`flex items-center text-gray-600 ${language === 'he' ? 'rtl:space-x-reverse' : ''}`}>
            <svg className={`w-5 h-5 ${language === 'he' ? 'ml-2' : 'mr-2'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              {language === 'he' 
                ? `${event.endTime} - ${event.startTime}`  
                : `${event.startTime} - ${event.endTime}`  
              }
            </span>
          </div>
          {!isAdmin && (
            <div className="flex items-center min-w-0">
              {(() => {
                const totalSlots = Math.max(1, parseInt(event?.capacity) || 0);
                const total = registrationIds.length;
                const showPlus = total > totalSlots;
                const avatarSlotsCount = showPlus ? Math.max(0, totalSlots - 1) : Math.min(previewUsers.length, totalSlots);
                const remaining = Math.max(0, total - avatarSlotsCount);

                const Slots = (
                  <>
                    {Array.from({ length: totalSlots }).map((_, i) => {
                      if (i < avatarSlotsCount) {
                        const u = previewUsers[i];
                        return (
                          <span
                            key={u?.id || `avatar-${i}`}
                            className={`inline-flex h-6 w-6 sm:h-8 sm:w-8 rounded-full ring-2 ring-white overflow-hidden ${i === 0 ? '' : (isRtl ? '-mr-2' : '-ml-2')}`}
                            style={{ backgroundColor: getAvatarColor(u) }}
                          >
                            <span className="h-full w-full text-white text-[10px] sm:text-[11px] leading-none flex items-center justify-center font-semibold">
                              {initialsOf(u)}
                            </span>
                          </span>
                        );
                      }
                      if (showPlus && i === totalSlots - 1) {
                        return (
                          <span
                            key={`more-${i}`}
                            className={`inline-flex h-6 w-6 sm:h-8 sm:w-8 rounded-full ring-2 ring-white bg-gray-100 text-gray-700 text-[10px] sm:text-[11px] items-center justify-center font-medium ${i === 0 ? '' : (isRtl ? '-mr-2' : '-ml-2')}`}
                          >
                            +{remaining}
                          </span>
                        );
                      }
                      return (
                        <span
                          key={`ph-${i}`}
                          className={`inline-flex h-6 w-6 sm:h-8 sm:w-8 rounded-full ring-2 ring-white bg-gray-200 ${i === 0 ? '' : (isRtl ? '-mr-2' : '-ml-2')}`}
                        />
                      );
                    })}
                  </>
                );

                return total > 0 ? (
                  <button
                    type="button"
                    onClick={() => onViewRegistrations(event)}
                    className="relative flex items-center -space-x-2 rtl:space-x-reverse hover:opacity-90 transition-opacity"
                    title={t('view_registrations')}
                  >
                    {Slots}
                  </button>
                ) : (
                  <div className="relative flex items-center -space-x-2 rtl:space-x-reverse opacity-70">
                    {Slots}
                  </div>
                );
              })()}
              {/* No names inline */}
            </div>
          )}
        </div>

        {/* Capacity Information - Only visible to admin */}
        {isAdmin && (
          <div className="mb-4 space-y-2">
            <div className={`flex justify-between items-center ${language === 'he' ? '' : ''}`}>
              <span className="text-sm text-gray-600">{t('regular_registration')}:</span>
              <span className="text-sm font-medium" dir="ltr">
                {`${event.registrations?.length || 0} / ${event.capacity}`}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2" dir="ltr">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: `${(event.registrations?.length || 0) / event.capacity * 100}%` }}
              ></div>
            </div>

            <div className={`flex justify-between items-center ${language === 'he' ? '' : ''}`}>
              <span className="text-sm text-gray-600">{t('standby_list')}:</span>
              <span className="text-sm font-medium" dir="ltr">
                {`${event.standbyRegistrations?.length || 0} / ${event.standbyCapacity}`}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2" dir="ltr">
              <div
                className="bg-yellow-500 h-2 rounded-full"
                style={{ width: `${(event.standbyRegistrations?.length || 0) / event.standbyCapacity * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      
        {/* Registration Buttons - Only visible to non-admin users and if showRegistrationButton is true */}
        {!isAdmin && showRegistrationButton && !isPastEvent && (
          <div className="mt-4">
            {isUserRegistered ? (
              <button
                onClick={() => onUnregister(event.id)}
                className={`w-full flex justify-center bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${language === 'he' ? 'rtl' : 'ltr'}`}
              >
                {t('unregister')}
              </button>
            ) : isUserStandby ? (
              <button
                onClick={() => onUnregister(event.id)}
                className={`w-full flex justify-center bg-yellow-500 text-gray-900 py-3 px-4 rounded-lg hover:bg-yellow-600 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${language === 'he' ? 'rtl' : 'ltr'}`}
              >
                {t('leave_standby_list')}
              </button>
            ) : (
              <button
                onClick={() => onRegister(event.id)}
                className={`w-full flex justify-center py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isUserRegistered || isUserStandby
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed focus:ring-gray-400'
                    : event.registrations?.length >= event.capacity &&
                      event.standbyRegistrations?.length >= event.standbyCapacity
                      ? 'bg-gray-400 text-gray-700 cursor-not-allowed focus:ring-gray-400'
                      : event.registrations?.length >= event.capacity
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-gray-900 focus:ring-yellow-500'
                      : 'bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500'
                } ${language === 'he' ? 'rtl' : 'ltr'}`}
                disabled={
                  isUserRegistered || isUserStandby ||
                  (event.registrations?.length >= event.capacity &&
                  event.standbyRegistrations?.length >= event.standbyCapacity)
                }
              >
                {isUserRegistered || isUserStandby ? 
                  t('already_registered') :
                  event.registrations?.length >= event.capacity
                    ? event.standbyRegistrations?.length >= event.standbyCapacity
                      ? t('full')
                      : t('register_for_standby')
                    : t('register')}
              </button>
            )}
          </div>
        )}
      </div>

      {/* User registrations modal handled by parent */}
    </div>
  );
}

export default EventCard;
