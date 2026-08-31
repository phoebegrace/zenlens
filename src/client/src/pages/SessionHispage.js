import React, { useEffect, useState } from "react";
import axios from "axios";
import Plot from "react-plotly.js";
import "./SessionHispage.css";
import Header from "../components/Header";

const SessionHisPage = () => {
  // State variables
  const [history, setHistory] = useState([]);
  const [emotionTimeline, setEmotionTimeline] = useState([]);
  const [filters, setFilters] = useState({
    subject: "",
    teacher: "",
    weather: "",
  });
  const [sortOrder, setSortOrder] = useState("latest");
  const [openDetails, setOpenDetails] = useState(null);

  // Dropdown options
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [teacherOptions, setTeacherOptions] = useState([]);
  const [weatherOptions, setWeatherOptions] = useState([]);

  // Fetch history data
  const fetchHistory = async (filters, sortOrder) => {
    try {
      const response = await axios.get("http://localhost:5000/history", {
        params: { ...filters, sort_order: sortOrder },
      });
      setHistory(response.data);
      extractFilterOptions(response.data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  // Fetch emotion timeline data
  const fetchEmotionTimeline = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/emotion-timeline"
      );
      setEmotionTimeline((prevTimeline) => [...prevTimeline, ...response.data]);
    } catch (error) {
      console.error("Error fetching emotion timeline:", error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchHistory(filters, sortOrder);
    fetchEmotionTimeline();
  }, [filters, sortOrder]);

  // Extract unique filter options
  const extractFilterOptions = (data) => {
    const subjects = [...new Set(data.map((item) => item.subject))];
    const teachers = [...new Set(data.map((item) => item.teacher))];
    const weatherConditions = [...new Set(data.map((item) => item.weather))];

    setSubjectOptions(subjects);
    setTeacherOptions(teachers);
    setWeatherOptions(weatherConditions);
  };

  // Handle filter change
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Handle sort order change
  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
  };

  // Toggle session details
  const toggleDetails = (index) => {
    setOpenDetails(index);
  };

  // Close session details
  const closeDetails = () => {
    setOpenDetails(null);
  };

  // Prepare data for Plotly chart
  const processDataForPlotly = (sessionId) => {
    const sessionData = emotionTimeline.filter(
      (entry) => entry.session_id === sessionId
    );

    // Sort data according to timestamp
    const sortedData = [...sessionData].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    const timestamps = sortedData.map((entry) => entry.timestamp);
    const emotions = sortedData.map((entry) => entry.emotion_counts);


    const emotionTraces = Object.keys(emotions[0] || {}).map((emotion) => ({
      x: timestamps,
      y: emotions.map((counts) => counts[emotion] ?? null),
      type: "scatter",
      mode: "lines",
      name: emotion,
      connectgaps: false,
      line: { shape: "linear" },
    }));

    return emotionTraces;
  };

  return (
    <>
      <div className="history-page">
        <Header />
        <div className="history-header">
          <h1>Session History</h1>
          <div className="filters">
            <label>
              Subject:
              <select
                name="subject"
                value={filters.subject}
                onChange={handleFilterChange}
              >
                <option value="">All</option>
                {subjectOptions.map((subject, index) => (
                  <option key={index} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Teacher:
              <select
                name="teacher"
                value={filters.teacher}
                onChange={handleFilterChange}
              >
                <option value="">All</option>
                {teacherOptions.map((teacher, index) => (
                  <option key={index} value={teacher}>
                    {teacher}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Weather:
              <select
                name="weather"
                value={filters.weather}
                onChange={handleFilterChange}
              >
                <option value="">All</option>
                {weatherOptions.map((weather, index) => (
                  <option key={index} value={weather}>
                    {weather}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Sort by:
              <select
                name="sortOrder"
                value={sortOrder}
                onChange={handleSortChange}
              >
                <option value="latest">Latest to Earliest</option>
                <option value="earliest">Earliest to Latest</option>
              </select>
            </label>
          </div>
          <table className="history-table">
            <thead>
              <tr>
                <th>Session ID</th>
                <th>Date</th>
                <th>Subject</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? (
                history.map((entry, index) => (
                  <tr key={index} onClick={() => toggleDetails(index)}>
                    <td>{entry.session_id}</td>
                    <td>{entry.date}</td>
                    <td>{entry.subject}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No analysis history found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Overlay and Session Details Pop-Up */}
      {openDetails !== null && (
        <>
          <div className="overlay" onClick={closeDetails}></div>
          <div className="session-details" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeDetails}>
              ×
            </button>
            <div className="plot-container-details">
              <h3>Session Details for {history[openDetails].session_id}</h3>
              <p>
                <strong>Subject:</strong> {history[openDetails].subject}
              </p>
              <p>
                <strong>Session:</strong> {history[openDetails].session}
              </p>
              <p>
                <strong>Date:</strong> {history[openDetails].date}
              </p>
              <p>
                <strong>Weather:</strong> {history[openDetails].weather}
              </p>
              <p>
                <strong>Teacher:</strong> {history[openDetails].teacher}
              </p>
              <p>
                <strong>Start Time:</strong> {history[openDetails].startTime}
              </p>
              <p>
                <strong>End Time:</strong> {history[openDetails].endTime}
              </p>
            </div>
            <div className="plot-container">
              <Plot
                data={processDataForPlotly(history[openDetails].session_id)}
                layout={{
                  title: "Emotion Timeline",
                  xaxis: { title: "Time" },
                  yaxis: { title: "Emotion Count" },
                }}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default SessionHisPage;
