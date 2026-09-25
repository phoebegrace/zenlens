import React, {
  useEffect,
  useState,
} from "react";

import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock3,
  FileImage,
  GraduationCap,
  HeartHandshake,
  History,
  Home,
  Info,
  Layers3,
  LogOut,
  Menu,
  ScanFace,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  auth,
  db,
} from "../components/firebase";

import zenlensLogo from "../image/app.png";

import "./Aboutpage.css";

const navigationItems = [
  {
    label: "Home",
    icon: Home,
    route: "/home",
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

const capabilities = [
  {
    icon: FileImage,
    title:
      "Image-based classroom analysis",
    description:
      "ZenLens works with classroom images collected during a session and organizes the observations into a structured analysis.",
  },
  {
    icon: ScanFace,
    title:
      "Facial expression processing",
    description:
      "Detected faces are processed so emotional expressions can contribute to the broader session pattern.",
  },
  {
    icon: Brain,
    title:
      "Emotion classification",
    description:
      "ZenLens classifies seven emotional categories that help describe what is being observed across the classroom images.",
  },
  {
    icon: BarChart3,
    title:
      "Session-level stress interpretation",
    description:
      "The recorded observations are summarized into a session view that helps users review stress patterns in context.",
  },
  {
    icon: TrendingUp,
    title:
      "Daily and weekly review",
    description:
      "Historical results can be viewed across time to help reveal patterns that may not be obvious from a single session.",
  },
  {
    icon: Layers3,
    title:
      "Combined monitoring",
    description:
      "Multiple sessions can be reviewed together within a selected date range for a wider view of recorded stress results.",
  },
];

const audiences = [
  {
    icon: GraduationCap,
    title:
      "Educators",
    description:
      "A clearer way to review emotional patterns alongside the context of individual classroom sessions.",
  },
  {
    icon: HeartHandshake,
    title:
      "Guidance personnel",
    description:
      "Supporting information that can complement broader conversations around student well-being.",
  },
  {
    icon: Users,
    title:
      "Academic institutions",
    description:
      "A structured way to examine classroom stress observations across sessions and time periods.",
  },
];

const faqs = [
  {
    question:
      "Does ZenLens analyze live classroom video?",
    answer:
      "No. ZenLens is image-based. Classroom images are collected and then uploaded as part of a session analysis.",
  },
  {
    question:
      "What emotions does ZenLens identify?",
    answer:
      "ZenLens classifies happiness, surprise, neutral, sadness, anger, fear, and disgust.",
  },
  {
    question:
      "Is ZenLens a diagnostic tool?",
    answer:
      "No. ZenLens is designed to support interpretation of classroom emotional and stress patterns. It should not be treated as a medical or psychological diagnosis.",
  },
  {
    question:
      "Can previous analyses be reviewed later?",
    answer:
      "Yes. ZenLens includes session history, daily and weekly insights, and combined monitoring for reviewing recorded patterns over time.",
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

const Aboutpage = () => {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [
    userDetails,
    setUserDetails,
  ] = useState(null);

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {
          if (!user) {
            setUserDetails(
              null
            );

            return;
          }

          try {
            const userRef =
              doc(
                db,
                "Users",
                user.uid
              );

            const snapshot =
              await getDoc(
                userRef
              );

            if (
              snapshot.exists()
            ) {
              setUserDetails(
                snapshot.data()
              );
            } else {
              setUserDetails({
                email:
                  user.email ||
                  "",
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
              email:
                user.email ||
                "",
              firstName: "",
              lastName: "",
            });
          }
        }
      );

    return () =>
      unsubscribe();
  }, []);

  const firstName =
    userDetails?.firstName ||
    "";

  const lastName =
    userDetails?.lastName ||
    "";

  const email =
    userDetails?.email ||
    auth.currentUser?.email ||
    "";

  const fullName =
    `${firstName} ${lastName}`.trim() ||
    email?.split("@")[0] ||
    "ZenLens User";

  const initials = (() => {
    if (
      firstName ||
      lastName
    ) {
      return `${
        firstName?.[0] ||
        ""
      }${
        lastName?.[0] ||
        ""
      }`.toUpperCase();
    }

    return (
      email?.[0] ||
      "Z"
    ).toUpperCase();
  })();

  const goTo = (
    route
  ) => {
    setMobileMenuOpen(
      false
    );

    navigate(route);
  };

  const handleLogout =
    async () => {
      try {
        await signOut(
          auth
        );

        navigate(
          "/login"
        );
      } catch (error) {
        console.error(
          "Unable to sign out:",
          error
        );
      }
    };

  const handleGlowMove = (
    event
  ) => {
    const element =
      event.currentTarget;

    const rect =
      element.getBoundingClientRect();

    element.style.setProperty(
      "--about-glow-x",
      `${
        event.clientX -
        rect.left
      }px`
    );

    element.style.setProperty(
      "--about-glow-y",
      `${
        event.clientY -
        rect.top
      }px`
    );

    element.style.setProperty(
      "--about-glow-opacity",
      "1"
    );
  };

  const handleGlowLeave = (
    event
  ) => {
    event.currentTarget.style.setProperty(
      "--about-glow-opacity",
      "0"
    );
  };

  const glowProps = {
    onMouseMove:
      handleGlowMove,
    onMouseLeave:
      handleGlowLeave,
  };

  return (
    <div className="zen-about-page">
      <aside className="zen-about-sidebar">
        <div className="zen-about-sidebar-inner">
          <button
            type="button"
            className="zen-about-brand"
            onClick={() =>
              goTo("/home")
            }
          >
            <span className="zen-about-brand-mark">
              <img
                src={
                  zenlensLogo
                }
                alt="ZenLens"
              />
            </span>

            <span className="zen-about-brand-copy">
              <strong>
                ZenLens
              </strong>

              <small>
                Classroom Stress Analytics
              </small>
            </span>
          </button>

          <div className="zen-about-nav-scroll">
            <p className="zen-about-nav-label">
              Workspace
            </p>

            <nav className="zen-about-navigation">
              {navigationItems.map(
                (item) => {
                  const Icon =
                    item.icon;

                  const active =
                    location.pathname ===
                    item.route;

                  return (
                    <button
                      type="button"
                      key={
                        item.label
                      }
                      className={`zen-about-nav-item ${
                        active
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        goTo(
                          item.route
                        )
                      }
                    >
                      <span className="zen-about-nav-icon">
                        <Icon />
                      </span>

                      <span>
                        {
                          item.label
                        }
                      </span>
                    </button>
                  );
                }
              )}
            </nav>

            <div className="zen-about-nav-divider" />

            <p className="zen-about-nav-label">
              Support
            </p>

            <nav className="zen-about-navigation">
              {supportNavigation.map(
                (item) => {
                  const Icon =
                    item.icon;

                  const active =
                    location.pathname ===
                    item.route;

                  return (
                    <button
                      type="button"
                      key={
                        item.label
                      }
                      className={`zen-about-nav-item ${
                        active
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        goTo(
                          item.route
                        )
                      }
                    >
                      <span className="zen-about-nav-icon">
                        <Icon />
                      </span>

                      <span>
                        {
                          item.label
                        }
                      </span>
                    </button>
                  );
                }
              )}
            </nav>
          </div>

          <div className="zen-about-sidebar-bottom">
            <div className="zen-about-user">
              <span className="zen-about-user-avatar">
                {
                  initials
                }
              </span>

              <div className="zen-about-user-copy">
                <strong>
                  {
                    fullName
                  }
                </strong>

                <small>
                  {
                    email
                  }
                </small>
              </div>
            </div>

            <button
              type="button"
              className="zen-about-signout"
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

      <header className="zen-about-mobile-header">
        <button
          type="button"
          className="zen-about-mobile-brand"
          onClick={() =>
            goTo("/home")
          }
        >
          <span>
            <img
              src={
                zenlensLogo
              }
              alt="ZenLens"
            />
          </span>

          <strong>
            ZenLens
          </strong>
        </button>

        <button
          type="button"
          className="zen-about-mobile-toggle"
          aria-label="Toggle navigation"
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
        <div className="zen-about-mobile-drawer">
          <div className="zen-about-mobile-user">
            <span className="zen-about-user-avatar">
              {
                initials
              }
            </span>

            <div>
              <strong>
                {
                  fullName
                }
              </strong>

              <small>
                {
                  email
                }
              </small>
            </div>
          </div>

          <nav>
            {[
              ...navigationItems,
              ...supportNavigation,
            ].map(
              (item) => {
                const Icon =
                  item.icon;

                const active =
                  location.pathname ===
                  item.route;

                return (
                  <button
                    type="button"
                    key={
                      item.label
                    }
                    className={
                      active
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      goTo(
                        item.route
                      )
                    }
                  >
                    <Icon />

                    <span>
                      {
                        item.label
                      }
                    </span>
                  </button>
                );
              }
            )}

            <button
              type="button"
              className="logout"
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

      <main className="zen-about-main">
        <div className="zen-about-orb orb-one" />
        <div className="zen-about-orb orb-two" />

        <div className="zen-about-content">
          <section className="zen-about-hero">
            <div className="zen-about-hero-main">
              <span className="zen-about-eyebrow">
                <Sparkles />

                About the ZenLens system
              </span>

              <p className="zen-about-overline">
                Image-based classroom stress analytics
              </p>

              <h1>
                Classroom stress,
                <span>
                  {" "}
                  seen in context.
                </span>
              </h1>

              <p className="zen-about-hero-description">
                ZenLens organizes emotional observations from classroom images into session-level and historical patterns that educators can review alongside classroom context.
              </p>

              <div className="zen-about-hero-actions">
                <Link
                  to="/how-it-works"
                  className="zen-about-primary-link"
                >
                  <span>
                    See how ZenLens works
                  </span>

                  <ArrowRight />
                </Link>

                <Link
                  to="/stressdetection"
                  className="zen-about-secondary-link"
                >
                  Start an analysis
                </Link>
              </div>
            </div>

            <aside
              className="zen-about-definition-panel zen-about-glow-card"
              {...glowProps}
            >
              <span className="zen-about-card-glow" />

              <div className="zen-about-card-layer">
                <div className="zen-about-definition-heading">
                  <span>
                    SYSTEM DEFINITION
                  </span>

                  <h2>
                    What ZenLens is designed to do.
                  </h2>
                </div>

                <div className="zen-about-definition-columns">
                  <div>
                    <span className="zen-about-definition-label">
                      ZENLENS IS
                    </span>

                    <ul>
                      <li>
                        <CheckCircle2 />

                        Image-based classroom analysis
                      </li>

                      <li>
                        <CheckCircle2 />

                        Session-focused interpretation
                      </li>

                      <li>
                        <CheckCircle2 />

                        Historical pattern review
                      </li>
                    </ul>
                  </div>

                  <div className="muted">
                    <span className="zen-about-definition-label">
                      ZENLENS IS NOT
                    </span>

                    <ul>
                      <li>
                        <X />

                        Live surveillance
                      </li>

                      <li>
                        <X />

                        A medical or psychological diagnosis
                      </li>

                      <li>
                        <X />

                        A replacement for professional judgment
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </aside>
          </section>

          <section className="zen-about-purpose">
            <div className="zen-about-section-number">
              01
            </div>

            <div>
              <span className="zen-about-section-label">
                WHY IT EXISTS
              </span>

              <h2>
                One classroom moment rarely tells the whole story.
              </h2>
            </div>

            <div className="zen-about-purpose-copy">
              <p>
                Stress is not always visible in a single image, and one expression should not be treated as a conclusion. Classroom sessions contain many small observations that become more meaningful when considered together.
              </p>

              <p>
                ZenLens was built around that idea. Instead of focusing on one isolated result, the system helps users review patterns within a session and compare those patterns across time.
              </p>
            </div>
          </section>

          <section className="zen-about-statement">
            <span>
              THE PRINCIPLE
            </span>

            <p>
              The goal is not to turn every expression into an answer.
            </p>

            <h2>
              It is to make the overall pattern easier to understand.
            </h2>
          </section>

          <section className="zen-about-process-preview">
            <article
              className="zen-about-process-copy zen-about-glow-card"
              {...glowProps}
            >
              <span className="zen-about-card-glow" />

              <div className="zen-about-card-layer">
                <span className="zen-about-section-label">
                  HOW THE SYSTEM CONNECTS
                </span>

                <h2>
                  Images become observations. Observations become patterns.
                </h2>

                <p>
                  ZenLens follows a structured workflow from classroom image collection through facial processing, emotion classification, session interpretation, and historical review.
                </p>

                <Link
                  to="/how-it-works"
                  className="zen-about-process-link"
                >
                  <span>
                    Explore the full process
                  </span>

                  <ArrowRight />
                </Link>
              </div>
            </article>

            <div className="zen-about-process-list">
              {[
                "Collect classroom images",
                "Detect faces and expressions",
                "Classify emotional states",
                "Interpret the session",
                "Review patterns over time",
              ].map(
                (
                  item,
                  index
                ) => (
                  <div
                    key={
                      item
                    }
                  >
                    <span>
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
                        item
                      }
                    </strong>

                    <ArrowRight />
                  </div>
                )
              )}
            </div>
          </section>

          <section className="zen-about-capabilities">
            <div className="zen-about-section-intro">
              <span>
                WHAT ZENLENS DOES
              </span>

              <h2>
                Built around the way classroom sessions are reviewed.
              </h2>

              <p>
                The system combines image analysis, session context, and historical views into one connected workflow.
              </p>
            </div>

            <div className="zen-about-capability-grid">
              {capabilities.map(
                (
                  capability,
                  index
                ) => {
                  const Icon =
                    capability.icon;

                  return (
                    <article
                      className="zen-about-capability-card zen-about-glow-card"
                      key={
                        capability.title
                      }
                      {...glowProps}
                    >
                      <span className="zen-about-card-glow" />

                      <div className="zen-about-card-layer">
                        <div className="zen-about-capability-top">
                          <span className="zen-about-capability-icon">
                            <Icon />
                          </span>

                          <span className="zen-about-capability-number">
                            {String(
                              index +
                                1
                            ).padStart(
                              2,
                              "0"
                            )}
                          </span>
                        </div>

                        <h3>
                          {
                            capability.title
                          }
                        </h3>

                        <p>
                          {
                            capability.description
                          }
                        </p>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          </section>

          <section className="zen-about-emotions">
            <div className="zen-about-emotions-copy">
              <span>
                SEVEN EMOTIONAL CATEGORIES
              </span>

              <h2>
                Analysis begins with the expressions observed in each face.
              </h2>

              <p>
                These classifications are treated as observations within the larger classroom session rather than conclusions on their own.
              </p>
            </div>

            <div className="zen-about-emotion-list">
              {emotionLabels.map(
                (
                  emotion,
                  index
                ) => (
                  <div
                    key={
                      emotion
                    }
                  >
                    <span>
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

                    <i />
                  </div>
                )
              )}
            </div>
          </section>

          <section className="zen-about-audience">
            <div className="zen-about-section-intro compact">
              <span>
                WHO IT SUPPORTS
              </span>

              <h2>
                Built for people working around classroom well-being.
              </h2>
            </div>

            <div className="zen-about-audience-grid">
              {audiences.map(
                (
                  audience
                ) => {
                  const Icon =
                    audience.icon;

                  return (
                    <article
                      className="zen-about-audience-card zen-about-glow-card"
                      key={
                        audience.title
                      }
                      {...glowProps}
                    >
                      <span className="zen-about-card-glow" />

                      <div className="zen-about-card-layer">
                        <div className="zen-about-audience-icon">
                          <Icon />
                        </div>

                        <h3>
                          {
                            audience.title
                          }
                        </h3>

                        <p>
                          {
                            audience.description
                          }
                        </p>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          </section>

          <section className="zen-about-principle">
            <div className="zen-about-principle-icon">
              <ShieldCheck />
            </div>

            <div>
              <span>
                AN IMPORTANT LIMIT
              </span>

              <h2>
                ZenLens supports interpretation. It does not make a diagnosis.
              </h2>
            </div>

            <p>
              Results provide supporting information about observed classroom emotional and stress patterns. Severe or concerning situations should still be evaluated by qualified professionals.
            </p>
          </section>

          <section className="zen-about-faq">
            <div className="zen-about-faq-heading">
              <span>
                COMMON QUESTIONS
              </span>

              <h2>
                A few things worth knowing before using ZenLens.
              </h2>
            </div>

            <div className="zen-about-faq-list">
              {faqs.map(
                (
                  faq,
                  index
                ) => (
                  <article
                    key={
                      faq.question
                    }
                  >
                    <span>
                      {String(
                        index +
                          1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <div>
                      <h3>
                        {
                          faq.question
                        }
                      </h3>

                      <p>
                        {
                          faq.answer
                        }
                      </p>
                    </div>
                  </article>
                )
              )}
            </div>
          </section>

          <section className="zen-about-final">
            <div>
              <span>
                CONTINUE EXPLORING
              </span>

              <h2>
                See what happens after classroom images are uploaded.
              </h2>

              <p>
                Explore the full ZenLens workflow from image collection to session interpretation.
              </p>
            </div>

            <Link
              to="/how-it-works"
              className="zen-about-final-link"
            >
              <span>
                How ZenLens works
              </span>

              <ArrowRight />
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Aboutpage;