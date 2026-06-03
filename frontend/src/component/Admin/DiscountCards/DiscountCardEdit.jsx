import React, { useState, useCallback, useEffect } from "react";
import {
  CreditCard,
  User,
  Percent,
  Calendar,
  Hash,
  DollarSign,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import instance from "../../../api/axiosInstance";
import { useNavigate, useParams } from "react-router-dom";

const initialFormState = {
  card_name: "",
  card_number: "",
  customer_name: "",
  customer_phone: "",
  discount_percentage: "",
  minimum_order_amount: "",
  valid_from: "",
  valid_until: "",
  usage_limit: "",
  notes: "",
  status: "active",
};

export default function EditDiscountCard() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [discountCard, setDiscountCard] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState({});

  // Fetch existing card
  useEffect(() => {
    const fetchDiscountCardDetails = async () => {
      setIsFetching(true);
      try {
        const res = await instance.get(`/orders/discount-cards-actions/${id}/`);
        setDiscountCard(res.data);
      } catch (error) {
        console.error("Failed to fetch discount card details", error);
        setErrors((prev) => ({
          ...prev,
          general: "Failed to load discount card details.",
        }));
      } finally {
        setIsFetching(false);
      }
    };

    if (id) fetchDiscountCardDetails();
  }, [id]);

  // Populate form when data arrives
  useEffect(() => {
    if (discountCard) {
      setFormData({
        card_name: discountCard.card_name || "",
        card_number: discountCard.card_number || "",
        customer_name: discountCard.customer_name || "",
        customer_phone: discountCard.customer_phone || "",
        discount_percentage: discountCard.discount_percentage ?? "",
        minimum_order_amount: discountCard.minimum_order_amount ?? 0,
        valid_from: discountCard.valid_from || "",
        valid_until: discountCard.valid_until || "",
        usage_limit: discountCard.usage_limit ?? "",
        notes: discountCard.notes || "",
        status: discountCard.status || "active",
      });
    }
  }, [discountCard]);

  // Generate unique card number
  const generateCardNumber = useCallback(() => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newNumber = `DC-${timestamp}-${random}`;
    setFormData((prev) => ({ ...prev, card_number: newNumber }));
    setErrors((prev) => ({ ...prev, card_number: null }));
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number" ? (value === "" ? "" : parseFloat(value)) : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  const validateField = (name, value) => {
    let error = null;

    switch (name) {
      case "card_name":
        if (!value || value.length < 2)
          error = "Card name must be at least 2 characters";
        break;
      case "card_number":
        if (!value) error = "Card number is required";
        else if (value.length < 5)
          error = "Card number must be at least 5 characters";
        break;
      case "customer_name":
        if (!value) error = "Customer name is required";
        break;
      case "customer_phone":
        if (value && !/^[\d\s\-\+\(\)]+$/.test(value)) {
          error = "Invalid phone number format";
        }
        break;
      case "discount_percentage":
        if (value === "" || value === null)
          error = "Discount percentage is required";
        else if (value < 0 || value > 100) error = "Must be between 0 and 100";
        break;
      case "valid_from":
        if (!value) error = "Start date is required";
        break;
      case "valid_until":
        if (!value) error = "End date is required";
        else if (
          formData.valid_from &&
          new Date(value) <= new Date(formData.valid_from)
        ) {
          error = "End date must be after start date";
        }
        break;
      case "usage_limit":
        if (value && value < 1) error = "Usage limit must be at least 1";
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateForm = () => {
    const fields = [
      "card_name",
      "card_number",
      "customer_name",
      "discount_percentage",
      "valid_from",
      "valid_until",
    ];
    let isValid = true;

    fields.forEach((field) => {
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
    });

    if (formData.valid_from && formData.valid_until) {
      const start = new Date(formData.valid_from);
      const end = new Date(formData.valid_until);
      if (end <= start) {
        setErrors((prev) => ({
          ...prev,
          valid_until: "End date must be after start date",
        }));
        isValid = false;
      }
    }

    setTouched({
      card_name: true,
      card_number: true,
      customer_name: true,
      discount_percentage: true,
      valid_from: true,
      valid_until: true,
      customer_phone: true,
      usage_limit: true,
    });

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);

    if (!validateForm()) {
      setErrors((prev) => ({
        ...prev,
        general: "Please fix the errors above",
      }));
      return;
    }
    const payload = {
      ...formData,
      usage_limit:
        formData.usage_limit === "" || formData.usage_limit === null
          ? null
          : Number(formData.usage_limit),
    };

    setLoading(true);
    try {
      await instance.patch(`/orders/discount-cards-actions/${id}/`, payload);
      setSuccess(true);
      setErrors({});
      navigate(-1);
    } catch (error) {
      console.error("Error updating discount card:", error);
      setErrors((prev) => ({
        ...prev,
        general:
          error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Failed to update discount card",
      }));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (fieldName) => `
    w-full px-4 py-2.5 rounded-lg border bg-white
    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all
    ${
      errors[fieldName] && touched[fieldName]
        ? "border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500"
        : "border-gray-300 hover:border-gray-400"
    }
  `;

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-blue-600" />
            Edit Discount Card
          </h1>
          <p className="mt-2 text-gray-600">
            Update the discount card details. All fields marked with * are
            required.
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3 animate-fade-in">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900">Success!</h3>
              <p className="text-green-800 mt-1">
                Discount card has been updated successfully.
              </p>
            </div>
          </div>
        )}

        {/* General Error */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <p className="text-red-800">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card Information Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Hash className="w-5 h-5 text-gray-500" />
                Card Information
              </h2>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label
                  htmlFor="card_name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Card Name *
                </label>
                <input
                  id="card_name"
                  type="text"
                  name="card_name"
                  value={formData.card_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., Gold Member Discount"
                  className={inputClass("card_name")}
                />
                {errors.card_name && touched.card_name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.card_name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="card_number"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Card Number *
                </label>
                <div className="relative">
                  <input
                    id="card_number"
                    type="text"
                    name="card_number"
                    value={formData.card_number}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="DC-XXXXXXXX"
                    className={`${inputClass("card_number")} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={generateCardNumber}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Generate random card number"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                {errors.card_number && touched.card_number && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.card_number}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Must be unique across all cards
                </p>
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={inputClass("status")}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>
          </div>

          {/* Customer Information Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-gray-500" />
                Customer Information
              </h2>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="customer_name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Customer Name *
                </label>
                <input
                  id="customer_name"
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="John Doe"
                  className={inputClass("customer_name")}
                />
                {errors.customer_name && touched.customer_name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.customer_name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="customer_phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone Number
                </label>
                <input
                  id="customer_phone"
                  type="tel"
                  name="customer_phone"
                  value={formData.customer_phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="0700000000"
                  className={inputClass("customer_phone")}
                />
                {errors.customer_phone && touched.customer_phone && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.customer_phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Discount Details Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Percent className="w-5 h-5 text-gray-500" />
                Discount Details
              </h2>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="discount_percentage"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Discount Percentage *
                </label>
                <div className="relative">
                  <input
                    id="discount_percentage"
                    type="number"
                    name="discount_percentage"
                    value={formData.discount_percentage}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="15.00"
                    className={`${inputClass("discount_percentage")} pl-10`}
                  />
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                {errors.discount_percentage && touched.discount_percentage && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.discount_percentage}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="minimum_order_amount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Minimum Order Amount
                </label>
                <div className="relative">
                  <input
                    id="minimum_order_amount"
                    type="number"
                    name="minimum_order_amount"
                    value={formData.minimum_order_amount}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className={`${inputClass("minimum_order_amount")} pl-10`}
                  />
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Leave empty or 0 for no minimum
                </p>
              </div>
            </div>
          </div>

          {/* Validity & Limits Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                Validity & Usage Limits
              </h2>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="valid_from"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Valid From *
                </label>
                <input
                  id="valid_from"
                  type="date"
                  name="valid_from"
                  value={formData.valid_from}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("valid_from")}
                />
                {errors.valid_from && touched.valid_from && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.valid_from}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="valid_until"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Valid Until *
                </label>
                <input
                  id="valid_until"
                  type="date"
                  name="valid_until"
                  value={formData.valid_until}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("valid_until")}
                />
                {errors.valid_until && touched.valid_until && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.valid_until}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="usage_limit"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Usage Limit
                </label>
                <input
                  id="usage_limit"
                  type="number"
                  name="usage_limit"
                  value={formData.usage_limit}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  min="1"
                  placeholder="Unlimited"
                  className={inputClass("usage_limit")}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Maximum number of times this card can be used. Leave empty for
                  unlimited usage.
                </p>
                {errors.usage_limit && touched.usage_limit && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.usage_limit}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Notes
                </label>
                <div className="relative">
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Additional notes about this discount card..."
                    className={`${inputClass("notes")} resize-none`}
                  />
                  <FileText className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => {
                setFormData(initialFormState);
                setErrors({});
                setTouched({});
                setSuccess(false);
              }}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              disabled={loading}
            >
              Reset Form
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Update Discount Card
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
