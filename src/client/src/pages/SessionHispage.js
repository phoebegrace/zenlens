import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Plot from "react-plotly.js";

import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  Clock3,
  Cloud,
  Filter,
  History,
  Search,
  SlidersHorizontal,
  UserRound,
  X,
} from "lucide-react";

import ZenLensHeader from "../components/ZenLensHeader";

import "./SessionHispage.css";

const API_BASE_URL = "http://127.0.0.1:5000";

const SessionHisPage = () => {
  const [history, setHistory] = useState([]);
  const [emotionTimeline, setEmotionTimeline] = useState([]);

  const [filters, setFilters] = useState({
    subject: "",
    teacher: "",
    weather: "",
  });

  const [sortOrder, setSortOrder] = useState("latest");
  const [openDetails, setOpenDetails] = useState(null);

  const [subjectOptions, setSubjectOptions] = useState([]);
  const [teacherOptions, setTeacherOptions] = useState([]);
  const [weatherOptions, setWeatherOptions] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [timelineLoading, setTimelineLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const extractFilterOptions = (data) => {
    const subjects = [
      ...new Set(
        data
          .map((item) => item.subject)
          .filter(Boolean)
      ),
    ];

    const teachers = [
      ...new Set(
        data
          .map((item) => item.teacher)
          .filter(Boolean)
      ),
    ];

    const weatherConditions = [
      ...new Set(
        data
          .map((item) => item.weather)
          .filter(Boolean)
      ),
    ];

    setSubjectOptions(subjects);
    setTeacherOptions(teachers);
    setWeatherOptions(weatherConditions);
  };

  const fetchHistory = async (
    activeFilters,
    activeSortOrder
  ) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.get(
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
        response.data || [];

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

      if (error.response) {
        const serverMessage =
          error.response?.data
            ?.error ||
          error.response?.data
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
      setIsLoading(false);
    }
  };

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
          response.data || []
        );
      } catch (error) {
        console.error(
          "Error fetching emotion timeline:",
          error
        );

        setEmotionTimeline(
          []
        );

        if (error.response) {
          setErrorMessage(
            error.response?.data
              ?.error ||
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
  }, [filters, sortOrder]);

  const handleFilterChange = (
    event
  ) => {
    const { name, value } =
      event.target;

    setFilters(
      (previousFilters) => ({
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

  const clearFilters = () => {
    setFilters({
      subject: "",
      teacher: "",
      weather: "",
    });

    setSortOrder("latest");
  };

  const toggleDetails = (
    index
  ) => {
    setOpenDetails(index);
  };

  const closeDetails = () => {
    setOpenDetails(null);
  };

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

        type: "scatter",

        mode: "lines",

        name: emotion,

        connectgaps: false,

        hovertemplate:
          "<b>%{fullData.name}</b><br>%{x}<br>Count: %{y}<extra></extra>",

        line: {
          shape: "linear",
          width: 2.2,
        },
      })
    );
  };

  const activeFilterCount =
    useMemo(() => {
      return Object.values(
        filters
      ).filter((value) =>
        String(value).trim()
      ).length;
    }, [filters]);

  const selectedSession =
    openDetails !== null
      ? history[
          openDetails
        ]
      : null;

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

  return (
    <div className="zen-session-page">
      <ZenLensHeader />

      <main className="zen-session-main">
        <section className="zen-session-intro">
          <div className="zen-session-intro-copy">
            <div className="zen-session-eyebrow">
              <History />

              <span>
                Session history
              </span>
            </div>

            <h1>
              Review classroom
              <span>
                sessions over time.
              </span>
            </h1>

            <p>
              Browse completed
              ZenLens sessions,
              filter by classroom
              context, and open
              individual sessions
              to inspect their
              emotional timeline.
            </p>
          </div>

          <div className="zen-session-overview">
            <div>
              <span>
                SESSIONS
              </span>

              <strong>
                {history.length}
              </strong>

              <small>
                Matching current
                filters
              </small>
            </div>

            <div>
              <span>
                ACTIVE FILTERS
              </span>

              <strong>
                {
                  activeFilterCount
                }
              </strong>

              <small>
                Current selections
              </small>
            </div>
          </div>
        </section>

        <section className="zen-session-toolbar">
          <div className="zen-session-toolbar-title">
            <Filter />

            <div>
              <span>
                FILTER SESSIONS
              </span>

              <strong>
                Find a classroom
                session
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

            <div className="zen-session-select-wrap sort">
              <SlidersHorizontal />

              <select
                name="sortOrder"
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
        </section>

        {errorMessage && (
          <div className="zen-session-error">
            <span>
              {errorMessage}
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
              Select a session to
              review its classroom
              information and
              emotion timeline.
            </p>
          </div>

          {isLoading ? (
            <div className="zen-session-loading">
              <div className="zen-session-loading-spinner" />

              <strong>
                Loading sessions
              </strong>

              <span>
                Retrieving analysis
                history.
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
                No classroom
                sessions match
                these filters.
              </h3>

              <p>
                Adjust the current
                filters or reset
                them to view all
                available ZenLens
                sessions.
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
      </main>

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
                  {
                    selectedSession.session_id
                  }
                </span>

                <h2>
                  {selectedSession.subject ||
                    "Classroom session"}
                </h2>

                <p>
                  Review the session
                  context and
                  emotional
                  timeline.
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
                    SESSION
                    INFORMATION
                  </span>

                  <h3>
                    Classroom
                    context
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
                      Emotional
                      changes across
                      the session
                    </h3>
                  </div>

                  <p>
                    Emotion counts
                    are shown in
                    timestamp order.
                  </p>
                </div>

                <div className="zen-session-chart">
                  {timelineLoading ? (
                    <div className="zen-session-chart-state">
                      <div className="zen-session-loading-spinner" />

                      <strong>
                        Loading
                        timeline
                      </strong>
                    </div>
                  ) : selectedSessionTraces.length >
                    0 ? (
                    <Plot
                      data={
                        selectedSessionTraces
                      }
                      layout={{
                        autosize: true,

                        margin: {
                          l: 54,
                          r: 22,
                          t: 24,
                          b: 52,
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

                          size: 10,
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
                            size: 9,
                          },
                        },

                        xaxis: {
                          title: {
                            text:
                              "Time",

                            font: {
                              size: 10,
                            },
                          },

                          showgrid:
                            true,

                          gridcolor:
                            "#edf0f5",

                          zeroline:
                            false,

                          tickfont: {
                            size: 9,
                          },
                        },

                        yaxis: {
                          title: {
                            text:
                              "Emotion count",

                            font: {
                              size: 10,
                            },
                          },

                          showgrid:
                            true,

                          gridcolor:
                            "#edf0f5",

                          zeroline:
                            false,

                          tickfont: {
                            size: 9,
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
                        No timeline
                        data
                      </strong>

                      <span>
                        No emotional
                        timeline data
                        is available
                        for this
                        session.
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