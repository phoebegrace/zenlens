import React, { useEffect, useState } from "react";
import { auth, db } from "../components/firebase";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./Homepage.css";
import Header from "../components/Header";
import paperImage from "../image/paper.png";
import teamImage from "../image/team.png";
import appImage from "../image/app.png";

const HomePage = () => {
  const navigate = useNavigate();

  // Navigate to the "How It Works" page
  const handleSeeHowItWorks = () => {
    navigate("/how-it-works");
  };

  const [userDetails, setUserDetails] = useState(null);
  
  const fetchUserData=async()=>{
    auth.onAuthStateChanged(async(user)=>{
      if (user) {
        console.log(user);
        const docRef=doc(db,"Users", user.uid);
        const docSnap=await getDoc(docRef);
        if(docSnap.exists()){
          setUserDetails(docSnap.data());
          console.log(docSnap.data());
        } else {
          console.log("User document does not exist");
        }
      } else {
        setUserDetails(null);
        console.log("User is not logged in")
      }
    });
  };

  useEffect(()=>{
    fetchUserData()
  }, [])

  // UseEffect to add the 'window-loaded' class to the body once the page is loaded
  useEffect(() => {
    document.body.classList.add("window-loaded");
    return () => {
      document.body.classList.remove("window-loaded");
    };
  }, []);

  return (
    <div className="homepage">
      <Header />
      <div className="main-content">
        {/* Intro Section */}
        <div className="intro">
        {userDetails ? (
            <>
              <div>
                <p>Welcome, {userDetails.firstName} {userDetails.lastName}</p>
              </div>
            </>
          ) : (
            <p></p>
          )}
          {/* <p>Discover ZenLens</p> */}
          <h2>
            Seeing Beyond the Surface, Support{" "}
            <span className="highlight-word">Well-Being.</span>
          </h2>
          <button className="show-app-button" onClick={handleSeeHowItWorks}>
            See How the App Works
          </button>
        </div>

        {/* Sections Area */}
        <div className="sections">
          {/* Section 1: Our App */}
          <div className="section1 app-section">
            <div className="section-content">
              <img src={appImage} alt="Label" />
              <h1>Our App</h1>
            </div>
            <div className="section-description">
              <p>
                ZenLens is a web app that analyzes student facial expressions to
                assess stress levels and provide expert-backed, evidence-based
                support recommendations.
              </p>
            </div>
          </div>

          {/* Section 2: Our Team */}
          <div className="section2 team-section">
            <div className="section-content">
              <img src={teamImage} alt="Label" />
              <h1>Our Team</h1>
            </div>
            <div className="section-description">
              <p>
                The ZenLens team consists of Computer Science students from West
                Visayas State University, dedicated to creating innovative
                solutions for student mental health.
              </p>
            </div>
          </div>

          {/* Section 3: Our Thesis */}
          <div className="section3 thesis-section">
            <div className="section-content">
              <img src={paperImage} alt="Label" />
              <h1>Thesis Paper</h1>
            </div>
            <div className="section-description">
              <p>
                Our research paper evaluates ZenLens as a tool for detecting and
                managing college student stress through facial recognition and
                personalized recommendations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
