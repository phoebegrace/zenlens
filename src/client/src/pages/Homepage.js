import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import {
  ArrowRight,
  BarChart3,
  Brain,
  ChevronDown,
  Clock3,
  History,
  Home,
  LineChart,
  LogOut,
  Menu,
  ScanFace,
  Sparkles,
  Upload,
  Users,
  X,
} from "lucide-react";

import { auth, db } from "../components/firebase";
import "./Homepage.css";
import zenlensLogo from "../image/app.png";

const HomePage = () => {
  const navigate = useNavigate();
  const visualRef = useRef(null);

  const [userDetails, setUserDetails] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUserDetails(null);
        return;
      }

      try {
        const userRef = doc(db, "Users", user.uid);
        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists()) {
          setUserDetails(userSnapshot.data());
        } else {
          setUserDetails({
            email: user.email,
            firstName: "",
            lastName: "",
          });
        }
      } catch (error) {
        console.error("Unable to load user details:", error);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Unable to sign out:", error);
    }
  };

  const firstName = userDetails?.firstName || "";
  const lastName = userDetails?.lastName || "";
  const email = userDetails?.email || auth.currentUser?.email || "";

  const fullName =
    `${firstName} ${lastName}`.trim() ||
    email?.split("@")[0] ||
    "ZenLens User";

  const initials = (() => {
    if (firstName || lastName) {
      return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
    }

    return (email?.[0] || "Z").toUpperCase();
  })();

  const goTo = (path) => {
    setMobileOpen(false);
    setProfileOpen(false);
    navigate(path);
  };

  const handleVisualMove = (event) => {
    const element = visualRef.current;

    if (!element) return;

    const rect = element.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    element.style.setProperty("--home-mouse-x", `${x}px`);
    element.style.setProperty("--home-mouse-y", `${y}px`);
    element.style.setProperty("--home-light-opacity", "1");
  };

  const handleVisualLeave = () => {
    const element = visualRef.current;

    if (!element) return;

    element.style.setProperty("--home-light-opacity", "0");
  };

  const mainActions = [
    {
      title: "Analyze a classroom session",
      description:
        "Upload classroom images and session information to begin emotion and stress analysis.",
      icon: Upload,
      route: "/stressdetection",
      action: "Start analysis",
    },
    {
      title: "Review session history",
      description:
        "Access completed analyses and review classroom results by session, subject, and date.",
      icon: History,
      route: "/sessionhistory",
      action: "View sessions",
    },
    {
      title: "Explore stress insights",
      description:
        "Compare daily and weekly results to understand emotional and stress patterns across sessions.",
      icon: LineChart,
      route: "/overallhistory",
      action: "View insights",
    },
  ];

  return (
    <div className="zen-home-page">
      <header className="zen-home-header">
        <div className="zen-home-header-inner">
          <button
            type="button"
            className="zen-home-brand"
            onClick={() => goTo("/home")}
          >
            <span className="zen-home-brand-mark">
              <img src={zenlensLogo} alt="ZenLens" />
            </span>

            <span className="zen-home-brand-copy">
              <strong>ZenLens</strong>
              <small>Classroom Stress Analytics</small>
            </span>
          </button>

          <nav
            className="zen-home-desktop-nav"
            aria-label="Main navigation"
          >
            <button
              type="button"
              className="zen-home-nav-link active"
              onClick={() => goTo("/home")}
            >
              <Home />
              <span>Home</span>
            </button>

            <button
              type="button"
              className="zen-home-nav-link"
              onClick={() => goTo("/stressdetection")}
            >
              <ScanFace />
              <span>Analysis</span>
            </button>

            <button
              type="button"
              className="zen-home-nav-link"
              onClick={() => goTo("/sessionhistory")}
            >
              <Clock3 />
              <span>History</span>
            </button>

            <button
              type="button"
              className="zen-home-nav-link"
              onClick={() => goTo("/overallhistory")}
            >
              <BarChart3 />
              <span>Insights</span>
            </button>

            <button
              type="button"
              className="zen-home-nav-link"
              onClick={() => goTo("/about")}
            >
              <Users />
              <span>About</span>
            </button>
          </nav>

          <div className="zen-home-header-actions">
            <button
              type="button"
              className="zen-home-new-analysis"
              onClick={() => goTo("/stressdetection")}
            >
              <ScanFace />
              <span>New analysis</span>
            </button>

            <div className="zen-home-profile-wrap">
              <button
                type="button"
                className="zen-home-profile-button"
                onClick={() => setProfileOpen((open) => !open)}
                aria-expanded={profileOpen}
              >
                <span className="zen-home-profile-avatar">
                  {initials}
                </span>

                <span className="zen-home-profile-meta">
                  <strong>{fullName}</strong>
                  <small>{email}</small>
                </span>

                <ChevronDown
                  className={`zen-home-profile-chevron ${
                    profileOpen ? "open" : ""
                  }`}
                />
              </button>

              {profileOpen && (
                <div className="zen-home-profile-menu">
                  <div className="zen-home-profile-menu-head">
                    <span className="zen-home-profile-avatar large">
                      {initials}
                    </span>

                    <div>
                      <strong>{fullName}</strong>
                      <span>{email}</span>
                    </div>
                  </div>

                  <button type="button" onClick={handleLogout}>
                    <LogOut />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              className="zen-home-mobile-toggle"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="zen-home-mobile-menu">
          <button type="button" onClick={() => goTo("/home")}>
            Home
          </button>

          <button type="button" onClick={() => goTo("/stressdetection")}>
            Analysis
          </button>

          <button type="button" onClick={() => goTo("/sessionhistory")}>
            History
          </button>

          <button type="button" onClick={() => goTo("/overallhistory")}>
            Insights
          </button>

          <button type="button" onClick={() => goTo("/about")}>
            About
          </button>

          <button
            type="button"
            className="zen-home-mobile-logout"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </div>
      )}

      <main className="zen-home-main">
        <section className="zen-home-hero">
          <div className="zen-home-hero-copy">
            <div className="zen-home-hero-label">
              <Brain />
              <span>Classroom stress analysis</span>
            </div>

            <h1>
              Understand the patterns
              <span>behind classroom stress.</span>
            </h1>

            <p className="zen-home-hero-description">
              ZenLens analyzes emotional patterns from classroom images
              to help users review stress signals within individual
              sessions and across time.
            </p>

            <div className="zen-home-hero-actions">
              <button
                type="button"
                className="zen-home-primary-button"
                onClick={() => goTo("/stressdetection")}
              >
                <span>Analyze a session</span>
                <ArrowRight />
              </button>

              <button
                type="button"
                className="zen-home-secondary-button"
                onClick={() => goTo("/how-it-works")}
              >
                <span>How ZenLens works</span>
              </button>
            </div>

            <div className="zen-home-hero-process">
              <div>
                <span>01</span>
                <p>
                  <strong>Classroom images</strong>
                  <small>Session observations</small>
                </p>
              </div>

              <div className="zen-home-process-arrow">
                <ArrowRight />
              </div>

              <div>
                <span>02</span>
                <p>
                  <strong>Emotion analysis</strong>
                  <small>Pattern classification</small>
                </p>
              </div>

              <div className="zen-home-process-arrow">
                <ArrowRight />
              </div>

              <div>
                <span>03</span>
                <p>
                  <strong>Stress insights</strong>
                  <small>Session interpretation</small>
                </p>
              </div>
            </div>
          </div>

          <div
            ref={visualRef}
            className="zen-home-psychology-visual"
            onMouseMove={handleVisualMove}
            onMouseLeave={handleVisualLeave}
          >
            <div className="zen-home-visual-light" />
            <div className="zen-home-visual-liquid" />
            <div className="zen-home-visual-grid" />

            <div className="zen-home-visual-orbit orbit-one" />
            <div className="zen-home-visual-orbit orbit-two" />

            <div className="zen-home-visual-header">
              <div>
                <span>SESSION VIEW</span>
                <strong>Emotional pattern field</strong>
              </div>

              <span className="zen-home-visual-status">
                <i />
                Image-based analysis
              </span>
            </div>

            <div className="zen-home-emotion-field">
              <div className="zen-home-emotion-ring ring-one" />
              <div className="zen-home-emotion-ring ring-two" />
              <div className="zen-home-emotion-ring ring-three" />

              <div className="zen-home-emotion-core">
                <Brain />

                <div>
                  <span>Emotion distribution</span>
                  <strong>Session pattern</strong>
                </div>
              </div>

              <span className="zen-home-signal signal-one" />
              <span className="zen-home-signal signal-two" />
              <span className="zen-home-signal signal-three" />
              <span className="zen-home-signal signal-four" />
              <span className="zen-home-signal signal-five" />
            </div>

            <div className="zen-home-emotion-list">
              <span>Happiness</span>
              <span>Surprise</span>
              <span>Neutral</span>
              <span>Sadness</span>
              <span>Anger</span>
              <span>Fear</span>
              <span>Disgust</span>
            </div>
          </div>
        </section>

        <section className="zen-home-method-section">
          <div className="zen-home-method-copy">
            <span className="zen-home-section-label">
              HOW ZENLENS INTERPRETS A SESSION
            </span>

            <h2>
              One image shows a moment. A session reveals a pattern.
            </h2>

            <p>
              ZenLens reviews emotional observations across a classroom
              session so changes and recurring responses can be examined
              together rather than treated as isolated expressions.
            </p>
          </div>

          <div className="zen-home-method-flow">
            <div className="zen-home-method-item">
              <div className="zen-home-method-icon">
                <ScanFace />
              </div>

              <span>Step 1</span>

              <strong>Observe expressions</strong>

              <p>
                Classroom images provide facial observations from
                different moments in the session.
              </p>
            </div>

            <div className="zen-home-method-arrow">
              <ArrowRight />
            </div>

            <div className="zen-home-method-item">
              <div className="zen-home-method-icon">
                <Brain />
              </div>

              <span>Step 2</span>

              <strong>Classify emotions</strong>

              <p>
                Detected expressions are organized into recognized
                emotional categories.
              </p>
            </div>

            <div className="zen-home-method-arrow">
              <ArrowRight />
            </div>

            <div className="zen-home-method-item">
              <div className="zen-home-method-icon">
                <LineChart />
              </div>

              <span>Step 3</span>

              <strong>Interpret patterns</strong>

              <p>
                Results are reviewed across the session to understand
                broader stress patterns.
              </p>
            </div>
          </div>
        </section>

        <section className="zen-home-actions-section">
          <div className="zen-home-actions-heading">
            <div>
              <span className="zen-home-section-label">
                ZENLENS TOOLS
              </span>

              <h2>What would you like to do?</h2>
            </div>

            <p>
              Analyze a new classroom session, return to previous results,
              or review stress patterns over time.
            </p>
          </div>

          <div className="zen-home-action-grid">
            {mainActions.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  type="button"
                  className="zen-home-action-card"
                  key={item.title}
                  onClick={() => goTo(item.route)}
                >
                  <div className="zen-home-action-icon">
                    <Icon />
                  </div>

                  <div className="zen-home-action-content">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>

                  <div className="zen-home-action-footer">
                    <span>{item.action}</span>

                    <span className="zen-home-action-arrow">
                      <ArrowRight />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="zen-home-notice">
          <div className="zen-home-notice-icon">
            <Sparkles />
          </div>

          <div className="zen-home-notice-copy">
            <span>INTERPRETATION SUPPORT</span>

            <h2>
              ZenLens supports stress assessment. It does not replace
              professional judgment.
            </h2>
          </div>

          <p>
            Results are intended to help organize and visualize classroom
            emotional patterns. They should be interpreted within the
            appropriate educational and psychological context.
          </p>
        </section>
      </main>
    </div>
  );
};

export default HomePage;