import React, { useState, useEffect, useRef } from "react";
import toast from 'react-hot-toast';
// Using API images now; no local EVENT_IMAGES
import { useLanguage } from "../contexts/LanguageContext";
import { searchEventImages } from "../services/imageService";

function EventForm({ open, onClose, onSubmit, initialData = null }) {
  const { t, language } = useLanguage();
  const isRtl = language === "he";

  const [showImages, setShowImages] = useState(false);
  const hasPexelsKey = Boolean(import.meta.env.VITE_PEXELS_API_KEY);

  // Search modal state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchClosing, setIsSearchClosing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchPage, setSearchPage] = useState(1);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const perPage = 24;
  const [isClosing, setIsClosing] = useState(false);
  const getDefaultFormData = () => ({
    title: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "",
    endTime: "",
    description: "",
    imageUrl: '',
    timeError: "",
    capacity: "",
    standbyCapacity: "",
    registrations: [],
    standbyRegistrations: [],
  });
  const requestClose = () => {
    // Clear form and errors when closing via X
    setFormData(getDefaultFormData());
    setErrors({ title: "", description: "", imageUrl: "" });
    setSearchQuery("");
    setSearchResults([]);
    setSearchTotal(0);
    setSearchError("");
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 180);
  };
  const aliveRef = useRef(true);

  const [formData, setFormData] = useState(getDefaultFormData());

  const [errors, setErrors] = useState({
    title: "",
    description: "",
    imageUrl: "",
  });

  // keep a ref to avoid setting state after unmount/close
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  // initialize / populate form
  useEffect(() => {
    if (!open) return; // don't thrash state when closed
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        date: initialData.date || new Date().toISOString().split("T")[0],
        startTime: initialData.startTime || "",
        endTime: initialData.endTime || "",
        description: initialData.description || "",
        imageUrl: initialData.imageUrl || '',
        timeError: "",
        capacity: initialData.capacity || "",
        standbyCapacity: initialData.standbyCapacity || "",
        registrations: initialData.registrations || [],
        standbyRegistrations: initialData.standbyRegistrations || [],
      });
    } else {
      setFormData(getDefaultFormData());
    }
  }, [initialData, open]);

  // prevent background scroll when the search modal is open
  useEffect(() => {
    if (!open) return;
    const body = document.body;
    const prev = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = prev;
    };
  }, [open]);

  // Lock scroll also while search modal is open
  useEffect(() => {
    if (!open) return;
    const body = document.body;
    const prev = body.style.overflow;
    if (isSearchOpen) body.style.overflow = "hidden";
    return () => { body.style.overflow = prev; };
  }, [isSearchOpen, open]);

  const runSearch = async (page = 1, qOverride) => {
    const baseQuery =
      qOverride ?? searchQuery ?? formData.title ?? formData.description ?? "";
    const q = baseQuery.trim();

    if (!q) {
      setSearchResults([]);
      setSearchTotal(0);
      setSearchPage(1);
      // Do not show a red error for empty query
      setSearchError("");
      return;
    }

    setSearchLoading(true);
    setSearchError("");

    try {
      const { items, total, error } = await searchEventImages(q, page, perPage);

      if (error) {
        // Map common cases to helpful messages
        const msg =
          error === "missing_key"
            ? "Pexels API key missing. Set VITE_PEXELS_API_KEY and restart the dev server."
            : error === "http_401"
            ? "Pexels rejected your key (401). Regenerate your API key."
            : error === "http_429"
            ? "Rate limited by Pexels (429). Try again later / reduce queries."
            : error === "timeout"
            ? "Request timed out. Check your network and try again."
            : "Search failed (" + error + "). Check console for details.";

        setSearchResults([]);
        setSearchTotal(0);
        setSearchPage(1);
        setSearchError(msg);
        try { toast.error(msg); } catch(_) {}
        return;
      }

      setSearchResults(items);
      setSearchTotal(total);
      setSearchPage(page);
    } catch (e) {
      setSearchResults([]);
      setSearchTotal(0);
      setSearchPage(1);
      setSearchError("Unexpected error. Check console.");
      try { toast.error('Unexpected error. Check console.'); } catch(_) {}
    } finally {
      setSearchLoading(false);
    }
  };

  // auto-run on open
  useEffect(() => {
    if (isSearchOpen) {
      runSearch(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSearchOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "startTime" || name === "endTime") {
        const { startTime, endTime } = updated;
        if (startTime && endTime && endTime < startTime) {
          updated.timeError = t("end_time_before_start");
        } else {
          updated.timeError = "";
        }
      }

      return updated;
    });

    if (name === 'title') {
      const v = (value || '').trim();
      setErrors((p) => ({ ...p, title: v.length === 0 ? t('name_required') || 'Title is required' : '' }));
    }
    if (name === 'description') {
      const v = (value || '').trim();
      setErrors((p) => ({ ...p, description: v.length === 0 ? t('description_required') || 'Description is required' : '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try { console.log('[EventForm] submit clicked', { initialData, formData }); } catch (_) {}
    if (formData.timeError) {
      try { toast.error(formData.timeError); } catch(_) {}
      return;
    }

    // Basic required validation + length limits
    let title = (formData.title || '').trim();
    let description = (formData.description || '').trim();
    const imageUrl = (formData.imageUrl || '').trim();
    const date = (formData.date || '').trim();
    const startTime = (formData.startTime || '').trim();
    const endTime = (formData.endTime || '').trim();
    const capacity = parseInt(formData.capacity, 10);
    const standbyCapacity = parseInt(formData.standbyCapacity, 10);

    const nextErrors = {
      title: title.length === 0 ? (t('name_required') || 'Title is required') : '',
      description: description.length === 0 ? (t('description_required') || 'Description is required') : '',
      imageUrl: !initialData && imageUrl.length === 0 ? (t('image_required') || 'Image is required') : '',
    };
    setErrors(nextErrors);
    if (nextErrors.title || nextErrors.description || nextErrors.imageUrl) {
      const first = nextErrors.title || nextErrors.description || nextErrors.imageUrl;
      try { toast.error(first); } catch(_) {}
      return;
    }

    if (!date) { try { toast.error(t('date_placeholder') || 'Please choose a date'); } catch(_) {} return; }
    if (!startTime) { try { toast.error(t('start_time_placeholder') || 'Please choose a start time'); } catch(_) {} return; }
    if (!endTime) { try { toast.error(t('end_time_placeholder') || 'Please choose an end time'); } catch(_) {} return; }
    if (Number.isNaN(capacity) || capacity < 1) { try { toast.error(t('worker_capacity') || 'Capacity is required'); } catch(_) {} return; }
    if (Number.isNaN(standbyCapacity) || standbyCapacity < 0) { try { toast.error(t('standby_capacity') || 'Standby capacity is required'); } catch(_) {} return; }

    // Normalize legacy/long values silently to fit limits
    if (title.length > 25) title = title.slice(0, 25);
    if (description.length > 50) description = description.slice(0, 50);

    const submissionData = {
      ...formData,
      title,
      description,
      imageUrl,
      capacity: capacity || 0,
      standbyCapacity: standbyCapacity || 0,
    };
    delete submissionData.timeError;

    if (initialData) {
      submissionData.id = initialData.id;
      submissionData.registrations = initialData.registrations || [];
      submissionData.standbyRegistrations =
        initialData.standbyRegistrations || [];
    }

    try { console.log('[EventForm] submitting payload', submissionData); } catch (_) {}
    onSubmit(submissionData);
    requestClose();
  };

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center p-4 z-50 transition-opacity duration-200 ease-out ${isClosing ? 'opacity-0' : 'opacity-100'} bg-black/50 backdrop-blur-[1px]`}
    >
      <div
        className={`relative bg-white rounded-xl shadow-xl w-full max-w-md transform transition-all duration-200 ease-out ${
          isClosing ? 'opacity-0 scale-95 translate-y-2' : 'opacity-100 scale-100 translate-y-0'
        } ${isRtl ? "rtl" : "ltr"} max-h-[90vh] overflow-y-auto`}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={requestClose}
          className="absolute top-3 left-3 text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          aria-label={t("close")}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <form onSubmit={handleSubmit} className="p-4 pt-5">
          <div className="mb-3">
            <h2 className="text-xl font-semibold text-gray-800">
              {initialData ? t("edit_event") : t("create_new_event")}
            </h2>
          </div>

          <div className="space-y-3">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("event_title")}
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`input-field py-2 ${errors.title ? 'border-red-400 focus:ring-red-500' : ''}`}
                maxLength={25}
                placeholder={t('event_title_placeholder')}
                dir={isRtl ? "rtl" : "ltr"}
              />
              <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                <span className={`text-red-600 ${errors.title ? '' : 'invisible'}`}>{errors.title || '.'}</span>
                <span dir="ltr">{(formData.title || '').length}/25</span>
              </div>
            </div>

            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("date")}
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="input-field py-2"
                placeholder={t('date_placeholder')}
                dir={isRtl ? "rtl" : "ltr"}
              />
            </div>

            <div
              className={`flex ${
                isRtl ? "flex-row-reverse" : "flex-row"
              } gap-4`}
            >
              <div className="w-full">
                <label
                  htmlFor="endTime"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("end_time")}
                </label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="input-field w-full py-2"
                  placeholder={t('end_time_placeholder')}
                  dir={isRtl ? "rtl" : "ltr"}
                />
              </div>
              <div className="w-full">
                <label
                  htmlFor="startTime"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("start_time")}
                </label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="input-field w-full py-2"
                  placeholder={t('start_time_placeholder')}
                  dir={isRtl ? "rtl" : "ltr"}
                />
              </div>
            </div>

            {formData.timeError && (
              <div className="text-red-500 text-sm">{formData.timeError}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("select_image")}
              </label>

              <div className="flex items-center justify-between mb-2 gap-2">

                <button
                  type="button"
                  onClick={() => {
                    const q = (
                      formData.title ||
                      formData.description ||
                      ""
                    ).trim();
                    setSearchQuery(q);
                    if (hasPexelsKey) {
                      setIsSearchOpen(true);
                    } else {
                      setSearchError(
                        "Pexels API key missing. Set VITE_PEXELS_API_KEY and restart the dev server."
                      );
                      return;
                    }
                    // kick off immediately with the string we just computed
                    setTimeout(() => runSearch(1, q), 0);
                  }}
                  disabled={!hasPexelsKey}
                  title={
                    hasPexelsKey
                      ? undefined
                      : "Pexels key missing. Set VITE_PEXELS_API_KEY."
                  }
className="flex-grow px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60"
                >
                  {t("search_image") || "חפש תמונה"}
                </button>

                {!showImages && (
                  <div className="ml-2 flex-shrink-0">
                    <div className="relative w-10 h-10 overflow-hidden rounded-lg border-2 border-blue-500 bg-gray-100 flex items-center justify-center">
                      {formData.imageUrl ? (
                        <img
                          src={formData.imageUrl}
                          alt="Selected event"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7a2 2 0 012-2h2l1-2h6l1 2h2a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 13a4 4 0 108 0 4 4 0 00-8 0z" />
                        </svg>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Inline image error removed; errors shown via toast only */}

                {/* SEARCH MODAL */}
                {isSearchOpen && (
                  <div
                    className={`fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-[1px] transition-opacity duration-200 ease-out ${isSearchClosing ? 'opacity-0' : 'opacity-100'}`}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setIsSearchClosing(true);
                        setTimeout(() => {
                          setIsSearchClosing(false);
                          setIsSearchOpen(false);
                        }, 180);
                      }
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        runSearch(1, searchQuery);
                      }
                    }}
                  >
                    <div
                      className={`relative bg-white w-full sm:max-w-4xl sm:rounded-xl shadow-xl max-h-[95vh] overflow-hidden transform transition-all duration-200 ease-out ${isSearchClosing ? 'opacity-0 scale-95 translate-y-2' : 'opacity-100 scale-100 translate-y-0'}`}
                      dir={isRtl ? "rtl" : "ltr"}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setIsSearchClosing(true);
                          setTimeout(() => {
                            setIsSearchClosing(false);
                            setIsSearchOpen(false);
                          }, 180);
                        }}
                        className="absolute top-3 left-3 text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        aria-label={t("close")}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="p-4 pl-14 border-b flex items-center gap-2">
                        <input
                          autoFocus
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder={
                            t("search_placeholder") || "חיפוש לפי שם האירוע"
                          }
                          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <button
                          type="button"
                          onClick={() => runSearch(1, searchQuery)}
                          disabled={searchLoading || !searchQuery.trim()}
                          className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-60"
                        >
                          {t("search") || "חפש"}
                        </button>
                      </div>

                      <div className="p-4 overflow-y-auto max-h-[70vh]">
                        {searchError && (
                          <div className="mb-3 p-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded">
                            {searchError}
                          </div>
                        )}

                        {searchLoading ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {Array.from({ length: 12 }).map((_, i) => (
                              <div
                                key={i}
                                className="aspect-[16/10] rounded-md bg-gray-100 animate-pulse"
                              />
                            ))}
                          </div>
                        ) : searchResults.length === 0 ? (
                          <div className="text-center text-gray-500 py-12">
                            {t("no_results") || "לא נמצאו תוצאות"}
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {searchResults.map((img) => (
                              <button
                                key={img.id}
                                type="button"
                                title={img.author ? `© ${img.author}` : img.alt}
                                onClick={() => {
                                  setFormData((p) => ({
                                    ...p,
                                    imageUrl: img.url,
                                  }));
                                  setErrors((p) => ({ ...p, imageUrl: '' }));
                                  setIsSearchOpen(false);
                                }}
                                className={`group relative rounded-md overflow-hidden border-2 ${
                                  formData.imageUrl === img.url
                                    ? "border-blue-500"
                                    : "border-transparent"
                                }`}
                              >
                                <img
                                  src={img.thumb || img.url}
                                  alt={img.alt || "photo"}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="p-3 border-t flex items-center justify-between text-sm text-gray-600">
                        <span>
                          {searchTotal
                            ? `${Math.min(
                                searchPage * perPage,
                                searchTotal
                              )} / ${searchTotal}`
                            : ""}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              searchPage > 1 && runSearch(searchPage - 1)
                            }
                            disabled={searchPage <= 1 || searchLoading}
                            className="px-3 py-1.5 rounded-md border disabled:opacity-50"
                          >
                            {t("prev") || "הקודם"}
                          </button>
                          <button
                            type="button"
                            onClick={() => runSearch(searchPage + 1)}
                            disabled={
                              searchLoading ||
                              searchPage * perPage >= searchTotal
                            }
                            className="px-3 py-1.5 rounded-md border disabled:opacity-50"
                          >
                            {t("next") || "הבא"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Local image grid removed (using API search) */}
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("description")}
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="2"
                className={`input-field py-2 ${errors.description ? 'border-red-400 focus:ring-red-500' : ''}`}
                maxLength={50}
                placeholder={t('event_description_placeholder')}
                dir={isRtl ? "rtl" : "ltr"}
              />
              <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                <span className={`text-red-600 ${errors.description ? '' : 'invisible'}`}>{errors.description || '.'}</span>
                <span dir="ltr">{(formData.description || '').length}/50</span>
              </div>
            </div>

            <div
              className={`grid grid-cols-2 gap-4 ${
                isRtl ? "flex-row-reverse" : ""
              }`}
            >
              <div>
                <label
                  htmlFor="capacity"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("worker_capacity")}
                </label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  min="1"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="input-field py-2"
                  placeholder={t("number_of_workers_needed")}
                  dir={isRtl ? "rtl" : "ltr"}
                />
              </div>

              <div>
                <label
                  htmlFor="standbyCapacity"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("standby_capacity")}
                </label>
                <input
                  type="number"
                  id="standbyCapacity"
                  name="standbyCapacity"
                  min="0"
                  value={formData.standbyCapacity}
                  onChange={handleChange}
                  className="input-field py-2"
                  placeholder={t("number_of_standby_workers")}
                  dir={isRtl ? "rtl" : "ltr"}
                />
              </div>
            </div>
          </div>

          <div className={`mt-4 flex ${isRtl ? "justify-start" : "justify-end"}`}>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 min-w-[130px]"
            >
              {initialData ? t("save_changes") : t("create_event")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EventForm;
