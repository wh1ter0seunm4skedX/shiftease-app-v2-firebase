import React, { useState, useEffect } from 'react';
import { EVENT_IMAGES } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

function EventForm({ open, onClose, onSubmit, initialData = null }) {
  const { t, language } = useLanguage();
  const isRtl = language === 'he';
  const [showImages, setShowImages] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    description: '',
    imageUrl: EVENT_IMAGES[0].url,
    timeError: '',
    capacity: '',
    standbyCapacity: '',
    registrations: [],
    standbyRegistrations: []
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        date: initialData.date || new Date().toISOString().split('T')[0],
        startTime: initialData.startTime || '',
        endTime: initialData.endTime || '',
        description: initialData.description || '',
        imageUrl: initialData.imageUrl || EVENT_IMAGES[0].url,
        timeError: '',
        capacity: initialData.capacity || '',
        standbyCapacity: initialData.standbyCapacity || '',
        registrations: initialData.registrations || [],
        standbyRegistrations: initialData.standbyRegistrations || []
      });
    } else {
      setFormData({
        title: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '',
        endTime: '',
        description: '',
        imageUrl: EVENT_IMAGES[0].url,
        timeError: '',
        capacity: '',
        standbyCapacity: '',
        registrations: [],
        standbyRegistrations: []
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update formData
    setFormData(prev => {
      const updatedData = { ...prev, [name]: value };

      // Validate time if start or end time is changed
      if (name === 'startTime' || name === 'endTime') {
        const { startTime, endTime } = updatedData;
        if (startTime && endTime && endTime < startTime) {
          updatedData.timeError = t('end_time_before_start');
        } else {
          updatedData.timeError = '';
        }
      }

      return updatedData;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ensure no time error before submission
    if (formData.timeError) {
      return;
    }

    // Create the submission data
    const submissionData = {
      ...formData,
      capacity: parseInt(formData.capacity) || 0,
      standbyCapacity: parseInt(formData.standbyCapacity) || 0
    };
    delete submissionData.timeError;

    if (initialData) {
      // For editing, include the id and existing registrations
      submissionData.id = initialData.id;
      submissionData.registrations = initialData.registrations || [];
      submissionData.standbyRegistrations = initialData.standbyRegistrations || [];
    }

    onSubmit(submissionData);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-xl shadow-xl w-full max-w-md transform transition-all ${isRtl ? 'rtl' : 'ltr'} max-h-[90vh] overflow-y-auto`}>
        <form onSubmit={handleSubmit} className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold text-gray-800">
              {initialData ? t('edit_event') : t('create_new_event')}
            </h2>
            <button 
              type="button" 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1"
              aria-label={t('close')}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-3">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                {t('event_title')}
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input-field py-2"
                required
                dir={isRtl ? 'rtl' : 'ltr'}
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                {t('date')}
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="input-field py-2"
                required
                dir={isRtl ? 'rtl' : 'ltr'}
              />
            </div>

            <div className={`flex ${isRtl ? 'flex-row-reverse' : 'flex-row-reverse'} gap-4`}>
              <div className='w-full'>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                {t('end_time')}
                </label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="input-field w-full py-2"
                  required
                  dir={isRtl ? 'rtl' : 'ltr'}
                />
              </div>
              <div className='w-full'>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                {t('start_time')}
                </label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="input-field w-full py-2"
                  required
                  dir={isRtl ? 'rtl' : 'ltr'}
                />
              </div>
            </div>
            {formData.timeError && (
              <div className="text-red-500 text-sm">
                {formData.timeError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('select_image')}
              </label>
              
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={() => setShowImages(!showImages)}
                  className="flex-grow px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  {showImages ? t('hide_images') : t('show_images')}
                </button>
                
                {/* Display the currently selected image next to the button */}
                {!showImages && (
                  <div className="ml-2 flex-shrink-0">
                    <div className="relative w-10 h-10 overflow-hidden rounded-lg border-2 border-blue-500">
                      <img
                        src={formData.imageUrl}
                        alt="Selected event image"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {showImages && (
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {EVENT_IMAGES.map((image) => (
                    <button
                      key={image.id}
                      type="button"
                      className={`relative aspect-square overflow-hidden rounded-lg border-2 ${
                        formData.imageUrl === image.url
                          ? 'border-blue-500'
                          : 'border-transparent'
                      }`}
                      onClick={() => handleChange({ target: { name: 'imageUrl', value: image.url } })}
                    >
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                {t('description')}
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="2"
                className="input-field py-2"
                required
                dir={isRtl ? 'rtl' : 'ltr'}
              />
            </div>

            <div className={`grid grid-cols-2 gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('worker_capacity')}
                </label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  min="1"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="input-field py-2"
                  required
                  placeholder={t('number_of_workers_needed')}
                  dir={isRtl ? 'rtl' : 'ltr'}
                />
              </div>

              <div>
                <label htmlFor="standbyCapacity" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('standby_capacity')}
                </label>
                <input
                  type="number"
                  id="standbyCapacity"
                  name="standbyCapacity"
                  min="0"
                  value={formData.standbyCapacity}
                  onChange={handleChange}
                  className="input-field py-2"
                  required
                  placeholder={t('number_of_standby_workers')}
                  dir={isRtl ? 'rtl' : 'ltr'}
                />
              </div>
            </div>
          </div>

          <div className={`mt-4 flex ${isRtl ? 'justify-start' : 'justify-end'} ${isRtl ? 'space-x-reverse' : ''} space-x-4`}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 min-w-[100px]"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 min-w-[130px]"
            >
              {initialData ? t('save_changes') : t('create_event')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EventForm;
