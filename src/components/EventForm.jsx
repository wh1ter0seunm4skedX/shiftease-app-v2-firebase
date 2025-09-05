import React, { useState, useEffect, useRef } from "react";
import { EVENT_IMAGES } from "../constants";
import { useLanguage } from "../contexts/LanguageContext";
import { searchEventImages } from "../services/imageService";

function EventForm({ open, onClose, onSubmit, initialData = null }) {
  const { t, language } = useLanguage();
  const isRtl = language === "he";

  const [showImages, setShowImages] = useState(false);
  const hasPexelsKey = Boolean(import.meta.env.VITE_PEXELS_API_KEY);

  // Search modal state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchPage, setSearchPage] = useState(1);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const perPage = 24;
  const aliveRef = useRef(true);

  const [formData, setFormData] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "",
    endTime: "",
    description: "",
    imageUrl: EVENT_IMAGES[0].url,
    timeError: "",
    capacity: "",
    standbyCapacity: "",
    registrations: [],
    standbyRegistrations: [],
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
        imageUrl: initialData.imageUrl || EVENT_IMAGES[0].url,
        timeError: "",
        capacity: initialData.capacity || "",
        standbyCapacity: initialData.standbyCapacity || "",
        registrations: initialData.registrations || [],
        standbyRegistrations: initialData.standbyRegistrations || [],
      });
    } else {
      setFormData({
        title: "",
        date: new Date().toISOString().split("T")[0],
        startTime: "",
        endTime: "",
        description: "",
        imageUrl: EVENT_IMAGES[0].url,
        timeError: "",
        capacity: "",
        standbyCapacity: "",
        registrations: [],
        standbyRegistrations: [],
      });
    }
  }, [initialData, open]);

  // prevent background scroll when the search modal is open
  useEffect(() => {
    if (!open) return;
    const body = document.body;
    const prev = body.style.overflow;
    if (isSearchOpen) body.style.overflow = "hidden";
    return () => {
      body.style.overflow = prev;
    };
  }, [isSearchOpen, open]);

  const runSearch = async (page = 1, qOverride) => {
    const baseQuery =
      qOverride ?? searchQuery ?? formData.title ?? formData.description ?? "";
    const q = baseQuery.trim();

    if (!q) {
      setSearchResults([]);
      setSearchTotal(0);
      setSearchPage(1);
      setSearchError(t("no_results") || "לא נמצאו תוצאות");
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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.timeError) return;

    const submissionData = {
      ...formData,
      capacity: parseInt(formData.capacity, 10) || 0,
      standbyCapacity: parseInt(formData.standbyCapacity, 10) || 0,
    };
    delete submissionData.timeError;

    if (initialData) {
      submissionData.id = initialData.id;
      submissionData.registrations = initialData.registrations || [];
      submissionData.standbyRegistrations =
        initialData.standbyRegistrations || [];
    }

    onSubmit(submissionData);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        className={`bg-white rounded-xl shadow-xl w-full max-w-md transform transition-all ${
          isRtl ? "rtl" : "ltr"
        } max-h-[90vh] overflow-y-auto`}
        role="dialog"
        aria-modal="true"
      >
        <form onSubmit={handleSubmit} className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold text-gray-800">
              {initialData ? t("edit_event") : t("create_new_event")}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1"
              aria-label={t("close")}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
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
                className="input-field py-2"
                required
                dir={isRtl ? "rtl" : "ltr"}
              />
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
                required
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
                  required
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
                  required
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
                  onClick={() => setShowImages(!showImages)}
                  className="flex-grow px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  {showImages ? t("hide_images") : t("show_images")}
                </button>

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
                  className="flex-grow px-4 py-2 text-sm font-medium text-white bg-slate-800 border border-transparent rounded-md shadow-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-60"
                >
                  {t("search_image") || "חפש תמונה"}
                </button>

                {!showImages && (
                  <div className="ml-2 flex-shrink-0">
                    <div className="relative w-10 h-10 overflow-hidden rounded-lg border-2 border-blue-500">
                      <img
                        src={formData.imageUrl}
                        alt="Selected event"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* SEARCH MODAL */}
                {isSearchOpen && (
                  <div
                    className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50"
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setIsSearchOpen(false);
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        runSearch(1, searchQuery);
                      }
                    }}
                  >
                    <div
                      className="bg-white w-full sm:max-w-4xl sm:rounded-xl shadow-xl max-h-[95vh] overflow-hidden"
                      dir={isRtl ? "rtl" : "ltr"}
                    >
                      <div className="p-4 border-b flex items-center gap-2">
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

                        <button
                          type="button"
                          onClick={() => setIsSearchOpen(false)}
                          className="ml-2 text-gray-600 hover:text-gray-800"
                        >
                          {t("close")}
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

              {showImages && (
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {EVENT_IMAGES.map((image) => (
                    <button
                      key={image.id}
                      type="button"
                      className={`relative aspect-square overflow-hidden rounded-lg border-2 ${
                        formData.imageUrl === image.url
                          ? "border-blue-500"
                          : "border-transparent"
                      }`}
                      onClick={() =>
                        handleChange({
                          target: { name: "imageUrl", value: image.url },
                        })
                      }
                    >
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
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
                className="input-field py-2"
                required
                dir={isRtl ? "rtl" : "ltr"}
              />
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
                  required
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
                  required
                  placeholder={t("number_of_standby_workers")}
                  dir={isRtl ? "rtl" : "ltr"}
                />
              </div>
            </div>
          </div>

          <div
            className={`mt-4 flex ${isRtl ? "justify-start" : "justify-end"} ${
              isRtl ? "space-x-reverse" : ""
            } space-x-4`}
          >
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 min-w-[100px]"
            >
              {t("cancel")}
            </button>
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
