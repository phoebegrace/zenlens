import React, { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  ChevronDown,
  Clock3,
  Home,
  LogOut,
  Menu,
  ScanFace,
  Users,
  X,
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "./firebase";

import zenlensLogo from "../image/app.png";

import "./ZenLensHeader.css";

const ZenLensHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const profileRef = useRef(null);

  const [userDetails, setUserDetails] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  /* ======================================================
     CURRENT USER
  ====================================================== */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUserDetails(null);
        return;
      }

      try {
        const userReference = doc(db, "Users", user.uid);

        const userSnapshot = await getDoc(userReference);

        if (userSnapshot.exists()) {
          setUserDetails(userSnapshot.data());
        } else {
          setUserDetails({
            email: user.email || "",
            firstName: "",
            lastName: "",
          });
        }
      } catch (error) {
        console.error("Unable to load ZenLens user:", error);

        setUserDetails({
          email: user.email || "",
          firstName: "",
          lastName: "",
        });
      }
    });

    return () => unsubscribe();
  }, []);

  /* ======================================================
     CLOSE PROFILE WHEN CLICKING OUTSIDE
  ====================================================== */

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  /* ======================================================
     CLOSE MENUS WHEN ROUTE CHANGES
  ====================================================== */

  useEffect(() => {
    setProfileOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  /* ======================================================
     USER DISPLAY DATA
  ====================================================== */

  const firstName = userDetails?.firstName || "";
  const lastName = userDetails?.lastName || "";

  const email =
    userDetails?.email ||
    auth.currentUser?.email ||
    "";

  const fullName =
    `${firstName} ${lastName}`.trim() ||
    email?.split("@")[0] ||
    "ZenLens User";

  const initials = (() => {
    if (firstName || lastName) {
      return `${firstName?.[0] || ""}${lastName?.[0] || ""}`
        .toUpperCase();
    }

    return (email?.[0] || "Z").toUpperCase();
  })();

  /* ======================================================
     NAVIGATION
  ====================================================== */

  const goTo = (path) => {
    setProfileOpen(false);
    setMobileOpen(false);

    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);

      navigate("/login");
    } catch (error) {
      console.error("Unable to sign out:", error);
    }
  };

  /* ======================================================
     ACTIVE NAV
  ====================================================== */

  const isHomeActive = location.pathname === "/home";

  const isAnalysisActive =
    location.pathname === "/stressdetection" ||
    location.pathname === "/stressmonitoring";

  const isHistoryActive =
    location.pathname === "/sessionhistory" ||
    location.pathname === "/stresshistory";

  const isInsightsActive =
    location.pathname === "/overallhistory";

  const isAboutActive =
    location.pathname === "/about" ||
    location.pathname === "/how-it-works";

  const navItems = [
    {
      label: "Home",
      route: "/home",
      icon: Home,
      active: isHomeActive,
    },
    {
      label: "Analysis",
      route: "/stressdetection",
      icon: ScanFace,
      active: isAnalysisActive,
    },
    {
      label: "History",
      route: "/sessionhistory",
      icon: Clock3,
      active: isHistoryActive,
    },
    {
      label: "Insights",
      route: "/overallhistory",
      icon: BarChart3,
      active: isInsightsActive,
    },
    {
      label: "About",
      route: "/about",
      icon: Users,
      active: isAboutActive,
    },
  ];

  return (
    <>
      <header className="zl-header">
        <div className="zl-header-inner">
          {/* ===============================================
              BRAND
          =============================================== */}

          <button
            type="button"
            className="zl-header-brand"
            onClick={() => goTo("/home")}
            aria-label="Go to ZenLens home"
          >
            <span className="zl-header-brand-mark">
              <img
                src={zenlensLogo}
                alt=""
                aria-hidden="true"
              />
            </span>

            <span className="zl-header-brand-copy">
              <strong>ZenLens</strong>

              <small>
                Classroom Stress Analytics
              </small>
            </span>
          </button>

          {/* ===============================================
              DESKTOP NAVIGATION
          =============================================== */}

          <nav
            className="zl-header-nav"
            aria-label="Main navigation"
          >
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  type="button"
                  className={`zl-header-nav-link ${
                    item.active ? "active" : ""
                  }`}
                  onClick={() => goTo(item.route)}
                  aria-current={
                    item.active ? "page" : undefined
                  }
                >
                  <Icon />

                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* ===============================================
              RIGHT SIDE
          =============================================== */}

          <div className="zl-header-actions">
            <button
              type="button"
              className="zl-header-analysis-button"
              onClick={() => goTo("/stressdetection")}
            >
              <ScanFace />

              <span>New analysis</span>
            </button>

            {/* ===========================================
                PROFILE
            =========================================== */}

            <div
              className="zl-header-profile-wrap"
              ref={profileRef}
            >
              <button
                type="button"
                className="zl-header-profile"
                onClick={() =>
                  setProfileOpen((current) => !current)
                }
                aria-expanded={profileOpen}
                aria-haspopup="menu"
              >
                <span className="zl-header-avatar">
                  {initials}
                </span>

                <span className="zl-header-profile-copy">
                  <strong>{fullName}</strong>

                  <small title={email}>
                    {email}
                  </small>
                </span>

                <ChevronDown
                  className={`zl-header-chevron ${
                    profileOpen ? "open" : ""
                  }`}
                />
              </button>

              {profileOpen && (
                <div
                  className="zl-header-profile-menu"
                  role="menu"
                >
                  <div className="zl-header-profile-summary">
                    <span className="zl-header-avatar large">
                      {initials}
                    </span>

                    <div>
                      <strong>{fullName}</strong>

                      <span title={email}>
                        {email}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="zl-header-logout"
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    <LogOut />

                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>

            {/* ===========================================
                MOBILE BUTTON
            =========================================== */}

            <button
              type="button"
              className="zl-header-mobile-toggle"
              onClick={() =>
                setMobileOpen((current) => !current)
              }
              aria-label={
                mobileOpen
                  ? "Close navigation"
                  : "Open navigation"
              }
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      {/* ==================================================
          MOBILE NAVIGATION
      ================================================== */}

      {mobileOpen && (
        <div className="zl-mobile-menu">
          <div className="zl-mobile-user">
            <span className="zl-header-avatar">
              {initials}
            </span>

            <div>
              <strong>{fullName}</strong>

              <span>{email}</span>
            </div>
          </div>

          <nav aria-label="Mobile navigation">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  type="button"
                  className={`zl-mobile-nav-link ${
                    item.active ? "active" : ""
                  }`}
                  onClick={() => goTo(item.route)}
                >
                  <Icon />

                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="zl-mobile-menu-footer">
            <button
              type="button"
              className="zl-mobile-new-analysis"
              onClick={() => goTo("/stressdetection")}
            >
              <ScanFace />

              <span>New analysis</span>
            </button>

            <button
              type="button"
              className="zl-mobile-logout"
              onClick={handleLogout}
            >
              <LogOut />

              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ZenLensHeader;