import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/Homepage";
import AnalysisPage from "./pages/Analysispage";
import HistoryPage from "./pages/Historypage";
import MonitoringPage from "./pages/Monitoringpage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SessionHisPage from "./pages/SessionHispage";
import DailyWeeklyPage from "./pages/OverallHispage";
import Aboutpage from "./pages/Aboutpage"; // Import the AboutPage
import HowItWorksPage from "./pages/HowItWorksPage";
import "./App.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { ToastContainer } from "react-toastify";

const App = () => {
  return (
    <Router>
      <div className="app">
        <div className="content">
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/stressdetection" element={<AnalysisPage />} />
            <Route path="/stressmonitoring" element={<MonitoringPage />} />
            <Route path="/sessionhistory" element={<SessionHisPage />} />
            <Route path="/overallhistory" element={<DailyWeeklyPage />} />
            <Route path="/stresshistory" element={<HistoryPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/about" element={<Aboutpage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />{" "}
            {/* New route for About Page */}
          </Routes>
          <ToastContainer />
        </div>
      </div>
    </Router>
  );
};

export default App;