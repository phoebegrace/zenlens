import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  ChevronRight,
  Clock3,
  FileText,
  History,
  Home,
  Info,
  LineChart,
  LogOut,
  Menu,
  ScanFace,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from "lucide-react";

import { auth, db } from "../components/firebase";
import zenlensLogo from "../image/app.png";

import "./Homepage.css";

const navigationItems = [
  {
    label: "Home",
    icon: Home,
    route: "/home",
    active: true,
  },
  {
    label: "New Analysis",
    icon: ScanFace,
    route: "/stressdetection",
  },
  {
    label: "Monitoring",
    icon: Activity,
    route: "/stressmonitoring",
  },
  {
    label: "Session History",
    icon: Clock3,
    route: "/sessionhistory",
  },
  {
    label: "Overall Insights",
    icon: BarChart3,
    route: "/overallhistory",
  },
  {
    label: "Stress History",
    icon: History,
    route: "/stresshistory",
  },
];

const supportNavigation = [
  {
    label: "About ZenLens",
    icon: Info,
    route: "/about",
  },
  {
    label: "How It Works",
    icon: BookOpen,
    route: "/how-it-works",
  },
];

const actionCards = [
  {
    title: "New Analysis",
    description:
      "Upload classroom images and session information to begin a new emotion and stress analysis.",
    eyebrow: "Analyze",
    icon: Upload,
    route: "/stressdetection",
    action: "Start analysis",
    featured: true,
  },
  {
    title: "Monitoring",
    description:
      "Review analyzed classroom emotions and examine the stress patterns detected during a session.",
    eyebrow: "Review",
    icon: Activity,
    route: "/stressmonitoring",
    action: "Open monitoring",
  },
  {
    title: "Session History",
    description:
      "Return to previous classroom analyses and review results by session, subject, and date.",
    eyebrow: "History",
    icon: Clock3,
    route: "/sessionhistory",
    action: "View sessions",
  },
  {
    title: "Weekly Insights",
    description:
      "Compare daily and weekly classroom stress patterns and review generated recommendations.",
    eyebrow: "Insights",
    icon: LineChart,
    route: "/overallhistory",
    action: "View insights",
  },
];

const emotionLabels = [
  "Happiness",
  "Surprise",
  "Neutral",
  "Sadness",
  "Anger",
  "Fear",
  "Disgust",
];

