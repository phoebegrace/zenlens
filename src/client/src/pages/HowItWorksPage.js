import React from "react";

import {
  ArrowRight,
  BarChart3,
  Brain,
  Camera,
  CheckCircle2,
  FileImage,
  Layers3,
  Lightbulb,
  ScanFace,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import ZenLensHeader from "../components/ZenLensHeader";

import step1Image from "../image/step1.png";
import step2Image from "../image/step2.png";
import step3Image from "../image/step3.png";
import step4Image from "../image/step4.png";
import step5Image from "../image/step5.png";

import "./HowItWorksPage.css";

const HowItWorksPage = () => {
  const steps = [
    {
      number: "01",
      eyebrow: "COLLECT",
      title: "Upload classroom images",
      image: step1Image,
      icon: FileImage,
      description:
        "Start by selecting the classroom image folder and adding the session context that will stay connected to the analysis.",
      details: [
        "Session subject and room",
        "Teacher and schedule information",
        "Classroom image folder",
      ],
    },
    {
      number: "02",
      eyebrow: "PROCESS",
      title: "Detect faces and visual features",
      image: step2Image,
      icon: ScanFace,
      description:
        "ZenLens processes the uploaded images to locate faces and prepare the visual information required for emotion classification.",
      details: [
        "Face detection",
        "Image preprocessing",
        "Feature extraction",
      ],
    },
    {
      number: "03",
      eyebrow: "CLASSIFY",
      title: "Identify emotional expressions",
      image: step3Image,
      icon: Brain,
      description:
        "Detected faces are classified into emotional categories so each classroom image contributes to the wider session pattern.",
      details: [
        "Happiness",
        "Surprise",
        "Neutral",
        "Sadness",
        "Anger",
        "Fear",
        "Disgust",
      ],
    },
    {
      number: "04",
      eyebrow: "INTERPRET",
      title: "Assess the session stress pattern",
      image: step4Image,
      icon: BarChart3,
      description:
        "ZenLens combines the detected emotional observations and summarizes them into a session-level stress interpretation.",
      details: [
        "Image-by-image observations",
        "Session stress category",
        "Emotion frequency patterns",
      ],
    },
    {
      number: "05",
      eyebrow: "REVIEW",
      title: "Explore results across time",
      image: step5Image,
      icon: TrendingUp,
      description:
        "Completed sessions can be reviewed individually or compared across days and weeks to help reveal broader classroom trends.",
      details: [
        "Session history",
        "Daily and weekly insights",
        "Combined monitoring",
      ],
    },
  ];

  return (
    <div className="zen-how-page">
      <ZenLensHeader />

      <main className="zen-how-main">
        {/* ==================================================
            HERO
        ================================================== */}

        <section className="zen-how-hero">
          <div className="zen-how-hero-copy">
            <div className="zen-how-eyebrow">
              <Sparkles />
              <span>How ZenLens works</span>
            </div>

            <h1>
              From classroom images
              <span>to useful stress insight.</span>
            </h1>

            <p>
              ZenLens turns a collection of classroom images into a
              structured view of emotional patterns, helping users review
              stress signals within individual sessions and across time.
            </p>

            <div className="zen-how-hero-actions">
              <a
                href="/stressdetection"
                className="zen-how-primary-link"
              >
                <Camera />
                <span>Start a new analysis</span>
                <ArrowRight />
              </a>

              <a
                href="/sessionhistory"
                className="zen-how-secondary-link"
              >
                <Layers3 />
                <span>View session history</span>
              </a>
            </div>
          </div>

          <div className="zen-how-hero-visual">
            <div className="zen-how-visual-core">
              <div className="zen-how-visual-icon">
                <Brain />
              </div>

              <span>ZENLENS PROCESS</span>

              <strong>
                Observe
                <br />
                Classify
                <br />
                Interpret
              </strong>
            </div>

            <div className="zen-how-visual-node node-one">
              <FileImage />
              <span>Images</span>
            </div>

            <div className="zen-how-visual-node node-two">
              <ScanFace />
              <span>Faces</span>
            </div>

            <div className="zen-how-visual-node node-three">
              <BarChart3 />
              <span>Patterns</span>
            </div>

            <div className="zen-how-visual-node node-four">
              <TrendingUp />
              <span>Insights</span>
            </div>
          </div>
        </section>

        {/* ==================================================
            PROCESS SUMMARY
        ================================================== */}

        <section className="zen-how-summary">
          <div>
            <span>01</span>
            <p>
              <strong>Upload</strong>
              <small>Classroom session images</small>
            </p>
          </div>

          <ArrowRight />

          <div>
            <span>02</span>
            <p>
              <strong>Detect</strong>
              <small>Faces and features</small>
            </p>
          </div>

          <ArrowRight />

          <div>
            <span>03</span>
            <p>
              <strong>Classify</strong>
              <small>Emotional expressions</small>
            </p>
          </div>

          <ArrowRight />

          <div>
            <span>04</span>
            <p>
              <strong>Interpret</strong>
              <small>Stress patterns</small>
            </p>
          </div>

          <ArrowRight />

          <div>
            <span>05</span>
            <p>
              <strong>Review</strong>
              <small>Results over time</small>
            </p>
          </div>
        </section>

        {/* ==================================================
            WALKTHROUGH INTRO
        ================================================== */}

        <section className="zen-how-section-head">
          <div>
            <span>THE ZENLENS WORKFLOW</span>

            <h2>
              One session, five clear stages.
            </h2>
          </div>

          <p>
            Each stage transforms the classroom images into information
            that can be reviewed as part of the overall session context.
          </p>
        </section>

        {/* ==================================================
            STEPS
        ================================================== */}

        <section className="zen-how-steps">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <article
                className={`zen-how-step ${
                  index % 2 === 1 ? "reverse" : ""
                }`}
                key={step.number}
              >
                <div className="zen-how-step-visual">
                  <div className="zen-how-step-image-wrap">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="zen-how-step-image"
                    />

                    <div className="zen-how-step-image-label">
                      <Icon />
                      <span>{step.eyebrow}</span>
                    </div>
                  </div>

                  <span className="zen-how-step-number">
                    {step.number}
                  </span>
                </div>

                <div className="zen-how-step-copy">
                  <div className="zen-how-step-kicker">
                    <Icon />

                    <span>
                      STEP {step.number} · {step.eyebrow}
                    </span>
                  </div>

                  <h3>{step.title}</h3>

                  <p>{step.description}</p>

                  <div className="zen-how-step-details">
                    {step.details.map((detail) => (
                      <div key={detail}>
                        <CheckCircle2 />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {/* ==================================================
            INTERPRETATION NOTE
        ================================================== */}

        <section className="zen-how-interpretation">
          <div className="zen-how-interpretation-icon">
            <Lightbulb />
          </div>

          <div>
            <span>IMPORTANT CONTEXT</span>

            <h2>
              ZenLens supports interpretation, not diagnosis.
            </h2>
          </div>

          <p>
            The system is designed to help users observe emotional and
            stress patterns within classroom data. Its results should be
            interpreted as supporting information rather than a medical or
            psychological diagnosis.
          </p>
        </section>

        {/* ==================================================
            CTA
        ================================================== */}

        <section className="zen-how-cta">
          <div>
            <span>READY TO SEE IT IN ACTION?</span>

            <h2>
              Start with a classroom session.
            </h2>

            <p>
              Add the classroom context, upload the image folder, and let
              ZenLens organize the emotional observations for review.
            </p>
          </div>

          <a
            href="/stressdetection"
            className="zen-how-cta-button"
          >
            <span>Analyze a session</span>
            <ArrowRight />
          </a>
        </section>
      </main>
    </div>
  );
};

export default HowItWorksPage;