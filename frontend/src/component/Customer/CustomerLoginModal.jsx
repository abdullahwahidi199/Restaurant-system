import { useState } from "react";
import { AlertCircle, Eye, EyeOff, LoaderCircle, LogIn } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getProfile, loginCustomer } from "../../api/auth";
import CustomerAuthLayout from "./CustomerAuthLayout";
import { notifyCustomerSessionChanged } from "../../api/customerSession";

const formatRetryAfter = (seconds, t) => {
  const value = Number(seconds || 0);
  if (!value || value < 1) {
    return t("customerAuth.login.retryMoment", "a moment");
  }
  if (value === 1) {
    return t("customerAuth.login.retrySecond", "1 second");
  }
  if (value < 60) {
    return t("customerAuth.login.retrySeconds", {
      count: value,
      defaultValue: `${value} seconds`,
    });
  }
  const minutes = Math.ceil(value / 60);
  if (minutes === 1) {
    return t("customerAuth.login.retryMinute", "1 minute");
  }
  return t("customerAuth.login.retryMinutes", {
    count: minutes,
    defaultValue: `${minutes} minutes`,
  });
};

const Login = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isRTL = i18n.dir() === "rtl";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const response = await loginCustomer({
        username: formData.username.trim(),
        password: formData.password,
      });

      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);

      const profileResponse = await getProfile();
      localStorage.setItem("customer", JSON.stringify(profileResponse.data));
      notifyCustomerSessionChanged();
      navigate("/", { replace: true });
    } catch (requestError) {
      if (requestError.response?.status === 429) {
        const retryAfter =
          requestError.response.data?.retry_after ||
          requestError.response.headers?.["retry-after"];
        setError(
          t("customerAuth.login.rateLimit", {
            defaultValue:
              "Too many login attempts. Please try again in {{duration}}.",
            duration: formatRetryAfter(retryAfter, t),
          }),
        );
      } else if (requestError.response?.status === 503) {
        setError(
          requestError.response.data?.error ||
            t(
              "customerAuth.login.unavailable",
              "Login is temporarily unavailable. Please try again shortly.",
            ),
        );
      } else {
        setError(
          t("customerAuth.login.invalid", "Invalid username or password."),
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomerAuthLayout
      direction={isRTL ? "rtl" : "ltr"}
      eyebrow={t("customerAuth.login.eyebrow", "Your Pakhlai account")}
      title={t("customerAuth.login.title", "Welcome back")}
      description={t(
        "customerAuth.login.description",
        "Sign in to see your saved restaurants, order history, and favorite meals.",
      )}
      footer={
        <p>
          {t("customerAuth.login.newCustomer", "New to Pakhlai?")} {" "}
          <Link className="customer-auth-switch-link" to="/signup">
            {t("customerAuth.login.createAccount", "Create a customer account")}
          </Link>
        </p>
      }
    >
      <form className="customer-auth-form" onSubmit={handleSubmit}>
        {error ? (
          <div
            id="customer-login-error"
            className="customer-auth-alert"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle aria-hidden="true" size={18} />
            <span>{error}</span>
          </div>
        ) : null}

        <div className="customer-auth-field">
          <label className="customer-auth-label" htmlFor="customer-login-username">
            {t("customerAuth.shared.username", "Username")}
          </label>
          <input
            id="customer-login-username"
            className="customer-auth-input"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder={t(
              "customerAuth.login.usernamePlaceholder",
              "Enter your username",
            )}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck="false"
            enterKeyHint="next"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "customer-login-error" : undefined}
            disabled={loading}
            required
          />
        </div>

        <div className="customer-auth-field">
          <label className="customer-auth-label" htmlFor="customer-login-password">
            {t("customerAuth.shared.password", "Password")}
          </label>
          <div className="customer-auth-input-wrap">
            <input
              id="customer-login-password"
              className="customer-auth-input customer-auth-input--password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t(
                "customerAuth.login.passwordPlaceholder",
                "Enter your password",
              )}
              autoComplete="current-password"
              enterKeyHint="go"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "customer-login-error" : undefined}
              disabled={loading}
              required
            />
            <button
              className="customer-auth-password-toggle"
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={
                showPassword
                  ? t("customerAuth.shared.hidePassword", "Hide password")
                  : t("customerAuth.shared.showPassword", "Show password")
              }
              aria-pressed={showPassword}
              disabled={loading}
            >
              {showPassword ? (
                <EyeOff aria-hidden="true" size={19} />
              ) : (
                <Eye aria-hidden="true" size={19} />
              )}
            </button>
          </div>
        </div>

        <button className="customer-auth-submit" type="submit" disabled={loading}>
          {loading ? (
            <>
              <LoaderCircle className="customer-auth-spinner" aria-hidden="true" size={18} />
              <span>{t("customerAuth.login.loading", "Signing you in...")}</span>
            </>
          ) : (
            <>
              <span>{t("customerAuth.login.submit", "Sign in to Pakhlai")}</span>
              <LogIn aria-hidden="true" size={18} />
            </>
          )}
        </button>
      </form>
    </CustomerAuthLayout>
  );
};

export default Login;
