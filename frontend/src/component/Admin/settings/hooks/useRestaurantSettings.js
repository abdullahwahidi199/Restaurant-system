import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import instance from "../../../../api/axiosInstance";
import { AuthContext } from "../../../../api/authforRBC";
import {
  copyText,
  downloadFile,
  getMediaUrl,
} from "../../../../api/publicOrdering";

export const INITIAL_FORM_DATA = {
  name: "",
  address: "",
  phone: "",
  email: "",
  website: "",
  facebook: "",
  instagram: "",
  x: "",
  delivery_available: false,
  logo: null,
  cover_image: null,
  slogan: "",
  latitude: "",
  longitude: "",
  delivery_radius_km: "",
  base_delivery_fee: "",
  price_per_km: "",
  min_order_amount: "",
  manager_discount_limit: "",
  admin_discount_limit: "",
};

export const INITIAL_BRANCH_SETTINGS = {
  latitude: "",
  longitude: "",
  receipt_header: "",
  receipt_footer: "",
  receipt_template: "",
  tax_rate: "",
  service_charge_rate: "",
  kitchen_printer: "",
  opening_hours: "",
  delivery_available: "",
  delivery_radius_km: "",
  base_delivery_fee: "",
  price_per_km: "",
  min_order_amount: "",
  cash_drawer_enabled: true,
  cash_drawer_name: "",
};

const nullableBranchFields = new Set([
  "tax_rate",
  "service_charge_rate",
  "latitude",
  "longitude",
  "delivery_available",
  "delivery_radius_km",
  "base_delivery_fee",
  "price_per_km",
  "min_order_amount",
]);

const fallbackPublicUrl = (slug) => {
  if (!slug) return "";
  return `${window.location.origin}/${slug}`;
};

const normalizeRestaurant = (restaurant = {}) => ({
  ...INITIAL_FORM_DATA,
  ...Object.fromEntries(
    Object.entries(restaurant).map(([key, value]) => [
      key,
      value ?? INITIAL_FORM_DATA[key] ?? "",
    ]),
  ),
  logo: null,
  cover_image: null,
});

