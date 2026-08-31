import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

import { DateRange } from "react-date-range";

import { addDays, format } from "date-fns";

import {
  AlertCircle,
  BarChart3,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Database,
  History,
  RefreshCcw,
  Save,
  ScanFace,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import ZenLensHeader from "../components/ZenLensHeader";

import "./Monitoringpage.css";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const MonitoringPage = () => {
  const [history, setHistory] = useState([]);

  const [combinedResults, setCombinedResults] = useState(null);

  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
      key: "selection",
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  /* ======================================================
     FETCH HISTORY
  ====================================================== */

  const fetchHistory = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.get(
        "http://localhost:5000/history"
      );

      setHistory(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error(
        "Error fetching history:",
        error
      );

      setErrorMessage(
        "Unable to load analysis history. Check that the ZenLens server is running and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  /* ======================================================
     NORMALIZE DATE
  ====================================================== */

  const normalizeDate = (value) => {
    if (!value) {
      return null;
    }

    const parsedDate =
      new Date(`${value}T00:00:00`);

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
     COMBINE RESULTS
  ====================================================== */

  const combineResultsByDate =
    useCallback(() => {
      let totalFaces = 0;
      let totalStress = 0;
      let sessionsCount = 0;

      const startDate =
        new Date(
          dateRange[0].startDate
        );

      const endDate =
        new Date(
          dateRange[0].endDate
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

          if (!entryDate) {
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

            sessionsCount += 1;
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
          dateRange[0].startDate
        );

      const endDate =
        new Date(
          dateRange[0].endDate
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

          if (!entryDate) {
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
     SAVE RESULTS
  ====================================================== */

  const saveCombinedResults =
    async () => {
      if (
        !combinedResults ||
        combinedResults
          .sessions_count === 0
      ) {
        return;
      }

      setIsSaving(true);

      setErrorMessage("");
      setSuccessMessage("");

      try {
        await axios.post(
          "http://localhost:5000/save-combined-results",
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
        setIsSaving(false);
      }
    };

  /* ======================================================
     RANGE LABEL
  ====================================================== */

  const rangeLabel =
    `${format(
      dateRange[0].startDate,
      "MMM d, yyyy"
    )} – ${format(
      dateRange[0].endDate,
      "MMM d, yyyy"
    )}`;

  /* ======================================================
     RESULT STATE
  ====================================================== */

  const hasSessions =
    combinedResults &&
    combinedResults
      .sessions_count > 0;

  return (
    <div className="zen-monitor-page">
      <ZenLensHeader />

      <main className="zen-monitor-main">
        {/* =================================================
            HERO
        ================================================= */}

        <section className="zen-monitor-intro">
          <div className="zen-monitor-intro-copy">
            <div className="zen-monitor-eyebrow">
              <TrendingUp />

              <span>
                Stress monitoring
              </span>
            </div>

            <h1>
              Combine stress results
              <span>
                across a date range.
              </span>
            </h1>

            <p>
              Select a period to review multiple classroom
              sessions together. ZenLens calculates a combined
              stress result using the session data recorded
              within that range.
            </p>
          </div>

          <div className="zen-monitor-process">
            <span className="zen-monitor-process-label">
              HOW IT WORKS
            </span>

            <div className="zen-monitor-process-flow">
              <div>
                <span>
                  01
                </span>

                <p>
                  <strong>
                    Select dates
                  </strong>

                  <small>
                    Choose the period
                    you want to review.
                  </small>
                </p>
              </div>

              <ChevronRight />

              <div>
                <span>
                  02
                </span>

                <p>
                  <strong>
                    Combine sessions
                  </strong>

                  <small>
                    ZenLens calculates
                    results from matching
                    sessions.
                  </small>
                </p>
              </div>

              <ChevronRight />

              <div>
                <span>
                  03
                </span>

                <p>
                  <strong>
                    Save result
                  </strong>

                  <small>
                    Store the combined
                    period for later
                    review.
                  </small>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            STATUS MESSAGES
        ================================================= */}

        {errorMessage && (
          <div className="zen-monitor-message error">
            <AlertCircle />

            <span>
              {errorMessage}
            </span>

            <button
              type="button"
              onClick={() =>
                setErrorMessage("")
              }
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {successMessage && (
          <div className="zen-monitor-message success">
            <Check />

            <span>
              {successMessage}
            </span>

            <button
              type="button"
              onClick={() =>
                setSuccessMessage("")
              }
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        )}

        {/* =================================================
            WORKSPACE
        ================================================= */}

        <section className="zen-monitor-workspace">
          {/* ===============================================
              CALENDAR
          =============================================== */}

          <div className="zen-monitor-calendar-panel">
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
                  Choose the dates that should be included
                  in the combined stress calculation.
                </p>
              </div>
            </div>

            <div className="zen-monitor-range-selected">
              <CalendarDays />

              <div>
                <span>
                  SELECTED RANGE
                </span>

                <strong>
                  {rangeLabel}
                </strong>
              </div>
            </div>

            <div className="zen-monitor-calendar-wrap">
              <DateRange
                editableDateInputs
                onChange={(item) => {
                  setDateRange([
                    item.selection,
                  ]);

                  setSuccessMessage("");
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

          {/* ===============================================
              RESULTS
          =============================================== */}

          <div className="zen-monitor-results-panel">
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
                  Results update automatically when the
                  selected date range changes.
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="zen-monitor-loading">
                <div className="zen-monitor-spinner" />

                <strong>
                  Loading history
                </strong>

                <span>
                  Retrieving classroom
                  sessions.
                </span>
              </div>
            ) : hasSessions ? (
              <>
                <div className="zen-monitor-result-hero">
                  <span>
                    AVERAGE STRESS
                  </span>

                  <strong>
                    {combinedResults
                      .average_stress
                      .toFixed(2)}
                    %
                  </strong>

                  <p>
                    Weighted across all
                    detected faces within
                    the selected sessions.
                  </p>
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
                      <Clock3 />
                    </span>

                    <p>
                      <span>
                        Period
                      </span>

                      <strong>
                        {rangeLabel}
                      </strong>
                    </p>
                  </article>
                </div>

                <div className="zen-monitor-save-section">
                  <div>
                    <Database />

                    <p>
                      <strong>
                        Save this combined result
                      </strong>

                      <span>
                        Store this date range for
                        future combined-history
                        review.
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
                          Save combined result
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
                  No analysis history exists within this date
                  range.
                </h3>

                <p>
                  Select a different period containing
                  completed classroom sessions.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* =================================================
            MATCHING SESSION LIST
        ================================================= */}

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
                  These classroom analyses are contributing
                  to the combined result shown above.
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
                              index + 1}
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
                            {typeof session.average_stress ===
                            "number"
                              ? `${session.average_stress.toFixed(
                                  2
                                )}%`
                              : session.average_stress
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

        {/* =================================================
            EXPLANATION
        ================================================= */}

        <section className="zen-monitor-note">
          <div className="zen-monitor-note-icon">
            <Sparkles />
          </div>

          <div>
            <span>
              ABOUT COMBINED MONITORING
            </span>

            <h2>
              A broader view of stress across multiple
              sessions.
            </h2>
          </div>

          <p>
            Combined monitoring summarizes sessions within
            the selected period. It is intended to support
            interpretation of trends rather than replace
            individual session review.
          </p>
        </section>
      </main>
    </div>
  );
};

export default MonitoringPage;