import React, { useEffect, useState } from "react";
import { useTranslation as useAutoTranslation } from "react-i18next";

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  address: "",
  is_active: true,
  admin_name: "",
  admin_email: "",
  admin_phone: "",
  admin_password: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const firstMessage = (value) => {
  if (Array.isArray(value)) return value.map(String).join(" ");
  if (value && typeof value === "object") {
    return Object.values(value).map(firstMessage).filter(Boolean).join(" ");
  }
  return value ? String(value) : "";
};

const parseApiErrors = (error) => {
  const responseData = error?.response?.data;
  if (!responseData || typeof responseData !== "object") {
    return {
      fields: {},
      form: "The restaurant could not be saved. Please try again.",
    };
  }

  const fields = {};
  let form = "";

  Object.entries(responseData).forEach(([key, value]) => {
    const message = firstMessage(value);
    if (["non_field_errors", "detail", "error"].includes(key)) {
      form = message;
    } else {
      fields[key] = message;
    }
  });

  return {
    fields,
    form:
      form ||
      (Object.keys(fields).length
        ? "Please correct the highlighted fields."
        : "The restaurant could not be saved."),
  };
};

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-xs font-medium text-red-600" role="alert">
      {message}
    </p>
  );
}

export default function RestaurantModal({ isOpen, onClose, onSave, editData }) {
  const { t: autoT } = useAutoTranslation();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [logo, setLogo] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setFormData(
      editData
        ? {
            ...EMPTY_FORM,
            name: editData.name || "",
            email: editData.email || "",
            phone: editData.phone || "",
            address: editData.address || "",
            is_active: editData.is_active ?? true,
          }
        : EMPTY_FORM,
    );
    setLogo(null);
    setFieldErrors({});
    setFormError("");
    setSubmitting(false);
  }, [editData, isOpen]);

  const clearError = (name) => {
    setFieldErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
    setFormError("");
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
    clearError(name);
  };

  const handleFileChange = (event) => {
    setLogo(event.target.files?.[0] || null);
    clearError("logo");
  };

  const validate = () => {
    const errors = {};
    const requiredFields = {
      name: "Enter the restaurant name.",
      email: "Enter the restaurant email address.",
      phone: "Enter the restaurant phone number.",
      address: "Enter the restaurant address.",
    };

    if (!editData) {
      Object.assign(requiredFields, {
        admin_name: "Enter a username for the restaurant administrator.",
        admin_email: "Enter the administrator email address.",
        admin_phone: "Enter the administrator phone number.",
      });
    }

    Object.entries(requiredFields).forEach(([field, message]) => {
      if (!String(formData[field] || "").trim()) errors[field] = message;
    });

    if (formData.email.trim() && !EMAIL_PATTERN.test(formData.email.trim())) {
      errors.email = "Enter a valid restaurant email address.";
    }
    if (
      !editData &&
      formData.admin_email.trim() &&
      !EMAIL_PATTERN.test(formData.admin_email.trim())
    ) {
      errors.admin_email = "Enter a valid administrator email address.";
    }

    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const errors = validate();
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setFormError("Please correct the highlighted fields.");
      return;
    }

    const data = new FormData();
    data.append("name", formData.name.trim());
    data.append("email", formData.email.trim());
    data.append("phone", formData.phone.trim());
    data.append("address", formData.address.trim());
    data.append("is_active", formData.is_active);

    if (!editData) {
      data.append("admin_name", formData.admin_name.trim());
      data.append("admin_email", formData.admin_email.trim());
      data.append("admin_phone", formData.admin_phone.trim());
      data.append("admin_password", formData.admin_password);
    }

    if (logo) data.append("logo", logo);

    setSubmitting(true);
    setFieldErrors({});
    setFormError("");
    try {
      await onSave(data, editData?.id);
    } catch (error) {
      const parsed = parseApiErrors(error);
      setFieldErrors(parsed.fields);
      setFormError(parsed.form);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const inputClass = (name) =>
    `mt-1.5 h-10 w-full rounded-md border bg-white px-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:ring-2 ${
      fieldErrors[name]
        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
        : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
    }`;
  const errorId = (name) => `restaurant-${name}-error`;
  const describedBy = (name) => (fieldErrors[name] ? errorId(name) : undefined);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 px-4 py-6">
      <div
        className="w-full max-w-2xl rounded-xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="restaurant-modal-title"
      >
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 id="restaurant-modal-title" className="text-lg font-semibold text-gray-900">
            {editData
              ? autoT("legacy.edit_restaurant_808eed25", "Edit restaurant")
              : autoT("legacy.add_new_restaurant_210585c2", "Add restaurant")}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {editData
              ? "Update the restaurant's contact details and availability."
              : "Add the restaurant details and create its first administrator account."}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="max-h-[72vh] space-y-5 overflow-y-auto px-5 py-4">
            {formError && (
              <div
                className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                role="alert"
              >
                {formError}
              </div>
            )}

            <section aria-labelledby="restaurant-details-heading">
              <div className="mb-3">
                <h3 id="restaurant-details-heading" className="text-sm font-semibold text-gray-900">
                  Restaurant details
                </h3>
                <p className="mt-0.5 text-xs text-gray-500">
                  Information shown across the management system.
                </p>
              </div>

              <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="restaurant-name" className="text-sm font-medium text-gray-700">
                    Restaurant name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="restaurant-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={inputClass("name")}
                    aria-invalid={Boolean(fieldErrors.name)}
                    aria-describedby={describedBy("name")}
                    autoComplete="organization"
                  />
                  <FieldError id={errorId("name")} message={fieldErrors.name} />
                </div>

                <div>
                  <label htmlFor="restaurant-email" className="text-sm font-medium text-gray-700">
                    Restaurant email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="restaurant-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClass("email")}
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={describedBy("email")}
                    autoComplete="email"
                  />
                  <FieldError id={errorId("email")} message={fieldErrors.email} />
                </div>

                <div>
                  <label htmlFor="restaurant-phone" className="text-sm font-medium text-gray-700">
                    Restaurant phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="restaurant-phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={inputClass("phone")}
                    aria-invalid={Boolean(fieldErrors.phone)}
                    aria-describedby={describedBy("phone")}
                    autoComplete="tel"
                  />
                  <FieldError id={errorId("phone")} message={fieldErrors.phone} />
                </div>

                <div>
                  <label htmlFor="restaurant-logo" className="text-sm font-medium text-gray-700">
                    Restaurant logo <span className="font-normal text-gray-400">(optional)</span>
                  </label>
                  <input
                    id="restaurant-logo"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mt-1.5 block h-10 w-full rounded-md border border-gray-300 text-sm text-gray-500 file:mr-3 file:h-full file:border-0 file:border-r file:border-gray-200 file:bg-gray-50 file:px-3 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-100"
                    aria-describedby={describedBy("logo")}
                  />
                  <FieldError id={errorId("logo")} message={fieldErrors.logo} />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="restaurant-address" className="text-sm font-medium text-gray-700">
                    Restaurant address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="restaurant-address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={2}
                    className={`${inputClass("address")} h-auto min-h-16 resize-y py-2`}
                    aria-invalid={Boolean(fieldErrors.address)}
                    aria-describedby={describedBy("address")}
                    autoComplete="street-address"
                  />
                  <FieldError id={errorId("address")} message={fieldErrors.address} />
                </div>
              </div>

              <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  <span className="block text-sm font-medium text-gray-800">Restaurant is active</span>
                  <span className="block text-xs text-gray-500">
                    Active restaurants can use their permitted management features.
                  </span>
                </span>
              </label>
            </section>

            {!editData && (
              <section
                className="border-t border-gray-200 pt-4"
                aria-labelledby="restaurant-admin-heading"
              >
                <div className="mb-3">
                  <h3 id="restaurant-admin-heading" className="text-sm font-semibold text-gray-900">
                    Restaurant administrator
                  </h3>
                  <p className="mt-0.5 text-xs text-gray-500">
                    This account will manage the new restaurant.
                  </p>
                </div>

                <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="restaurant-admin-name" className="text-sm font-medium text-gray-700">
                      Administrator username <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="restaurant-admin-name"
                      type="text"
                      name="admin_name"
                      value={formData.admin_name}
                      onChange={handleChange}
                      className={inputClass("admin_name")}
                      aria-invalid={Boolean(fieldErrors.admin_name)}
                      aria-describedby={describedBy("admin_name")}
                      autoComplete="off"
                    />
                    <FieldError id={errorId("admin_name")} message={fieldErrors.admin_name} />
                  </div>

                  <div>
                    <label htmlFor="restaurant-admin-email" className="text-sm font-medium text-gray-700">
                      Administrator email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="restaurant-admin-email"
                      type="email"
                      name="admin_email"
                      value={formData.admin_email}
                      onChange={handleChange}
                      className={inputClass("admin_email")}
                      aria-invalid={Boolean(fieldErrors.admin_email)}
                      aria-describedby={describedBy("admin_email")}
                      autoComplete="off"
                    />
                    <FieldError id={errorId("admin_email")} message={fieldErrors.admin_email} />
                  </div>

                  <div>
                    <label htmlFor="restaurant-admin-phone" className="text-sm font-medium text-gray-700">
                      Administrator phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="restaurant-admin-phone"
                      type="tel"
                      name="admin_phone"
                      value={formData.admin_phone}
                      onChange={handleChange}
                      className={inputClass("admin_phone")}
                      aria-invalid={Boolean(fieldErrors.admin_phone)}
                      aria-describedby={describedBy("admin_phone")}
                      autoComplete="off"
                    />
                    <FieldError id={errorId("admin_phone")} message={fieldErrors.admin_phone} />
                  </div>

                  <div>
                    <label htmlFor="restaurant-admin-password" className="text-sm font-medium text-gray-700">
                      Temporary password <span className="font-normal text-gray-400">(optional)</span>
                    </label>
                    <input
                      id="restaurant-admin-password"
                      type="password"
                      name="admin_password"
                      value={formData.admin_password}
                      onChange={handleChange}
                      className={inputClass("admin_password")}
                      aria-invalid={Boolean(fieldErrors.admin_password)}
                      aria-describedby={
                        fieldErrors.admin_password
                          ? errorId("admin_password")
                          : "restaurant-admin-password-help"
                      }
                      autoComplete="new-password"
                    />
                    <p id="restaurant-admin-password-help" className="mt-1 text-xs text-gray-500">
                      If left blank, the existing default-password behavior is used.
                    </p>
                    <FieldError id={errorId("admin_password")} message={fieldErrors.admin_password} />
                  </div>
                </div>
              </section>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-5 py-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {autoT("staff.cancel", "Cancel")}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="min-w-24 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {submitting
                ? "Saving..."
                : editData
                  ? autoT("inventory_manager.common.update", "Update")
                  : autoT("inventory_manager.common.create", "Create")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
