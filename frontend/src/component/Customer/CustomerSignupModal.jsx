import { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getProfile, loginCustomer, signupCustomer } from "../../api/auth";
import CustomerAuthLayout from "./CustomerAuthLayout";
import { notifyCustomerSessionChanged } from "../../api/customerSession";

const getApiError = (requestError, fallback) => {
  const data = requestError.response?.data;
  if (!data) return requestError.message || fallback;

  if (typeof data === "string") return data;
  if (typeof data.detail === "string") return data.detail;
  if (typeof data.error === "string") return data.error;

  const firstFieldError = Object.values(data).find(
    (value) => typeof value === "string" || Array.isArray(value),
  );
  if (Array.isArray(firstFieldError)) return firstFieldError[0] || fallback;
  return firstFieldError || fallback;
};

const Signup = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    phone: "",
    address: "",
    date_of_birth: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const isRTL = i18n.dir() === "rtl";
  const today = new Date().toISOString().slice(0, 10);

  const handleChange = (event) => {
    const { name } = event.target;
    let { value } = event.target;

    if (name === "phone") value = value.replace(/[^0-9]/g, "");

    setFormData((current) => ({ ...current, [name]: value }));
    if (error) setError("");
  };

  const validate = () => {
    const username = formData.username.trim();
    if (
      username.length < 2 ||
      !/^[\p{L}\p{N}@.+_-]+$/u.test(username)
    ) {
      return t(
        "customerAuth.signup.errors.usernameInvalid",
        "Use letters, numbers, or @ . + - _ in your username.",
      );
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return t("customerAuth.signup.errors.emailInvalid", "Enter a valid email address.");
    }
    if (formData.password.length < 6) {
      return t(
        "customerAuth.signup.errors.passwordShort",
        "Password must be at least 6 characters.",
      );
    }
    if (formData.password !== formData.confirm_password) {
      return t("customerAuth.signup.errors.passwordMatch", "Passwords do not match.");
    }
    if (!/^[0-9]{7,15}$/.test(formData.phone)) {
      return t(
        "customerAuth.signup.errors.phoneInvalid",
        "Phone number must be 7 to 15 digits.",
      );
    }
    if (formData.address.trim().length < 5) {
      return t(
        "customerAuth.signup.errors.addressShort",
        "Address must be at least 5 characters.",
      );
    }
    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const { confirm_password: _confirmPassword, ...signupData } = formData;
      await signupCustomer({
        ...signupData,
        username: formData.username.trim(),
        address: formData.address.trim(),
      });

      const loginResponse = await loginCustomer({
        username: formData.username.trim(),
        password: formData.password,
      });
      localStorage.setItem("access_token", loginResponse.data.access);
      localStorage.setItem("refresh_token", loginResponse.data.refresh);

      const profileResponse = await getProfile();
      localStorage.setItem("customer", JSON.stringify(profileResponse.data));
      notifyCustomerSessionChanged();
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          t(
            "customerAuth.signup.errors.failed",
            "We could not create your account. Please try again.",
          ),
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const passwordToggle = (visible, toggle, labelPrefix) => (
    <button
      className="customer-auth-password-toggle"
      type="button"
      onClick={toggle}
      aria-label={
        visible
          ? t("customerAuth.shared.hidePassword", `Hide ${labelPrefix}`)
          : t("customerAuth.shared.showPassword", `Show ${labelPrefix}`)
      }
      aria-pressed={visible}
      disabled={loading}
    >
      {visible ? (
        <EyeOff aria-hidden="true" size={19} />
      ) : (
        <Eye aria-hidden="true" size={19} />
      )}
    </button>
  );

  return (
    <CustomerAuthLayout
      direction={isRTL ? "rtl" : "ltr"}
      imagePosition="57% center"
      eyebrow={t("customerAuth.signup.eyebrow", "Free customer account")}
      title={t("customerAuth.signup.title", "Create your Pakhlai account")}
      description={t(
        "customerAuth.signup.description",
        "Join once, then keep your favorite restaurants and orders close at hand.",
      )}
      footer={
        <p>
          {t("customerAuth.signup.haveAccount", "Already have an account?")} {" "}
          <Link className="customer-auth-switch-link" to="/login">
            {t("customerAuth.signup.signIn", "Sign in")}
          </Link>
        </p>
      }
    >
      <form className="customer-auth-form" onSubmit={handleSubmit}>
        {error ? (
          <div
            id="customer-signup-error"
            className="customer-auth-alert"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle aria-hidden="true" size={18} />
            <span>{error}</span>
          </div>
        ) : null}

        <div className="customer-auth-field-grid">
          <div className="customer-auth-field">
            <label className="customer-auth-label" htmlFor="customer-signup-username">
              {t("customerAuth.shared.username", "Username")}
            </label>
            <input
              id="customer-signup-username"
              className="customer-auth-input"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder={t(
                "customerAuth.signup.usernamePlaceholder",
                "Choose a username",
              )}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck="false"
              minLength={2}
              maxLength={30}
              disabled={loading}
              required
            />
            <p className="customer-auth-help">
              {t(
                "customerAuth.signup.usernameHelp",
                "Use letters, numbers, or @ . + - _.",
              )}
            </p>
          </div>

          <div className="customer-auth-field">
            <label className="customer-auth-label" htmlFor="customer-signup-email">
              {t("customerAuth.shared.email", "Email address")}
              <span className="customer-auth-optional">
                {t("customerAuth.shared.optional", "Optional")}
              </span>
            </label>
            <input
              id="customer-signup-email"
              className="customer-auth-input"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t(
                "customerAuth.signup.emailPlaceholder",
                "you@example.com",
              )}
              autoComplete="email"
              inputMode="email"
              disabled={loading}
            />
          </div>

          <div className="customer-auth-field">
            <label className="customer-auth-label" htmlFor="customer-signup-password">
              {t("customerAuth.shared.password", "Password")}
            </label>
            <div className="customer-auth-input-wrap">
              <input
                id="customer-signup-password"
                className="customer-auth-input customer-auth-input--password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t(
                  "customerAuth.signup.passwordPlaceholder",
                  "At least 6 characters",
                )}
                autoComplete="new-password"
                minLength={6}
                disabled={loading}
                required
              />
              {passwordToggle(showPassword, () => setShowPassword((visible) => !visible), "password")}
            </div>
          </div>

          <div className="customer-auth-field">
            <label
              className="customer-auth-label"
              htmlFor="customer-signup-confirm-password"
            >
              {t("customerAuth.shared.confirmPassword", "Confirm password")}
            </label>
            <div className="customer-auth-input-wrap">
              <input
                id="customer-signup-confirm-password"
                className="customer-auth-input customer-auth-input--password"
                type={showConfirmPassword ? "text" : "password"}
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder={t(
                  "customerAuth.signup.confirmPlaceholder",
                  "Enter it again",
                )}
                autoComplete="new-password"
                minLength={6}
                disabled={loading}
                required
              />
              {passwordToggle(
                showConfirmPassword,
                () => setShowConfirmPassword((visible) => !visible),
                "password confirmation",
              )}
            </div>
          </div>

          <div className="customer-auth-field">
            <label className="customer-auth-label" htmlFor="customer-signup-phone">
              {t("customerAuth.shared.phone", "Phone number")}
            </label>
            <input
              id="customer-signup-phone"
              className="customer-auth-input"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder={t(
                "customerAuth.signup.phonePlaceholder",
                "7 to 15 digits",
              )}
              autoComplete="tel"
              inputMode="numeric"
              minLength={7}
              maxLength={15}
              disabled={loading}
              required
            />
          </div>

          <div className="customer-auth-field">
            <label className="customer-auth-label" htmlFor="customer-signup-dob">
              {t("customerAuth.shared.dateOfBirth", "Date of birth")}
            </label>
            <input
              id="customer-signup-dob"
              className="customer-auth-input"
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              autoComplete="bday"
              max={today}
              disabled={loading}
              required
            />
          </div>

          <div className="customer-auth-field">
            <label className="customer-auth-label" htmlFor="customer-signup-address">
              {t("customerAuth.shared.address", "Delivery address")}
            </label>
            <input
              id="customer-signup-address"
              className="customer-auth-input"
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder={t(
                "customerAuth.signup.addressPlaceholder",
                "Street, area, or neighborhood",
              )}
              autoComplete="street-address"
              minLength={5}
              disabled={loading}
              required
            />
          </div>
        </div>

        <p className="customer-auth-legal">
          {t("customerAuth.signup.legalPrefix", "By creating an account, you agree to our")} {" "}
          <Link to="/terms">{t("customerAuth.signup.terms", "Terms")}</Link>{" "}
          {t("customerAuth.signup.legalAnd", "and")} {" "}
          <Link to="/privacy">{t("customerAuth.signup.privacy", "Privacy Policy")}</Link>.
        </p>

        <button className="customer-auth-submit" type="submit" disabled={loading}>
          {loading ? (
            <>
              <LoaderCircle className="customer-auth-spinner" aria-hidden="true" size={18} />
              <span>{t("customerAuth.signup.loading", "Creating your account...")}</span>
            </>
          ) : (
            <>
              <span>{t("customerAuth.signup.submit", "Create customer account")}</span>
              <ArrowRight aria-hidden="true" size={18} />
            </>
          )}
        </button>
      </form>
    </CustomerAuthLayout>
  );
};

export default Signup;
