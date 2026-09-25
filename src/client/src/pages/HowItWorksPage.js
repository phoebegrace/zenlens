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
  Camera,
  CheckCircle2,
  Clock3,
  FileImage,
  History,
  Home,
  Info,
  Layers3,
  Lightbulb,
  LogOut,
  Menu,
  ScanFace,
  ShieldCheck,
  Sparkles,
  TrendingUp,
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

import step1Image from "../image/step1.png";
import step2Image from "../image/step2.png";
import step3Image from "../image/step3.png";
import step4Image from "../image/step4.png";
import step5Image from "../image/step5.png";

import "./HowItWorksPage.css";

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

const steps = [
  {
    number: "01",
    eyebrow: "COLLECT",
    title:
      "Upload classroom images",
    image:
      step1Image,
    icon:
      FileImage,
    description:
      "Start by selecting the classroom image folder and adding the session context that will stay connected to the analysis.",
    details: [
      "Session subject and room",
      "Teacher and schedule information",
      "Classroom image folder",
    ],
  },
  {
    number: "02",
    eyebrow: "PROCESS",
    title:
      "Detect faces and visual features",
    image:
      step2Image,
    icon:
      ScanFace,
    description:
      "ZenLens processes the uploaded images to locate faces and prepare the visual information required for emotion classification.",
    details: [
      "Face detection",
      "Image preprocessing",
      "Feature extraction",
    ],
  },
  {
    number: "03",
    eyebrow: "CLASSIFY",
    title:
      "Identify emotional expressions",
    image:
      step3Image,
    icon:
      Brain,
    description:
      "Detected faces are classified into emotional categories so each classroom image contributes to the wider session pattern.",
    details: [
      "Happiness",
      "Surprise",
      "Neutral",
      "Sadness",
      "Anger",
      "Fear",
      "Disgust",
    ],
  },
  {
    number: "04",
    eyebrow: "INTERPRET",
    title:
      "Assess the session stress pattern",
    image:
      step4Image,
    icon:
      BarChart3,
    description:
      "ZenLens combines the detected emotional observations and summarizes them into a session-level stress interpretation.",
    details: [
      "Image-by-image observations",
      "Session stress category",
      "Emotion frequency patterns",
    ],
  },
  {
    number: "05",
    eyebrow: "REVIEW",
    title:
      "Explore results across time",
    image:
      step5Image,
    icon:
      TrendingUp,
    description:
      "Completed sessions can be reviewed individually or compared across days and weeks to help reveal broader classroom trends.",
    details: [
      "Session history",
      "Daily and weekly insights",
      "Combined monitoring",
    ],
  },
];

