import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import Plot from "react-plotly.js";

import {
  Activity,
  AlertCircle,
  BarChart3,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Clock3,
  History,
  Home,
  Info,
  Layers3,
  LineChart,
  LogOut,
  Menu,
  RefreshCcw,
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

import "./OverallHispage.css";

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

const DailyWeeklyPage = () => {
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
    dailyData,
    setDailyData,
  ] = useState([]);

  const [
    weeklyData,
    setWeeklyData,
  ] = useState([]);

  const [
    selectedDay,
    setSelectedDay,
  ] = useState(null);

  const [
    selectedWeek,
    setSelectedWeek,
  ] = useState(null);

  const [
    view,
    setView,
  ] = useState("daily");

  const [
    recommendation,
    setRecommendation,
  ] = useState("");

  const [
    dailyLoading,
    setDailyLoading,
  ] = useState(false);

  const [
    weeklyLoading,
    setWeeklyLoading,
  ] = useState(false);

  const [
    recommendationLoading,
    setRecommendationLoading,
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
     FETCH DAILY
  ====================================================== */

  const fetchDailyData =
    async () => {
      setDailyLoading(
        true
      );

      setErrorMessage(
        ""
      );

      try {
        const response =
          await fetch(
            `${API_BASE_URL}/daily-emotion-timeline`
          );

        if (
          !response.ok
        ) {
          throw new Error(
            `Daily data request failed with status ${response.status}`
          );
        }

        const data =
          await response.json();

        setDailyData(
          Array.isArray(
            data
          )
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Error fetching daily data:",
          error
        );

        setDailyData([]);

        if (
          error instanceof
          TypeError
        ) {
          setErrorMessage(
            "Unable to connect to the ZenLens server at 127.0.0.1:5000. Make sure python app.py is still running."
          );
        } else {
          setErrorMessage(
            error.message ||
              "Unable to load daily insight data."
          );
        }
      } finally {
        setDailyLoading(
          false
        );
      }
    };

  /* ======================================================
     FETCH WEEKLY
  ====================================================== */

  const fetchWeeklyData =
    async () => {
      setWeeklyLoading(
        true
      );

      setErrorMessage(
        ""
      );

      try {
        const response =
          await fetch(
            `${API_BASE_URL}/weekly-emotion-timeline`
          );

        if (
          !response.ok
        ) {
          throw new Error(
            `Weekly data request failed with status ${response.status}`
          );
        }

        const data =
          await response.json();

        setWeeklyData(
          Array.isArray(
            data
          )
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Error fetching weekly data:",
          error
        );

        setWeeklyData([]);

        if (
          error instanceof
          TypeError
        ) {
          setErrorMessage(
            "Unable to connect to the ZenLens server at 127.0.0.1:5000. Make sure python app.py is still running."
          );
        } else {
          setErrorMessage(
            error.message ||
              "Unable to load weekly insight data."
          );
        }
      } finally {
        setWeeklyLoading(
          false
        );
      }
    };

  /* ======================================================
     WEEKLY RECOMMENDATION
  ====================================================== */

  const fetchRecommendation =
    async () => {
      if (
        !selectedWeek
      ) {
        setRecommendation(
          ""
        );

        return;
      }

      setRecommendationLoading(
        true
      );

      try {
        const response =
          await fetch(
            `${API_BASE_URL}/get-weekly-recommendation`
          );

        if (
          !response.ok
        ) {
          throw new Error(
            `Recommendation request failed with status ${response.status}`
          );
        }

        const data =
          await response.json();

        if (
          !Array.isArray(
            data
          )
        ) {
          setRecommendation(
            "No recommendation is available for this week."
          );

          return;
        }

        const selectedWeekData =
          data.find(
            (entry) =>
              entry.week ===
              selectedWeek.week
          );

        if (
          selectedWeekData &&
          selectedWeekData.openai_response
        ) {
          setRecommendation(
            selectedWeekData.openai_response
          );
        } else {
          setRecommendation(
            "No recommendation is available for this week."
          );
        }
      } catch (error) {
        console.error(
          "Error fetching recommendation:",
          error
        );

        if (
          error instanceof
          TypeError
        ) {
          setRecommendation(
            "ZenLens could not connect to the analysis server."
          );
        } else {
          setRecommendation(
            "The recommendation could not be loaded at this time."
          );
        }
      } finally {
        setRecommendationLoading(
          false
        );
      }
    };

  useEffect(() => {
    fetchDailyData();
    fetchWeeklyData();
  }, []);

  useEffect(() => {
    if (
      selectedWeek
    ) {
      fetchRecommendation();
    }
  }, [selectedWeek]);

  /* ======================================================
     PLOT DATA
  ====================================================== */

  const processDailyDataForPlotly = (
    dayData
  ) => {
    const sortedEntries =
      [
        ...(dayData?.entries ||
          []),
      ]
        .map(
          (entry) => ({
            ...entry,

            timestamp:
              new Date(
                entry.timestamp
              ),
          })
        )
        .sort(
          (a, b) =>
            a.timestamp -
            b.timestamp
        );

    const emotionLabels =
      [
        ...new Set(
          sortedEntries.flatMap(
            (entry) =>
              Object.keys(
                entry.emotion_counts ||
                  {}
              )
          )
        ),
      ];

    return emotionLabels.map(
      (emotion) => ({
        x: sortedEntries.map(
          (entry) =>
            entry.timestamp
        ),

        y: sortedEntries.map(
          (entry) =>
            entry
              .emotion_counts?.[
              emotion
            ] ?? null
        ),

        type: "scatter",

        mode: "lines",

        name:
          emotion
            .charAt(0)
            .toUpperCase() +
          emotion.slice(1),

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

  const processWeeklyDataForPlotly = (
    weekData
  ) => {
    const sortedEntries =
      [
        ...(weekData?.entries ||
          []),
      ].sort(
        (a, b) =>
          new Date(
            a.timestamp
          ) -
          new Date(
            b.timestamp
          )
      );

    const emotionLabels =
      [
        ...new Set(
          sortedEntries.flatMap(
            (entry) =>
              Object.keys(
                entry.emotion_counts ||
                  {}
              )
          )
        ),
      ];

    return emotionLabels.map(
      (emotion) => ({
        x: sortedEntries.map(
          (entry) =>
            entry.timestamp
        ),

        y: sortedEntries.map(
          (entry) =>
            entry
              .emotion_counts?.[
              emotion
            ] ?? null
        ),

        type: "scatter",

        mode: "lines",

        name:
          emotion
            .charAt(0)
            .toUpperCase() +
          emotion.slice(1),

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

  /* ======================================================
     VIEW
  ====================================================== */

  const handleViewChange = (
    nextView
  ) => {
    setView(
      nextView
    );

    setSelectedDay(
      null
    );

    setSelectedWeek(
      null
    );

    setRecommendation(
      ""
    );
  };

  const toggleDaySelection = (
    day
  ) => {
    setSelectedWeek(
      null
    );

    setRecommendation(
      ""
    );

    setSelectedDay(
      (current) =>
        current?.date ===
        day.date
          ? null
          : day
    );
  };

  const toggleWeekSelection = (
    week
  ) => {
    setSelectedDay(
      null
    );

    setSelectedWeek(
      (current) => {
        if (
          current?.week ===
          week.week
        ) {
          setRecommendation(
            ""
          );

          return null;
        }

        return week;
      }
    );
  };

  const closeInfoCard =
    () => {
      setSelectedDay(
        null
      );

      setSelectedWeek(
        null
      );

      setRecommendation(
        ""
      );
    };

  const selectedData =
    selectedDay ||
    selectedWeek;

  const selectedTraces =
    useMemo(() => {
      if (
        selectedDay
      ) {
        return processDailyDataForPlotly(
          selectedDay
        );
      }

      if (
        selectedWeek
      ) {
        return processWeeklyDataForPlotly(
          selectedWeek
        );
      }

      return [];
    }, [
      selectedDay,
      selectedWeek,
    ]);

  const currentData =
    view === "daily"
      ? dailyData
      : weeklyData;

  const currentLoading =
    view === "daily"
      ? dailyLoading
      : weeklyLoading;

  const entryCount =
    currentData.length;

  const totalTimelinePoints =
    useMemo(() => {
      return currentData.reduce(
        (
          total,
          item
        ) =>
          total +
          (item.entries
            ?.length ||
            0),
        0
      );
    }, [
      currentData,
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
      "--overall-glow-x",
      `${
        event.clientX -
        rect.left
      }px`
    );

    element.style.setProperty(
      "--overall-glow-y",
      `${
        event.clientY -
        rect.top
      }px`
    );

    element.style.setProperty(
      "--overall-glow-opacity",
      "1"
    );
  };

  const handleGlowLeave = (
    event
  ) => {
    event.currentTarget.style.setProperty(
      "--overall-glow-opacity",
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
     CHART
  ====================================================== */

  const chartLayout = {
    autosize: true,

    margin: {
      l: 62,
      r: 24,
      t: 24,
      b: 68,
    },

    paper_bgcolor:
      "rgba(255,255,255,0)",

    plot_bgcolor:
      "rgba(255,255,255,0)",

    font: {
      family:
        "Inter, sans-serif",

      color:
        "#68758a",

      size: 12,
    },

    hovermode:
      "x unified",

    showlegend:
      true,

    legend: {
      orientation:
        "h",

      x: 0,

      y: -0.25,

      font: {
        size: 11,
      },
    },

    xaxis: {
      title: {
        text:
          "Time",

        font: {
          size: 12,
        },
      },

      showgrid:
        true,

      gridcolor:
        "#edf0f5",

      zeroline:
        false,

      tickfont: {
        size: 11,
      },
    },

    yaxis: {
      title: {
        text:
          "Emotion count",

        font: {
          size: 12,
        },
      },

      showgrid:
        true,

      gridcolor:
        "#edf0f5",

      zeroline:
        false,

      rangemode:
        "tozero",

      tickfont: {
        size: 11,
      },
    },
  };

  return (
    <div className="zen-overall-page">
      {/* ===============================================
          SIDEBAR
      =============================================== */}

      <aside className="zen-overall-sidebar">
        <div className="zen-overall-sidebar-inner">
          <button
            type="button"
            className="zen-overall-brand"
            onClick={() =>
              goTo(
                "/home"
              )
            }
          >
            <span className="zen-overall-brand-mark">
              <img
                src={
                  zenlensLogo
                }
                alt="ZenLens"
              />
            </span>

            <span className="zen-overall-brand-copy">
              <strong>
                ZenLens
              </strong>

              <small>
                Classroom Stress Analytics
              </small>
            </span>
          </button>

          <div className="zen-overall-nav-scroll">
            <p className="zen-overall-nav-label">
              Workspace
            </p>

            <nav className="zen-overall-navigation">
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
                      className={`zen-overall-nav-item ${
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
                      <span className="zen-overall-nav-icon">
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

            <div className="zen-overall-nav-divider" />

            <p className="zen-overall-nav-label">
              Support
            </p>

            <nav className="zen-overall-navigation">
              {supportNavigation.map(
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
                      className={`zen-overall-nav-item ${
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
                      <span className="zen-overall-nav-icon">
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

          <div className="zen-overall-sidebar-bottom">
            <div className="zen-overall-user">
              <span className="zen-overall-user-avatar">
                {
                  initials
                }
              </span>

              <div className="zen-overall-user-copy">
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
              className="zen-overall-signout"
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

      {/* ===============================================
          MOBILE
      =============================================== */}

      <header className="zen-overall-mobile-header">
        <button
          type="button"
          className="zen-overall-mobile-brand"
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
          className="zen-overall-mobile-toggle"
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
        <div className="zen-overall-mobile-drawer">
          <div className="zen-overall-mobile-user">
            <span className="zen-overall-user-avatar">
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

      {/* ===============================================
          MAIN
      =============================================== */}

      <main className="zen-overall-main">
        <div className="zen-overall-orb orb-one" />

        <div className="zen-overall-orb orb-two" />

        <div className="zen-overall-main-content">
          {/* =============================================
              INTRO
          ============================================= */}

          <section className="zen-overall-intro">
            <div className="zen-overall-intro-copy">
              <span className="zen-overall-eyebrow">
                <Sparkles />

                ZenLens historical insights
              </span>

              <p className="zen-overall-overline">
                Daily and weekly classroom patterns
              </p>

              <h1>
                Overall
                <span>
                  {" "}
                  Insights
                </span>
              </h1>

              <p className="zen-overall-description">
                Compare emotional observations across days and weeks to review broader classroom patterns beyond a single analysis session.
              </p>
            </div>

            <div className="zen-overall-overview">
              <article>
                <span className="zen-overall-overview-icon">
                  {view ===
                  "daily" ? (
                    <CalendarDays />
                  ) : (
                    <Layers3 />
                  )}
                </span>

                <div>
                  <span>
                    Current view
                  </span>

                  <strong>
                    {view ===
                    "daily"
                      ? "Daily"
                      : "Weekly"}
                  </strong>

                  <small>
                    Insight level
                  </small>
                </div>
              </article>

              <article>
                <span className="zen-overall-overview-icon">
                  <BarChart3 />
                </span>

                <div>
                  <span>
                    Periods
                  </span>

                  <strong>
                    {
                      entryCount
                    }
                  </strong>

                  <small>
                    Available results
                  </small>
                </div>
              </article>

              <article>
                <span className="zen-overall-overview-icon">
                  <LineChart />
                </span>

                <div>
                  <span>
                    Observations
                  </span>

                  <strong>
                    {
                      totalTimelinePoints
                    }
                  </strong>

                  <small>
                    Timeline entries
                  </small>
                </div>
              </article>
            </div>
          </section>

          {/* =============================================
              VIEW SWITCH
          ============================================= */}

          <section
            className="zen-overall-toolbar zen-overall-glow-card"
            {...glowProps}
          >
            <span className="zen-overall-card-glow" />

            <div className="zen-overall-card-layer toolbar">
              <div className="zen-overall-view-switch">
                <button
                  type="button"
                  className={
                    view ===
                    "daily"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    handleViewChange(
                      "daily"
                    )
                  }
                >
                  <CalendarDays />

                  <div>
                    <strong>
                      Daily
                    </strong>

                    <span>
                      Day-by-day patterns
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  className={
                    view ===
                    "weekly"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    handleViewChange(
                      "weekly"
                    )
                  }
                >
                  <Layers3 />

                  <div>
                    <strong>
                      Weekly
                    </strong>

                    <span>
                      Broader weekly patterns
                    </span>
                  </div>
                </button>
              </div>

              <div className="zen-overall-toolbar-note">
                <span className="zen-overall-toolbar-note-icon">
                  <LineChart />
                </span>

                <p>
                  <span>
                    CURRENTLY VIEWING
                  </span>

                  <strong>
                    {view ===
                    "daily"
                      ? "Daily emotion history"
                      : "Weekly emotion history"}
                  </strong>
                </p>
              </div>
            </div>
          </section>

          {/* =============================================
              ERROR
          ============================================= */}

          {errorMessage && (
            <div className="zen-overall-error">
              <AlertCircle />

              <span>
                {
                  errorMessage
                }
              </span>

              <button
                type="button"
                onClick={() => {
                  fetchDailyData();
                  fetchWeeklyData();
                }}
              >
                <RefreshCcw />

                <span>
                  Try again
                </span>
              </button>
            </div>
          )}

          {/* =============================================
              PERIODS
          ============================================= */}

          <section className="zen-overall-content">
            <div className="zen-overall-content-head">
              <div>
                <span>
                  {view ===
                  "daily"
                    ? "DAILY INSIGHTS"
                    : "WEEKLY INSIGHTS"}
                </span>

                <h2>
                  {view ===
                  "daily"
                    ? "Classroom patterns by day"
                    : "Classroom patterns by week"}
                </h2>
              </div>

              <p>
                {view ===
                "daily"
                  ? "Select a day to inspect how emotion counts changed throughout that period."
                  : "Select a week to inspect the emotional timeline and review its associated recommendation."}
              </p>
            </div>

            {currentLoading ? (
              <div className="zen-overall-loading">
                <div className="zen-overall-loading-spinner" />

                <strong>
                  Loading insights
                </strong>

                <span>
                  Retrieving ZenLens timeline data.
                </span>
              </div>
            ) : currentData.length >
              0 ? (
              <div className="zen-overall-period-grid">
                {view ===
                "daily"
                  ? dailyData.map(
                      (
                        day,
                        index
                      ) => (
                        <button
                          type="button"
                          className="zen-overall-period-card zen-overall-glow-card"
                          key={
                            day.date ||
                            index
                          }
                          onClick={() =>
                            toggleDaySelection(
                              day
                            )
                          }
                          {...glowProps}
                        >
                          <span className="zen-overall-card-glow" />

                          <div className="zen-overall-card-layer period">
                            <div className="zen-overall-period-top">
                              <span className="zen-overall-period-icon">
                                <CalendarDays />
                              </span>

                              <span>
                                DAILY
                              </span>
                            </div>

                            <div className="zen-overall-period-copy">
                              <span>
                                DATE
                              </span>

                              <h3>
                                {day.date ||
                                  "Unknown date"}
                              </h3>

                              <p>
                                {day.entries
                                  ?.length ||
                                  0}{" "}
                                timeline{" "}
                                {(day.entries
                                  ?.length ||
                                  0) ===
                                1
                                  ? "entry"
                                  : "entries"}
                              </p>
                            </div>

                            <div className="zen-overall-period-footer">
                              <span>
                                View daily details
                              </span>

                              <ChevronRight />
                            </div>
                          </div>
                        </button>
                      )
                    )
                  : weeklyData.map(
                      (
                        week,
                        index
                      ) => (
                        <button
                          type="button"
                          className="zen-overall-period-card zen-overall-glow-card"
                          key={
                            week.week ||
                            index
                          }
                          onClick={() =>
                            toggleWeekSelection(
                              week
                            )
                          }
                          {...glowProps}
                        >
                          <span className="zen-overall-card-glow" />

                          <div className="zen-overall-card-layer period">
                            <div className="zen-overall-period-top">
                              <span className="zen-overall-period-icon">
                                <Layers3 />
                              </span>

                              <span>
                                WEEKLY
                              </span>
                            </div>

                            <div className="zen-overall-period-copy">
                              <span>
                                WEEK
                              </span>

                              <h3>
                                {week.week ||
                                  "Unknown week"}
                              </h3>

                              <p>
                                {week.entries
                                  ?.length ||
                                  0}{" "}
                                timeline{" "}
                                {(week.entries
                                  ?.length ||
                                  0) ===
                                1
                                  ? "entry"
                                  : "entries"}
                              </p>
                            </div>

                            <div className="zen-overall-period-footer">
                              <span>
                                View weekly details
                              </span>

                              <ChevronRight />
                            </div>
                          </div>
                        </button>
                      )
                    )}
              </div>
            ) : (
              <div className="zen-overall-empty">
                <div className="zen-overall-empty-icon">
                  <BarChart3 />
                </div>

                <span>
                  NO INSIGHT DATA
                </span>

                <h3>
                  No {view} results are available yet.
                </h3>

                <p>
                  ZenLens will display historical patterns here once classroom session data is available.
                </p>
              </div>
            )}
          </section>

          {/* =============================================
              NOTE
          ============================================= */}

          <section className="zen-overall-note">
            <div className="zen-overall-note-icon">
              <ShieldCheck />
            </div>

            <div>
              <span>
                LONGITUDINAL REVIEW
              </span>

              <h2>
                Patterns across time can add context to individual sessions.
              </h2>
            </div>

            <p>
              Daily and weekly insights are intended to support broader classroom interpretation while keeping the individual session observations available for review.
            </p>
          </section>
        </div>
      </main>

      {/* ===============================================
          DETAIL MODAL
      =============================================== */}

      {selectedData && (
        <div
          className="zen-overall-overlay"
          onMouseDown={
            closeInfoCard
          }
        >
          <div
            className="zen-overall-modal"
            onMouseDown={(
              event
            ) =>
              event.stopPropagation()
            }
          >
            <div className="zen-overall-modal-head">
              <div>
                <span>
                  {selectedDay
                    ? "DAILY DETAILS"
                    : "WEEKLY DETAILS"}
                </span>

                <h2>
                  {selectedDay
                    ? selectedDay.date
                    : selectedWeek?.week}
                </h2>

                <p>
                  {selectedDay
                    ? "Review emotional changes recorded across this day."
                    : "Review the week's emotional pattern and recommendation."}
                </p>
              </div>

              <button
                type="button"
                className="zen-overall-modal-close"
                onClick={
                  closeInfoCard
                }
                aria-label="Close insight details"
              >
                <X />
              </button>
            </div>

            <div className="zen-overall-modal-body">
              <aside className="zen-overall-modal-info">
                <div className="zen-overall-modal-info-heading">
                  <span>
                    PERIOD SUMMARY
                  </span>

                  <h3>
                    {selectedDay
                      ? "Daily insight"
                      : "Weekly insight"}
                  </h3>
                </div>

                <div className="zen-overall-modal-stat-list">
                  <div>
                    {selectedDay ? (
                      <CalendarDays />
                    ) : (
                      <Layers3 />
                    )}

                    <p>
                      <span>
                        {selectedDay
                          ? "Date"
                          : "Week"}
                      </span>

                      <strong>
                        {selectedDay
                          ? selectedDay.date
                          : selectedWeek?.week}
                      </strong>
                    </p>
                  </div>

                  <div>
                    <Clock3 />

                    <p>
                      <span>
                        Timeline entries
                      </span>

                      <strong>
                        {selectedData
                          ?.entries
                          ?.length ||
                          0}
                      </strong>
                    </p>
                  </div>

                  <div>
                    <BarChart3 />

                    <p>
                      <span>
                        Emotion groups
                      </span>

                      <strong>
                        {
                          selectedTraces.length
                        }
                      </strong>
                    </p>
                  </div>
                </div>

                {selectedWeek && (
                  <div className="zen-overall-recommendation">
                    <div className="zen-overall-recommendation-heading">
                      <span className="zen-overall-recommendation-icon">
                        <Sparkles />
                      </span>

                      <div>
                        <span>
                          WEEKLY RECOMMENDATION
                        </span>

                        <strong>
                          ZenLens insight
                        </strong>
                      </div>
                    </div>

                    {recommendationLoading ? (
                      <div className="zen-overall-recommendation-loading">
                        <div className="zen-overall-mini-spinner" />

                        <span>
                          Loading recommendation
                        </span>
                      </div>
                    ) : (
                      <p>
                        {recommendation ||
                          "No recommendation is available for this week."}
                      </p>
                    )}
                  </div>
                )}
              </aside>

              <section className="zen-overall-chart-panel">
                <div className="zen-overall-chart-head">
                  <div>
                    <span>
                      EMOTION TIMELINE
                    </span>

                    <h3>
                      Emotional patterns over time
                    </h3>
                  </div>

                  <p>
                    Each line represents one detected emotion category across the selected period.
                  </p>
                </div>

                <div className="zen-overall-chart">
                  {selectedTraces.length >
                  0 ? (
                    <Plot
                      data={
                        selectedTraces
                      }
                      layout={
                        chartLayout
                      }
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
                    <div className="zen-overall-chart-empty">
                      <LineChart />

                      <strong>
                        No timeline data
                      </strong>

                      <span>
                        No emotional timeline data is available for this period.
                      </span>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyWeeklyPage;