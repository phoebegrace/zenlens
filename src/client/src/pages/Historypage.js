import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  Clock3,
  Cloud,
  Filter,
  History,
  Layers3,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

import ZenLensHeader from "../components/ZenLensHeader";

import "./Historypage.css";

const API_BASE_URL = "http://127.0.0.1:5000";

const HistoryPage = () => {
  const [viewOption, setViewOption] = useState("individual");

  const [history, setHistory] = useState([]);
  const [weeklyResults, setWeeklyResults] = useState([]);

  const [filters, setFilters] = useState({
    subject: "",
    teacher: "",
    weather: "",
    stress_category: "",
  });

  const [sortOrder, setSortOrder] = useState("latest");

  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchHistory = async (
    option,
    activeFilters,
    activeSortOrder
  ) => {
    const endpoint =
      option === "individual"
        ? `${API_BASE_URL}/history`
        : `${API_BASE_URL}/combined-results`;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.get(endpoint, {
        params: {
          ...activeFilters,
          sort_order: activeSortOrder,
        },
      });

      if (option === "individual") {
        setHistory(response.data || []);
      } else {
        setWeeklyResults(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching history:", error);

      if (error.response) {
        const serverMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          `The ZenLens server returned status ${error.response.status}.`;

        setErrorMessage(serverMessage);
      } else if (error.request) {
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
      setIsLoading(false);
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

  const handleViewChange = (option) => {
    setViewOption(option);

    setFilters({
      subject: "",
      teacher: "",
      weather: "",
      stress_category: "",
    });
  };

  const handleFilterChange = (event) => {
    const { name, value } =
      event.target;

    setFilters(
      (previousFilters) => ({
        ...previousFilters,
        [name]: value,
      })
    );
  };

  const handleSortChange = (event) => {
    setSortOrder(
      event.target.value
    );
  };

  const toggleFilters = () => {
    setShowFilters(
      (current) => !current
    );
  };

  const clearFilters = () => {
    setFilters({
      subject: "",
      teacher: "",
      weather: "",
      stress_category: "",
    });

    setSortOrder("latest");
  };

  const activeFilterCount =
    useMemo(() => {
      return Object.values(
        filters
      ).filter((value) =>
        String(value).trim()
      ).length;
    }, [filters]);

  const currentResultCount =
    viewOption === "individual"
      ? history.length
      : weeklyResults.length;

  const getStressClass = (
    category = ""
  ) => {
    const normalized =
      category.toLowerCase();

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

  return (
    <div className="zen-history-page">
      <ZenLensHeader />

      <main className="zen-history-main">
        <section className="zen-history-intro">
          <div className="zen-history-intro-copy">
            <div className="zen-history-eyebrow">
              <History />

              <span>
                Analysis history
              </span>
            </div>

            <h1>
              Review previous
              <span>
                classroom analyses.
              </span>
            </h1>

            <p>
              Revisit completed
              classroom sessions or
              examine combined stress
              results across multiple
              sessions.
            </p>
          </div>

          <div className="zen-history-overview">
            <div>
              <span>
                VIEWING
              </span>

              <strong>
                {viewOption ===
                "individual"
                  ? "Individual sessions"
                  : "Combined results"}
              </strong>
            </div>

            <div>
              <span>
                RESULTS
              </span>

              <strong>
                {
                  currentResultCount
                }
              </strong>
            </div>

            <div>
              <span>
                SORT ORDER
              </span>

              <strong>
                {sortOrder ===
                "latest"
                  ? "Latest first"
                  : "Earliest first"}
              </strong>
            </div>
          </div>
        </section>

        <section className="zen-history-toolbar">
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
        </section>

        {showFilters && (
          <section className="zen-history-filter-panel">
            <div className="zen-history-filter-panel-head">
              <div>
                <span>
                  FILTER HISTORY
                </span>

                <h2>
                  Narrow down the
                  results
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
              <p>
                Results update
                automatically as
                filters change.
              </p>

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

        {errorMessage && (
          <div className="zen-history-error">
            <span>
              {errorMessage}
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

        <section className="zen-history-content">
          <div className="zen-history-content-head">
            <div>
              <span>
                {viewOption ===
                "individual"
                  ? "SESSION HISTORY"
                  : "COMBINED HISTORY"}
              </span>

              <h2>
                {viewOption ===
                "individual"
                  ? "Classroom sessions"
                  : "Combined stress results"}
              </h2>
            </div>

            <p>
              {viewOption ===
              "individual"
                ? "Review the classroom context recorded for each completed session."
                : "Review aggregated weekly stress results and the associated ZenLens response."}
            </p>
          </div>

          {isLoading ? (
            <div className="zen-history-loading">
              <div className="zen-history-loading-icon">
                <RefreshCcw />
              </div>

              <strong>
                Loading history
              </strong>

              <span>
                Retrieving saved
                ZenLens results.
              </span>
            </div>
          ) : (
            <>
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
                          className="zen-history-session-card"
                          key={
                            entry.session_id ||
                            `${entry.subject}-${index}`
                          }
                        >
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
                        </article>
                      )
                    )}
                  </div>
                )}

              {viewOption ===
                "combined" &&
                weeklyResults.length >
                  0 && (
                  <div className="zen-history-combined-list">
                    {weeklyResults.map(
                      (
                        result,
                        index
                      ) => (
                        <article
                          className="zen-history-combined-card"
                          key={`${result.week}-${index}`}
                        >
                          <div className="zen-history-combined-top">
                            <div>
                              <span>
                                WEEK
                              </span>

                              <h3>
                                {result.week ||
                                  "Unspecified"}
                              </h3>
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

                          <div className="zen-history-combined-stats">
                            <div>
                              <span>
                                Average
                                stress
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
                            </div>

                            <div>
                              <span>
                                Sessions
                              </span>

                              <strong>
                                {result.sessions_count ??
                                  "—"}
                              </strong>
                            </div>
                          </div>

                          <div className="zen-history-response">
                            <div className="zen-history-response-icon">
                              <Sparkles />
                            </div>

                            <div>
                              <span>
                                ZENLENS
                                RESPONSE
                              </span>

                              <p>
                                {result.openai_response ||
                                  "No response available for this period."}
                              </p>
                            </div>
                          </div>
                        </article>
                      )
                    )}
                  </div>
                )}

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
                    No analysis
                    history matches
                    this view.
                  </h3>

                  <p>
                    Try changing the
                    current filters
                    or switch between
                    individual and
                    combined results.
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
      </main>
    </div>
  );
};

export default HistoryPage;