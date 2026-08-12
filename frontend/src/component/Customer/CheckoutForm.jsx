import React, { useEffect, useRef, useState } from "react";
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

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error(t("checkout.location.notSupported"));
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        if (!latitude || !longitude) {
          toast.error("Could not detect location properly");
          setLocationLoading(false);
          return;
        }
        setLocation({ lat: latitude, lng: longitude });
        setLocationLoading(false);
        toast.success(`Location detected (±${Math.round(accuracy)}m)`);
      },
      (err) => {
        setLocationLoading(false);
        if (err.code === 1)
          toast.error(t("checkout.location.permissionDenied"));
        else if (err.code === 2)
          toast.error(t("checkout.location.unavailable"));
        else if (err.code === 3) toast.error(t("checkout.location.timeout"));
        else toast.error(t("checkout.location.failed"));
        g;
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
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

  const handleSubmit = async () => {
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
    `w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-gray-500
     outline-none transition-all duration-200 text-sm
     ${
       errors[name] && touched[name]
         ? "border-red-500/60 focus:border-red-400 focus:ring-2 focus:ring-red-500/20"
         : "border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
     }`;

  const iconClasses = (name) =>
    `absolute top-1/2 -translate-y-1/2 ${isRTL ? "right-3" : "left-3"} w-4 h-4 ${
      errors[name] && touched[name] ? "text-red-400" : "text-gray-500"
    } transition-colors`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl shadow-2xl shadow-black/50 border border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {t("checkout.title")}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t("checkout.description", "Confirm your delivery details.")}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors group"
            >
              <X className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Form Body */}
        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
          {/* Name Field */}
          {!user && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                {t("checkout.name")}
              </label>
              <div className="relative">
                <User className={iconClasses("name")} />
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="John Doe"
                  className={`${inputClasses("name")} ${isRTL ? "pr-10" : "pl-10"}`}
                />
              </div>
              {errors.name && touched.name && (
                <div className="flex items-center gap-1.5 text-red-400 text-xs mt-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  <span>{errors.name}</span>
                </div>
              )}
            </div>
          )}

          {/* Phone Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              {t("checkout.phone")}
            </label>
            <div className="relative">
              <Phone className={iconClasses("phone")} />
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="07XXXXXXXX"
                className={`${inputClasses("phone")} ${isRTL ? "pr-10" : "pl-10"}`}
              />
            </div>
            {errors.phone && touched.phone && (
              <div className="flex items-center gap-1.5 text-red-400 text-xs mt-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span>{errors.phone}</span>
              </div>
            )}
          </div>

          {/* Address Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              {t("checkout.address")}
            </label>
            <div className="relative">
              <Home className={iconClasses("address")} />
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Street, District, City"
                className={`${inputClasses("address")} ${isRTL ? "pr-10" : "pl-10"}`}
              />
            </div>
            {errors.address && touched.address && (
              <div className="flex items-center gap-1.5 text-red-400 text-xs mt-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span>{errors.address}</span>
              </div>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              {t("checkout.email")}
            </label>
            <div className="relative">
              <Mail className={iconClasses("email")} />
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="you@example.com"
                className={`${inputClasses("email")} ${isRTL ? "pr-10" : "pl-10"}`}
              />
            </div>
            {errors.email && touched.email && (
              <div className="flex items-center gap-1.5 text-red-400 text-xs mt-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span>{errors.email}</span>
              </div>
            )}
          </div>

          {/* Location Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                {t("checkout.location.deliveryLocation", "Delivery Location")}
              </label>
              {location.lat && location.lng && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  {t("location.set")}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={getAccurateCurrentLocation}
                disabled={locationLoading}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl
                  bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/25
                  text-indigo-400 text-sm font-medium transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl
                  bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25
                  text-emerald-400 text-sm font-medium transition-all duration-200"
              >
                <Map className="w-4 h-4" />
                <span>{t("checkout.location.selectMap", "Map")}</span>
              </button>
            </div>

            <div className="relative">
              <MapPin
                className={`absolute top-1/2 -translate-y-1/2 ${
                  isRTL ? "right-3" : "left-3"
                } w-4 h-4 text-gray-500`}
              />
              <input
                type="text"
                value={mapInput}
                onChange={(e) => setMapInput(e.target.value)}
                onBlur={handleMapInputBlur}
                placeholder={t(
                  "checkout.location.pasteHint",
                  "Paste Google Maps link or lat,lng",
                )}
                className={`w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white
                  placeholder-gray-500 outline-none transition-all duration-200 text-sm
                  focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
                  ${isRTL ? "pr-10" : "pl-10"}`}
              />
            </div>

            {isValidCoordinate(location.lat, location.lng) && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="text-xs text-gray-400 truncate">
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
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="px-6 py-4">
          <button
            disabled={loading}
            onClick={handleSubmit}
            className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200
              bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400
              text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-indigo-500/25
              flex items-center justify-center gap-2"
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
      </div>
    </div>
  );
}
