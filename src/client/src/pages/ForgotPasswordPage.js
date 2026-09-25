import React, { useState } from "react";
import { ArrowLeft, CheckCircle2, Mail, Send } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import { auth } from "../components/firebase";
import zenlensLogo from "../image/app.png";

import "./ForgotPasswordPage.css";

const getResetErrorMessage = (error) => {
  const code = error?.code || "";

  if (code === "auth/invalid-email") {
    return "Enter a valid email address and try again.";
  }

  if (code === "auth/missing-email") {
    return "Enter the email address connected to your ZenLens account.";
  }

  if (code === "auth/too-many-requests") {
    return "Too many reset requests were made. Please wait a moment and try again.";
  }

  if (code === "auth/network-request-failed") {
    return "ZenLens could not reach Firebase. Check your internet connection and try again.";
  }

  return "We could not send the reset email right now. Please try again.";
};

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setErrorMessage(
        "Enter the email address connected to your ZenLens account."
      );
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      await sendPasswordResetEmail(auth, normalizedEmail);
      setSent(true);
    } catch (error) {
      console.error("Unable to send password reset email:", error);
      setErrorMessage(getResetErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="zen-forgot-page">
      <div className="zen-forgot-card">
        <section className="zen-forgot-visual" aria-hidden="true">
          <div className="zen-forgot-brand">
            <div className="zen-forgot-logo-box">
              <img src={zenlensLogo} alt="" className="zen-forgot-logo" />
            </div>

            <div className="zen-forgot-brand-copy">
              <strong>ZenLens</strong>
              <span>Classroom Emotion &amp; Stress Analytics</span>
            </div>
          </div>

          <div className="zen-forgot-visual-copy">
            <span>ACCOUNT RECOVERY</span>
            <h1>Get back to your classroom insights.</h1>

            <p>
              Request a secure password reset link using the email address
              connected to your ZenLens account.
            </p>
          </div>

          <div className="zen-forgot-security-note">
            <div className="zen-forgot-security-icon">
              <Mail />
            </div>

            <div>
              <strong>Reset by email</strong>

              <span>
                Firebase will send the recovery link directly to your inbox.
              </span>
            </div>
          </div>
        </section>

        <section className="zen-forgot-form-side">
          <div className="zen-forgot-mobile-brand">
            <div className="zen-forgot-mobile-logo-box">
              <img src={zenlensLogo} alt="ZenLens" />
            </div>

            <div>
              <strong>ZenLens</strong>
              <span>Classroom Stress Analytics</span>
            </div>
          </div>

          <div className="zen-forgot-form-wrap">
            <button
              type="button"
              className="zen-forgot-back"
              onClick={() => navigate("/login")}
            >
              <ArrowLeft />
              <span>Back to sign in</span>
            </button>

            {!sent ? (
              <>
                <header className="zen-forgot-header">
                  <span className="zen-forgot-kicker">
                    PASSWORD RESET
                  </span>

                  <h2>Forgot your password?</h2>

                  <p>
                    Enter your account email and we will send you a secure link
                    to create a new password.
                  </p>
                </header>

                <form
                  className="zen-forgot-form"
                  onSubmit={handleSubmit}
                >
                  {errorMessage && (
                    <div
                      className="zen-forgot-error"
                      role="alert"
                    >
                      {errorMessage}
                    </div>
                  )}

                  <div className="zen-forgot-field">
                    <label htmlFor="forgot-email">
                      Email address
                    </label>

                    <div className="zen-forgot-input-wrap">
                      <Mail className="zen-forgot-input-icon" />

                      <input
                        id="forgot-email"
                        type="email"
                        value={email}
                        onChange={(event) => {
                          setEmail(event.target.value);

                          if (errorMessage) {
                            setErrorMessage("");
                          }
                        }}
                        placeholder="name@example.com"
                        autoComplete="email"
                        autoFocus
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="zen-forgot-submit"
                    disabled={loading}
                  >
                    <Send />

                    <span>
                      {loading
                        ? "Sending reset link..."
                        : "Send reset link"}
                    </span>
                  </button>
                </form>

                <p className="zen-forgot-help">
                  Remembered your password?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                  >
                    Sign in
                  </button>
                </p>
              </>
            ) : (
              <div
                className="zen-forgot-success"
                role="status"
              >
                <div className="zen-forgot-success-icon">
                  <CheckCircle2 />
                </div>

                <span className="zen-forgot-kicker">
                  EMAIL SENT
                </span>

                <h2>Check your inbox.</h2>

                <p>
                  If <strong>{email.trim()}</strong> is connected to a ZenLens
                  account, a password reset link has been sent to that address.
                </p>

                <div className="zen-forgot-success-note">
                  The email may take a few minutes to arrive. Check your spam or
                  junk folder if you do not see it in your inbox.
                </div>

                <button
                  type="button"
                  className="zen-forgot-submit zen-forgot-login-button"
                  onClick={() => navigate("/login")}
                >
                  <ArrowLeft />
                  <span>Return to sign in</span>
                </button>

                <button
                  type="button"
                  className="zen-forgot-resend"
                  disabled={loading}
                  onClick={() => {
                    setSent(false);
                    setErrorMessage("");
                  }}
                >
                  Use a different email address
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;