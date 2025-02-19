import React, { useState, useEffect } from 'react';
import { EVENT_IMAGES } from '../constants';

function EventForm({ open, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    description: '',
    imageUrl: EVENT_IMAGES[0].url,
    timeError: '',
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
        timeError: ''
      });
    } else {
      setFormData({
        title: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '',
        endTime: '',
        description: '',
        imageUrl: EVENT_IMAGES[0].url,
        timeError: ''
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
          updatedData.timeError = 'End time cannot be before start time';
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

    if (initialData) {
      onSubmit({ ...formData, id: initialData.id });
    } else {
      onSubmit(formData);
    }
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md transform transition-all">
        <form onSubmit={handleSubmit} className="p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            {initialData ? 'Edit Event' : 'Create New Event'}
          </h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Event Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
              </label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
              End Time
              </label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            
            {formData.timeError && (
              <div className="text-red-500 text-sm mt-2">
                {formData.timeError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Image
              </label>
              <div className="grid grid-cols-5 gap-2">
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
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {initialData ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EventForm;
