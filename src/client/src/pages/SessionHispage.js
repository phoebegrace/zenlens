import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";
import Plot from "react-plotly.js";

import {
  Activity,
  AlertCircle,
  BarChart3,
  BookOpen,
  CalendarDays,
  ChevronDown,
  Clock3,
  Cloud,
  Filter,
  History,
  Home,
  Info,
  LogOut,
  Menu,
  ScanFace,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserRound,
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

import "./SessionHispage.css";

const API_BASE_URL =
  "http://127.0.0.1:5001";

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

const SessionHisPage = () => {
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

  const [
    history,
    setHistory,
  ] = useState([]);

  const [
    emotionTimeline,
    setEmotionTimeline,
  ] = useState([]);

  const [
    filters,
    setFilters,
  ] = useState({
    subject: "",
    teacher: "",
    weather: "",
  });

  const [
    sortOrder,
    setSortOrder,
  ] = useState("latest");

  const [
    openDetails,
    setOpenDetails,
  ] = useState(null);

  const [
    subjectOptions,
    setSubjectOptions,
  ] = useState([]);

  const [
    teacherOptions,
    setTeacherOptions,
  ] = useState([]);

  const [
    weatherOptions,
    setWeatherOptions,
  ] = useState([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    timelineLoading,
    setTimelineLoading,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
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
     FILTER OPTIONS
  ====================================================== */

  const extractFilterOptions = (
    data
  ) => {
    const subjects = [
      ...new Set(
        data
          .map(
            (item) =>
              item.subject
          )
          .filter(Boolean)
      ),
    ];

    const teachers = [
      ...new Set(
        data
          .map(
            (item) =>
              item.teacher
          )
          .filter(Boolean)
      ),
    ];

    const weatherConditions =
      [
        ...new Set(
          data
            .map(
              (item) =>
                item.weather
            )
            .filter(
              Boolean
            )
        ),
      ];

    setSubjectOptions(
      subjects
    );

    setTeacherOptions(
      teachers
    );

    setWeatherOptions(
      weatherConditions
    );
  };

  /* ======================================================
     FETCH HISTORY
  ====================================================== */

  const fetchHistory =
    async (
      activeFilters,
      activeSortOrder
    ) => {
      setIsLoading(true);

      setErrorMessage("");

      try {
        const response =
          await axios.get(
            `${API_BASE_URL}/history`,
            {
              params: {
                ...activeFilters,

                sort_order:
                  activeSortOrder,
              },
            }
          );

        const data =
          Array.isArray(
            response.data
          )
            ? response.data
            : [];

        setHistory(data);

        extractFilterOptions(
          data
        );
      } catch (error) {
        console.error(
          "Error fetching history:",
          error
        );

        setHistory([]);

        if (
          error.response
        ) {
          const serverMessage =
            error.response
              ?.data?.error ||
            error.response
              ?.data
              ?.message ||
            `The ZenLens server returned status ${error.response.status}.`;

          setErrorMessage(
            serverMessage
          );
        } else if (
          error.request
        ) {
          setErrorMessage(
            "Unable to connect to the ZenLens server at 127.0.0.1:5000. Make sure python app.py is still running."
          );
        } else {
          setErrorMessage(
            error.message ||
              "Unable to load session history."
          );
        }
      } finally {
        setIsLoading(
          false
        );
      }
    };

  /* ======================================================
     FETCH TIMELINE
  ====================================================== */

  const fetchEmotionTimeline =
    async () => {
      setTimelineLoading(
        true
      );

      try {
        const response =
          await axios.get(
            `${API_BASE_URL}/emotion-timeline`
          );

        setEmotionTimeline(
          Array.isArray(
            response.data
          )
            ? response.data
            : []
        );
      } catch (error) {
        console.error(
          "Error fetching emotion timeline:",
          error
        );

        setEmotionTimeline(
          []
        );

        if (
          error.response
        ) {
          setErrorMessage(
            error.response
              ?.data?.error ||
              error.response
                ?.data
                ?.message ||
              `Unable to load the emotion timeline. Server returned status ${error.response.status}.`
          );
        } else if (
          error.request
        ) {
          setErrorMessage(
            "Unable to connect to the ZenLens server at 127.0.0.1:5000. Make sure python app.py is still running."
          );
        } else {
          setErrorMessage(
            error.message ||
              "Unable to load the emotion timeline."
          );
        }
      } finally {
        setTimelineLoading(
          false
        );
      }
    };

  useEffect(() => {
    fetchEmotionTimeline();
  }, []);

  useEffect(() => {
    fetchHistory(
      filters,
      sortOrder
    );
  }, [
    filters,
    sortOrder,
  ]);

  /* ======================================================
     FILTER HANDLERS
  ====================================================== */

  const handleFilterChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFilters(
      (
        previousFilters
      ) => ({
        ...previousFilters,
        [name]: value,
      })
    );
  };

  const handleSortChange = (
    event
  ) => {
    setSortOrder(
      event.target.value
    );
  };

  const clearFilters =
    () => {
      setFilters({
        subject: "",
        teacher: "",
        weather: "",
      });

      setSortOrder(
        "latest"
      );
    };

  const activeFilterCount =
    useMemo(() => {
      return Object.values(
        filters
      ).filter(
        (value) =>
          String(value).trim()
      ).length;
    }, [filters]);

  /* ======================================================
     SESSION DETAIL
  ====================================================== */

  const toggleDetails = (
    index
  ) => {
    setOpenDetails(
      index
    );
  };

  const closeDetails =
    () => {
      setOpenDetails(
        null
      );
    };

  const selectedSession =
    openDetails !== null
      ? history[
          openDetails
        ]
      : null;

  /* ======================================================
     PLOTLY DATA
  ====================================================== */

  const processDataForPlotly = (
    sessionId
  ) => {
    const sessionData =
      emotionTimeline.filter(
        (entry) =>
          entry.session_id ===
          sessionId
      );

    const sortedData = [
      ...sessionData,
    ].sort(
      (a, b) =>
        new Date(
          a.timestamp
        ) -
        new Date(
          b.timestamp
        )
    );

    const timestamps =
      sortedData.map(
        (entry) =>
          entry.timestamp
      );

    const emotionCounts =
      sortedData.map(
        (entry) =>
          entry.emotion_counts ||
          {}
      );

    const emotionNames = [
      ...new Set(
        emotionCounts.flatMap(
          (counts) =>
            Object.keys(
              counts
            )
        )
      ),
    ];

    return emotionNames.map(
      (emotion) => ({
        x: timestamps,

        y: emotionCounts.map(
          (counts) =>
            counts[
              emotion
            ] ?? null
        ),

        type:
          "scatter",

        mode:
          "lines",

        name:
          emotion,

        connectgaps:
          false,

        hovertemplate:
          "<b>%{fullData.name}</b><br>%{x}<br>Count: %{y}<extra></extra>",

        line: {
          shape:
            "linear",

          width:
            2.4,
        },
      })
    );
  };

  const selectedSessionTraces =
    useMemo(() => {
      if (
        !selectedSession
      ) {
        return [];
      }

      return processDataForPlotly(
        selectedSession.session_id
      );
    }, [
      selectedSession,
      emotionTimeline,
    ]);

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
      "--session-glow-x",
      `${
        event.clientX -
        rect.left
      }px`
    );

    element.style.setProperty(
      "--session-glow-y",
      `${
        event.clientY -
        rect.top
      }px`
    );

    element.style.setProperty(
      "--session-glow-opacity",
      "1"
    );
  };

  const handleGlowLeave = (
    event
  ) => {
    event.currentTarget.style.setProperty(
      "--session-glow-opacity",
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
        <aside className="zen-session-sidebar">
          <div className="zen-session-sidebar-inner">
            <button
              type="button"
              className="zen-session-brand"
              onClick={() =>
                goTo(
                  "/home"
                )
              }
            >
              <span className="zen-session-brand-mark">
                <img
                  src={
                    zenlensLogo
                  }
                  alt="ZenLens"
                />
              </span>

              <span className="zen-session-brand-copy">
                <strong>
                  ZenLens
                </strong>

                <small>
                  Classroom Stress Analytics
                </small>
              </span>
            </button>

            <div className="zen-session-nav-scroll">
              <p className="zen-session-nav-label">
                Workspace
              </p>

              <nav className="zen-session-navigation">
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
                        className={`zen-session-nav-item ${
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
                        <span className="zen-session-nav-icon">
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

              <div className="zen-session-nav-divider" />

              <p className="zen-session-nav-label">
                Support
              </p>

              <nav className="zen-session-navigation">
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
                        className="zen-session-nav-item"
                        onClick={() =>
                          goTo(
                            item.route
                          )
                        }
                      >
                        <span className="zen-session-nav-icon">
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

            <div className="zen-session-sidebar-bottom">
              <div className="zen-session-user">
                <span className="zen-session-user-avatar">
                  {
                    initials
                  }
                </span>

                <div className="zen-session-user-copy">
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
                className="zen-session-signout"
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

        <header className="zen-session-mobile-header">
          <button
            type="button"
            className="zen-session-mobile-brand"
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
            className="zen-session-mobile-toggle"
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
          <div className="zen-session-mobile-drawer">
            <div className="zen-session-mobile-user">
              <span className="zen-session-user-avatar">
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
    <div className="zen-session-page">
      {renderSidebar()}

      <main className="zen-session-main">
        <div className="zen-session-orb orb-one" />

        <div className="zen-session-orb orb-two" />

        <div className="zen-session-main-content">
          {/* ===============================================
              HERO
          =============================================== */}

          <section className="zen-session-intro">
            <div className="zen-session-intro-copy">
              <span className="zen-session-eyebrow">
                <Sparkles />

                ZenLens history workspace
              </span>

              <p className="zen-session-overline">
                Classroom analysis archive
              </p>

              <h1>
                Session
                <span>
                  {" "}
                  History
                </span>
              </h1>

              <p className="zen-session-description">
                Browse completed classroom analyses, filter by session context, and open individual sessions to review their emotional timeline.
              </p>
            </div>

            <div className="zen-session-overview">
              <div>
                <span className="zen-session-overview-icon">
                  <History />
                </span>

                <p>
                  <span>
                    Matching sessions
                  </span>

                  <strong>
                    {
                      history.length
                    }
                  </strong>

                  <small>
                    Current result set
                  </small>
                </p>
              </div>

              <div>
                <span className="zen-session-overview-icon">
                  <Filter />
                </span>

                <p>
                  <span>
                    Active filters
                  </span>

                  <strong>
                    {
                      activeFilterCount
                    }
                  </strong>

                  <small>
                    Current selections
                  </small>
                </p>
              </div>
            </div>
          </section>

          {/* ===============================================
              FILTER TOOLBAR
          =============================================== */}

          <section
            className="zen-session-toolbar zen-session-glow-card"
            {...glowProps}
          >
            <span className="zen-session-card-glow" />

            <div className="zen-session-card-layer toolbar">
              <div className="zen-session-toolbar-title">
                <span className="zen-session-toolbar-icon">
                  <SlidersHorizontal />
                </span>

                <div>
                  <span>
                    FILTER SESSIONS
                  </span>

                  <strong>
                    Find a classroom session
                  </strong>
                </div>
              </div>

              <div className="zen-session-toolbar-fields">
                <div className="zen-session-select-wrap">
                  <Search />

                  <select
                    name="subject"
                    value={
                      filters.subject
                    }
                    onChange={
                      handleFilterChange
                    }
                  >
                    <option value="">
                      All subjects
                    </option>

                    {subjectOptions.map(
                      (
                        subject,
                        index
                      ) => (
                        <option
                          key={`${subject}-${index}`}
                          value={
                            subject
                          }
                        >
                          {
                            subject
                          }
                        </option>
                      )
                    )}
                  </select>

                  <ChevronDown />
                </div>

                <div className="zen-session-select-wrap">
                  <UserRound />

                  <select
                    name="teacher"
                    value={
                      filters.teacher
                    }
                    onChange={
                      handleFilterChange
                    }
                  >
                    <option value="">
                      All teachers
                    </option>

                    {teacherOptions.map(
                      (
                        teacher,
                        index
                      ) => (
                        <option
                          key={`${teacher}-${index}`}
                          value={
                            teacher
                          }
                        >
                          {
                            teacher
                          }
                        </option>
                      )
                    )}
                  </select>

                  <ChevronDown />
                </div>

                <div className="zen-session-select-wrap">
                  <Cloud />

                  <select
                    name="weather"
                    value={
                      filters.weather
                    }
                    onChange={
                      handleFilterChange
                    }
                  >
                    <option value="">
                      All weather
                    </option>

                    {weatherOptions.map(
                      (
                        weather,
                        index
                      ) => (
                        <option
                          key={`${weather}-${index}`}
                          value={
                            weather
                          }
                        >
                          {
                            weather
                          }
                        </option>
                      )
                    )}
                  </select>

                  <ChevronDown />
                </div>

                <div className="zen-session-select-wrap">
                  <SlidersHorizontal />

                  <select
                    value={
                      sortOrder
                    }
                    onChange={
                      handleSortChange
                    }
                  >
                    <option value="latest">
                      Latest to earliest
                    </option>

                    <option value="earliest">
                      Earliest to latest
                    </option>
                  </select>

                  <ChevronDown />
                </div>

                {(activeFilterCount >
                  0 ||
                  sortOrder !==
                    "latest") && (
                  <button
                    type="button"
                    className="zen-session-reset-button"
                    onClick={
                      clearFilters
                    }
                  >
                    <X />

                    <span>
                      Reset
                    </span>
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* ===============================================
              ERROR
          =============================================== */}

          {errorMessage && (
            <div className="zen-session-error">
              <AlertCircle />

              <span>
                {
                  errorMessage
                }
              </span>

              <button
                type="button"
                onClick={() =>
                  fetchHistory(
                    filters,
                    sortOrder
                  )
                }
              >
                Try again
              </button>
            </div>
          )}

          {/* ===============================================
              CONTENT
          =============================================== */}

          <section className="zen-session-content">
            <div className="zen-session-content-head">
              <div>
                <span>
                  CLASSROOM SESSIONS
                </span>

                <h2>
                  Completed analyses
                </h2>
              </div>

              <p>
                Open a session to review its classroom context and the recorded emotion timeline.
              </p>
            </div>

            {isLoading ? (
              <div className="zen-session-loading">
                <div className="zen-session-loading-spinner" />

                <strong>
                  Loading sessions
                </strong>

                <span>
                  Retrieving classroom analysis history.
                </span>
              </div>
            ) : history.length >
              0 ? (
              <div className="zen-session-list">
                <div className="zen-session-list-header">
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
                    Teacher
                  </span>

                  <span>
                    Time
                  </span>

                  <span />
                </div>

                {history.map(
                  (
                    entry,
                    index
                  ) => (
                    <button
                      type="button"
                      className="zen-session-row"
                      key={
                        entry.session_id ||
                        `${entry.subject}-${index}`
                      }
                      onClick={() =>
                        toggleDetails(
                          index
                        )
                      }
                    >
                      <div className="zen-session-row-id">
                        <span className="zen-session-row-icon">
                          <History />
                        </span>

                        <div>
                          <span>
                            SESSION ID
                          </span>

                          <strong>
                            {entry.session_id ||
                              index +
                                1}
                          </strong>
                        </div>
                      </div>

                      <div className="zen-session-row-subject">
                        <span>
                          SUBJECT
                        </span>

                        <strong>
                          {entry.subject ||
                            "—"}
                        </strong>

                        <small>
                          {entry.session
                            ? `Session ${entry.session}`
                            : "Classroom analysis"}
                        </small>
                      </div>

                      <div className="zen-session-row-meta">
                        <CalendarDays />

                        <div>
                          <span>
                            Date
                          </span>

                          <strong>
                            {entry.date ||
                              "—"}
                          </strong>
                        </div>
                      </div>

                      <div className="zen-session-row-meta">
                        <UserRound />

                        <div>
                          <span>
                            Teacher
                          </span>

                          <strong>
                            {entry.teacher ||
                              "—"}
                          </strong>
                        </div>
                      </div>

                      <div className="zen-session-row-meta">
                        <Clock3 />

                        <div>
                          <span>
                            Time
                          </span>

                          <strong>
                            {entry.startTime ||
                              "—"}
                            {
                              " – "
                            }
                            {entry.endTime ||
                              "—"}
                          </strong>
                        </div>
                      </div>

                      <span className="zen-session-row-open">
                        View
                      </span>
                    </button>
                  )
                )}
              </div>
            ) : (
              <div className="zen-session-empty">
                <div className="zen-session-empty-icon">
                  <History />
                </div>

                <span>
                  NO SESSIONS FOUND
                </span>

                <h3>
                  No classroom sessions match these filters.
                </h3>

                <p>
                  Adjust the current filters or reset them to view all available ZenLens sessions.
                </p>

                {activeFilterCount >
                  0 && (
                  <button
                    type="button"
                    onClick={
                      clearFilters
                    }
                  >
                    Reset filters
                  </button>
                )}
              </div>
            )}
          </section>

          {/* ===============================================
              BOTTOM NOTE
          =============================================== */}

          <section className="zen-session-note">
            <div className="zen-session-note-icon">
              <ShieldCheck />
            </div>

            <div>
              <span>
                SESSION REVIEW
              </span>

              <h2>
                Each analysis remains connected to its classroom context.
              </h2>
            </div>

            <p>
              Session history helps compare previous observations without removing the date, teacher, weather, subject, and timing information recorded during analysis.
            </p>
          </section>
        </div>
      </main>

      {/* =================================================
          MODAL
      ================================================= */}

      {selectedSession && (
        <div
          className="zen-session-overlay"
          onMouseDown={
            closeDetails
          }
        >
          <div
            className="zen-session-modal"
            onMouseDown={(
              event
            ) =>
              event.stopPropagation()
            }
          >
            <div className="zen-session-modal-head">
              <div>
                <span>
                  SESSION{" "}
                  {selectedSession.session_id ||
                    ""}
                </span>

                <h2>
                  {selectedSession.subject ||
                    "Classroom session"}
                </h2>

                <p>
                  Review the classroom context and emotional changes recorded across this session.
                </p>
              </div>

              <button
                type="button"
                className="zen-session-modal-close"
                onClick={
                  closeDetails
                }
                aria-label="Close session details"
              >
                <X />
              </button>
            </div>

            <div className="zen-session-modal-body">
              <aside className="zen-session-details-panel">
                <div className="zen-session-details-heading">
                  <span>
                    SESSION INFORMATION
                  </span>

                  <h3>
                    Classroom context
                  </h3>
                </div>

                <div className="zen-session-detail-list">
                  <div>
                    <BarChart3 />

                    <p>
                      <span>
                        Session
                      </span>

                      <strong>
                        {selectedSession.session ||
                          selectedSession.session_id ||
                          "—"}
                      </strong>
                    </p>
                  </div>

                  <div>
                    <CalendarDays />

                    <p>
                      <span>
                        Date
                      </span>

                      <strong>
                        {selectedSession.date ||
                          "—"}
                      </strong>
                    </p>
                  </div>

                  <div>
                    <UserRound />

                    <p>
                      <span>
                        Teacher
                      </span>

                      <strong>
                        {selectedSession.teacher ||
                          "—"}
                      </strong>
                    </p>
                  </div>

                  <div>
                    <Cloud />

                    <p>
                      <span>
                        Weather
                      </span>

                      <strong>
                        {selectedSession.weather ||
                          "—"}
                      </strong>
                    </p>
                  </div>

                  <div>
                    <Clock3 />

                    <p>
                      <span>
                        Start time
                      </span>

                      <strong>
                        {selectedSession.startTime ||
                          "—"}
                      </strong>
                    </p>
                  </div>

                  <div>
                    <Clock3 />

                    <p>
                      <span>
                        End time
                      </span>

                      <strong>
                        {selectedSession.endTime ||
                          "—"}
                      </strong>
                    </p>
                  </div>
                </div>
              </aside>

              <div className="zen-session-chart-panel">
                <div className="zen-session-chart-head">
                  <div>
                    <span>
                      EMOTION TIMELINE
                    </span>

                    <h3>
                      Emotional changes across the session
                    </h3>
                  </div>

                  <p>
                    Emotion counts are displayed in timestamp order.
                  </p>
                </div>

                <div className="zen-session-chart">
                  {timelineLoading ? (
                    <div className="zen-session-chart-state">
                      <div className="zen-session-loading-spinner" />

                      <strong>
                        Loading timeline
                      </strong>
                    </div>
                  ) : selectedSessionTraces.length >
                    0 ? (
                    <Plot
                      data={
                        selectedSessionTraces
                      }
                      layout={{
                        autosize:
                          true,

                        margin: {
                          l: 62,
                          r: 24,
                          t: 24,
                          b: 62,
                        },

                        paper_bgcolor:
                          "rgba(255,255,255,0)",

                        plot_bgcolor:
                          "rgba(255,255,255,0)",

                        font: {
                          family:
                            "Inter, sans-serif",

                          color:
                            "#6d7a92",

                          size:
                            12,
                        },

                        hovermode:
                          "x unified",

                        showlegend:
                          true,

                        legend: {
                          orientation:
                            "h",

                          x:
                            0,

                          y:
                            -0.25,

                          font: {
                            size:
                              11,
                          },
                        },

                        xaxis: {
                          title: {
                            text:
                              "Time",

                            font: {
                              size:
                                12,
                            },
                          },

                          showgrid:
                            true,

                          gridcolor:
                            "#edf0f5",

                          zeroline:
                            false,

                          tickfont: {
                            size:
                              11,
                          },
                        },

                        yaxis: {
                          title: {
                            text:
                              "Emotion count",

                            font: {
                              size:
                                12,
                            },
                          },

                          showgrid:
                            true,

                          gridcolor:
                            "#edf0f5",

                          zeroline:
                            false,

                          tickfont: {
                            size:
                              11,
                          },

                          rangemode:
                            "tozero",
                        },
                      }}
                      config={{
                        responsive:
                          true,

                        displaylogo:
                          false,

                        displayModeBar:
                          false,
                      }}
                      useResizeHandler
                      style={{
                        width:
                          "100%",

                        height:
                          "100%",
                      }}
                    />
                  ) : (
                    <div className="zen-session-chart-state">
                      <BarChart3 />

                      <strong>
                        No timeline data
                      </strong>

                      <span>
                        No emotional timeline data is available for this session.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionHisPage;