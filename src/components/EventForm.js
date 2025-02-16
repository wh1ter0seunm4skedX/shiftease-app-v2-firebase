import React, { useState, useEffect } from 'react';
import { EVENT_IMAGES } from '../constants';

function EventForm({ open, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    description: '',
    imageUrl: EVENT_IMAGES[0].url,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    if (!initialData) {
      setFormData({
        title: '',
        date: '',
        description: '',
        imageUrl: EVENT_IMAGES[0].url,
      });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md transform transition-all animate-fade-in">
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
