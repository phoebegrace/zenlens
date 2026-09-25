import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

import { DateRange } from "react-date-range";

import {
  addDays,
  format,
} from "date-fns";

import {
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  Check,
  Clock3,
  Database,
  History,
  Home,
  Info,
  LineChart,
  LogOut,
  Menu,
  RefreshCcw,
  Save,
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
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  auth,
  db,
} from "../components/firebase";

import zenlensLogo from "../image/app.png";

import "./Monitoringpage.css";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const API_BASE_URL =
  "http://localhost:5001";

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

const MonitoringPage = () => {
  const navigate = useNavigate();

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

  const [
    history,
    setHistory,
  ] = useState([]);

  const [
    combinedResults,
    setCombinedResults,
  ] = useState(null);

  const [
    dateRange,
    setDateRange,
  ] = useState([
    {
      startDate:
        new Date(),

      endDate:
        addDays(
          new Date(),
          7
        ),

      key: "selection",
    },
  ]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

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

                firstName:
                  "",

                lastName:
                  "",
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
     FETCH HISTORY
  ====================================================== */

  const fetchHistory =
    async () => {
      setIsLoading(true);

      setErrorMessage("");

      try {
        const response =
          await axios.get(
            `${API_BASE_URL}/history`
          );

        setHistory(
          Array.isArray(
            response.data
          )
            ? response.data
            : []
        );
      } catch (error) {
        console.error(
          "Error fetching history:",
          error
        );

        setHistory([]);

        setErrorMessage(
          "Unable to load analysis history. Check that the ZenLens server is running and try again."
        );
      } finally {
        setIsLoading(
          false
        );
      }
    };

  useEffect(() => {
    fetchHistory();
  }, []);

  /* ======================================================
     DATE
  ====================================================== */

  const normalizeDate = (
    value
  ) => {
    if (!value) {
      return null;
    }

    const parsedDate =
      new Date(
        `${value}T00:00:00`
      );

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return null;
    }

    return parsedDate;
  };

  /* ======================================================
     COMBINED RESULT
  ====================================================== */

  const combineResultsByDate =
    useCallback(() => {
      let totalFaces = 0;

      let totalStress = 0;

      let sessionsCount =
        0;

      const startDate =
        new Date(
          dateRange[0]
            .startDate
        );

      const endDate =
        new Date(
          dateRange[0]
            .endDate
        );

      startDate.setHours(
        0,
        0,
        0,
        0
      );

      endDate.setHours(
        23,
        59,
        59,
        999
      );

      history.forEach(
        (entry) => {
          const entryDate =
            normalizeDate(
              entry.date
            );

          if (
            !entryDate
          ) {
            return;
          }

          if (
            entryDate >=
              startDate &&
            entryDate <=
              endDate
          ) {
            const totalFacesForSession =
              Number(
                entry.total_faces
              ) || 0;

            const averageStressForSession =
              Number(
                entry.average_stress
              ) || 0;

            totalFaces +=
              totalFacesForSession;

            totalStress +=
              averageStressForSession *
              totalFacesForSession;

            sessionsCount +=
              1;
          }
        }
      );

      const averageStress =
        totalFaces > 0
          ? totalStress /
            totalFaces
          : 0;

      setCombinedResults({
        total_faces:
          totalFaces,

        average_stress:
          averageStress,

        sessions_count:
          sessionsCount,

        start_date:
          format(
            startDate,
            "yyyy-MM-dd"
          ),

        end_date:
          format(
            endDate,
            "yyyy-MM-dd"
          ),
      });
    }, [
      history,
      dateRange,
    ]);

  useEffect(() => {
    combineResultsByDate();
  }, [
    history,
    dateRange,
    combineResultsByDate,
  ]);

  /* ======================================================
     SELECTED SESSIONS
  ====================================================== */

  const selectedSessions =
    useMemo(() => {
      const startDate =
        new Date(
          dateRange[0]
            .startDate
        );

      const endDate =
        new Date(
          dateRange[0]
            .endDate
        );

      startDate.setHours(
        0,
        0,
        0,
        0
      );

      endDate.setHours(
        23,
        59,
        59,
        999
      );

      return history.filter(
        (entry) => {
          const entryDate =
            normalizeDate(
              entry.date
            );

          if (
            !entryDate
          ) {
            return false;
          }

          return (
            entryDate >=
              startDate &&
            entryDate <=
              endDate
          );
        }
      );
    }, [
      history,
      dateRange,
    ]);

  /* ======================================================
     SAVE
  ====================================================== */

  const saveCombinedResults =
    async () => {
      if (
        !combinedResults ||
        combinedResults
          .sessions_count ===
          0
      ) {
        return;
      }

      setIsSaving(true);

      setErrorMessage("");

      setSuccessMessage("");

      try {
        await axios.post(
          `${API_BASE_URL}/save-combined-results`,
          combinedResults
        );

        setSuccessMessage(
          "Combined results saved successfully."
        );
      } catch (error) {
        console.error(
          "Error saving combined results:",
          error
        );

        setErrorMessage(
          "The combined results could not be saved. Please try again."
        );
      } finally {
        setIsSaving(
          false
        );
      }
    };

  /* ======================================================
     LABELS
  ====================================================== */

  const rangeLabel =
    `${format(
      dateRange[0]
        .startDate,
      "MMM d, yyyy"
    )} – ${format(
      dateRange[0]
        .endDate,
      "MMM d, yyyy"
    )}`;

  const hasSessions =
    combinedResults &&
    combinedResults
      .sessions_count >
      0;

  /* ======================================================
     GLOW
  ====================================================== */

  const handleGlowMove = (
    event
  ) => {
    const element =
      event.currentTarget;

    const rect =
      element.getBoundingClientRect();

    element.style.setProperty(
      "--monitor-glow-x",
      `${
        event.clientX -
        rect.left
      }px`
    );

    element.style.setProperty(
      "--monitor-glow-y",
      `${
        event.clientY -
        rect.top
      }px`
    );

    element.style.setProperty(
      "--monitor-glow-opacity",
      "1"
    );
  };

  const handleGlowLeave = (
    event
  ) => {
    event.currentTarget.style.setProperty(
      "--monitor-glow-opacity",
      "0"
    );
  };

  const glowProps = {
    onMouseMove:
      handleGlowMove,

    onMouseLeave:
      handleGlowLeave,
  };

  /* ======================================================
     SIDEBAR
  ====================================================== */

  const renderSidebar =
    () => (
      <>
        <aside className="zen-monitor-sidebar">
          <div className="zen-monitor-sidebar-inner">
            <button
              type="button"
              className="zen-monitor-brand"
              onClick={() =>
                goTo(
                  "/home"
                )
              }
            >
              <span className="zen-monitor-brand-mark">
                <img
                  src={
                    zenlensLogo
                  }
                  alt="ZenLens"
                />
              </span>

              <span className="zen-monitor-brand-copy">
                <strong>
                  ZenLens
                </strong>

                <small>
                  Classroom Stress Analytics
                </small>
              </span>
            </button>

            <div className="zen-monitor-nav-scroll">
              <p className="zen-monitor-nav-label">
                Workspace
              </p>

              <nav className="zen-monitor-navigation">
                {navigationItems.map(
                  (item) => {
                    const Icon =
                      item.icon;

                    const active =
                      location
                        .pathname ===
                      item.route;

                    return (
                      <button
                        type="button"
                        key={
                          item.label
                        }
                        className={`zen-monitor-nav-item ${
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
                        <span className="zen-monitor-nav-icon">
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

              <div className="zen-monitor-nav-divider" />

              <p className="zen-monitor-nav-label">
                Support
              </p>

              <nav className="zen-monitor-navigation">
                {supportNavigation.map(
                  (item) => {
                    const Icon =
                      item.icon;

                    return (
                      <button
                        type="button"
                        key={
                          item.label
                        }
                        className="zen-monitor-nav-item"
                        onClick={() =>
                          goTo(
                            item.route
                          )
                        }
                      >
                        <span className="zen-monitor-nav-icon">
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

            <div className="zen-monitor-sidebar-bottom">
              <div className="zen-monitor-user">
                <span className="zen-monitor-user-avatar">
                  {
                    initials
                  }
                </span>

                <div className="zen-monitor-user-copy">
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
                className="zen-monitor-signout"
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

        <header className="zen-monitor-mobile-header">
          <button
            type="button"
            className="zen-monitor-mobile-brand"
            onClick={() =>
              goTo(
                "/home"
              )
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
            className="zen-monitor-mobile-toggle"
            aria-label="Toggle navigation"
            onClick={() =>
              setMobileMenuOpen(
                (
                  current
                ) =>
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
          <div className="zen-monitor-mobile-drawer">
            <div className="zen-monitor-mobile-user">
              <span className="zen-monitor-user-avatar">
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
                    location
                      .pathname ===
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
      </>
    );

  return (
    <div className="zen-monitor-page">
      {renderSidebar()}

      <main className="zen-monitor-main">
        <div className="zen-monitor-orb orb-one" />

        <div className="zen-monitor-orb orb-two" />

        <div className="zen-monitor-content">
          {/* ===============================================
              HERO
          =============================================== */}

          <section className="zen-monitor-intro">
            <div className="zen-monitor-intro-copy">
              <span className="zen-monitor-eyebrow">
                <Sparkles />

                ZenLens monitoring workspace
              </span>

              <p className="zen-monitor-overline">
                Combined classroom analysis
              </p>

              <h1>
                Stress
                <span>
                  {" "}
                  Monitoring
                </span>
              </h1>

              <p className="zen-monitor-description">
                Select a date range to combine classroom sessions and review the broader stress pattern recorded during that period.
              </p>
            </div>

            <div className="zen-monitor-process">
              <div>
                <i>
                  01
                </i>

                <p>
                  <strong>
                    Select dates
                  </strong>

                  <small>
                    Choose a monitoring period
                  </small>
                </p>
              </div>

              <ArrowRight />

              <div>
                <i>
                  02
                </i>

                <p>
                  <strong>
                    Combine
                  </strong>

                  <small>
                    Review matching sessions
                  </small>
                </p>
              </div>

              <ArrowRight />

              <div>
                <i>
                  03
                </i>

                <p>
                  <strong>
                    Save
                  </strong>

                  <small>
                    Store the combined result
                  </small>
                </p>
              </div>
            </div>
          </section>

          {/* ===============================================
              MESSAGES
          =============================================== */}

          {errorMessage && (
            <div className="zen-monitor-message error">
              <AlertCircle />

              <span>
                {
                  errorMessage
                }
              </span>

              <button
                type="button"
                onClick={() =>
                  setErrorMessage(
                    ""
                  )
                }
                aria-label="Dismiss error"
              >
                <X />
              </button>
            </div>
          )}

          {successMessage && (
            <div className="zen-monitor-message success">
              <Check />

              <span>
                {
                  successMessage
                }
              </span>

              <button
                type="button"
                onClick={() =>
                  setSuccessMessage(
                    ""
                  )
                }
                aria-label="Dismiss message"
              >
                <X />
              </button>
            </div>
          )}

          {/* ===============================================
              WORKSPACE
          =============================================== */}

          <section className="zen-monitor-workspace">
            <article
              className="zen-monitor-calendar-panel zen-monitor-glow-card"
              {...glowProps}
            >
              <span className="zen-monitor-card-glow" />

              <div className="zen-monitor-card-layer">
                <div className="zen-monitor-panel-heading">
                  <div className="zen-monitor-panel-icon">
                    <CalendarDays />
                  </div>

                  <div>
                    <span>
                      DATE RANGE
                    </span>

                    <h2>
                      Select monitoring period
                    </h2>

                    <p>
                      Choose which completed classroom sessions should contribute to the combined stress calculation.
                    </p>
                  </div>
                </div>

                <div className="zen-monitor-range-selected">
                  <span className="zen-monitor-range-icon">
                    <CalendarDays />
                  </span>

                  <div>
                    <span>
                      SELECTED RANGE
                    </span>

                    <strong>
                      {
                        rangeLabel
                      }
                    </strong>
                  </div>
                </div>

                <div className="zen-monitor-calendar-wrap">
                  <DateRange
                    editableDateInputs
                    onChange={(
                      item
                    ) => {
                      setDateRange([
                        item.selection,
                      ]);

                      setSuccessMessage(
                        ""
                      );
                    }}
                    moveRangeOnFirstSelection={
                      false
                    }
                    ranges={
                      dateRange
                    }
                    rangeColors={[
                      "#315ed5",
                    ]}
                  />
                </div>
              </div>
            </article>

            <article
              className="zen-monitor-results-panel zen-monitor-glow-card"
              {...glowProps}
            >
              <span className="zen-monitor-card-glow" />

              <div className="zen-monitor-card-layer">
                <div className="zen-monitor-panel-heading">
                  <div className="zen-monitor-panel-icon">
                    <BarChart3 />
                  </div>

                  <div>
                    <span>
                      COMBINED RESULT
                    </span>

                    <h2>
                      Period summary
                    </h2>

                    <p>
                      Results update automatically whenever the selected monitoring period changes.
                    </p>
                  </div>
                </div>

                {isLoading ? (
                  <div className="zen-monitor-loading">
                    <div className="zen-monitor-spinner" />

                    <strong>
                      Loading classroom history
                    </strong>

                    <span>
                      Retrieving recorded sessions.
                    </span>
                  </div>
                ) : hasSessions ? (
                  <>
                    <div className="zen-monitor-result-hero">
                      <span className="zen-monitor-result-kicker">
                        AVERAGE STRESS
                      </span>

                      <strong>
                        {Number(
                          combinedResults
                            .average_stress
                        ).toFixed(
                          2
                        )}
                        %
                      </strong>

                      <p>
                        Weighted across all detected faces in the sessions included within this period.
                      </p>

                      <div className="zen-monitor-result-range">
                        <CalendarDays />

                        <span>
                          {
                            rangeLabel
                          }
                        </span>
                      </div>
                    </div>

                    <div className="zen-monitor-stat-grid">
                      <article>
                        <span className="zen-monitor-stat-icon">
                          <History />
                        </span>

                        <p>
                          <span>
                            Sessions
                          </span>

                          <strong>
                            {
                              combinedResults
                                .sessions_count
                            }
                          </strong>
                        </p>
                      </article>

                      <article>
                        <span className="zen-monitor-stat-icon">
                          <ScanFace />
                        </span>

                        <p>
                          <span>
                            Faces analyzed
                          </span>

                          <strong>
                            {
                              combinedResults
                                .total_faces
                            }
                          </strong>
                        </p>
                      </article>

                      <article>
                        <span className="zen-monitor-stat-icon">
                          <TrendingUp />
                        </span>

                        <p>
                          <span>
                            Average stress
                          </span>

                          <strong>
                            {Number(
                              combinedResults
                                .average_stress
                            ).toFixed(
                              2
                            )}
                            %
                          </strong>
                        </p>
                      </article>
                    </div>

                    <div className="zen-monitor-save-section">
                      <div>
                        <span className="zen-monitor-save-icon">
                          <Database />
                        </span>

                        <p>
                          <strong>
                            Save combined result
                          </strong>

                          <span>
                            Store this monitoring period for future combined-history review.
                          </span>
                        </p>
                      </div>

                      <button
                        type="button"
                        className="zen-monitor-save-button"
                        onClick={
                          saveCombinedResults
                        }
                        disabled={
                          isSaving
                        }
                      >
                        {isSaving ? (
                          <>
                            <RefreshCcw className="zen-monitor-saving-icon" />

                            <span>
                              Saving...
                            </span>
                          </>
                        ) : (
                          <>
                            <Save />

                            <span>
                              Save result
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="zen-monitor-empty">
                    <div className="zen-monitor-empty-icon">
                      <BarChart3 />
                    </div>

                    <span>
                      NO MATCHING SESSIONS
                    </span>

                    <h3>
                      No analysis history exists within this date range.
                    </h3>

                    <p>
                      Select another period that contains completed classroom analyses.
                    </p>
                  </div>
                )}
              </div>
            </article>
          </section>

          {/* ===============================================
              INCLUDED SESSIONS
          =============================================== */}

          {!isLoading &&
            selectedSessions.length >
              0 && (
              <section className="zen-monitor-sessions">
                <div className="zen-monitor-sessions-heading">
                  <div>
                    <span>
                      INCLUDED SESSIONS
                    </span>

                    <h2>
                      Sessions within this period
                    </h2>
                  </div>

                  <p>
                    These classroom analyses contribute to the combined stress result shown above.
                  </p>
                </div>

                <div className="zen-monitor-session-list">
                  <div className="zen-monitor-session-list-head">
                    <span>
                      Session
                    </span>

                    <span>
                      Subject
                    </span>

                    <span>
                      Date
                    </span>

                    <span>
                      Faces
                    </span>

                    <span>
                      Average stress
                    </span>
                  </div>

                  {selectedSessions.map(
                    (
                      session,
                      index
                    ) => (
                      <div
                        className="zen-monitor-session-row"
                        key={
                          session.session_id ||
                          `${session.date}-${index}`
                        }
                      >
                        <div>
                          <span className="zen-monitor-session-icon">
                            <History />
                          </span>

                          <p>
                            <span>
                              Session
                            </span>

                            <strong>
                              {session.session_id ||
                                index +
                                  1}
                            </strong>
                          </p>
                        </div>

                        <div>
                          <p>
                            <span>
                              Subject
                            </span>

                            <strong>
                              {session.subject ||
                                "—"}
                            </strong>
                          </p>
                        </div>

                        <div>
                          <p>
                            <span>
                              Date
                            </span>

                            <strong>
                              {session.date ||
                                "—"}
                            </strong>
                          </p>
                        </div>

                        <div>
                          <p>
                            <span>
                              Faces
                            </span>

                            <strong>
                              {session.total_faces ??
                                "—"}
                            </strong>
                          </p>
                        </div>

                        <div>
                          <p>
                            <span>
                              Stress
                            </span>

                            <strong>
                              {session.average_stress !==
                                undefined &&
                              session.average_stress !==
                                null
                                ? `${Number(
                                    session.average_stress
                                  ).toFixed(
                                    2
                                  )}%`
                                : "—"}
                            </strong>
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </section>
            )}

          {/* ===============================================
              NOTE
          =============================================== */}

          <section className="zen-monitor-note">
            <div className="zen-monitor-note-icon">
              <ShieldCheck />
            </div>

            <div>
              <span>
                ABOUT COMBINED MONITORING
              </span>

              <h2>
                A broader view of classroom stress across multiple sessions.
              </h2>
            </div>

            <p>
              Combined monitoring summarizes sessions within the selected period. It supports interpretation of broader trends rather than replacing individual session review.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default MonitoringPage;