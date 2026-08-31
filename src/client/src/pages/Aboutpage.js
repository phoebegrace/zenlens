import React from "react";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  FileImage,
  GraduationCap,
  HeartHandshake,
  Layers3,
  ScanFace,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";

import ZenLensHeader from "../components/ZenLensHeader";

import "./Aboutpage.css";

const Aboutpage = () => {
  const capabilities = [
    {
      icon: FileImage,
      title: "Image-based classroom analysis",
      description:
        "ZenLens works with classroom images collected during a session and organizes the observations into a structured analysis.",
    },
    {
      icon: ScanFace,
      title: "Facial expression processing",
      description:
        "Detected faces are processed so emotional expressions can contribute to the broader session pattern.",
    },
    {
      icon: Brain,
      title: "Emotion classification",
      description:
        "ZenLens classifies seven emotional categories that help describe what is being observed across the classroom images.",
    },
    {
      icon: BarChart3,
      title: "Session-level stress interpretation",
      description:
        "The recorded observations are summarized into a session view that helps users review stress patterns in context.",
    },
    {
      icon: TrendingUp,
      title: "Daily and weekly review",
      description:
        "Historical results can be viewed across time to help reveal patterns that may not be obvious from a single session.",
    },
    {
      icon: Layers3,
      title: "Combined monitoring",
      description:
        "Multiple sessions can be reviewed together within a selected date range for a wider view of recorded stress results.",
    },
  ];

  const audiences = [
    {
      icon: GraduationCap,
      title: "Educators",
      description:
        "A clearer way to review emotional patterns alongside the context of individual classroom sessions.",
    },
    {
      icon: HeartHandshake,
      title: "Guidance personnel",
      description:
        "Supporting information that can complement broader conversations around student well-being.",
    },
    {
      icon: Users,
      title: "Academic institutions",
      description:
        "A structured way to examine classroom stress observations across sessions and time periods.",
    },
  ];

  const faqs = [
    {
      question: "Does ZenLens analyze live classroom video?",
      answer:
        "No. ZenLens is image-based. Classroom images are collected and then uploaded as part of a session analysis.",
    },
    {
      question: "What emotions does ZenLens identify?",
      answer:
        "ZenLens classifies happiness, surprise, neutral, sadness, anger, fear, and disgust.",
    },
    {
      question: "Is ZenLens a diagnostic tool?",
      answer:
        "No. ZenLens is designed to support interpretation of classroom emotional and stress patterns. It should not be treated as a medical or psychological diagnosis.",
    },
    {
      question: "Can previous analyses be reviewed later?",
      answer:
        "Yes. ZenLens includes session history, daily and weekly insights, and combined monitoring for reviewing recorded patterns over time.",
    },
  ];

  return (
    <div className="zen-about-page">
      <ZenLensHeader />

      <main className="zen-about-main">
        {/* ==================================================
            HERO
        ================================================== */}

        <section className="zen-about-hero">
          <div className="zen-about-hero-main">
            <span className="zen-about-kicker">ABOUT ZENLENS</span>

            <h1>
              A clearer way to see
              <br />
              classroom stress
              <br />
              <em>in context.</em>
            </h1>

            <p>
              ZenLens helps organize emotional observations from classroom
              images into patterns that can be reviewed within individual
              sessions and across time.
            </p>

            <div className="zen-about-hero-actions">
              <Link
                to="/how-it-works"
                className="zen-about-primary-link"
              >
                <span>See how ZenLens works</span>
                <ArrowRight />
              </Link>

              <Link
                to="/stressdetection"
                className="zen-about-secondary-link"
              >
                Start an analysis
              </Link>
            </div>
          </div>

          <aside className="zen-about-definition-panel">
            <div className="zen-about-definition-block">
              <span>WHAT ZENLENS IS</span>

              <ul>
                <li>Image-based classroom analysis</li>
                <li>Session-focused interpretation</li>
                <li>Historical pattern review</li>
              </ul>
            </div>

            <div className="zen-about-definition-divider" />

            <div className="zen-about-definition-block muted">
              <span>WHAT IT IS NOT</span>

              <ul>
                <li>Live surveillance</li>
                <li>A medical or psychological diagnosis</li>
                <li>A replacement for professional judgment</li>
              </ul>
            </div>
          </aside>
        </section>

        {/* ==================================================
            PURPOSE
        ================================================== */}

        <section className="zen-about-purpose">
          <div className="zen-about-purpose-index">01</div>

          <div className="zen-about-purpose-heading">
            <span>WHY IT EXISTS</span>

            <h2>
              One classroom moment rarely tells the whole story.
            </h2>
          </div>

          <div className="zen-about-purpose-copy">
            <p>
              Stress is not always visible in a single image, and one
              expression should not be treated as a conclusion. Classroom
              sessions are made up of many small observations that become
              more meaningful when they are considered together.
            </p>

            <p>
              ZenLens was built around that idea. Instead of focusing on one
              isolated result, it helps users review patterns within a session
              and compare those patterns across time.
            </p>
          </div>
        </section>

        {/* ==================================================
            SIMPLE STATEMENT
        ================================================== */}

        <section className="zen-about-statement">
          <p>
            The goal is not to turn every expression into an answer.
          </p>

          <h2>
            It is to make the overall pattern easier to understand.
          </h2>
        </section>

        {/* ==================================================
            HOW IT CONNECTS
        ================================================== */}

        <section className="zen-about-process-preview">
          <div className="zen-about-process-copy">
            <span>HOW THE SYSTEM CONNECTS</span>

            <h2>
              Images become observations. Observations become patterns.
            </h2>

            <p>
              ZenLens follows a structured workflow from classroom image
              collection through facial processing, emotion classification,
              session interpretation, and historical review.
            </p>

            <Link
              to="/how-it-works"
              className="zen-about-process-link"
            >
              <span>Explore the full process</span>
              <ArrowRight />
            </Link>
          </div>

          <div className="zen-about-process-list">
            <div>
              <span>01</span>
              <strong>Collect classroom images</strong>
            </div>

            <div>
              <span>02</span>
              <strong>Detect faces and expressions</strong>
            </div>

            <div>
              <span>03</span>
              <strong>Classify emotional states</strong>
            </div>

            <div>
              <span>04</span>
              <strong>Interpret the session</strong>
            </div>

            <div>
              <span>05</span>
              <strong>Review patterns over time</strong>
            </div>
          </div>
        </section>

        {/* ==================================================
            CAPABILITIES
        ================================================== */}

        <section className="zen-about-capabilities">
          <div className="zen-about-section-intro">
            <span>WHAT ZENLENS DOES</span>

            <h2>
              Built around the way classroom sessions are actually reviewed.
            </h2>

            <p>
              The system combines image analysis, session context, and
              historical views into one workflow.
            </p>
          </div>

          <div className="zen-about-capability-list">
            {capabilities.map((capability, index) => {
              const Icon = capability.icon;

              return (
                <article
                  className="zen-about-capability-row"
                  key={capability.title}
                >
                  <span className="zen-about-capability-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="zen-about-capability-icon">
                    <Icon />
                  </div>

                  <h3>{capability.title}</h3>

                  <p>{capability.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* ==================================================
            EMOTIONS
        ================================================== */}

        <section className="zen-about-emotions">
          <div className="zen-about-emotions-copy">
            <span>SEVEN EMOTIONAL CATEGORIES</span>

            <h2>
              The analysis begins with what is observed in each face.
            </h2>

            <p>
              These emotional classifications are treated as observations
              within the larger classroom session rather than conclusions on
              their own.
            </p>
          </div>

          <div className="zen-about-emotion-words">
            <span>Happiness</span>
            <span>Surprise</span>
            <span>Neutral</span>
            <span>Sadness</span>
            <span>Anger</span>
            <span>Fear</span>
            <span>Disgust</span>
          </div>
        </section>

        {/* ==================================================
            AUDIENCE
        ================================================== */}

        <section className="zen-about-audience">
          <div className="zen-about-section-intro compact">
            <span>WHO IT SUPPORTS</span>

            <h2>
              Made for people working around classroom well-being.
            </h2>
          </div>

          <div className="zen-about-audience-list">
            {audiences.map((audience) => {
              const Icon = audience.icon;

              return (
                <article
                  className="zen-about-audience-item"
                  key={audience.title}
                >
                  <div className="zen-about-audience-icon">
                    <Icon />
                  </div>

                  <div>
                    <h3>{audience.title}</h3>
                    <p>{audience.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ==================================================
            PRINCIPLE
        ================================================== */}

        <section className="zen-about-principle">
          <div className="zen-about-principle-icon">
            <ShieldCheck />
          </div>

          <div className="zen-about-principle-heading">
            <span>AN IMPORTANT LIMIT</span>

            <h2>
              ZenLens supports interpretation. It does not make a diagnosis.
            </h2>
          </div>

          <p>
            The results are intended to provide supporting information about
            observed classroom emotional and stress patterns. Severe or
            concerning situations should still be evaluated by qualified
            professionals.
          </p>
        </section>

        {/* ==================================================
            FAQ
        ================================================== */}

        <section className="zen-about-faq">
          <div className="zen-about-faq-heading">
            <span>COMMON QUESTIONS</span>

            <h2>
              A few things worth knowing before using ZenLens.
            </h2>
          </div>

          <div className="zen-about-faq-list">
            {faqs.map((faq, index) => (
              <article
                className="zen-about-faq-item"
                key={faq.question}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>

                <div>
                  <h3>{faq.question}</h3>
                  <p>{faq.answer}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ==================================================
            FINAL CTA
        ================================================== */}

        <section className="zen-about-final">
          <div>
            <span>NEXT</span>

            <h2>
              See what happens after the images are uploaded.
            </h2>
          </div>

          <Link
            to="/how-it-works"
            className="zen-about-final-link"
          >
            <span>How ZenLens works</span>
            <ArrowRight />
          </Link>
        </section>
      </main>
    </div>
  );
};

export default Aboutpage;