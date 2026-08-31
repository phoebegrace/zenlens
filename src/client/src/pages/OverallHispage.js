import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import "./OverallHispage.css";
import Header from "../components/Header";

const DailyWeeklyPage = () => {
  const [dailyData, setDailyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [view, setView] = useState("daily");
  const [recommendation, setRecommendation] = useState("");

  
  const fetchDailyData = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/daily-emotion-timeline"
      );
      const data = await response.json();
      setDailyData(data);
    } catch (error) {
      console.error("Error fetching daily data:", error);
    }
  };

  const fetchWeeklyData = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/weekly-emotion-timeline"
      );
      const data = await response.json();
      setWeeklyData(data);
    } catch (error) {
      console.error("Error fetching weekly data:", error);
    }
  };

  const fetchRecommendation = async () => {
    try {
      if (!selectedWeek) {
        console.error("No week selected.");
        setRecommendation("Please select a week to view the recommendation.");
        return;
      }
  
      const response = await fetch("http://localhost:5000/get-weekly-recommendation");
  
      if (!response.ok) {
        console.error(`Error: ${response.status} - ${response.statusText}`);
        setRecommendation("Unable to fetch recommendation at this time. Please try again later.");
        return;
      }
  
      const data = await response.json();
  
      if (!Array.isArray(data)) {
        console.error("Unexpected response format:", data);
        setRecommendation("Unexpected response format from the server.");
        return;
      }
  
      // Find the recommendation for the selected week using exact string matching
      const selectedWeekData = data.find((entry) => entry.week === selectedWeek.week);
  
      if (selectedWeekData && selectedWeekData.openai_response) {
        setRecommendation(
          selectedWeekData.openai_response
        );
      } else {
        setRecommendation("No recommendation available for the selected week.");
      }
    } catch (error) {
      console.error("Error fetching recommendation:", error.message);
      setRecommendation(`Unable to fetch recommendation: ${error.message}`);
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

  const processDailyDataForPlotly = (dayData) => {
    // Convert timestamps to Date objects and sort them
    const sortedEntries = dayData.entries
      .map(entry => ({
        ...entry,
        timestamp: new Date(entry.timestamp) // Ensure proper date format
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  
    // Debugging: Check if sorting is correct
    console.log("First timestamp:", sortedEntries[0]?.timestamp);
    console.log("Last timestamp:", sortedEntries[sortedEntries.length - 1]?.timestamp);
  
    // Get all unique emotions
    const emotionLabels = Object.keys(sortedEntries[0]?.emotion_counts || {});
  
    return emotionLabels.map((emotion) => ({
      x: sortedEntries.map((entry) => entry.timestamp),  // ✅ Use sortedEntries
      y: sortedEntries.map((entry) => entry.emotion_counts[emotion] || 0), // ✅ Handle missing values
      type: "scatter",
      mode: "lines",
      name: emotion.charAt(0).toUpperCase() + emotion.slice(1),
      connectgaps: false,  // Optional: Change to true if missing data causes gaps
    }));
  };
  

  const processWeeklyDataForPlotly = (weekData) => {

    const sortedEntries = [...weekData.entries].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    const emotionLabels = Object.keys(sortedEntries[0]?.emotion_counts || {});

    return emotionLabels.map((emotion) => ({
      x: sortedEntries.map((entry) => entry.timestamp),
      y: sortedEntries.map((entry) => entry.emotion_counts[emotion] ?? null),
      type: "scatter",
      mode: "lines",
      name: emotion.charAt(0).toUpperCase() + emotion.slice(1),
      connectgaps: false,
    }));
  };

  const toggleDaySelection = (day) => {
    setSelectedDay(selectedDay?.date === day.date ? null : day);
  };

  const toggleWeekSelection = (week) => {
    if (selectedWeek?.week === week.week) {
      setSelectedWeek(null);
      setRecommendation("");
    } else {
      setSelectedWeek(week);
    }
  };

  const closeInfoCard = () => {
    setSelectedDay(null);
    setSelectedWeek(null);
    setRecommendation("");
  };

  const toggleView = () => {
    setView(view === "daily" ? "weekly" : "daily");
  };

  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const handleViewChange = (viewType) => {
    setView(viewType);
    setDropdownOpen(false);
  };

  return (
    <div className="daily-weekly-page scoped-page">
      <div className="daily-weekly-page">
        <Header />
        <header className="page-header">
          {/* <h1 className="logo">Daily and Weekly Emotion Levels</h1> */}

          {view === "daily" ? (
            <div className="daily-container">
              <h2>Daily Data</h2>
              <button onClick={toggleDropdown} className="dropdown-button">
                {view === "daily" ? "Daily Data" : "Weekly Data"}
                <i className="fa fa-chevron-down" aria-hidden="true"></i>
              </button>

              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <button onClick={() => handleViewChange("daily")}>
                    Show Daily Data
                  </button>
                  <button onClick={() => handleViewChange("weekly")}>
                    Show Weekly Data
                  </button>
                </div>
              )}
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {dailyData.length > 0 ? (
                    dailyData.map((day) => (
                      <tr
                        key={day.date}
                        onClick={() => toggleDaySelection(day)}
                        className="clickable-entry"
                      >
                        <td>{day.date}</td>
                        <td>View Details</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2">It may take a while to load the data.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="weekly-container">
              <h2>Weekly Data</h2>
              <button onClick={toggleDropdown} className="dropdown-button">
                {view === "daily" ? "Daily Data" : "Weekly Data"}
                <i className="fa fa-chevron-down" aria-hidden="true"></i>
              </button>

              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <button onClick={() => handleViewChange("daily")}>
                    Show Daily Data
                  </button>
                  <button onClick={() => handleViewChange("weekly")}>
                    Show Weekly Data
                  </button>
                </div>
              )}
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Week</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyData.length > 0 ? (
                    weeklyData.map((week) => (
                      <tr
                        key={week.week}
                        onClick={() => toggleWeekSelection(week)}
                        className="clickable-entry"
                      >
                        <td>{week.week}</td>
                        <td>View Details</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2">It may take a while to load the data.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {(selectedDay || selectedWeek) && (
            <div className="overlay" onClick={closeInfoCard}>
              <div className="info-card" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={closeInfoCard}>
                  ×
                </button>
                <h3>
                  {selectedDay
                    ? `Daily Details for ${selectedDay.date}`
                    : `Weekly Details for ${selectedWeek.week}`}
                </h3>
                {selectedDay && (
                  <>
                    <Plot
                      data={processDailyDataForPlotly(selectedDay)}
                      layout={{
                        title: `Emotion Levels for ${selectedDay.date}`,
                        xaxis: { title: "Timestamp" },
                        yaxis: { title: "Emotion Count" },
                        legend: { orientation: "v" },
                      }}
                    />
                    
                  </>
                )}
                {selectedWeek && (
                  <>
                    <Plot
                      data={processWeeklyDataForPlotly(selectedWeek)}
                      layout={{
                        title: `Emotion Levels for ${selectedWeek.week}`,
                        xaxis: { title: "Timestamp" },
                        yaxis: { title: "Emotion Count" },
                        legend: { orientation: "v" },
                      }}
                    />
                    <p className="recommendation">
                      <strong>Recommendation:</strong> {recommendation}
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </header>
      </div>
    </div>
  );
};

export default DailyWeeklyPage;