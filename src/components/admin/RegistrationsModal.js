import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { format } from 'date-fns';
import { useLanguage } from '../../contexts/LanguageContext';

function RegistrationsModal({ isOpen, onClose, event }) {
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [standbyUsers, setStandbyUsers] = useState([]);
  const [loading, setLoading] = useState(true);
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

        setRegisteredUsers(regularUsers);
        setStandbyUsers(standbyUsersData);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
      setLoading(false);
    };

    fetchUserDetails();
  }, [isOpen, event]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-xl shadow-xl w-full max-w-4xl transform transition-all max-h-[90vh] overflow-hidden ${isRtl ? 'rtl' : 'ltr'}`}>
        <div className="p-6 flex justify-between items-center border-b">
          <h2 className="text-2xl font-semibold text-gray-800">
            {t('event_registrations')}: {event.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Regular Registrations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  {t('regular_registration')} ({registeredUsers.length} / {event.capacity})
                </h3>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRtl ? 'text-right' : 'text-left'}`}>
                          {t('name')}
                        </th>
                        <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRtl ? 'text-right' : 'text-left'}`}>
                          {t('email')}
                        </th>
                        <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRtl ? 'text-right' : 'text-left'}`}>
                          {t('phone')}
                        </th>
                        <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRtl ? 'text-right' : 'text-left'}`}>
                          {t('registered_at')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {registeredUsers.map((reg, index) => (
                        <tr key={reg.userId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {reg.userDetails?.fullName || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {reg.userDetails?.email || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {reg.userDetails?.phoneNumber || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {format(new Date(reg.registeredAt), 'MMM d, yyyy HH:mm')}
                          </td>
                        </tr>
                      ))}
                      {registeredUsers.length === 0 && (
                        <tr>
                          <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                            {t('no_registrations')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Standby Registrations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  {t('standby_list')} ({standbyUsers.length} / {event.standbyCapacity})
                </h3>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRtl ? 'text-right' : 'text-left'}`}>
                          {t('name')}
                        </th>
                        <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRtl ? 'text-right' : 'text-left'}`}>
                          {t('email')}
                        </th>
                        <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRtl ? 'text-right' : 'text-left'}`}>
                          {t('phone')}
                        </th>
                        <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRtl ? 'text-right' : 'text-left'}`}>
                          {t('registered_at')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {standbyUsers.map((reg, index) => (
                        <tr key={reg.userId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {reg.userDetails?.fullName || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {reg.userDetails?.email || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {reg.userDetails?.phoneNumber || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {format(new Date(reg.registeredAt), 'MMM d, yyyy HH:mm')}
                          </td>
                        </tr>
                      ))}
                      {standbyUsers.length === 0 && (
                        <tr>
                          <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                            {t('no_standby_registrations')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
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
