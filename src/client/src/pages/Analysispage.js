import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Analysispage.css";
import Header from "../components/Header";

const AnalysisPage = () => {
  const [files, setFiles] = useState([]);
  const [subject, setSubject] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [teacher, setTeacher] = useState("");
  const [weather, setWeather] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [results, setResults] = useState(null);
  const [loadingPage, setLoadingPage] = useState(false);

  useEffect(() => {
    const savedFormData = JSON.parse(localStorage.getItem("formData"));
    if (savedFormData) {
      setSubject(savedFormData.subject);
      setRoomNumber(savedFormData.roomNumber);
      setTeacher(savedFormData.teacher);
      setWeather(savedFormData.weather);
      setDate(savedFormData.date);
      setStartTime(savedFormData.startTime);
      setEndTime(savedFormData.endTime);
    }
  }, []);

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleAnalyze = async () => {
    setLoadingPage(true);
    const formData = new FormData();
    formData.append("subject", subject);
    formData.append("roomNumber", roomNumber);
    formData.append("teacher", teacher);
    formData.append("weather", weather);
    formData.append("date", date);
    formData.append("startTime", startTime);
    formData.append("endTime", endTime);

    for (let i = 0; i < files.length; i++) {
      formData.append("folder", files[i]);
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/analyze",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setResults(response.data); // Save results in state
      setLoadingPage(false);

      const formDataToSave = {
        subject,
        roomNumber,
        teacher,
        weather,
        date,
        startTime,
        endTime,
      };
      localStorage.setItem("formData", JSON.stringify(formDataToSave));
      localStorage.setItem("analysisResults", JSON.stringify(response.data));
    } catch (error) {
      console.error("Error analyzing folder:", error);
      setLoadingPage(false);
    }
  };

  const handleClear = () => {
    setFiles([]);
    setSubject("");
    setRoomNumber("");
    setTeacher("");
    setWeather("");
    setDate("");
    setStartTime("");
    setEndTime("");
    setResults(null);
    localStorage.removeItem("formData");
    localStorage.removeItem("analysisResults");
  };

  const handlePrint = () => {
    const printArea = document.getElementById("printable-results").innerHTML;
    const originalContent = document.body.innerHTML;
    const printWindow = window.open("", "", "height=500,width=800");
    printWindow.document.write("<html><head><title>Print Results</title>");
    printWindow.document.write("<style>");
    printWindow.document.write(
      "body { font-family: Arial, sans-serif; padding: 20px; }"
    );
    printWindow.document.write(
      "table { width: 100%; border-collapse: collapse; }"
    );
    printWindow.document.write(
      "th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }"
    );
    printWindow.document.write(
      ".result-image { width: 100%; max-width: 300px; height: auto; display: block; margin: 10px 0; }"
    );
    printWindow.document.write("</style>");
    printWindow.document.write("</head><body>");
    printWindow.document.write(printArea);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  };

  if (loadingPage) {
    return (
      <div className="loader-page">
        <div className="loader"></div>
        <p>Analyzing... Please wait</p>
      </div>
    );
  }

  return (
    <div className="analysis-page">
      <Header />
      <div className="content-container">
        {results ? (
          <div className="results-wrapper">
            <div className="results-container">
              <div className="results" id="printable-results">
                <h2>Analysis Results</h2>
                {/* <p>Average Stress: {results.average_stress.toFixed(2)}%</p> */}
                <p>Stress Level: {results.stress_category}</p>
                <table className="results-table">
                  <thead>
                    <tr>
                      <th className="filename-image">Filename & Image</th>
                      <th className="faces-detected">
                        Faces Detected (Emotion and Stress Score)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.details.map((detail, index) => {
                      const filename = detail.filename.split("/").pop();
                      return (
                        <tr key={index}>
                          <td className="filename-image">
                            <div>
                              <img
                                src={`http://localhost:5000/processed/${encodeURIComponent(
                                  filename
                                )}?folder_path=${encodeURIComponent(
                                  results.folder_path
                                )}`}
                                alt={filename}
                                onError={(e) =>
                                  (e.target.src = "/placeholder.png")
                                }
                                className="result-image"
                              />
                              <p>{filename}</p>
                            </div>
                          </td>
                          <td className="faces-detected">
                            <ul>
                              {Object.entries(detail.results).map(
                                ([face, data], i) => (
                                  <li key={i}>
                                    <span className="face-label">
                                      Face {i + 1}:
                                    </span>{" "}
                                    {data.emotion}
                                  </li>
                                )
                              )}
                            </ul>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="button-container-right">
              <button onClick={handlePrint} className="print-button">
                Print Results
              </button>
              <button onClick={handleClear} className="clear-button">
                Clear
              </button>
            </div>
          </div>
        ) : (
          <div className="combined-section">
            <div className="form-section">
              <h2>Enter Information</h2>
              <div className="input-group">
                <label>Subject</label>
                <input
                  type="text"
                  placeholder="Enter Session Number"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Room Number</label>
                <input
                  type="text"
                  placeholder="Enter Room Number"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Teacher's Name</label>
                <input
                  type="text"
                  placeholder="Enter Teacher's Name"
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Weather</label>
                <input
                  type="text"
                  placeholder="Enter Weather"
                  value={weather}
                  onChange={(e) => setWeather(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
            <div className="upload-section">
              <h2>Upload Files and Analyze</h2>
              <div className="upload-container">
                <label className="upload-label">
                  <input
                    type="file"
                    webkitdirectory="true"
                    directory="true"
                    multiple
                    onChange={handleFileChange}
                  />
                  <div className="upload-box">
                    <div className="upload-icon">+</div>
                    <div className="upload-text">Select Folder to Upload</div>
                  </div>
                </label>
                <button onClick={handleAnalyze} disabled={loadingPage}>
                  Analyze
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisPage;
