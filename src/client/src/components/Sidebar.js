import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BarChart3,
  BookOpenCheck,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Home,
  Info,
  LogOut,
  Menu,
  ScanFace,
  X,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "./firebase";

import zenlensLogo from "../image/app.png";

import "./Sidebar.css";

const Sidebar = () => {
  const location =
    useLocation();

  const navigate =
    useNavigate();

  const [
    collapsed,
    setCollapsed,
  ] = useState(() => {
    try {
      return (
        localStorage.getItem(
          "zenlens-sidebar-collapsed"
        ) === "true"
      );
    } catch {
      return false;
    }
  });

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  const [
    authUser,
    setAuthUser,
  ] = useState(null);

  const [
    userDetails,
    setUserDetails,
  ] = useState(null);

  const [
    authLoading,
    setAuthLoading,
  ] = useState(true);

  /* ======================================================
     AUTH USER
  ====================================================== */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {
          setAuthUser(
            user
          );

          if (!user) {
            setUserDetails(
              null
            );

            setAuthLoading(
              false
            );

            return;
          }

          try {
            const userReference =
              doc(
                db,
                "Users",
                user.uid
              );

            const userSnapshot =
              await getDoc(
                userReference
              );

            if (
              userSnapshot.exists()
            ) {
              const data =
                userSnapshot.data();

              setUserDetails({
                firstName:
                  data.firstName ||
                  "",

                lastName:
                  data.lastName ||
                  "",

                email:
                  data.email ||
                  user.email ||
                  "",
              });
            } else {
              setUserDetails({
                firstName:
                  "",

                lastName:
                  "",

                email:
                  user.email ||
                  "",
              });
            }
          } catch (error) {
            console.error(
              "Unable to load user profile:",
              error
            );

            setUserDetails({
              firstName:
                "",

              lastName:
                "",

              email:
                user.email ||
                "",
            });
          } finally {
            setAuthLoading(
              false
            );
          }
        }
      );

    return () =>
      unsubscribe();
  }, []);

  /* ======================================================
     SIDEBAR WIDTH
  ====================================================== */

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--zen-sidebar-width",
      collapsed
        ? "78px"
        : "286px"
    );

    try {
      localStorage.setItem(
        "zenlens-sidebar-collapsed",
        String(
          collapsed
        )
      );
    } catch {
      // Storage unavailable.
    }
  }, [
    collapsed,
  ]);

  /* ======================================================
     CLOSE MOBILE DRAWER ON ROUTE CHANGE
  ====================================================== */

  useEffect(() => {
    setMobileOpen(
      false
    );
  }, [
    location.pathname,
  ]);

  /* ======================================================
     USER DISPLAY
  ====================================================== */

  const firstName =
    userDetails?.firstName?.trim() ||
    "";

  const lastName =
    userDetails?.lastName?.trim() ||
    "";

  const email =
    userDetails?.email?.trim() ||
    authUser?.email?.trim() ||
    "";

  const firestoreName =
    `${firstName} ${lastName}`.trim();

  const firebaseDisplayName =
    authUser?.displayName?.trim() ||
    "";

  const emailName =
    email
      ? email
          .split("@")[0]
          .trim()
      : "";

  const fullName =
    firestoreName ||
    firebaseDisplayName ||
    emailName;

  const initials =
    useMemo(() => {
      if (
        firstName ||
        lastName
      ) {
        return `${
          firstName?.[0] ||
          ""
        }${
          lastName?.[0] ||
          ""
        }`.toUpperCase();
      }

      if (
        firebaseDisplayName
      ) {
        const nameParts =
          firebaseDisplayName
            .split(" ")
            .filter(Boolean);

        if (
          nameParts.length >
          1
        ) {
          return `${
            nameParts[0][0]
          }${
            nameParts[
              nameParts.length -
              1
            ][0]
          }`.toUpperCase();
        }

        return firebaseDisplayName
          .slice(0, 2)
          .toUpperCase();
      }

      return (
        email?.[0] ||
        "U"
      ).toUpperCase();
    }, [
      firstName,
      lastName,
      firebaseDisplayName,
      email,
    ]);

  /* ======================================================
     NAVIGATION
  ====================================================== */

  const navigation =
    useMemo(
      () => [
        {
          label: "Home",
          route: "/home",
          icon: Home,
          active:
            location.pathname ===
            "/home",
        },

        {
          label:
            "Analysis",
          route:
            "/stressdetection",
          icon:
            ScanFace,
          active: [
            "/stressdetection",
            "/stressmonitoring",
          ].includes(
            location.pathname
          ),
        },

        {
          label:
            "History",
          route:
            "/sessionhistory",
          icon:
            Clock3,
          active: [
            "/sessionhistory",
            "/stresshistory",
          ].includes(
            location.pathname
          ),
        },

        {
          label:
            "Insights",
          route:
            "/overallhistory",
          icon:
            BarChart3,
          active:
            location.pathname ===
            "/overallhistory",
        },

        {
          label:
            "About",
          route:
            "/about",
          icon:
            Info,
          active:
            location.pathname ===
            "/about",
        },

        {
          label:
            "How It Works",
          route:
            "/how-it-works",
          icon:
            BookOpenCheck,
          active:
            location.pathname ===
            "/how-it-works",
        },
      ],
      [
        location.pathname,
      ]
    );

  const goTo = (
    route
  ) => {
    setMobileOpen(
      false
    );

    navigate(route);
  };

  const handleLogout =
    async () => {
      try {
        await signOut(
          auth
        );

        navigate(
          "/login"
        );
      } catch (error) {
        console.error(
          "Unable to sign out:",
          error
        );
      }
    };

  /* ======================================================
     HOVER LIGHT
  ====================================================== */

  const handlePointerMove = (
    event
  ) => {
    const element =
      event.currentTarget;

    const rectangle =
      element.getBoundingClientRect();

    element.style.setProperty(
      "--light-x",
      `${
        event.clientX -
        rectangle.left
      }px`
    );

    element.style.setProperty(
      "--light-y",
      `${
        event.clientY -
        rectangle.top
      }px`
    );

    element.style.setProperty(
      "--light-opacity",
      "1"
    );
  };

  const handlePointerLeave = (
    event
  ) => {
    event.currentTarget.style.setProperty(
      "--light-opacity",
      "0"
    );
  };

  return (
    <>
      <aside
        className={`zl-sidebar ${
          collapsed
            ? "collapsed"
            : ""
        }`}
      >
        <div className="zl-sidebar-glow glow-one" />
        <div className="zl-sidebar-glow glow-two" />

        <div className="zl-sidebar-inner">
          {/* =============================================
              BRAND
          ============================================= */}

          <button
            type="button"
            className="zl-sidebar-brand"
            onClick={() =>
              goTo(
                "/home"
              )
            }
          >
            <span className="zl-sidebar-logo">
              <img
                src={
                  zenlensLogo
                }
                alt="ZenLens"
              />
            </span>

            {!collapsed && (
              <span className="zl-sidebar-brand-copy">
                <strong>
                  ZenLens
                </strong>

                <small>
                  Classroom Stress Analytics
                </small>
              </span>
            )}
          </button>

          {/* =============================================
              NAVIGATION
          ============================================= */}

          <div className="zl-sidebar-nav-area">
            {!collapsed && (
              <p className="zl-sidebar-label">
                Workspace
              </p>
            )}

            <nav className="zl-sidebar-nav">
              {navigation.map(
                (item) => {
                  const Icon =
                    item.icon;

                  return (
                    <button
                      type="button"
                      key={
                        item.label
                      }
                      className={`zl-sidebar-nav-item ${
                        item.active
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        goTo(
                          item.route
                        )
                      }
                      onMouseMove={
                        handlePointerMove
                      }
                      onMouseLeave={
                        handlePointerLeave
                      }
                      title={
                        collapsed
                          ? item.label
                          : undefined
                      }
                      aria-label={
                        item.label
                      }
                    >
                      <span className="zl-sidebar-hover-light" />

                      <span className="zl-sidebar-nav-icon">
                        <Icon />
                      </span>

                      {!collapsed && (
                        <>
                          <span className="zl-sidebar-nav-text">
                            {
                              item.label
                            }
                          </span>

                          <ChevronRight className="zl-sidebar-nav-arrow" />
                        </>
                      )}
                    </button>
                  );
                }
              )}
            </nav>
          </div>

          {/* =============================================
              PROFILE
          ============================================= */}

          <div className="zl-sidebar-footer">
            {authLoading ? (
              <div className="zl-sidebar-user-loading">
                <span className="zl-sidebar-loading-avatar" />

                {!collapsed && (
                  <div className="zl-sidebar-loading-copy">
                    <span />
                    <span />
                  </div>
                )}
              </div>
            ) : (
              <div className="zl-sidebar-user">
                <span className="zl-sidebar-avatar">
                  {
                    initials
                  }
                </span>

                {!collapsed && (
                  <div className="zl-sidebar-user-copy">
                    <strong
                      title={
                        fullName
                      }
                    >
                      {
                        fullName
                      }
                    </strong>

                    <small
                      title={
                        email
                      }
                    >
                      {
                        email
                      }
                    </small>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              className="zl-sidebar-logout"
              onClick={
                handleLogout
              }
              title={
                collapsed
                  ? "Sign out"
                  : undefined
              }
            >
              <LogOut />

              {!collapsed && (
                <span>
                  Sign out
                </span>
              )}
            </button>
          </div>
        </div>

        {/* =============================================
            EDGE COLLAPSE CONTROL
        ============================================= */}

        <button
          type="button"
          className="zl-sidebar-edge-toggle"
          onClick={() =>
            setCollapsed(
              (
                current
              ) =>
                !current
            )
          }
          aria-label={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
          title={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
        >
          {collapsed ? (
            <ChevronRight />
          ) : (
            <ChevronLeft />
          )}
        </button>
      </aside>

      {/* ===============================================
          MOBILE HEADER
      =============================================== */}

      <header className="zl-sidebar-mobile-header">
        <button
          type="button"
          className="zl-sidebar-mobile-brand"
          onClick={() =>
            goTo(
              "/home"
            )
          }
        >
          <span>
            <img
              src={
                zenlensLogo
              }
              alt="ZenLens"
            />
          </span>

          <strong>
            ZenLens
          </strong>
        </button>

        <button
          type="button"
          className="zl-sidebar-mobile-toggle"
          onClick={() =>
            setMobileOpen(
              (
                current
              ) =>
                !current
            )
          }
          aria-label="Toggle navigation"
        >
          {mobileOpen ? (
            <X />
          ) : (
            <Menu />
          )}
        </button>
      </header>

      {/* ===============================================
          MOBILE DRAWER
      =============================================== */}

      {mobileOpen && (
        <>
          <button
            type="button"
            className="zl-sidebar-mobile-backdrop"
            aria-label="Close navigation"
            onClick={() =>
              setMobileOpen(
                false
              )
            }
          />

          <aside className="zl-sidebar-mobile-drawer">
            <div className="zl-sidebar-mobile-drawer-head">
              <div className="zl-sidebar-mobile-drawer-brand">
                <span>
                  <img
                    src={
                      zenlensLogo
                    }
                    alt="ZenLens"
                  />
                </span>

                <div>
                  <strong>
                    ZenLens
                  </strong>

                  <small>
                    Classroom Stress Analytics
                  </small>
                </div>
              </div>

              <button
                type="button"
                className="zl-sidebar-mobile-close"
                onClick={() =>
                  setMobileOpen(
                    false
                  )
                }
                aria-label="Close navigation"
              >
                <X />
              </button>
            </div>

            <nav className="zl-sidebar-mobile-nav">
              {navigation.map(
                (item) => {
                  const Icon =
                    item.icon;

                  return (
                    <button
                      type="button"
                      key={
                        item.label
                      }
                      className={
                        item.active
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        goTo(
                          item.route
                        )
                      }
                    >
                      <span>
                        <Icon />
                      </span>

                      <strong>
                        {
                          item.label
                        }
                      </strong>

                      <ChevronRight />
                    </button>
                  );
                }
              )}
            </nav>

            <div className="zl-sidebar-mobile-footer">
              {authLoading ? (
                <div className="zl-sidebar-mobile-user">
                  <span className="zl-sidebar-loading-avatar" />

                  <div className="zl-sidebar-loading-copy">
                    <span />
                    <span />
                  </div>
                </div>
              ) : (
                <div className="zl-sidebar-mobile-user">
                  <span className="zl-sidebar-avatar">
                    {
                      initials
                    }
                  </span>

                  <div>
                    <strong>
                      {
                        fullName
                      }
                    </strong>

                    <small>
                      {
                        email
                      }
                    </small>
                  </div>
                </div>
              )}

              <button
                type="button"
                className="zl-sidebar-mobile-logout"
                onClick={
                  handleLogout
                }
              >
                <LogOut />

                <span>
                  Sign out
                </span>
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
};

export default Sidebar;