const HowItWorksPage = () => {
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

  /* ======================================================
     USER
  ====================================================== */

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

  /* ======================================================
     POINTER GLOW
  ====================================================== */

  const handleGlowMove = (
    event
  ) => {
    const element =
      event.currentTarget;

    const rect =
      element.getBoundingClientRect();

    element.style.setProperty(
      "--how-glow-x",
      `${
        event.clientX -
        rect.left
      }px`
    );

    element.style.setProperty(
      "--how-glow-y",
      `${
        event.clientY -
        rect.top
      }px`
    );

    element.style.setProperty(
      "--how-glow-opacity",
      "1"
    );
  };

  const handleGlowLeave = (
    event
  ) => {
    event.currentTarget.style.setProperty(
      "--how-glow-opacity",
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
    <div className="zen-how-page">
      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="zen-how-sidebar">
        <div className="zen-how-sidebar-inner">
          <button
            type="button"
            className="zen-how-brand"
            onClick={() =>
              goTo("/home")
            }
          >
            <span className="zen-how-brand-mark">
              <img
                src={
                  zenlensLogo
                }
                alt="ZenLens"
              />
            </span>

            <span className="zen-how-brand-copy">
              <strong>
                ZenLens
              </strong>

              <small>
                Classroom Stress Analytics
              </small>
            </span>
          </button>

          <div className="zen-how-nav-scroll">
            <p className="zen-how-nav-label">
              Workspace
            </p>

            <nav className="zen-how-navigation">
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
                      className={`zen-how-nav-item ${
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
                      <span className="zen-how-nav-icon">
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

            <div className="zen-how-nav-divider" />

            <p className="zen-how-nav-label">
              Support
            </p>

            <nav className="zen-how-navigation">
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
                      className={`zen-how-nav-item ${
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
                      <span className="zen-how-nav-icon">
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

          <div className="zen-how-sidebar-bottom">
            <div className="zen-how-user">
              <span className="zen-how-user-avatar">
                {
                  initials
                }
              </span>

              <div className="zen-how-user-copy">
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
              className="zen-how-signout"
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

      {/* =================================================
          MOBILE HEADER
      ================================================= */}

      <header className="zen-how-mobile-header">
        <button
          type="button"
          className="zen-how-mobile-brand"
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
          className="zen-how-mobile-toggle"
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
        <div className="zen-how-mobile-drawer">
          <div className="zen-how-mobile-user">
            <span className="zen-how-user-avatar">
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

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="zen-how-main">
        <div className="zen-how-orb orb-one" />
        <div className="zen-how-orb orb-two" />

        <div className="zen-how-content">
          {/* ===============================================
              HERO
          =============================================== */}

          <section className="zen-how-hero">
            <div className="zen-how-hero-copy">
              <span className="zen-how-eyebrow">
                <Sparkles />

                How the ZenLens system works
              </span>

              <p className="zen-how-overline">
                From classroom images to structured analysis
              </p>

              <h1>
                One session.
                <span>
                  {" "}
                  Five clear stages.
                </span>
              </h1>

              <p className="zen-how-description">
                ZenLens transforms a collection of classroom images into a structured view of emotional and stress patterns that can be reviewed within one session and across time.
              </p>

              <div className="zen-how-hero-actions">
                <Link
                  to="/stressdetection"
                  className="zen-how-primary-link"
                >
                  <Camera />

                  <span>
                    Start new analysis
                  </span>

                  <ArrowRight />
                </Link>

                <Link
                  to="/sessionhistory"
                  className="zen-how-secondary-link"
                >
                  <History />

                  <span>
                    View session history
                  </span>
                </Link>
              </div>
            </div>

            <div
              className="zen-how-hero-visual zen-how-glow-card"
              {...glowProps}
            >
              <span className="zen-how-card-glow" />

              <div className="zen-how-card-layer">
                <div className="zen-how-visual-lines">
                  <i className="line-one" />
                  <i className="line-two" />
                  <i className="line-three" />
                  <i className="line-four" />
                </div>

                <div className="zen-how-visual-core">
                  <span className="zen-how-visual-core-icon">
                    <Brain />
                  </span>

                  <span>
                    ZENLENS
                  </span>

                  <strong>
                    Classroom
                    <br />
                    Analysis
                  </strong>

                  <small>
                    Image-based workflow
                  </small>
                </div>

                <div className="zen-how-visual-node node-one">
                  <FileImage />

                  <div>
                    <span>
                      INPUT
                    </span>

                    <strong>
                      Images
                    </strong>
                  </div>
                </div>

                <div className="zen-how-visual-node node-two">
                  <ScanFace />

                  <div>
                    <span>
                      DETECT
                    </span>

                    <strong>
                      Faces
                    </strong>
                  </div>
                </div>

                <div className="zen-how-visual-node node-three">
                  <BarChart3 />

                  <div>
                    <span>
                      INTERPRET
                    </span>

                    <strong>
                      Patterns
                    </strong>
                  </div>
                </div>

                <div className="zen-how-visual-node node-four">
                  <TrendingUp />

                  <div>
                    <span>
                      REVIEW
                    </span>

                    <strong>
                      Insights
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ===============================================
              SUMMARY
          =============================================== */}

          <section className="zen-how-summary">
            {steps.map(
              (
                step,
                index
              ) => (
                <React.Fragment
                  key={
                    step.number
                  }
                >
                  <div>
                    <span>
                      {
                        step.number
                      }
                    </span>

                    <p>
                      <strong>
                        {
                          step.eyebrow.charAt(
                            0
                          ) +
                          step.eyebrow
                            .slice(1)
                            .toLowerCase()
                        }
                      </strong>

                      <small>
                        {
                          step.title
                        }
                      </small>
                    </p>
                  </div>

                  {index <
                    steps.length -
                      1 && (
                    <ArrowRight />
                  )}
                </React.Fragment>
              )
            )}
          </section>

          {/* ===============================================
              WORKFLOW INTRO
          =============================================== */}

          <section className="zen-how-section-head">
            <div>
              <span>
                THE ZENLENS WORKFLOW
              </span>

              <h2>
                From uploaded images to classroom insight.
              </h2>
            </div>

            <p>
              Each stage transforms the uploaded classroom images into information that can be reviewed as part of the overall session context.
            </p>
          </section>

          {/* ===============================================
              STEPS
          =============================================== */}

          <section className="zen-how-steps">
            {steps.map(
              (
                step,
                index
              ) => {
                const Icon =
                  step.icon;

                return (
                  <article
                    className={`zen-how-step zen-how-glow-card ${
                      index %
                        2 ===
                      1
                        ? "reverse"
                        : ""
                    }`}
                    key={
                      step.number
                    }
                    {...glowProps}
                  >
                    <span className="zen-how-card-glow" />

                    <div className="zen-how-card-layer step">
                      <div className="zen-how-step-visual">
                        <div className="zen-how-step-image-wrap">
                          <img
                            src={
                              step.image
                            }
                            alt={
                              step.title
                            }
                            className="zen-how-step-image"
                          />

                          <div className="zen-how-step-image-overlay" />

                          <div className="zen-how-step-image-label">
                            <Icon />

                            <span>
                              {
                                step.eyebrow
                              }
                            </span>
                          </div>

                          <div className="zen-how-step-image-number">
                            {
                              step.number
                            }
                          </div>
                        </div>
                      </div>

                      <div className="zen-how-step-copy">
                        <div className="zen-how-step-kicker">
                          <span className="zen-how-step-kicker-icon">
                            <Icon />
                          </span>

                          <span>
                            STEP{" "}
                            {
                              step.number
                            }{" "}
                            ·{" "}
                            {
                              step.eyebrow
                            }
                          </span>
                        </div>

                        <h3>
                          {
                            step.title
                          }
                        </h3>

                        <p>
                          {
                            step.description
                          }
                        </p>

                        <div className="zen-how-step-details">
                          {step.details.map(
                            (
                              detail
                            ) => (
                              <div
                                key={
                                  detail
                                }
                              >
                                <CheckCircle2 />

                                <span>
                                  {
                                    detail
                                  }
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </section>

          {/* ===============================================
              IMPORTANT CONTEXT
          =============================================== */}

          <section className="zen-how-interpretation">
            <div className="zen-how-interpretation-icon">
              <ShieldCheck />
            </div>

            <div>
              <span>
                IMPORTANT CONTEXT
              </span>

              <h2>
                ZenLens supports interpretation, not diagnosis.
              </h2>
            </div>

            <p>
              The system helps users observe classroom emotional and stress patterns. Results should be interpreted as supporting information rather than a medical or psychological diagnosis.
            </p>
          </section>

          {/* ===============================================
              FINAL CTA
          =============================================== */}

          <section className="zen-how-cta">
            <div>
              <span>
                READY TO SEE IT IN ACTION?
              </span>

              <h2>
                Start with a classroom session.
              </h2>

              <p>
                Add the classroom context, upload the image folder, and let ZenLens organize the emotional observations for review.
              </p>
            </div>

            <Link
              to="/stressdetection"
              className="zen-how-cta-button"
            >
              <span>
                Analyze a session
              </span>

              <ArrowRight />
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
};

export default HowItWorksPage;