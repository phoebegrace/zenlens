import React, { useState } from "react";
import "./Aboutpage.css";
import Header from "../components/Header";

const questionsAndAnswers = [
  {
    question: "What is ZenLens?",
    answer:
      "ZenLens is a user-friendly application designed to monitor emotional trends and provide insights using advanced AI technology.",
  },
  {
    question: "Who can use ZenLens?",
    answer:
      "ZenLens is designed for IT professionals, teachers, psychiatrists, and guidance counselors to assess emotional well-being.",
  },
  {
    question: "How does ZenLens collect data?",
    answer:
      "ZenLens uses pre-collected data to analyze emotions and trends without requiring any real-time input from users.",
  },
  {
    question: "Is ZenLens secure?",
    answer:
      "Yes, ZenLens follows strict data security and privacy guidelines to ensure user information is protected.",
  },
  {
    question: "How does the user testing process work?",
    answer:
      "Participants are provided with a pre-collected dataset and asked to interact with the system, evaluating its usability and features.",
  },
  {
    question: "Can I provide feedback on ZenLens?",
    answer:
      "Absolutely! Feedback from users is highly valued and helps us improve the application.",
  },
  {
    question: "Is there a support team for ZenLens?",
    answer:
      "Yes, our support team is available to assist users with any questions or issues they may encounter.",
  },
  {
    question: "How can I participate in the user testing?",
    answer:
      "You can register your interest through our testing program, and we may offer financial assistance if needed.",
  },
  {
    question: "What are the benefits of using ZenLens?",
    answer:
      "ZenLens provides deep insights into emotional trends, helping professionals better understand and support their users.",
  },
  {
    question: "Where can I learn more about ZenLens?",
    answer:
      "Visit our official website or contact our support team for more detailed information about the application.",
  },
];

const AboutPage = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAnswer = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="about-page">
      <Header />
      <h1>about us</h1>
      <div className="faq-container">
        {questionsAndAnswers.map((item, index) => (
          <div key={index} className="faq-item">
            <div className="faq-question" onClick={() => toggleAnswer(index)}>
              <span>{item.question}</span>
              <span className="icon">{activeIndex === index ? "−" : "+"}</span>
            </div>
            {activeIndex === index && (
              <div className="faq-answer">{item.answer}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AboutPage;
