import {
  signInWithEmailAndPassword,
} from "firebase/auth";

import React, {
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import { auth } from "../components/firebase";

import {
  toast,
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import "./LoginPage.css";

import zenlensLogo from "../image/app.png";

const LoginPage = () => {
  const navigate = useNavigate();
  const visualRef = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

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
     REAL FIREBASE LOGIN
  ----------------------------------------- */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isLoading) return;

    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      toast.success(
        "Logged in Successfully!",
        {
          position: "top-center",
          autoClose: 1800,
        }
      );

      /*
        Preserves the original ZenLens
        login behavior.

        Firebase authenticates first,
        then the user is taken to /home.
      */

      setTimeout(() => {
        navigate("/home");
      }, 1800);
    } catch (error) {
      console.error(
        "ZenLens login error:",
        error
      );

      let message =
        "Unable to sign in. Please check your email and password.";

      if (
        error.code ===
          "auth/invalid-credential" ||
        error.code ===
          "auth/wrong-password" ||
        error.code ===
          "auth/user-not-found"
      ) {
        message =
          "Incorrect email or password.";
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
        "auth/too-many-requests"
      ) {
        message =
          "Too many unsuccessful attempts. Please try again later.";
      }

      if (
        error.code ===
        "auth/network-request-failed"
      ) {
        message =
          "Unable to connect. Please check your internet connection.";
      }

      toast.error(
        message,
        {
          position: "top-center",
          autoClose: 3000,
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  /* -----------------------------------------
     UI
  ----------------------------------------- */

  return (
    <main className="zen-login-page">
      <div className="zen-login-card">
        {/* =====================================
            LEFT GRADIENT PANEL
        ====================================== */}

        <section
          className="zen-login-visual"
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
          <div className="zen-login-pointer-light" />
          <div className="zen-login-pointer-liquid" />

          <div className="zen-login-visual-glow zen-login-visual-glow-one" />

          <div className="zen-login-visual-glow zen-login-visual-glow-two" />

          {/* BRAND */}

          <div className="zen-login-brand">
            <div className="zen-login-logo-box">
              <img
                src={zenlensLogo}
                alt="ZenLens logo"
                className="zen-login-logo"
              />
            </div>

            <div className="zen-login-brand-copy">
              <strong>
                ZenLens
              </strong>

              <span>
                Classroom Emotion & Stress
                Analytics
              </span>
            </div>
          </div>

          {/* MESSAGE */}

          <div className="zen-login-visual-copy">
            <span className="zen-login-small-label">
              Image-based classroom
              analysis
            </span>

            <h1>
              Better insight into
              <br />
              classroom stress.
            </h1>

            <p>
              Analyze classroom emotion
              patterns, review session
              history, and understand stress
              trends through one focused
              platform.
            </p>
          </div>

          {/* FOOTER */}

          <div className="zen-login-visual-footer">
            <span>
              Research-driven
            </span>

            <span className="zen-login-dot" />

            <span>
              Academic platform
            </span>
          </div>
        </section>

        {/* =====================================
            LOGIN FORM
        ====================================== */}

        <section className="zen-login-form-side">
          {/* MOBILE BRAND */}

          <div className="zen-login-mobile-brand">
            <div className="zen-login-mobile-logo-box">
              <img
                src={zenlensLogo}
                alt="ZenLens logo"
                className="zen-login-mobile-logo"
              />
            </div>

            <div className="zen-login-mobile-brand-copy">
              <strong>
                ZenLens
              </strong>

              <span>
                Classroom Emotion & Stress
                Analytics
              </span>
            </div>
          </div>

          <div className="zen-login-form-wrap">
            {/* HEADER */}

            <header className="zen-login-header">
              <span className="zen-login-kicker">
                Welcome
              </span>

              <h2>
                Sign in to ZenLens
              </h2>

              <p>
                Access your classroom
                analyses, session history,
                and stress insights.
              </p>
            </header>

            {/* FORM */}

            <form
              className="zen-login-form"
              onSubmit={handleSubmit}
            >
              {/* EMAIL */}

              <div className="zen-login-field">
                <label htmlFor="email">
                  Email address
                </label>

                <div className="zen-login-input-wrap">
                  <svg
                    className="zen-login-input-icon"
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
                    value={email}
                    onChange={(
                      event
                    ) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    placeholder="name@university.edu"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* PASSWORD */}

              <div className="zen-login-field">
                <div className="zen-login-label-row">
                  <label htmlFor="password">
                    Password
                  </label>

                  <button
                    type="button"
                    className="zen-login-forgot"
                    onClick={() => {
                      /*
                        We'll connect this
                        properly when we build
                        the password recovery
                        flow.
                      */
                    }}
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="zen-login-input-wrap">
                  <svg
                    className="zen-login-input-icon"
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
                    value={password}
                    onChange={(
                      event
                    ) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />

                  {/* SHOW PASSWORD */}

                  <button
                    type="button"
                    className="zen-login-password-toggle"
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
                    aria-pressed={
                      showPassword
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
              </div>

              {/* SIGN IN */}

              <button
                type="submit"
                className="zen-login-submit"
                disabled={isLoading}
              >
                <span>
                  {isLoading
                    ? "Signing in..."
                    : "Sign in"}
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

            {/* REGISTER */}

            <div className="zen-login-register">
              <span>
                New to ZenLens?
              </span>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/register"
                  )
                }
              >
                Create an account
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default LoginPage;