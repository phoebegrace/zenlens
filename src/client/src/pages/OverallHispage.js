import React, { useEffect, useMemo, useState } from "react";
import Plot from "react-plotly.js";

import {
  BarChart3,
  CalendarDays,
  ChevronRight,
  Clock3,
  Layers3,
  LineChart,
  RefreshCcw,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";

import ZenLensHeader from "../components/ZenLensHeader";

import "./OverallHispage.css";

const API_BASE_URL = "http://127.0.0.1:5000";

const DailyWeeklyPage = () => {
  const [dailyData, setDailyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);

  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);

  const [view, setView] = useState("daily");

  const [recommendation, setRecommendation] = useState("");

  const [dailyLoading, setDailyLoading] = useState(false);
  const [weeklyLoading, setWeeklyLoading] = useState(false);

  const [
    recommendationLoading,
    setRecommendationLoading,
  ] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const fetchDailyData = async () => {
    setDailyLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/daily-emotion-timeline`
      );

      if (!response.ok) {
        throw new Error(
          `Daily data request failed with status ${response.status}`
        );
      }

      const data =
        await response.json();

      setDailyData(
        Array.isArray(data)
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
        error instanceof TypeError
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
      setDailyLoading(false);
    }
  };

  const fetchWeeklyData = async () => {
    setWeeklyLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/weekly-emotion-timeline`
      );

      if (!response.ok) {
        throw new Error(
          `Weekly data request failed with status ${response.status}`
        );
      }

      const data =
        await response.json();

      setWeeklyData(
        Array.isArray(data)
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
        error instanceof TypeError
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

  const fetchRecommendation =
    async () => {
      if (!selectedWeek) {
        setRecommendation("");
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

        if (!response.ok) {
          throw new Error(
            `Recommendation request failed with status ${response.status}`
          );
        }

        const data =
          await response.json();

        if (
          !Array.isArray(data)
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
    if (selectedWeek) {
      fetchRecommendation();
    }
  }, [selectedWeek]);

  const processDailyDataForPlotly = (
    dayData
  ) => {
    const sortedEntries = [
      ...(dayData?.entries ||
        []),
    ]
      .map((entry) => ({
        ...entry,
        timestamp: new Date(
          entry.timestamp
        ),
      }))
      .sort(
        (a, b) =>
          a.timestamp -
          b.timestamp
      );

    const emotionLabels = [
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
          shape: "linear",
          width: 2.2,
        },
      })
    );
  };

  const processWeeklyDataForPlotly = (
    weekData
  ) => {
    const sortedEntries = [
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

    const emotionLabels = [
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
          shape: "linear",
          width: 2.2,
        },
      })
    );
  };

  const handleViewChange = (
    nextView
  ) => {
    setView(nextView);

    setSelectedDay(null);
    setSelectedWeek(null);
    setRecommendation("");
  };

  const toggleDaySelection = (
    day
  ) => {
    setSelectedWeek(null);
    setRecommendation("");

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
    setSelectedDay(null);

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

  const closeInfoCard = () => {
    setSelectedDay(null);
    setSelectedWeek(null);
    setRecommendation("");
  };

  const selectedData =
    selectedDay ||
    selectedWeek;

  const selectedTraces =
    useMemo(() => {
      if (selectedDay) {
        return processDailyDataForPlotly(
          selectedDay
        );
      }

      if (selectedWeek) {
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
        (total, item) =>
          total +
          (item.entries
            ?.length ||
            0),
        0
      );
    }, [currentData]);

  const chartLayout = {
    autosize: true,

    margin: {
      l: 52,
      r: 22,
      t: 20,
      b: 58,
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

    showlegend: true,

    legend: {
      orientation: "h",

      x: 0,

      y: -0.28,

      font: {
        size: 9,
      },
    },

    xaxis: {
      title: {
        text: "Time",

        font: {
          size: 10,
        },
      },

      showgrid: true,

      gridcolor:
        "#edf0f5",

      zeroline: false,

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

      showgrid: true,

      gridcolor:
        "#edf0f5",

      zeroline: false,

      rangemode:
        "tozero",

      tickfont: {
        size: 9,
      },
    },
  };

  return (
    <div className="zen-overall-page">
      <ZenLensHeader />

      <main className="zen-overall-main">
        <section className="zen-overall-intro">
          <div className="zen-overall-intro-copy">
            <div className="zen-overall-eyebrow">
              <TrendingUp />

              <span>
                Stress insights
              </span>
            </div>

            <h1>
              Understand patterns
              <span>
                across days and
                weeks.
              </span>
            </h1>

            <p>
              Compare emotional
              observations across
              time to review
              broader classroom
              stress patterns
              beyond a single
              session.
            </p>
          </div>

          <div className="zen-overall-overview">
            <div>
              <span>
                CURRENT VIEW
              </span>

              <strong>
                {view === "daily"
                  ? "Daily"
                  : "Weekly"}
              </strong>

              <small>
                Insight level
              </small>
            </div>

            <div>
              <span>
                PERIODS
              </span>

              <strong>
                {entryCount}
              </strong>

              <small>
                Available results
              </small>
            </div>

            <div>
              <span>
                OBSERVATIONS
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
          </div>
        </section>

        <section className="zen-overall-toolbar">
          <div className="zen-overall-view-switch">
            <button
              type="button"
              className={
                view === "daily"
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
                  Day-by-day
                  patterns
                </span>
              </div>
            </button>

            <button
              type="button"
              className={
                view === "weekly"
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
                  Broader weekly
                  patterns
                </span>
              </div>
            </button>
          </div>

          <div className="zen-overall-toolbar-note">
            <LineChart />

            <p>
              <span>
                CURRENTLY VIEWING
              </span>

              <strong>
                {view === "daily"
                  ? "Daily emotion history"
                  : "Weekly emotion history"}
              </strong>
            </p>
          </div>
        </section>

        {errorMessage && (
          <div className="zen-overall-error">
            <span>
              {errorMessage}
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

        <section className="zen-overall-content">
          <div className="zen-overall-content-head">
            <div>
              <span>
                {view === "daily"
                  ? "DAILY INSIGHTS"
                  : "WEEKLY INSIGHTS"}
              </span>

              <h2>
                {view === "daily"
                  ? "Classroom patterns by day"
                  : "Classroom patterns by week"}
              </h2>
            </div>

            <p>
              {view === "daily"
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
                Retrieving ZenLens
                timeline data.
              </span>
            </div>
          ) : currentData.length >
            0 ? (
            <div className="zen-overall-period-grid">
              {view === "daily"
                ? dailyData.map(
                    (
                      day,
                      index
                    ) => (
                      <button
                        type="button"
                        className="zen-overall-period-card"
                        key={
                          day.date ||
                          index
                        }
                        onClick={() =>
                          toggleDaySelection(
                            day
                          )
                        }
                      >
                        <div className="zen-overall-period-top">
                          <div className="zen-overall-period-icon">
                            <CalendarDays />
                          </div>

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
                            View daily
                            details
                          </span>

                          <ChevronRight />
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
                        className="zen-overall-period-card"
                        key={
                          week.week ||
                          index
                        }
                        onClick={() =>
                          toggleWeekSelection(
                            week
                          )
                        }
                      >
                        <div className="zen-overall-period-top">
                          <div className="zen-overall-period-icon">
                            <Layers3 />
                          </div>

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
                            View weekly
                            details
                          </span>

                          <ChevronRight />
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
                No {view} results
                are available yet.
              </h3>

              <p>
                ZenLens will
                display historical
                patterns here once
                classroom session
                data is available.
              </p>
            </div>
          )}
        </section>
      </main>

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
                        Timeline
                        entries
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
                        Emotion
                        groups
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
                      <Sparkles />

                      <div>
                        <span>
                          WEEKLY
                          RECOMMENDATION
                        </span>

                        <strong>
                          ZenLens
                          insight
                        </strong>
                      </div>
                    </div>

                    {recommendationLoading ? (
                      <div className="zen-overall-recommendation-loading">
                        <div className="zen-overall-mini-spinner" />

                        <span>
                          Loading
                          recommendation
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
                      Emotional
                      patterns over
                      time
                    </h3>
                  </div>

                  <p>
                    Each line
                    represents one
                    detected emotion
                    category across
                    the selected
                    period.
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
                        No timeline
                        data
                      </strong>

                      <span>
                        No emotional
                        timeline data
                        is available
                        for this
                        period.
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