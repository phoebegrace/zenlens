import React from "react";

import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
  useLocation,
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

import Sidebar from "./components/Sidebar";

import "./App.css";

import "@fortawesome/fontawesome-free/css/all.min.css";

import {
  ToastContainer,
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

const AppContent = () => {
  const location =
    useLocation();

  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
  ];

  const showSidebar =
    !publicRoutes.includes(
      location.pathname
    );

  return (
    <div
      className={`app ${
        showSidebar
          ? "app-has-sidebar"
          : "app-public"
      }`}
    >
      {showSidebar && (
        <Sidebar />
      )}

      <div className="content">
        <Routes>
          {/* ============================================
              AUTH
          ============================================ */}

          <Route
            path="/"
            element={
              <LoginPage />
            }
          />

          <Route
            path="/login"
            element={
              <LoginPage />
            }
          />

          <Route
            path="/register"
            element={
              <RegisterPage />
            }
          />

          {/* ============================================
              HOME
          ============================================ */}

          <Route
            path="/home"
            element={
              <HomePage />
            }
          />

          {/* ============================================
              ANALYSIS
          ============================================ */}

          <Route
            path="/stressdetection"
            element={
              <AnalysisPage />
            }
          />

          <Route
            path="/stressmonitoring"
            element={
              <MonitoringPage />
            }
          />

          {/* ============================================
              HISTORY
          ============================================ */}

          <Route
            path="/sessionhistory"
            element={
              <SessionHisPage />
            }
          />

          <Route
            path="/stresshistory"
            element={
              <HistoryPage />
            }
          />

          {/* ============================================
              INSIGHTS
          ============================================ */}

          <Route
            path="/overallhistory"
            element={
              <DailyWeeklyPage />
            }
          />

          {/* ============================================
              INFORMATION
          ============================================ */}

          <Route
            path="/about"
            element={
              <Aboutpage />
            }
          />

          <Route
            path="/how-it-works"
            element={
              <HowItWorksPage />
            }
          />

          {/* ============================================
              FALLBACK
          ============================================ */}

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />
        </Routes>

        <ToastContainer
          position="top-right"
          autoClose={
            3500
          }
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
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;