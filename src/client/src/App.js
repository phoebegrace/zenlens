import React, { lazy, Suspense } from "react";

import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

import Sidebar from "./components/Sidebar";

import "./App.css";

import "@fortawesome/fontawesome-free/css/all.min.css";

import {
  ToastContainer,
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const HomePage = lazy(() => import("./pages/Homepage"));
const AnalysisPage = lazy(() => import("./pages/Analysispage"));
const HistoryPage = lazy(() => import("./pages/Historypage"));
const MonitoringPage = lazy(() => import("./pages/Monitoringpage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const SessionHisPage = lazy(() => import("./pages/SessionHispage"));
const DailyWeeklyPage = lazy(() => import("./pages/OverallHispage"));
const Aboutpage = lazy(() => import("./pages/Aboutpage"));
const HowItWorksPage = lazy(() => import("./pages/HowItWorksPage"));

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
        <ProtectedRoute><Sidebar /></ProtectedRoute>
      )}

      <div className="content">
        <Suspense fallback={<div role="status" style={{ padding: "2rem" }}>Loading ASTRA…</div>}>
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

          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* ============================================
              HOME
          ============================================ */}

          <Route
            path="/home"
            element={
              <ProtectedRoute><HomePage /></ProtectedRoute>
            }
          />

          {/* ============================================
              ANALYSIS
          ============================================ */}

          <Route
            path="/stressdetection"
            element={
              <ProtectedRoute><AnalysisPage /></ProtectedRoute>
            }
          />

          <Route
            path="/stressmonitoring"
            element={
              <ProtectedRoute><MonitoringPage /></ProtectedRoute>
            }
          />

          {/* ============================================
              HISTORY
          ============================================ */}

          <Route
            path="/sessionhistory"
            element={
              <ProtectedRoute><SessionHisPage /></ProtectedRoute>
            }
          />

          <Route
            path="/stresshistory"
            element={
              <ProtectedRoute><HistoryPage /></ProtectedRoute>
            }
          />

          {/* ============================================
              INSIGHTS
          ============================================ */}

          <Route
            path="/overallhistory"
            element={
              <ProtectedRoute><DailyWeeklyPage /></ProtectedRoute>
            }
          />

          {/* ============================================
              INFORMATION
          ============================================ */}

          <Route
            path="/about"
            element={
              <ProtectedRoute><Aboutpage /></ProtectedRoute>
            }
          />

          <Route
            path="/how-it-works"
            element={
              <ProtectedRoute><HowItWorksPage /></ProtectedRoute>
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
        </Suspense>

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