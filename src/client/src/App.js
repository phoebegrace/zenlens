import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import HomePage from "./pages/Homepage";
import AnalysisPage from "./pages/Analysispage";
import HistoryPage from "./pages/Historypage";
import MonitoringPage from "./pages/Monitoringpage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SessionHisPage from "./pages/SessionHispage";
import DailyWeeklyPage from "./pages/OverallHispage";
import Aboutpage from "./pages/Aboutpage";
import HowItWorksPage from "./pages/HowItWorksPage";

import "./App.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <Router>
      <div className="app">
        <div className="content">
          <Routes>
            {/* Authentication */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Main Application */}
            <Route path="/home" element={<HomePage />} />

            {/* Analysis */}
            <Route
              path="/stressdetection"
              element={<AnalysisPage />}
            />

            <Route
              path="/stressmonitoring"
              element={<MonitoringPage />}
            />

            {/* History */}
            <Route
              path="/sessionhistory"
              element={<SessionHisPage />}
            />

            <Route
              path="/overallhistory"
              element={<DailyWeeklyPage />}
            />

            <Route
              path="/stresshistory"
              element={<HistoryPage />}
            />

            {/* Information */}
            <Route
              path="/about"
              element={<Aboutpage />}
            />

            <Route
              path="/how-it-works"
              element={<HowItWorksPage />}
            />

            {/* Unknown URLs */}
            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />
          </Routes>

          <ToastContainer
            position="top-right"
            autoClose={3500}
            hideProgressBar
            newestOnTop
            closeOnClick
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </div>
    </Router>
  );
};

export default App;