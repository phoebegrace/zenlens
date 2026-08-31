import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { DateRange } from "react-date-range";
import { addDays } from "date-fns";
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

  const fetchHistory = async () => {
    try {
      const response = await axios.get("http://localhost:5000/history");
      setHistory(response.data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const combineResultsByDate = useCallback(() => {
    let totalFaces = 0;
    let totalStress = 0;
    let sessionsCount = 0;

    history.forEach((entry) => {
      const { date, average_stress, total_faces } = entry;
      const entryDate = new Date(date);

      if (
        entryDate >= dateRange[0].startDate &&
        entryDate <= dateRange[0].endDate
      ) {
        totalFaces += total_faces;
        totalStress += average_stress * total_faces;
        sessionsCount++;
      }
    });

    const averageStress = totalFaces > 0 ? totalStress / totalFaces : 0;

    setCombinedResults({
      total_faces: totalFaces,
      average_stress: averageStress,
      sessions_count: sessionsCount,
      start_date: dateRange[0].startDate.toISOString().split("T")[0],
      end_date: dateRange[0].endDate.toISOString().split("T")[0],
    });
  }, [history, dateRange]);

  useEffect(() => {
    if (history.length > 0) {
      combineResultsByDate();
    }
  }, [history, dateRange, combineResultsByDate]);

  const saveCombinedResults = async () => {
    if (combinedResults) {
      try {
        await axios.post(
          "http://localhost:5000/save-combined-results",
          combinedResults
        );
        alert("Combined results saved successfully!");
      } catch (error) {
        console.error("Error saving combined results:", error);
        alert("Failed to save combined results.");
      }
    }
  };

  return (
    <div className="stress-monitoring-page">
      <header className="stress-monitoring-header">
        <h1>Stress Monitoring</h1>
        <DateRange
          editableDateInputs={true}
          onChange={(item) => setDateRange([item.selection])}
          moveRangeOnFirstSelection={false}
          ranges={dateRange}
        />
        {combinedResults ? (
          <div className="combined-result-entry">
            <h3>
              Date Range: {dateRange[0].startDate.toDateString()} -{" "}
              {dateRange[0].endDate.toDateString()}
            </h3>
            <p>Total Faces: {combinedResults.total_faces}</p>
            <p>Average Stress: {combinedResults.average_stress.toFixed(2)}%</p>
            <p>Sessions Count: {combinedResults.sessions_count}</p>
            <button onClick={saveCombinedResults}>Save Combined Results</button>
          </div>
        ) : (
          <p>No analysis history found for the selected date range.</p>
        )}
      </header>
    </div>
  );
};

export default MonitoringPage;