const HomePage = () => {
  const navigate = useNavigate();

  const [userDetails, setUserDetails] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
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
          console.error(
            "Unable to load user details:",
            error
          );

          setUserDetails({
            email: user.email,
            firstName: "",
            lastName: "",
          });
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const firstName =
    userDetails?.firstName || "";

  const lastName =
    userDetails?.lastName || "";

  const email =
    userDetails?.email ||
    auth.currentUser?.email ||
    "";

  const fullName =
    `${firstName} ${lastName}`.trim() ||
    email?.split("@")[0] ||
    "ZenLens User";

  const displayFirstName =
    firstName ||
    fullName?.split(" ")[0] ||
    "there";

  const initials = (() => {
    if (firstName || lastName) {
      return `${firstName?.[0] || ""}${
        lastName?.[0] || ""
      }`.toUpperCase();
    }

    return (email?.[0] || "Z").toUpperCase();
  })();

  const goTo = (route) => {
    setMobileMenuOpen(false);
    navigate(route);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error(
        "Unable to sign out:",
        error
      );
    }
  };

  const handleGlowMove = (event) => {
    const element =
      event.currentTarget;

    const rect =
      element.getBoundingClientRect();

    const x =
      event.clientX - rect.left;

    const y =
      event.clientY - rect.top;

    element.style.setProperty(
      "--glow-x",
      `${x}px`
    );

    element.style.setProperty(
      "--glow-y",
      `${y}px`
    );

    element.style.setProperty(
      "--glow-opacity",
      "1"
    );
  };

  const handleGlowLeave = (event) => {
    event.currentTarget.style.setProperty(
      "--glow-opacity",
      "0"
    );
  };

  const glowProps = {
    onMouseMove: handleGlowMove,
    onMouseLeave: handleGlowLeave,
  };

  return (
    <div className="zen-dashboard-page">
      <aside className="zen-dashboard-sidebar">
        <div className="zen-sidebar-inner">
          <button
            type="button"
            className="zen-sidebar-brand"
            onClick={() => goTo("/home")}
          >
            <span className="zen-sidebar-brand-mark">
              <img
                src={zenlensLogo}
                alt="ZenLens"
              />
            </span>

            <span className="zen-sidebar-brand-copy">
              <strong>ZenLens</strong>

              <small>
                Classroom Stress Analytics
              </small>
            </span>
          </button>

          <div className="zen-sidebar-nav-wrap">
            <p className="zen-sidebar-section-label">
              Workspace
            </p>

            <nav
              className="zen-sidebar-navigation"
              aria-label="ZenLens navigation"
            >
              {navigationItems.map(
                (item) => {
                  const Icon =
                    item.icon;

                  return (
                    <button
                      type="button"
                      key={item.label}
                      className={`zen-sidebar-nav-item ${
                        item.active
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        goTo(
                          item.route
                        )
                      }
                    >
                      <span className="zen-sidebar-nav-icon">
                        <Icon />
                      </span>

                      <span>
                        {item.label}
                      </span>
                    </button>
                  );
                }
              )}
            </nav>

            <div className="zen-sidebar-divider" />

            <p className="zen-sidebar-section-label">
              Support
            </p>

            <nav
              className="zen-sidebar-navigation"
              aria-label="ZenLens information"
            >
              {supportNavigation.map(
                (item) => {
                  const Icon =
                    item.icon;

                  return (
                    <button
                      type="button"
                      key={item.label}
                      className="zen-sidebar-nav-item"
                      onClick={() =>
                        goTo(
                          item.route
                        )
                      }
                    >
                      <span className="zen-sidebar-nav-icon">
                        <Icon />
                      </span>

                      <span>
                        {item.label}
                      </span>
                    </button>
                  );
                }
              )}
            </nav>
          </div>

          <div className="zen-sidebar-bottom">
            <div className="zen-sidebar-user">
              <span className="zen-user-avatar">
                {initials}
              </span>

              <div className="zen-user-copy">
                <strong>
                  {fullName}
                </strong>

                <small>
                  {email}
                </small>
              </div>
            </div>

            <button
              type="button"
              className="zen-sidebar-signout"
              onClick={
                handleLogout
              }
            >
              <LogOut />

              <span>
                Sign out
              </span>
            </button>
          </div>
        </div>
      </aside>

      <header className="zen-mobile-header">
        <button
          type="button"
          className="zen-mobile-brand"
          onClick={() =>
            goTo("/home")
          }
        >
          <span className="zen-mobile-brand-mark">
            <img
              src={zenlensLogo}
              alt="ZenLens"
            />
          </span>

          <span>
            ZenLens
          </span>
        </button>

        <button
          type="button"
          className="zen-mobile-toggle"
          aria-label="Toggle navigation"
          aria-expanded={
            mobileMenuOpen
          }
          onClick={() =>
            setMobileMenuOpen(
              (current) =>
                !current
            )
          }
        >
          {mobileMenuOpen ? (
            <X />
          ) : (
            <Menu />
          )}
        </button>
      </header>

      {mobileMenuOpen && (
        <div className="zen-mobile-drawer">
          <div className="zen-mobile-user">
            <span className="zen-user-avatar mobile">
              {initials}
            </span>

            <div>
              <strong>
                {fullName}
              </strong>

              <small>
                {email}
              </small>
            </div>
          </div>

          <nav className="zen-mobile-navigation">
            {[
              ...navigationItems,
              ...supportNavigation,
            ].map((item) => {
              const Icon =
                item.icon;

              return (
                <button
                  type="button"
                  key={item.label}
                  className={
                    item.active
                      ? "zen-mobile-nav-item active"
                      : "zen-mobile-nav-item"
                  }
                  onClick={() =>
                    goTo(
                      item.route
                    )
                  }
                >
                  <Icon />

                  <span>
                    {item.label}
                  </span>
                </button>
              );
            })}

            <button
              type="button"
              className="zen-mobile-nav-item logout"
              onClick={
                handleLogout
              }
            >
              <LogOut />

              <span>
                Sign out
              </span>
            </button>
          </nav>
        </div>
      )}

      <main className="zen-dashboard-main">
        <div className="zen-dashboard-background-orb orb-one" />

        <div className="zen-dashboard-background-orb orb-two" />

        <div className="zen-dashboard-content">
          <section className="zen-dashboard-intro">
            <div className="zen-dashboard-intro-copy">
              <span className="zen-dashboard-eyebrow">
                <Sparkles />

                ZenLens workspace
              </span>

              <p className="zen-dashboard-welcome">
                Welcome back,{" "}
                {displayFirstName}.
              </p>

              <h1>
                Classroom Stress
                <span>
                  {" "}
                  Dashboard
                </span>
              </h1>

              <p className="zen-dashboard-description">
                Analyze classroom
                emotions, review
                stress patterns, and
                understand changes
                across individual
                sessions and over
                time.
              </p>
            </div>

            <div className="zen-dashboard-intro-actions">
              <button
                type="button"
                className="zen-dashboard-primary-button"
                onClick={() =>
                  goTo(
                    "/stressdetection"
                  )
                }
              >
                <ScanFace />

                <span>
                  New analysis
                </span>

                <ArrowRight />
              </button>
            </div>
          </section>

          <section className="zen-dashboard-action-grid">
            {actionCards.map(
              (card) => {
                const Icon =
                  card.icon;

                return (
                  <button
                    type="button"
                    key={
                      card.title
                    }
                    className={`zen-dashboard-action-card zen-glow-card ${
                      card.featured
                        ? "featured"
                        : ""
                    }`}
                    onClick={() =>
                      goTo(
                        card.route
                      )
                    }
                    {...glowProps}
                  >
                    <span className="zen-card-glow" />

                    <div className="zen-card-content-layer">
                      <div className="zen-action-card-top">
                        <span className="zen-action-card-icon">
                          <Icon />
                        </span>

                        <span className="zen-action-card-eyebrow">
                          {
                            card.eyebrow
                          }
                        </span>
                      </div>

                      <div className="zen-action-card-copy">
                        <h2>
                          {
                            card.title
                          }
                        </h2>

                        <p>
                          {
                            card.description
                          }
                        </p>
                      </div>

                      <div className="zen-action-card-footer">
                        <span>
                          {
                            card.action
                          }
                        </span>

                        <span className="zen-action-card-arrow">
                          <ArrowRight />
                        </span>
                      </div>
                    </div>
                  </button>
                );
              }
            )}
          </section>

          <section className="zen-dashboard-overview-grid">
            <article
              className="zen-overview-card zen-overview-workflow zen-glow-card"
              {...glowProps}
            >
              <span className="zen-card-glow" />

              <div className="zen-card-content-layer">
                <div className="zen-card-heading">
                  <div>
                    <span className="zen-card-label">
                      Analysis workflow
                    </span>

                    <h2>
                      From classroom
                      images to useful
                      insight.
                    </h2>
                  </div>

                  <span className="zen-heading-icon">
                    <Brain />
                  </span>
                </div>

                <div className="zen-workflow-list">
                  <div className="zen-workflow-row">
                    <span className="zen-workflow-number">
                      01
                    </span>

                    <span className="zen-workflow-icon">
                      <Upload />
                    </span>

                    <div>
                      <strong>
                        Upload classroom
                        observations
                      </strong>

                      <p>
                        Add classroom
                        images together
                        with the session
                        information
                        required for
                        analysis.
                      </p>
                    </div>
                  </div>

                  <div className="zen-workflow-connector" />

                  <div className="zen-workflow-row">
                    <span className="zen-workflow-number">
                      02
                    </span>

                    <span className="zen-workflow-icon">
                      <ScanFace />
                    </span>

                    <div>
                      <strong>
                        Detect emotional
                        responses
                      </strong>

                      <p>
                        ZenLens processes
                        visible facial
                        expressions and
                        organizes
                        predictions into
                        supported emotion
                        classes.
                      </p>
                    </div>
                  </div>

                  <div className="zen-workflow-connector" />

                  <div className="zen-workflow-row">
                    <span className="zen-workflow-number">
                      03
                    </span>

                    <span className="zen-workflow-icon">
                      <LineChart />
                    </span>

                    <div>
                      <strong>
                        Review classroom
                        patterns
                      </strong>

                      <p>
                        Examine session
                        results and
                        longer-term stress
                        trends through
                        ZenLens.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="zen-workflow-link"
                  onClick={() =>
                    goTo(
                      "/how-it-works"
                    )
                  }
                >
                  <span>
                    Learn how ZenLens
                    works
                  </span>

                  <ChevronRight />
                </button>
              </div>
            </article>

            <article
              className="zen-overview-card zen-overview-emotions zen-glow-card"
              {...glowProps}
            >
              <span className="zen-card-glow" />

              <div className="zen-card-content-layer">
                <div className="zen-card-heading">
                  <div>
                    <span className="zen-card-label">
                      Emotion framework
                    </span>

                    <h2>
                      Seven recognized
                      categories.
                    </h2>
                  </div>

                  <span className="zen-heading-icon">
                    <ScanFace />
                  </span>
                </div>

                <p className="zen-emotion-description">
                  ZenLens organizes
                  detected facial
                  expressions into seven
                  emotion categories
                  used by the classroom
                  stress analysis
                  workflow.
                </p>

                <div className="zen-emotion-list">
                  {emotionLabels.map(
                    (
                      emotion,
                      index
                    ) => (
                      <div
                        className="zen-emotion-row"
                        key={
                          emotion
                        }
                      >
                        <span className="zen-emotion-index">
                          {String(
                            index +
                              1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </span>

                        <strong>
                          {
                            emotion
                          }
                        </strong>

                        <span className="zen-emotion-dot" />
                      </div>
                    )
                  )}
                </div>

                <button
                  type="button"
                  className="zen-emotion-link"
                  onClick={() =>
                    goTo(
                      "/stressmonitoring"
                    )
                  }
                >
                  <span>
                    Open stress
                    monitoring
                  </span>

                  <ArrowRight />
                </button>
              </div>
            </article>
          </section>

          <section className="zen-dashboard-lower-grid">
            <article
              className="zen-lower-card zen-glow-card"
              {...glowProps}
            >
              <span className="zen-card-glow" />

              <div className="zen-card-content-layer lower">
                <div className="zen-lower-card-icon">
                  <FileText />
                </div>

                <div>
                  <span className="zen-card-label">
                    Previous sessions
                  </span>

                  <h3>
                    Return to your
                    analysis history.
                  </h3>

                  <p>
                    Access previously
                    completed classroom
                    sessions and review
                    their analysis
                    results whenever you
                    need them.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    goTo(
                      "/sessionhistory"
                    )
                  }
                >
                  View session history

                  <ArrowRight />
                </button>
              </div>
            </article>

            <article
              className="zen-lower-card zen-glow-card"
              {...glowProps}
            >
              <span className="zen-card-glow" />

              <div className="zen-card-content-layer lower">
                <div className="zen-lower-card-icon">
                  <BarChart3 />
                </div>

                <div>
                  <span className="zen-card-label">
                    Trends and
                    recommendations
                  </span>

                  <h3>
                    Review stress
                    patterns over time.
                  </h3>

                  <p>
                    Compare daily and
                    weekly results and
                    review the
                    recommendation
                    generated for the
                    selected analysis
                    period.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    goTo(
                      "/overallhistory"
                    )
                  }
                >
                  Open overall insights

                  <ArrowRight />
                </button>
              </div>
            </article>
          </section>

          <section
            className="zen-dashboard-notice zen-glow-card"
            {...glowProps}
          >
            <span className="zen-card-glow" />

            <div className="zen-card-content-layer notice">
              <div className="zen-notice-icon">
                <ShieldCheck />
              </div>

              <div className="zen-notice-main">
                <span className="zen-card-label">
                  Interpretation
                  support
                </span>

                <h2>
                  ZenLens supports
                  classroom stress
                  assessment.
                </h2>
              </div>

              <p>
                Results help organize
                and visualize classroom
                emotional patterns.
                They should be
                interpreted together
                with appropriate
                educational and
                professional judgment.
              </p>
            </div>
          </section>

          <footer className="zen-dashboard-footer">
            <div>
              <img
                src={zenlensLogo}
                alt=""
              />

              <span>
                ZenLens
              </span>
            </div>

            <p>
              Image-Based Stress
              Detection and Classroom
              Stress Analytics
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default HomePage;