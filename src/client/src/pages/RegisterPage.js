import {
  createUserWithEmailAndPassword,
} from "firebase/auth";

import {
  doc,
  setDoc,
} from "firebase/firestore";

import React, {
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  auth,
  db,
} from "../components/firebase";

import {
  toast,
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import "./RegisterPage.css";

import zenlensLogo from "../image/app.png";

const RegisterPage = () => {
  const navigate = useNavigate();
  const visualRef = useRef(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  /* -----------------------------------------
     LIQUID MOUSE LIGHT
  ----------------------------------------- */

  const handleVisualMouseMove = (event) => {
    const panel = visualRef.current;

    if (!panel) return;

    const rect =
      panel.getBoundingClientRect();

    const x =
      event.clientX - rect.left;

    const y =
      event.clientY - rect.top;

    panel.style.setProperty(
      "--mouse-x",
      `${x}px`
    );

    panel.style.setProperty(
      "--mouse-y",
      `${y}px`
    );

    panel.style.setProperty(
      "--light-opacity",
      "1"
    );
  };

  const handleVisualMouseEnter = () => {
    const panel = visualRef.current;

    if (!panel) return;

    panel.style.setProperty(
      "--light-opacity",
      "1"
    );
  };

  const handleVisualMouseLeave = () => {
    const panel = visualRef.current;

    if (!panel) return;

    panel.style.setProperty(
      "--light-opacity",
      "0"
    );
  };

  /* -----------------------------------------
     FORM HANDLING
  ----------------------------------------- */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (current) => ({
        ...current,
        [name]: value,
      })
    );
  };

  /* -----------------------------------------
     REAL FIREBASE REGISTRATION
  ----------------------------------------- */

  const handleRegister = async (event) => {
    event.preventDefault();

    if (isLoading) return;

    const firstName =
      formData.firstName.trim();

    const lastName =
      formData.lastName.trim();

    const email =
      formData.email.trim();

    const password =
      formData.password;

    const confirmPassword =
      formData.confirmPassword;

    if (
      !firstName ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      toast.error(
        "Please complete all required fields.",
        {
          position: "bottom-center",
        }
      );

      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      toast.error(
        "Passwords do not match.",
        {
          position: "bottom-center",
        }
      );

      return;
    }

    setIsLoading(true);

    try {
      /*
        REAL ORIGINAL ZENLENS AUTH FLOW

        1. Create Firebase Authentication user.
        2. Get newly authenticated user.
        3. Create their Firestore Users/{uid} document.
      */

      const credential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      const user =
        credential.user ||
        auth.currentUser;

      if (!user) {
        throw new Error(
          "User account was created but user information could not be retrieved."
        );
      }

      /*
        Preserve the exact original
        ZenLens Firestore structure.
      */

      await setDoc(
        doc(
          db,
          "Users",
          user.uid
        ),
        {
          email: user.email,
          firstName: firstName,
          lastName: lastName,
          photo: "",
        }
      );

      console.log(
        "User Registered Successfully!!"
      );

      toast.success(
        "User Registered Successfully!!",
        {
          position: "top-center",
          autoClose: 2500,
        }
      );

      /*
        Original ZenLens did not
        automatically redirect after
        registration, so we preserve
        that behavior.

        The user can click Sign in below.
      */
    } catch (error) {
      console.error(
        "ZenLens registration error:",
        error
      );

      let message =
        error.message ||
        "Unable to create your account.";

      /*
        Cleaner Firebase messages
        while preserving actual errors.
      */

      if (
        error.code ===
        "auth/email-already-in-use"
      ) {
        message =
          "An account already exists with this email address.";
      }

      if (
        error.code ===
        "auth/invalid-email"
      ) {
        message =
          "Please enter a valid email address.";
      }

      if (
        error.code ===
        "auth/weak-password"
      ) {
        message =
          "Your password is too weak. Please choose a stronger password.";
      }

      if (
        error.code ===
        "auth/network-request-failed"
      ) {
        message =
          "Unable to connect. Please check your internet connection.";
      }

      if (
        error.code ===
        "auth/operation-not-allowed"
      ) {
        message =
          "Email and password registration is currently unavailable.";
      }

      toast.error(
        message,
        {
          position: "bottom-center",
          autoClose: 3500,
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="zen-register-page">
      <div className="zen-register-card">
        {/* =====================================
            LEFT GRADIENT PANEL
        ====================================== */}

        <section
          className="zen-register-visual"
          ref={visualRef}
          onMouseMove={
            handleVisualMouseMove
          }
          onMouseEnter={
            handleVisualMouseEnter
          }
          onMouseLeave={
            handleVisualMouseLeave
          }
        >
          <div className="zen-register-pointer-light" />

          <div className="zen-register-pointer-liquid" />

          <div className="zen-register-visual-glow zen-register-visual-glow-one" />

          <div className="zen-register-visual-glow zen-register-visual-glow-two" />

          {/* BRAND */}

          <div className="zen-register-brand">
            <div className="zen-register-logo-box">
              <img
                src={zenlensLogo}
                alt="ZenLens logo"
                className="zen-register-logo"
              />
            </div>

            <div className="zen-register-brand-copy">
              <strong>
                ZenLens
              </strong>

              <span>
                Classroom Emotion & Stress
                Analytics
              </span>
            </div>
          </div>

          {/* MAIN COPY */}

          <div className="zen-register-visual-copy">
            <span className="zen-register-small-label">
              Research-driven
              classroom analytics
            </span>

            <h1>
              Start seeing
              <br />
              classroom patterns
              <br />
              more clearly.
            </h1>

            <p>
              Create your ZenLens account
              to analyze classroom sessions,
              review emotion patterns, and
              monitor stress trends over time.
            </p>
          </div>

          {/* FOOTER */}

          <div className="zen-register-visual-footer">
            <span>
              Structured analysis
            </span>

            <span className="zen-register-dot" />

            <span>
              Academic platform
            </span>
          </div>
        </section>

        {/* =====================================
            REGISTER FORM
        ====================================== */}

        <section className="zen-register-form-side">
          {/* MOBILE BRAND */}

          <div className="zen-register-mobile-brand">
            <div className="zen-register-mobile-logo-box">
              <img
                src={zenlensLogo}
                alt="ZenLens logo"
                className="zen-register-mobile-logo"
              />
            </div>

            <div className="zen-register-mobile-brand-copy">
              <strong>
                ZenLens
              </strong>

              <span>
                Classroom Emotion & Stress
                Analytics
              </span>
            </div>
          </div>

          <div className="zen-register-form-wrap">
            {/* HEADER */}

            <header className="zen-register-header">
              <span className="zen-register-kicker">
                Get started
              </span>

              <h2>
                Create your account
              </h2>

              <p>
                Set up your ZenLens account
                to begin analyzing classroom
                sessions and reviewing stress
                insights.
              </p>
            </header>

            {/* FORM */}

            <form
              className="zen-register-form"
              onSubmit={
                handleRegister
              }
            >
              {/* FIRST NAME */}

              <div className="zen-register-field">
                <label htmlFor="firstName">
                  First name
                </label>

                <div className="zen-register-input-wrap">
                  <svg
                    className="zen-register-input-icon"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <circle
                      cx="10"
                      cy="6.2"
                      r="3.2"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />

                    <path
                      d="M3.7 16.2C4.5 12.9 6.6 11.2 10 11.2C13.4 11.2 15.5 12.9 16.3 16.2"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>

                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={
                      formData.firstName
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="First name"
                    autoComplete="given-name"
                    required
                  />
                </div>
              </div>

              {/* LAST NAME */}

              <div className="zen-register-field">
                <label htmlFor="lastName">
                  Last name
                </label>

                <div className="zen-register-input-wrap">
                  <svg
                    className="zen-register-input-icon"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <circle
                      cx="10"
                      cy="6.2"
                      r="3.2"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />

                    <path
                      d="M3.7 16.2C4.5 12.9 6.6 11.2 10 11.2C13.4 11.2 15.5 12.9 16.3 16.2"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>

                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={
                      formData.lastName
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Last name"
                    autoComplete="family-name"
                  />
                </div>
              </div>

              {/* EMAIL */}

              <div className="zen-register-field">
                <label htmlFor="email">
                  Email address
                </label>

                <div className="zen-register-input-wrap">
                  <svg
                    className="zen-register-input-icon"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <rect
                      x="2.5"
                      y="4"
                      width="15"
                      height="12"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />

                    <path
                      d="M3.6 5.5L10 10.2L16.4 5.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={
                      formData.email
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="name@university.edu"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* PASSWORD */}

              <div className="zen-register-field">
                <label htmlFor="password">
                  Password
                </label>

                <div className="zen-register-input-wrap">
                  <svg
                    className="zen-register-input-icon"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <rect
                      x="3.5"
                      y="8"
                      width="13"
                      height="8.5"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />

                    <path
                      d="M6.3 8V6.1C6.3 4 8 2.3 10 2.3C12 2.3 13.7 4 13.7 6.1V8"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      formData.password
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Create a password"
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="zen-register-password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (
                          previous
                        ) =>
                          !previous
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3 3L17 17"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                        />

                        <path
                          d="M8.6 5.1C9.05 5.03 9.52 5 10 5C13.8 5 16.5 7.8 17.5 10C17.12 10.82 16.36 11.96 15.24 12.92"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                        />

                        <path
                          d="M12.1 12.38C11.51 12.87 10.77 13.15 10 13.15C8.26 13.15 6.85 11.74 6.85 10C6.85 9.27 7.1 8.59 7.52 8.05"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                        />

                        <path
                          d="M5.34 6.16C3.74 7.26 2.78 8.84 2.5 10C3.5 12.2 6.2 15 10 15C11.09 15 12.08 14.77 12.97 14.39"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M2.5 10C3.5 7.8 6.2 5 10 5C13.8 5 16.5 7.8 17.5 10C16.5 12.2 13.8 15 10 15C6.2 15 3.5 12.2 2.5 10Z"
                          stroke="currentColor"
                          strokeWidth="1.4"
                        />

                        <circle
                          cx="10"
                          cy="10"
                          r="2.4"
                          stroke="currentColor"
                          strokeWidth="1.4"
                        />
                      </svg>
                    )}
                  </button>
                </div>

                <span className="zen-register-hint">
                  Firebase requires at
                  least 6 characters.
                </span>
              </div>

              {/* CONFIRM PASSWORD */}

              <div className="zen-register-field">
                <label htmlFor="confirmPassword">
                  Confirm password
                </label>

                <div className="zen-register-input-wrap">
                  <svg
                    className="zen-register-input-icon"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <rect
                      x="3.5"
                      y="8"
                      width="13"
                      height="8.5"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />

                    <path
                      d="M6.3 8V6.1C6.3 4 8 2.3 10 2.3C12 2.3 13.7 4 13.7 6.1V8"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      formData.confirmPassword
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="zen-register-password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        (
                          previous
                        ) =>
                          !previous
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3 3L17 17"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                        />

                        <path
                          d="M8.6 5.1C9.05 5.03 9.52 5 10 5C13.8 5 16.5 7.8 17.5 10C17.12 10.82 16.36 11.96 15.24 12.92"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                        />

                        <path
                          d="M12.1 12.38C11.51 12.87 10.77 13.15 10 13.15C8.26 13.15 6.85 11.74 6.85 10C6.85 9.27 7.1 8.59 7.52 8.05"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                        />

                        <path
                          d="M5.34 6.16C3.74 7.26 2.78 8.84 2.5 10C3.5 12.2 6.2 15 10 15C11.09 15 12.08 14.77 12.97 14.39"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M2.5 10C3.5 7.8 6.2 5 10 5C13.8 5 16.5 7.8 17.5 10C16.5 12.2 13.8 15 10 15C6.2 15 3.5 12.2 2.5 10Z"
                          stroke="currentColor"
                          strokeWidth="1.4"
                        />

                        <circle
                          cx="10"
                          cy="10"
                          r="2.4"
                          stroke="currentColor"
                          strokeWidth="1.4"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                className="zen-register-submit"
                disabled={isLoading}
              >
                <span>
                  {isLoading
                    ? "Creating account..."
                    : "Create account"}
                </span>

                {!isLoading && (
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 10H16"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />

                    <path
                      d="M11.5 5.5L16 10L11.5 14.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </form>

            {/* LOGIN */}

            <div className="zen-register-login">
              <span>
                Already have an account?
              </span>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/login"
                  )
                }
              >
                Sign in
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default RegisterPage;