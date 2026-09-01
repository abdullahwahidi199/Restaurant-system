import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  MapPin,
  Map,
  X,
  User,
  Phone,
  Mail,
  Home,
  ShoppingBag,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const GOOD_ACCURACY_METERS = 80;
const MAX_DELIVERY_ACCURACY_METERS = 300;
const LOCATION_WAIT_MS = 18000;

const isValidCoordinate = (lat, lng) =>
  lat !== null &&
  lat !== undefined &&
  lat !== "" &&
  lng !== null &&
  lng !== undefined &&
  lng !== "" &&
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  Math.abs(lat) <= 90 &&
  Math.abs(lng) <= 180;

const getGoogleMapsUrl = (lat, lng) =>
  `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;

export default function CheckoutForm({ user, onSubmit, onClose }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ps" || i18n.language === "fa";

  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [location, setLocation] = useState({
    lat: null,
    lng: null,
    accuracy: null,
  });
  const [mapInput, setMapInput] = useState("");
  const locationWatchRef = useRef({ watchId: null, timeoutId: null });
  const closeButtonRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.username || "",
    phone: user?.phone || "",
    address: user?.address || "",
    email: user?.email || "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const clearLocationWatch = () => {
    const { watchId, timeoutId } = locationWatchRef.current;
    if (watchId !== null) {
      navigator.geolocation?.clearWatch(watchId);
    }
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    locationWatchRef.current = { watchId: null, timeoutId: null };
  };

  useEffect(() => clearLocationWatch, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const validateName = (name) => /^[A-Za-z\s]{2,50}$/.test(name.trim());
  const validatePhone = (phone) => /^[0-9]{7,15}$/.test(phone);
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "name") value = value.replace(/[^A-Za-z\s]/g, "");
    if (name === "phone") value = value.replace(/[^0-9]/g, "");
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "name":
        if (!user && !validateName(value))
          error = t("checkout.errors.nameInvalid");
        break;
      case "phone":
        if (!validatePhone(value)) error = t("checkout.errors.phoneInvalid");
        break;
      case "address":
        if (value.trim().length < 5)
          error = t("checkout.errors.addressInvalid");
        break;
      case "email":
        if (!validateEmail(value)) error = t("checkout.errors.emailInvalid");
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const validate = () => {
    let newErrors = {};
    if (!user && !validateName(formData.name))
      newErrors.name = t("checkout.errors.nameInvalid");
    if (!validatePhone(formData.phone))
      newErrors.phone = t("checkout.errors.phoneInvalid");
    if (formData.address.trim().length < 5)
      newErrors.address = t("checkout.errors.addressInvalid");
    if (!validateEmail(formData.email))
      newErrors.email = t("checkout.errors.emailInvalid");
    setErrors(newErrors);
    setTouched({ name: true, phone: true, address: true, email: true });
    return Object.keys(newErrors).length === 0;
  };

  const applyLocation = ({ lat, lng, accuracy = null }) => {
    const latitude = Number(lat);
    const longitude = Number(lng);

    if (!isValidCoordinate(latitude, longitude)) {
      toast.error("Could not detect location properly.");
      return false;
    }

    const coordinateText = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    const mapUrl = getGoogleMapsUrl(latitude, longitude);

    setLocation({ lat: latitude, lng: longitude, accuracy });
    setMapInput(coordinateText);
    setFormData((prev) => ({
      ...prev,
      address: `Current location: ${coordinateText} - ${mapUrl}`,
    }));
    setTouched((prev) => ({ ...prev, address: true }));
    setErrors((prev) => ({ ...prev, address: "" }));

    const accuracyText =
      accuracy !== null ? ` (accuracy ${Math.round(accuracy)}m)` : "";
    toast.success(`Current location set${accuracyText}`);
    return true;
  };

  const getAccurateCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Your browser does not support location detection.");
      return;
    }

    clearLocationWatch();
    setLocationLoading(true);

    let bestPosition = null;
    let completed = false;

    const finish = (position) => {
      if (completed) return;
      completed = true;
      clearLocationWatch();
      setLocationLoading(false);

      if (!position) {
        toast.error("Could not detect your current location.");
        return;
      }

      const { latitude, longitude, accuracy } = position.coords;
      if (
        accuracy &&
        Number.isFinite(accuracy) &&
        accuracy > MAX_DELIVERY_ACCURACY_METERS
      ) {
        setLocation({ lat: null, lng: null, accuracy: null });
        setMapInput("");
        toast.error(
          `Current location is too approximate (${Math.round(
            accuracy,
          )}m). Please use Map and choose your exact pin.`,
          { duration: 6000 },
        );
        return;
      }

      applyLocation({ lat: latitude, lng: longitude, accuracy });
    };

    const handlePosition = (pos) => {
      const { latitude, longitude, accuracy } = pos.coords;
      if (!isValidCoordinate(latitude, longitude)) return;

      if (!bestPosition || accuracy < bestPosition.coords.accuracy) {
        bestPosition = pos;
      }

      if (accuracy <= GOOD_ACCURACY_METERS) {
        finish(pos);
      }
    };

    const handleError = (err) => {
      if (bestPosition) {
        finish(bestPosition);
        return;
      }

      setLocationLoading(false);
      clearLocationWatch();
      if (err.code === 1) {
        toast.error("Location permission was denied.");
      } else if (err.code === 2) {
        toast.error("Your current location is unavailable.");
      } else if (err.code === 3) {
        toast.error("Location detection timed out.");
      } else {
        toast.error("Could not detect your current location.");
      }
    };

    locationWatchRef.current.watchId = navigator.geolocation.watchPosition(
      handlePosition,
      handleError,
      { enableHighAccuracy: true, timeout: LOCATION_WAIT_MS, maximumAge: 0 },
    );
    locationWatchRef.current.timeoutId = setTimeout(
      () => finish(bestPosition),
      LOCATION_WAIT_MS,
    );

    navigator.geolocation.getCurrentPosition(handlePosition, handleError, {
      enableHighAccuracy: true,
      timeout: LOCATION_WAIT_MS,
      maximumAge: 0,
    });
  };

  const openMapSelector = () => {
    const url =
      isValidCoordinate(location.lat, location.lng)
        ? getGoogleMapsUrl(location.lat, location.lng)
        : "https://www.google.com/maps/search/?api=1&query=Current%20Location";
    window.open(url, "_blank");
    toast("Paste the selected Google Maps link or coordinates below.", {
      icon: "🗺️",
      duration: 4000,
    });
  };

  const parseCoordinates = (input) => {
    try {
      const decodedInput = decodeURIComponent(input);
      const directMatch = decodedInput.match(
        /(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/,
      );

      if (directMatch) {
        const lat = parseFloat(directMatch[1]);
        const lng = parseFloat(directMatch[2]);
        if (isValidCoordinate(lat, lng)) return { lat, lng };
      }

      const regex = /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/;
      const match = decodedInput.match(regex);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        if (isValidCoordinate(lat, lng)) return { lat, lng };
      }

      return null;
    } catch {
      return null;
    }
  };

  const handleMapInputBlur = () => {
    if (!mapInput.trim()) return;
    const coords = parseCoordinates(mapInput);
    if (coords) {
      applyLocation(coords);
    } else {
      toast.error("Invalid location format");
    }
  };

  const handleSubmit = async (event) => {
    event?.preventDefault();
    if (loading) return;
    if (!validate()) return;
    if (!isValidCoordinate(location.lat, location.lng)) {
      toast.error("Please set your delivery location.");
      return;
    }
    try {
      setLoading(true);
      await onSubmit({
        ...formData,
        latitude: location.lat,
        longitude: location.lng,
      });
    } catch {
      toast.error("Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = (name) =>
    `w-full min-h-12 rounded-xl border bg-white px-4 py-3 text-base text-stone-950
     shadow-sm outline-none transition placeholder:text-stone-400 sm:text-sm
     ${
       errors[name] && touched[name]
         ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100"
         : "border-stone-300 hover:border-stone-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
     }`;

  const iconClasses = (name) =>
    `absolute top-1/2 -translate-y-1/2 ${isRTL ? "right-3" : "left-3"} w-4 h-4 ${
      errors[name] && touched[name] ? "text-red-500" : "text-stone-400"
    } transition-colors`;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto p-3 sm:items-center sm:p-6"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-950/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <form
        className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-2xl shadow-stone-950/20 sm:max-h-[calc(100dvh-3rem)]"
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        aria-describedby="checkout-description"
      >
        {/* Header */}
        <div className="shrink-0 border-b border-stone-200 bg-gradient-to-r from-orange-50 via-white to-white px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-orange-200 bg-orange-100 text-orange-700">
                <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h2
                  id="checkout-title"
                  className="text-lg font-black tracking-tight text-stone-950 sm:text-xl"
                >
                  {t("checkout.title")}
                </h2>
                <p
                  id="checkout-description"
                  className="mt-0.5 text-xs leading-5 text-stone-500 sm:text-sm"
                >
                  {t("checkout.description", "Confirm your delivery details.")}
                </p>
              </div>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-500 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
              aria-label={t("common.close", "Close checkout")}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto overscroll-contain px-5 py-5 sm:grid-cols-2 sm:px-6">
          {/* Name Field */}
          {!user && (
            <div className="space-y-1.5">
              <label
                htmlFor="checkout-name"
                className="text-sm font-bold text-stone-700"
              >
                {t("checkout.name")}
              </label>
              <div className="relative">
                <User className={iconClasses("name")} />
                <input
                  id="checkout-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="John Doe"
                  className={`${inputClasses("name")} ${isRTL ? "pr-10" : "pl-10"}`}
                  autoComplete="name"
                  aria-invalid={Boolean(errors.name && touched.name)}
                  aria-describedby={errors.name ? "checkout-name-error" : undefined}
                />
              </div>
              {errors.name && touched.name && (
                <div
                  id="checkout-name-error"
                  className="mt-1 flex items-center gap-1.5 text-xs font-medium text-red-600"
                >
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  <span>{errors.name}</span>
                </div>
              )}
            </div>
          )}

          {/* Phone Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="checkout-phone"
              className="text-sm font-bold text-stone-700"
            >
              {t("checkout.phone")}
            </label>
            <div className="relative">
              <Phone className={iconClasses("phone")} />
              <input
                id="checkout-phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="07XXXXXXXX"
                className={`${inputClasses("phone")} ${isRTL ? "pr-10" : "pl-10"}`}
                autoComplete="tel"
                inputMode="tel"
                aria-invalid={Boolean(errors.phone && touched.phone)}
                aria-describedby={errors.phone ? "checkout-phone-error" : undefined}
              />
            </div>
            {errors.phone && touched.phone && (
              <div
                id="checkout-phone-error"
                className="mt-1 flex items-center gap-1.5 text-xs font-medium text-red-600"
              >
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span>{errors.phone}</span>
              </div>
            )}
          </div>

          {/* Email Field */}
          <div className={`space-y-1.5 ${!user ? "sm:col-span-2" : ""}`}>
            <label
              htmlFor="checkout-email"
              className="text-sm font-bold text-stone-700"
            >
              {t("checkout.email")}
            </label>
            <div className="relative">
              <Mail className={iconClasses("email")} />
              <input
                id="checkout-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="you@example.com"
                className={`${inputClasses("email")} ${isRTL ? "pr-10" : "pl-10"}`}
                autoComplete="email"
                aria-invalid={Boolean(errors.email && touched.email)}
                aria-describedby={errors.email ? "checkout-email-error" : undefined}
              />
            </div>
            {errors.email && touched.email && (
              <div
                id="checkout-email-error"
                className="mt-1 flex items-center gap-1.5 text-xs font-medium text-red-600"
              >
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span>{errors.email}</span>
              </div>
            )}
          </div>

          {/* Address Field */}
          <div className="space-y-1.5 sm:col-span-2">
            <label
              htmlFor="checkout-address"
              className="text-sm font-bold text-stone-700"
            >
              {t("checkout.address")}
            </label>
            <div className="relative">
              <Home className={iconClasses("address")} />
              <input
                id="checkout-address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Street, District, City"
                className={`${inputClasses("address")} ${isRTL ? "pr-10" : "pl-10"}`}
                autoComplete="street-address"
                aria-invalid={Boolean(errors.address && touched.address)}
                aria-describedby={errors.address ? "checkout-address-error" : undefined}
              />
            </div>
            {errors.address && touched.address && (
              <div
                id="checkout-address-error"
                className="mt-1 flex items-center gap-1.5 text-xs font-medium text-red-600"
              >
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span>{errors.address}</span>
              </div>
            )}
          </div>

          {/* Location Section */}
          <div className="space-y-3 rounded-2xl border border-stone-200 bg-stone-50 p-4 sm:col-span-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="checkout-map-location"
                className="text-sm font-bold text-stone-700"
              >
                {t("checkout.location.deliveryLocation", "Delivery Location")}
              </label>
              {location.lat && location.lng && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="w-3 h-3" />
                  {t("location.set")}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={getAccurateCurrentLocation}
                disabled={locationLoading}
                className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2.5 text-sm font-bold text-orange-700 transition hover:border-orange-300 hover:bg-orange-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 disabled:cursor-wait disabled:opacity-50"
              >
                {locationLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MapPin className="w-4 h-4" />
                )}
                <span>
                  <span>
                    {locationLoading
                      ? t("checkout.location.detecting", "Detecting...")
                      : t("checkout.location.current", "Current")}
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={openMapSelector}
                className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm font-bold text-stone-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
              >
                <Map className="w-4 h-4" />
                <span>{t("checkout.location.selectMap", "Map")}</span>
              </button>
            </div>

            <div className="relative">
              <MapPin
                className={`absolute top-1/2 -translate-y-1/2 ${
                  isRTL ? "right-3" : "left-3"
                } w-4 h-4 text-stone-400`}
              />
              <input
                id="checkout-map-location"
                type="text"
                value={mapInput}
                onChange={(e) => setMapInput(e.target.value)}
                onBlur={handleMapInputBlur}
                placeholder={t(
                  "checkout.location.pasteHint",
                  "Paste Google Maps link or lat,lng",
                )}
                className={`min-h-12 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 shadow-sm
                  outline-none transition placeholder:text-stone-400 hover:border-stone-400
                  focus:border-orange-500 focus:ring-4 focus:ring-orange-100 sm:text-sm
                  ${isRTL ? "pr-10" : "pl-10"}`}
              />
            </div>

            {isValidCoordinate(location.lat, location.lng) && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span className="truncate text-xs font-medium text-emerald-800">
                  {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  {location.accuracy
                    ? ` - accuracy ${Math.round(location.accuracy)}m`
                    : ""}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-stone-200 bg-stone-50/90 px-5 py-4 sm:px-6">
          <button
            type="submit"
            disabled={loading}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-600/20 transition hover:-translate-y-0.5 hover:bg-orange-700 hover:shadow-orange-600/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 active:translate-y-0 disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t("order.placeing")}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>{t("checkout.placeOrder")}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
