import React from "react";
import "./HowItWorksPage.css";
import step1Image from "../image/step1.png";
import step2Image from "../image/step2.png";
import step3Image from "../image/step3.png";
import step4Image from "../image/step4.png";
import step5Image from "../image/step5.png";
import Header from "../components/Header";

const HowItWorksPage = () => {
  const steps = [
    {
      title: "Step 1: Upload Student Data",
      image: step1Image,
      description:
        "Users start by uploading pre-collected student data for analysis.",
    },
    {
      title: "Step 2: Facial Expression Analysis",
      image: step2Image,
      description:
        "The app analyzes facial expressions to detect signs of stress.",
    },
    {
      title: "Step 3: Emotion Detection",
      image: step3Image,
      description: "ZenLens identifies emotional states and trends over time.",
    },
    {
      title: "Step 4: Stress Level Assessment",
      image: step4Image,
      description: "Stress levels are evaluated using AI-driven analysis.",
    },
    {
      title: "Step 5: Personalized Recommendations",
      image: step5Image,
      description:
        "The app provides personalized recommendations based on the analysis.",
    },
  ];

  return (
    <div className="how-it-works-page">
      <Header />
      <h1>See How the App Works</h1>
      <div className="steps-container">
        {steps.map((step, index) => (
          <div className="step-card" key={index}>
            <img src={step.image} alt={step.title} className="step-image" />
            <h2>{step.title}</h2>
            <p>{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorksPage;
