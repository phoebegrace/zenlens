import React, { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";
import logo from "../image/logo.png";
import icon1 from "../image/icon1.png";
import icon2 from "../image/icon2.png";
import icon3 from "../image/icon3.png";
import icon4 from "../image/icon4.png";
import icon5 from "../image/icon5.png";
import historyicon from "../image/historyicon.png";
import { auth } from "../components/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";

import "./Header.css";

const Header = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const navigate = useNavigate();

  // Check authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsSignedIn(!!user);
    });

    return () => unsubscribe();
  }, []);

  // Handle user logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out successfully");
      navigate("/");

   
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  return (
    <header className="header">
      <img src={logo} alt="Zenlens Logo" className="logo" />
      <nav className="nav">
        {isSignedIn ? (
          <>

            <Link to="/home" className="nav-button">
              <img src={icon1} alt="Dashboard Icon" className="nav-icon" />
              Home
            </Link>
            <Link to="/stressdetection" className="nav-button">
              <img src={icon2} alt="Record Icon" className="nav-icon" />
              Record
            </Link>
            <Link to="/sessionhistory" className="nav-button">
              <img src={historyicon} alt="History Icon" className="nav-icon" />
              History
            </Link>
            <Link to="/overallhistory" className="nav-button">
              <img src={icon3} alt="Analysis Icon" className="nav-icon" />
              Result
            </Link>
            <Link to="/about" className="nav-button">
              <img src={icon4} alt="About Icon" className="nav-icon" />
              About
            </Link>
            <Link to="/login" onClick={handleLogout} className="nav-button">
              <img src={icon5} alt="Logout Icon" className="nav-icon" />
              Logout
            </Link>
          </>
        ) : (
          <Link to="/login" className="nav-button">
            Sign-In
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Header;