export default function useRestaurantSettings(t) {
  const { auth, activeBranch } = useContext(AuthContext);
  const branchOnly = auth?.user?.role === "BranchAdmin";
  const isDemo = auth?.user?.isDemo;

  const [restaurant, setRestaurant] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingKey, setSavingKey] = useState("");
  const [showRestriction, setShowRestriction] = useState(false);

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [branchSettings, setBranchSettings] = useState(
    INITIAL_BRANCH_SETTINGS,
  );
  const [branchSettingsLoading, setBranchSettingsLoading] = useState(false);
  const [branchSettingsLoaded, setBranchSettingsLoaded] = useState(false);

  const [previewLogo, setPreviewLogo] = useState(null);
  const [previewCoverImage, setPreviewCoverImage] = useState(null);
  const [qrCode, setQrCode] = useState(null);

  const [branchOverview, setBranchOverview] = useState([]);
  const [branchOverviewLoading, setBranchOverviewLoading] = useState(false);
  const [branchOverviewLoaded, setBranchOverviewLoaded] = useState(false);

  useEffect(() => {
    let ignore = false;

    const fetchRestaurant = async () => {
      setInitialLoading(true);
      setError(null);

      try {
        const res = await instance.get(
          branchOnly ? "/restaurant/me/" : "/restaurant/restaurant/",
        );
        if (ignore) return;
        setRestaurant(res.data);
      } catch (err) {
        if (!ignore) {
          console.error("Failed to fetch restaurant info", err);
          setError(t("settings_center.messages.load_failed"));
        }
      } finally {
        if (!ignore) setInitialLoading(false);
      }
    };

    fetchRestaurant();
    return () => {
      ignore = true;
    };
  }, [branchOnly, t]);

  useEffect(() => {
    if (!restaurant) return;
    setFormData(normalizeRestaurant(restaurant));
    setQrCode(restaurant.qr_code ? getMediaUrl(restaurant.qr_code) : null);
    setPreviewLogo(restaurant.logo ? getMediaUrl(restaurant.logo) : null);
    setPreviewCoverImage(
      restaurant.cover_image ? getMediaUrl(restaurant.cover_image) : null,
    );
  }, [restaurant]);

  useEffect(() => {
    return () => {
      if (previewLogo?.startsWith("blob:")) URL.revokeObjectURL(previewLogo);
      if (previewCoverImage?.startsWith("blob:")) {
        URL.revokeObjectURL(previewCoverImage);
      }
    };
  }, [previewCoverImage, previewLogo]);

  useEffect(() => {
    setBranchSettingsLoaded(false);
    setBranchSettings(INITIAL_BRANCH_SETTINGS);
  }, [activeBranch?.id]);

  const ensureBranchSettings = useCallback(
    async (force = false) => {
      if (!activeBranch?.id || (branchSettingsLoaded && !force)) return;
      setBranchSettingsLoading(true);
      try {
        const res = await instance.get("/restaurant/branches/active/settings/");
        setBranchSettings({
          ...INITIAL_BRANCH_SETTINGS,
          ...Object.fromEntries(
            Object.keys(INITIAL_BRANCH_SETTINGS).map((key) => [
              key,
              res.data?.[key] ?? INITIAL_BRANCH_SETTINGS[key] ?? "",
            ]),
          ),
        });
        setBranchSettingsLoaded(true);
      } catch (err) {
        console.error("Failed to load branch settings", err);
        toast.error(t("settings_center.messages.branch_load_failed"));
      } finally {
        setBranchSettingsLoading(false);
      }
    },
    [activeBranch?.id, branchSettingsLoaded, t],
  );

  const brandUrl = useMemo(
    () =>
      restaurant?.public_url ||
      fallbackPublicUrl(restaurant?.slug || formData.slug),
    [formData.slug, restaurant?.public_url, restaurant?.slug],
  );

  const handleRestaurantChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  const handleBranchSettingsChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    setBranchSettings((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "delivery_available"
            ? value === ""
              ? null
              : value === "true"
            : value,
    }));
  }, []);

  const handleLogoChange = useCallback(
    (file) => {
      if (previewLogo?.startsWith("blob:")) URL.revokeObjectURL(previewLogo);
      setFormData((prev) => ({ ...prev, logo: file }));
      setPreviewLogo(URL.createObjectURL(file));
    },
    [previewLogo],
  );

  const handleCoverImageChange = useCallback(
    (file) => {
      if (previewCoverImage?.startsWith("blob:")) {
        URL.revokeObjectURL(previewCoverImage);
      }
      setFormData((prev) => ({ ...prev, cover_image: file }));
      setPreviewCoverImage(URL.createObjectURL(file));
    },
    [previewCoverImage],
  );

  const guardSave = useCallback(() => {
    if (isDemo) {
      setShowRestriction(true);
      return false;
    }
    return true;
  }, [isDemo]);

  const saveRestaurantSettings = useCallback(
    async (key, fields, successMessage) => {
      if (branchOnly || !guardSave()) return false;
      setSavingKey(key);
      setError(null);

      try {
        const data = new FormData();
        fields.forEach((field) => {
          const value = formData[field];
          if (value !== null && value !== undefined && value !== "") {
            data.append(field, value);
          }
        });

        const res = await instance.patch("/restaurant/restaurant/", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setRestaurant((prev) => ({ ...(prev || {}), ...res.data }));
        if (res.data?.logo) setPreviewLogo(getMediaUrl(res.data.logo));
        if (res.data?.cover_image) {
          setPreviewCoverImage(getMediaUrl(res.data.cover_image));
        }
        if (res.data?.qr_code) setQrCode(getMediaUrl(res.data.qr_code));
        setFormData((prev) => ({ ...prev, logo: null, cover_image: null }));
        toast.success(successMessage);
        return true;
      } catch (err) {
        console.error(err);
        setError(t("settings_center.messages.save_failed"));
        toast.error(t("settings_center.messages.save_failed"));
        return false;
      } finally {
        setSavingKey("");
      }
    },
    [branchOnly, formData, guardSave, t],
  );

  const saveBranchSettings = useCallback(
    async (key, fields, successMessage) => {
      if (!branchSettingsLoaded || !guardSave()) return false;
      setSavingKey(key);
      setError(null);

      try {
        const payload = Object.fromEntries(
          fields.map((field) => {
            const value = branchSettings[field];
            return [
              field,
              value === "" && nullableBranchFields.has(field) ? null : value,
            ];
          }),
        );

        await instance.patch("/restaurant/branches/active/settings/", payload);
        toast.success(successMessage);
        return true;
      } catch (err) {
        console.error(err);
        setError(t("settings_center.messages.branch_save_failed"));
        toast.error(t("settings_center.messages.branch_save_failed"));
        return false;
      } finally {
        setSavingKey("");
      }
    },
    [branchSettings, branchSettingsLoaded, guardSave, t],
  );

  const fetchBranchOverview = useCallback(
    async (force = false) => {
      if (branchOnly || (branchOverviewLoaded && !force)) return;
      setBranchOverviewLoading(true);
      try {
        const res = await instance.get(
          "/restaurant/branches/?include_inactive=true",
        );
        setBranchOverview(
          Array.isArray(res.data) ? res.data : res.data?.branches || [],
        );
        setBranchOverviewLoaded(true);
      } catch (err) {
        console.error("Failed to fetch branch overview", err);
        toast.error(t("settings_center.messages.branch_overview_failed"));
      } finally {
        setBranchOverviewLoading(false);
      }
    },
    [branchOnly, branchOverviewLoaded, t],
  );

  const copyLink = useCallback(
    async (value) => {
      if (!value) return;
      try {
        await copyText(value);
        toast.success(t("settings_center.messages.link_copied"));
      } catch {
        toast.error(t("settings_center.messages.link_copy_failed"));
      }
    },
    [t],
  );

  const downloadQR = useCallback(
    async (url, filename) => {
      if (!url) return;
      try {
        await downloadFile(url, filename);
      } catch {
        toast.error(t("settings_center.messages.qr_download_failed"));
      }
    },
    [t],
  );

  return {
    activeBranch,
    branchOnly,
    branchOverview,
    branchOverviewLoading,
    branchSettings,
    branchSettingsLoading,
    branchSettingsLoaded,
    brandUrl,
    copyLink,
    downloadQR,
    error,
    ensureBranchSettings,
    fetchBranchOverview,
    formData,
    handleBranchSettingsChange,
    handleCoverImageChange,
    handleLogoChange,
    handleRestaurantChange,
    initialLoading,
    previewCoverImage,
    previewLogo,
    qrCode,
    restaurant,
    saveBranchSettings,
    saveRestaurantSettings,
    savingKey,
    setShowRestriction,
    showRestriction,
  };
}
