import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

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
  Layers3,
  LogOut,
  Menu,
  RefreshCcw,
  ScanFace,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
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

import "./Historypage.css";

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

const HistoryPage = () => {
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
    viewOption,
    setViewOption,
  ] = useState(
    "individual"
  );

  const [
    history,
    setHistory,
  ] = useState([]);

  const [
    weeklyResults,
    setWeeklyResults,
  ] = useState([]);

  const [
    filters,
    setFilters,
  ] = useState({
    subject: "",
    teacher: "",
    weather: "",
    stress_category: "",
  });

  const [
    sortOrder,
    setSortOrder,
  ] = useState(
    "latest"
  );

  const [
    showFilters,
    setShowFilters,
  ] = useState(false);

  const [
    isLoading,
    setIsLoading,
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
              firstName:
                "",
              lastName:
                "",
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
     DATA
  ====================================================== */

  const fetchHistory =
    async (
      option,
      activeFilters,
      activeSortOrder
    ) => {
      const endpoint =
        option ===
        "individual"
          ? `${API_BASE_URL}/history`
          : `${API_BASE_URL}/combined-results`;

      setIsLoading(
        true
      );

      setErrorMessage(
        ""
      );

      try {
        const response =
          await axios.get(
            endpoint,
            {
              params: {
                ...activeFilters,

                sort_order:
                  activeSortOrder,
              },
            }
          );

        if (
          option ===
          "individual"
        ) {
          setHistory(
            Array.isArray(
              response.data
            )
              ? response.data
              : []
          );
        } else {
          setWeeklyResults(
            Array.isArray(
              response.data
            )
              ? response.data
              : []
          );
        }
      } catch (error) {
        console.error(
          "Error fetching history:",
          error
        );

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
              "Unable to load analysis history."
          );
        }
      } finally {
        setIsLoading(
          false
        );
      }
    };

  useEffect(() => {
    fetchHistory(
      viewOption,
      filters,
      sortOrder
    );
  }, [
    viewOption,
    filters,
    sortOrder,
  ]);

  /* ======================================================
     CONTROLS
  ====================================================== */

  const handleViewChange = (
    option
  ) => {
    setViewOption(
      option
    );

    setFilters({
      subject: "",
      teacher: "",
      weather: "",
      stress_category:
        "",
    });
  };

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
        [name]:
          value,
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

  const toggleFilters =
    () => {
      setShowFilters(
        (
          current
        ) =>
          !current
      );
    };

  const clearFilters =
    () => {
      setFilters({
        subject: "",
        teacher: "",
        weather: "",
        stress_category:
          "",
      });

      setSortOrder(
        "latest"
      );
    };

  const activeFilterCount =
    useMemo(() => {
      return Object.values(
        filters
      ).filter((value) =>
        String(
          value
        ).trim()
      ).length;
    }, [filters]);

  const currentResultCount =
    viewOption ===
    "individual"
      ? history.length
      : weeklyResults.length;

  /* ======================================================
     STRESS CATEGORY
  ====================================================== */

  const getStressClass = (
    category = ""
  ) => {
    const normalized =
      String(
        category
      ).toLowerCase();

    if (
      normalized.includes(
        "extremely"
      )
    ) {
      return "extreme";
    }

    if (
      normalized.includes(
        "severe"
      )
    ) {
      return "severe";
    }

    if (
      normalized.includes(
        "moderate"
      )
    ) {
      return "moderate";
    }

    if (
      normalized.includes(
        "mild"
      )
    ) {
      return "mild";
    }

    if (
      normalized.includes(
        "normal"
      )
    ) {
      return "normal";
    }

    return "";
  };

  const averageCombinedStress =
    useMemo(() => {
      if (
        !weeklyResults.length
      ) {
        return 0;
      }

      const validValues =
        weeklyResults
          .map((item) =>
            Number(
              item.average_stress
            )
          )
          .filter(
            (value) =>
              Number.isFinite(
                value
              )
          );

      if (
        !validValues.length
      ) {
        return 0;
      }

      return (
        validValues.reduce(
          (
            total,
            value
          ) =>
            total +
            value,
          0
        ) /
        validValues.length
      );
    }, [
      weeklyResults,
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
      "--history-glow-x",
      `${
        event.clientX -
        rect.left
      }px`
    );

    element.style.setProperty(
      "--history-glow-y",
      `${
        event.clientY -
        rect.top
      }px`
    );

    element.style.setProperty(
      "--history-glow-opacity",
      "1"
    );
  };

  const handleGlowLeave = (
    event
  ) => {
    event.currentTarget.style.setProperty(
      "--history-glow-opacity",
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
     UI
  ====================================================== */

  return (
    <div className="zen-history-page">
      {/* ===============================================
          SIDEBAR
      =============================================== */}

      <aside className="zen-history-sidebar">
        <div className="zen-history-sidebar-inner">
          <button
            type="button"
            className="zen-history-brand"
            onClick={() =>
              goTo(
                "/home"
              )
            }
          >
            <span className="zen-history-brand-mark">
              <img
                src={
                  zenlensLogo
                }
                alt="ZenLens"
              />
            </span>

            <span className="zen-history-brand-copy">
              <strong>
                ZenLens
              </strong>

              <small>
                Classroom Stress Analytics
              </small>
            </span>
          </button>

          <div className="zen-history-nav-scroll">
            <p className="zen-history-nav-label">
              Workspace
            </p>

            <nav className="zen-history-navigation">
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
                      className={`zen-history-nav-item ${
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
                      <span className="zen-history-nav-icon">
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

            <div className="zen-history-nav-divider" />

            <p className="zen-history-nav-label">
              Support
            </p>

            <nav className="zen-history-navigation">
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
                      className={`zen-history-nav-item ${
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
                      <span className="zen-history-nav-icon">
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

          <div className="zen-history-sidebar-bottom">
            <div className="zen-history-user">
              <span className="zen-history-user-avatar">
                {
                  initials
                }
              </span>

              <div className="zen-history-user-copy">
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
              className="zen-history-signout"
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
          MOBILE HEADER
      =============================================== */}

      <header className="zen-history-mobile-header">
        <button
          type="button"
          className="zen-history-mobile-brand"
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
          className="zen-history-mobile-toggle"
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
        <div className="zen-history-mobile-drawer">
          <div className="zen-history-mobile-user">
            <span className="zen-history-user-avatar">
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

      <main className="zen-history-main">
        <div className="zen-history-orb orb-one" />

        <div className="zen-history-orb orb-two" />

        <div className="zen-history-main-content">
          {/* =============================================
              HERO
          ============================================= */}

          <section className="zen-history-intro">
            <div className="zen-history-intro-copy">
              <span className="zen-history-eyebrow">
                <Sparkles />

                ZenLens stress archive
              </span>

              <p className="zen-history-overline">
                Historical classroom stress review
              </p>

              <h1>
                Stress
                <span>
                  {" "}
                  History
                </span>
              </h1>

              <p className="zen-history-description">
                Revisit individual classroom sessions or examine combined stress results across multiple sessions and monitoring periods.
              </p>
            </div>

            <div className="zen-history-overview">
              <div>
                <span className="zen-history-overview-icon">
                  {viewOption ===
                  "individual" ? (
                    <History />
                  ) : (
                    <Layers3 />
                  )}
                </span>

                <p>
                  <span>
                    Current view
                  </span>

                  <strong>
                    {viewOption ===
                    "individual"
                      ? "Individual"
                      : "Combined"}
                  </strong>

                  <small>
                    {viewOption ===
                    "individual"
                      ? "Classroom sessions"
                      : "Aggregated results"}
                  </small>
                </p>
              </div>

              <div>
                <span className="zen-history-overview-icon">
                  <BarChart3 />
                </span>

                <p>
                  <span>
                    Results
                  </span>

                  <strong>
                    {
                      currentResultCount
                    }
                  </strong>

                  <small>
                    Current result set
                  </small>
                </p>
              </div>

              <div>
                <span className="zen-history-overview-icon">
                  <Filter />
                </span>

                <p>
                  <span>
                    Filters
                  </span>

                  <strong>
                    {
                      activeFilterCount
                    }
                  </strong>

                  <small>
                    Active selections
                  </small>
                </p>
              </div>
            </div>
          </section>

          {/* =============================================
              TOOLBAR
          ============================================= */}

          <section
            className="zen-history-toolbar zen-history-glow-card"
            {...glowProps}
          >
            <span className="zen-history-card-glow" />

            <div className="zen-history-card-layer toolbar">
              <div className="zen-history-view-switch">
                <button
                  type="button"
                  className={
                    viewOption ===
                    "individual"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    handleViewChange(
                      "individual"
                    )
                  }
                >
                  <History />

                  <span>
                    Individual sessions
                  </span>
                </button>

                <button
                  type="button"
                  className={
                    viewOption ===
                    "combined"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    handleViewChange(
                      "combined"
                    )
                  }
                >
                  <Layers3 />

                  <span>
                    Combined results
                  </span>
                </button>
              </div>

              <div className="zen-history-toolbar-actions">
                <div className="zen-history-sort-control">
                  <SlidersHorizontal />

                  <select
                    value={
                      sortOrder
                    }
                    onChange={
                      handleSortChange
                    }
                    aria-label="Sort history"
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

                <button
                  type="button"
                  className={`zen-history-filter-toggle ${
                    showFilters
                      ? "active"
                      : ""
                  }`}
                  onClick={
                    toggleFilters
                  }
                >
                  <Filter />

                  <span>
                    Filters
                  </span>

                  {activeFilterCount >
                    0 && (
                    <strong>
                      {
                        activeFilterCount
                      }
                    </strong>
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* =============================================
              FILTERS
          ============================================= */}

          {showFilters && (
            <section className="zen-history-filter-panel">
              <div className="zen-history-filter-panel-head">
                <div>
                  <span>
                    FILTER HISTORY
                  </span>

                  <h2>
                    Narrow down the results
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={
                    toggleFilters
                  }
                  aria-label="Close filters"
                >
                  <X />
                </button>
              </div>

              <div className="zen-history-filter-grid">
                {viewOption ===
                "individual" ? (
                  <>
                    <div className="zen-history-filter-field">
                      <label htmlFor="history-subject">
                        Subject
                      </label>

                      <div className="zen-history-filter-input">
                        <Search />

                        <input
                          id="history-subject"
                          type="text"
                          name="subject"
                          value={
                            filters.subject
                          }
                          onChange={
                            handleFilterChange
                          }
                          placeholder="Search subject"
                        />
                      </div>
                    </div>

                    <div className="zen-history-filter-field">
                      <label htmlFor="history-teacher">
                        Teacher
                      </label>

                      <div className="zen-history-filter-input">
                        <UserRound />

                        <input
                          id="history-teacher"
                          type="text"
                          name="teacher"
                          value={
                            filters.teacher
                          }
                          onChange={
                            handleFilterChange
                          }
                          placeholder="Search teacher"
                        />
                      </div>
                    </div>

                    <div className="zen-history-filter-field">
                      <label htmlFor="history-weather">
                        Weather
                      </label>

                      <div className="zen-history-filter-input">
                        <Cloud />

                        <input
                          id="history-weather"
                          type="text"
                          name="weather"
                          value={
                            filters.weather
                          }
                          onChange={
                            handleFilterChange
                          }
                          placeholder="Search weather"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="zen-history-filter-field">
                    <label htmlFor="history-stress-category">
                      Stress category
                    </label>

                    <div className="zen-history-filter-select">
                      <BarChart3 />

                      <select
                        id="history-stress-category"
                        name="stress_category"
                        value={
                          filters.stress_category
                        }
                        onChange={
                          handleFilterChange
                        }
                      >
                        <option value="">
                          All categories
                        </option>

                        <option value="Normal">
                          Normal
                        </option>

                        <option value="Mild">
                          Mild
                        </option>

                        <option value="Moderate">
                          Moderate
                        </option>

                        <option value="Severe">
                          Severe
                        </option>

                        <option value="Extremely Severe">
                          Extremely Severe
                        </option>
                      </select>

                      <ChevronDown />
                    </div>
                  </div>
                )}
              </div>

              <div className="zen-history-filter-footer">
                <div>
                  <span className="zen-history-filter-info-icon">
                    <Filter />
                  </span>

                  <p>
                    Results update automatically whenever a filter or sort option changes.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                >
                  <RefreshCcw />

                  <span>
                    Reset filters
                  </span>
                </button>
              </div>
            </section>
          )}

          {/* =============================================
              ERROR
          ============================================= */}

          {errorMessage && (
            <div className="zen-history-error">
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
                    viewOption,
                    filters,
                    sortOrder
                  )
                }
              >
                Try again
              </button>
            </div>
          )}

          {/* =============================================
              CONTENT HEADER
          ============================================= */}

          <section className="zen-history-content">
            <div className="zen-history-content-head">
              <div>
                <span>
                  {viewOption ===
                  "individual"
                    ? "INDIVIDUAL HISTORY"
                    : "COMBINED HISTORY"}
                </span>

                <h2>
                  {viewOption ===
                  "individual"
                    ? "Classroom stress sessions"
                    : "Combined stress results"}
                </h2>
              </div>

              <p>
                {viewOption ===
                "individual"
                  ? "Review the classroom context recorded for each completed session."
                  : "Review aggregated stress results and the ZenLens response associated with each saved period."}
              </p>
            </div>

            {/* ===========================================
                LOADING
            =========================================== */}

            {isLoading ? (
              <div className="zen-history-loading">
                <div className="zen-history-loading-icon">
                  <RefreshCcw />
                </div>

                <strong>
                  Loading stress history
                </strong>

                <span>
                  Retrieving saved ZenLens results.
                </span>
              </div>
            ) : (
              <>
                {/* =======================================
                    INDIVIDUAL
                ======================================= */}

                {viewOption ===
                  "individual" &&
                  history.length >
                    0 && (
                    <div className="zen-history-session-grid">
                      {history.map(
                        (
                          entry,
                          index
                        ) => (
                          <article
                            className="zen-history-session-card zen-history-glow-card"
                            key={
                              entry.session_id ||
                              `${entry.subject}-${index}`
                            }
                            {...glowProps}
                          >
                            <span className="zen-history-card-glow" />

                            <div className="zen-history-card-layer session">
                              <div className="zen-history-session-top">
                                <div className="zen-history-session-icon">
                                  <History />
                                </div>

                                <span className="zen-history-session-id">
                                  SESSION{" "}
                                  {entry.session_id ||
                                    index +
                                      1}
                                </span>
                              </div>

                              <div className="zen-history-session-primary">
                                <span>
                                  SUBJECT
                                </span>

                                <h3>
                                  {entry.subject ||
                                    "Untitled session"}
                                </h3>

                                <p>
                                  {entry.session
                                    ? `Session ${entry.session}`
                                    : "Classroom analysis"}
                                </p>
                              </div>

                              <div className="zen-history-session-details">
                                <div>
                                  <CalendarDays />

                                  <p>
                                    <span>
                                      Date
                                    </span>

                                    <strong>
                                      {entry.date ||
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
                                      {entry.teacher ||
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
                                      {entry.weather ||
                                        "—"}
                                    </strong>
                                  </p>
                                </div>

                                <div>
                                  <Clock3 />

                                  <p>
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
                                  </p>
                                </div>
                              </div>
                            </div>
                          </article>
                        )
                      )}
                    </div>
                  )}

                {/* =======================================
                    COMBINED
                ======================================= */}

                {viewOption ===
                  "combined" &&
                  weeklyResults.length >
                    0 && (
                    <>
                      <section className="zen-history-combined-summary">
                        <article>
                          <span className="zen-history-summary-icon">
                            <Layers3 />
                          </span>

                          <div>
                            <span>
                              Saved periods
                            </span>

                            <strong>
                              {
                                weeklyResults.length
                              }
                            </strong>
                          </div>
                        </article>

                        <article>
                          <span className="zen-history-summary-icon">
                            <TrendingUp />
                          </span>

                          <div>
                            <span>
                              Average stress
                            </span>

                            <strong>
                              {averageCombinedStress.toFixed(
                                2
                              )}
                              %
                            </strong>
                          </div>
                        </article>

                        <article>
                          <span className="zen-history-summary-icon">
                            <Filter />
                          </span>

                          <div>
                            <span>
                              Active filters
                            </span>

                            <strong>
                              {
                                activeFilterCount
                              }
                            </strong>
                          </div>
                        </article>
                      </section>

                      <div className="zen-history-combined-list">
                        {weeklyResults.map(
                          (
                            result,
                            index
                          ) => (
                            <article
                              className="zen-history-combined-card zen-history-glow-card"
                              key={`${result.week}-${index}`}
                              {...glowProps}
                            >
                              <span className="zen-history-card-glow" />

                              <div className="zen-history-card-layer combined">
                                <div className="zen-history-combined-top">
                                  <div className="zen-history-combined-period">
                                    <span className="zen-history-combined-icon">
                                      <Layers3 />
                                    </span>

                                    <div>
                                      <span>
                                        MONITORING PERIOD
                                      </span>

                                      <h3>
                                        {result.week ||
                                          "Unspecified period"}
                                      </h3>
                                    </div>
                                  </div>

                                  <span
                                    className={`zen-history-stress-badge ${getStressClass(
                                      result.stress_category
                                    )}`}
                                  >
                                    {result.stress_category ||
                                      "Not categorized"}
                                  </span>
                                </div>

                                <div className="zen-history-combined-body">
                                  <div className="zen-history-combined-stats">
                                    <div>
                                      <span>
                                        Average stress
                                      </span>

                                      <strong>
                                        {Number.isFinite(
                                          Number(
                                            result.average_stress
                                          )
                                        )
                                          ? `${Number(
                                              result.average_stress
                                            ).toFixed(
                                              2
                                            )}%`
                                          : "—"}
                                      </strong>

                                      <small>
                                        Combined result
                                      </small>
                                    </div>

                                    <div>
                                      <span>
                                        Sessions
                                      </span>

                                      <strong>
                                        {result.sessions_count ??
                                          "—"}
                                      </strong>

                                      <small>
                                        Included analyses
                                      </small>
                                    </div>
                                  </div>

                                  <div className="zen-history-response">
                                    <span className="zen-history-response-icon">
                                      <Sparkles />
                                    </span>

                                    <div>
                                      <span>
                                        ZENLENS RESPONSE
                                      </span>

                                      <p>
                                        {result.openai_response ||
                                          "No response available for this period."}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </article>
                          )
                        )}
                      </div>
                    </>
                  )}

                {/* =======================================
                    EMPTY
                ======================================= */}

                {currentResultCount ===
                  0 && (
                  <div className="zen-history-empty">
                    <div className="zen-history-empty-icon">
                      <History />
                    </div>

                    <span>
                      NO RESULTS FOUND
                    </span>

                    <h3>
                      No stress history matches this view.
                    </h3>

                    <p>
                      Try changing the current filters or switch between individual and combined results.
                    </p>

                    {activeFilterCount >
                      0 && (
                      <button
                        type="button"
                        onClick={
                          clearFilters
                        }
                      >
                        <RefreshCcw />

                        <span>
                          Clear filters
                        </span>
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </section>

          {/* =============================================
              FOOT NOTE
          ============================================= */}

          <section className="zen-history-note">
            <div className="zen-history-note-icon">
              <ShieldCheck />
            </div>

            <div>
              <span>
                HISTORICAL CONTEXT
              </span>

              <h2>
                Stress history supports comparison across classroom sessions.
              </h2>
            </div>

            <p>
              Historical results are most useful when interpreted together with the classroom context and the individual session observations that contributed to them.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default HistoryPage;