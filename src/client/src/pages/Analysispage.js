import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";

import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  Brain,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Cloud,
  FileImage,
  FolderOpen,
  GraduationCap,
  Image as ImageIcon,
  LoaderCircle,
  MapPin,
  Play,
  Printer,
  RotateCcw,
  ScanFace,
  Sparkles,
  UploadCloud,
  UserRound,
  X,
} from "lucide-react";

import ZenLensHeader from "../components/ZenLensHeader";

import "./Analysispage.css";

const API_BASE_URL = "http://127.0.0.1:5000";

const EMOTION_CODES = [
  {
    label: "Happiness",
    code: "HAP",
  },
  {
    label: "Surprise",
    code: "SUR",
  },
  {
    label: "Neutral",
    code: "NEU",
  },
  {
    label: "Sadness",
    code: "SAD",
  },
  {
    label: "Anger",
    code: "ANG",
  },
  {
    label: "Fear",
    code: "FEA",
  },
  {
    label: "Disgust",
    code: "DIS",
  },
];

const EMOTION_CODE_MAP = {
  happiness: "HAP",
  happy: "HAP",

  surprise: "SUR",
  surprised: "SUR",

  neutral: "NEU",

  sadness: "SAD",
  sad: "SAD",

  anger: "ANG",
  angry: "ANG",

  fear: "FEA",
  fearful: "FEA",

  disgust: "DIS",
  disgusted: "DIS",
};

const getEmotionShortLabel = (emotion) => {
  if (!emotion) {
    return "UNK";
  }

  const normalizedEmotion = String(emotion)
    .trim()
    .toLowerCase();

  if (EMOTION_CODE_MAP[normalizedEmotion]) {
    return EMOTION_CODE_MAP[normalizedEmotion];
  }

  return String(emotion)
    .trim()
    .slice(0, 3)
    .toUpperCase();
};

const escapeHtml = (value) => {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const AnalysisPage = () => {
  const fileInputRef = useRef(null);

  const [files, setFiles] = useState([]);

  const [subject, setSubject] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [teacher, setTeacher] = useState("");
  const [weather, setWeather] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [results, setResults] = useState(null);
  const [loadingPage, setLoadingPage] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    try {
      const savedFormData = JSON.parse(
        localStorage.getItem("formData")
      );

      if (savedFormData) {
        setSubject(savedFormData.subject || "");
        setRoomNumber(savedFormData.roomNumber || "");
        setTeacher(savedFormData.teacher || "");
        setWeather(savedFormData.weather || "");
        setDate(savedFormData.date || "");
        setStartTime(savedFormData.startTime || "");
        setEndTime(savedFormData.endTime || "");
      }
    } catch (error) {
      console.error(
        "Unable to restore saved analysis form:",
        error
      );
    }
  }, []);

  const updateFiles = (selectedFiles) => {
    if (!selectedFiles) {
      return;
    }

    const normalizedFiles = Array.from(
      selectedFiles
    ).filter(
      (file) =>
        file.type.startsWith("image/") ||
        /\.(jpg|jpeg|png|webp|bmp)$/i.test(
          file.name
        )
    );

    setFiles(normalizedFiles);
    setErrorMessage("");
  };

  const handleFileChange = (event) => {
    updateFiles(event.target.files);
  };

  const handleDrop = (event) => {
    event.preventDefault();

    setIsDragging(false);

    updateFiles(
      event.dataTransfer.files
    );
  };

  const handleDragOver = (event) => {
    event.preventDefault();

    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();

    setIsDragging(false);
  };

  const openFolderPicker = () => {
    fileInputRef.current?.click();
  };

  const clearSelectedFiles = (event) => {
    event.stopPropagation();

    setFiles([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const requiredFieldsComplete =
    subject.trim() &&
    roomNumber.trim() &&
    teacher.trim() &&
    date &&
    startTime &&
    endTime;

  const canAnalyze =
    Boolean(requiredFieldsComplete) &&
    files.length > 0 &&
    !loadingPage;

  const selectedFolderName = useMemo(() => {
    if (!files.length) {
      return "";
    }

    const firstFile = files[0];

    if (firstFile.webkitRelativePath) {
      return firstFile.webkitRelativePath.split(
        "/"
      )[0];
    }

    return "Selected images";
  }, [files]);

  const handleAnalyze = async () => {
    setErrorMessage("");

    if (!requiredFieldsComplete) {
      setErrorMessage(
        "Complete the required session information before starting the analysis."
      );

      return;
    }

    if (!files.length) {
      setErrorMessage(
        "Select a folder containing classroom images before starting the analysis."
      );

      return;
    }

    setLoadingPage(true);

    const formData = new FormData();

    formData.append(
      "subject",
      subject
    );

    formData.append(
      "roomNumber",
      roomNumber
    );

    formData.append(
      "teacher",
      teacher
    );

    formData.append(
      "weather",
      weather
    );

    formData.append(
      "date",
      date
    );

    formData.append(
      "startTime",
      startTime
    );

    formData.append(
      "endTime",
      endTime
    );

    files.forEach((file) => {
      formData.append(
        "folder",
        file
      );
    });

    try {
      const response =
        await axios.post(
          `${API_BASE_URL}/analyze`,
          formData
        );

      setResults(
        response.data
      );

      const formDataToSave = {
        subject,
        roomNumber,
        teacher,
        weather,
        date,
        startTime,
        endTime,
      };

      localStorage.setItem(
        "formData",
        JSON.stringify(
          formDataToSave
        )
      );

      localStorage.setItem(
        "analysisResults",
        JSON.stringify(
          response.data
        )
      );
    } catch (error) {
      console.error(
        "Error analyzing folder:",
        error
      );

      if (error.response) {
        const serverMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          "The ZenLens server returned an error while processing the session.";

        setErrorMessage(
          serverMessage
        );
      } else if (error.request) {
        setErrorMessage(
          "ZenLens could not connect to the analysis server at 127.0.0.1:5000. Make sure python app.py is still running."
        );
      } else {
        setErrorMessage(
          error.message ||
            "The analysis could not be started. Please try again."
        );
      }
    } finally {
      setLoadingPage(false);
    }
  };

  const handleClear = () => {
    setFiles([]);

    setSubject("");
    setRoomNumber("");
    setTeacher("");
    setWeather("");
    setDate("");
    setStartTime("");
    setEndTime("");

    setResults(null);
    setErrorMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }

    localStorage.removeItem(
      "formData"
    );

    localStorage.removeItem(
      "analysisResults"
    );
  };

  const handleNewAnalysis = () => {
    setResults(null);
    setFiles([]);
    setErrorMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const totalImages =
    results?.details?.length ||
    0;

  const totalFaces = useMemo(() => {
    if (!results?.details) {
      return 0;
    }

    return results.details.reduce(
      (
        total,
        detail
      ) => {
        return (
          total +
          Object.keys(
            detail.results || {}
          ).length
        );
      },
      0
    );
  }, [results]);

  const emotionCounts = useMemo(() => {
    if (!results?.details) {
      return {};
    }

    const counts = {};

    results.details.forEach(
      (detail) => {
        Object.values(
          detail.results || {}
        ).forEach((data) => {
          const emotion =
            data?.emotion ||
            "Unknown";

          counts[emotion] =
            (counts[emotion] || 0) + 1;
        });
      }
    );

    return counts;
  }, [results]);

  const dominantEmotion = useMemo(() => {
    const entries =
      Object.entries(
        emotionCounts
      );

    if (!entries.length) {
      return "—";
    }

    return entries.sort(
      (a, b) =>
        b[1] - a[1]
    )[0][0];
  }, [emotionCounts]);

  const handlePrint = () => {
    if (!results) {
      return;
    }

    const printWindow = window.open(
      "",
      "_blank",
      "width=1100,height=900"
    );

    if (!printWindow) {
      return;
    }

    const stressCategory =
      results.stress_category ||
      "Not available";

    const dominantEmotionCode =
      dominantEmotion === "—"
        ? "—"
        : getEmotionShortLabel(
            dominantEmotion
          );

    const emotionLegendHtml =
      EMOTION_CODES.map(
        (emotion) => `
          <div class="emotion-legend-item">
            <span>${escapeHtml(
              emotion.code
            )}</span>

            <small>
              ${escapeHtml(
                emotion.label
              )}
            </small>
          </div>
        `
      ).join("");

    const resultRowsHtml =
      (results.details || [])
        .map(
          (
            detail,
            index
          ) => {
            const filename =
              detail.filename
                ?.split("/")
                .pop() ||
              `Image ${index + 1}`;

            const detectedFaces =
              Object.entries(
                detail.results ||
                  {}
              );

            const imageUrl =
              `${API_BASE_URL}/processed/${encodeURIComponent(
                filename
              )}?folder_path=${encodeURIComponent(
                results.folder_path ||
                  ""
              )}`;

            const faceRows =
              detectedFaces.length
                ? detectedFaces
                    .map(
                      (
                        [
                          face,
                          data,
                        ],
                        faceIndex
                      ) => {
                        const fullEmotion =
                          data?.emotion ||
                          "Unknown";

                        const emotionCode =
                          getEmotionShortLabel(
                            fullEmotion
                          );

                        return `
                          <div class="face-row">
                            <div class="face-number">
                              ${String(
                                faceIndex +
                                  1
                              ).padStart(
                                2,
                                "0"
                              )}
                            </div>

                            <div class="face-copy">
                              <small>
                                FACE ${
                                  faceIndex +
                                  1
                                }
                              </small>

                              <strong>
                                ${escapeHtml(
                                  emotionCode
                                )}
                              </strong>
                            </div>

                            <span
                              class="face-full-emotion"
                            >
                              ${escapeHtml(
                                fullEmotion
                              )}
                            </span>
                          </div>
                        `;
                      }
                    )
                    .join("")
                : `
                    <div class="no-face">
                      No faces were detected in this image.
                    </div>
                  `;

            return `
              <section class="image-result-card">
                <div class="image-result-top">
                  <div>
                    <span class="image-number">
                      ${String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <p>
                      IMAGE OBSERVATION
                    </p>
                  </div>

                  <div class="image-file">
                    ${escapeHtml(
                      filename
                    )}
                  </div>
                </div>

                <div class="image-result-body">
                  <div class="image-column">
                    <img
                      src="${imageUrl}"
                      alt="${escapeHtml(
                        filename
                      )}"
                    />

                    <div class="image-face-count">
                      ${detectedFaces.length}
                      ${
                        detectedFaces.length ===
                        1
                          ? "face"
                          : "faces"
                      }
                      detected
                    </div>
                  </div>

                  <div class="faces-column">
                    ${faceRows}
                  </div>
                </div>
              </section>
            `;
          }
        )
        .join("");

    printWindow.document.write(`
      <!DOCTYPE html>

      <html>
        <head>
          <meta charset="UTF-8" />

          <title>
            ZenLens Analysis Results
          </title>

          <style>
            @page {
              size: A4;
              margin: 13mm;
            }

            * {
              box-sizing: border-box;
            }

            html,
            body {
              margin: 0;
              padding: 0;
            }

            body {
              width: 100%;

              color: #1b2940;

              background: #ffffff;

              font-family:
                -apple-system,
                BlinkMacSystemFont,
                "Segoe UI",
                Arial,
                sans-serif;

              font-size: 10px;

              line-height: 1.45;

              -webkit-print-color-adjust:
                exact;

              print-color-adjust:
                exact;
            }

            .report {
              width: 100%;
            }

            .report-header {
              padding-bottom: 18px;

              display: flex;

              align-items: flex-start;

              justify-content: space-between;

              gap: 30px;

              border-bottom:
                1px solid #dfe5ee;
            }

            .report-brand {
              display: flex;

              align-items: center;

              gap: 10px;
            }

            .brand-mark {
              width: 35px;
              height: 35px;

              display: grid;

              place-items: center;

              border-radius: 8px;

              color: #ffffff;

              background:
                #315ed5;

              font-size: 13px;

              font-weight: 800;
            }

            .report-brand h1 {
              margin: 0;

              color: #0b1735;

              font-size: 17px;

              line-height: 1.1;

              font-weight: 800;

              letter-spacing:
                -0.03em;
            }

            .report-brand p {
              margin:
                3px
                0
                0;

              color: #778398;

              font-size: 8px;
            }

            .report-heading {
              text-align: right;
            }

            .report-heading span {
              display: block;

              margin-bottom: 4px;

              color: #315ed5;

              font-size: 7px;

              font-weight: 800;

              letter-spacing:
                0.12em;
            }

            .report-heading strong {
              display: block;

              color: #0b1735;

              font-size: 14px;

              font-weight: 800;
            }

            .session-section {
              padding:
                18px
                0;
            }

            .section-label {
              margin-bottom: 7px;

              color: #315ed5;

              font-size: 7px;

              font-weight: 800;

              letter-spacing:
                0.11em;
            }

            .session-title {
              margin:
                0
                0
                12px;

              color: #0b1735;

              font-size: 20px;

              line-height: 1.15;

              font-weight: 800;

              letter-spacing:
                -0.035em;
            }

            .session-grid {
              display: grid;

              grid-template-columns:
                repeat(
                  3,
                  minmax(0, 1fr)
                );

              gap:
                9px
                14px;
            }

            .session-field {
              padding:
                8px
                0;

              border-bottom:
                1px solid #edf0f5;
            }

            .session-field span {
              display: block;

              margin-bottom: 3px;

              color: #8b96a8;

              font-size: 6.5px;

              font-weight: 700;

              letter-spacing:
                0.08em;

              text-transform:
                uppercase;
            }

            .session-field strong {
              display: block;

              color: #233149;

              font-size: 9px;

              font-weight: 700;
            }

            .summary-section {
              margin-bottom: 18px;

              display: grid;

              grid-template-columns:
                repeat(
                  4,
                  minmax(0, 1fr)
                );

              gap: 8px;
            }

            .summary-card {
              min-height: 73px;

              padding: 11px;

              border:
                1px solid #e1e6ef;

              border-radius: 8px;

              background: #ffffff;
            }

            .summary-card.primary {
              border-color:
                #cbd8fa;

              background:
                #f4f7ff;
            }

            .summary-card span {
              display: block;

              margin-bottom: 7px;

              color: #7b879a;

              font-size: 6.5px;

              font-weight: 700;

              letter-spacing:
                0.06em;

              text-transform:
                uppercase;
            }

            .summary-card strong {
              display: block;

              color: #0b1735;

              font-size: 17px;

              line-height: 1;

              font-weight: 800;

              letter-spacing:
                -0.025em;
            }

            .emotion-legend {
              margin:
                0
                0
                20px;

              padding:
                11px
                12px;

              display: flex;

              align-items: center;

              flex-wrap: wrap;

              gap:
                8px
                16px;

              border:
                1px solid #e5e9f0;

              border-radius: 8px;

              background:
                #fafbfd;
            }

            .emotion-legend-title {
              margin-right: 6px;

              color: #657187;

              font-size: 7px;

              font-weight: 800;

              letter-spacing:
                0.08em;
            }

            .emotion-legend-item {
              display: inline-flex;

              align-items: center;

              gap: 5px;
            }

            .emotion-legend-item span {
              min-width: 31px;

              padding:
                3px
                5px;

              border-radius: 4px;

              color: #315ed5;

              background:
                #eaf0ff;

              text-align: center;

              font-size: 7px;

              font-weight: 800;
            }

            .emotion-legend-item small {
              color: #707c8e;

              font-size: 7px;
            }

            .results-heading {
              margin-bottom: 12px;
            }

            .results-heading h2 {
              margin:
                0
                0
                4px;

              color: #0b1735;

              font-size: 16px;

              font-weight: 800;

              letter-spacing:
                -0.025em;
            }

            .results-heading p {
              margin: 0;

              color: #778398;

              font-size: 8px;
            }

            .image-result-card {
              margin-bottom: 12px;

              padding: 12px;

              border:
                1px solid #e0e5ed;

              border-radius: 8px;

              background: #ffffff;

              break-inside: avoid;

              page-break-inside:
                avoid;
            }

            .image-result-top {
              margin-bottom: 10px;

              padding-bottom: 8px;

              display: flex;

              align-items: center;

              justify-content: space-between;

              gap: 16px;

              border-bottom:
                1px solid #eef1f5;
            }

            .image-result-top > div:first-child {
              display: flex;

              align-items: center;

              gap: 8px;
            }

            .image-number {
              min-width: 28px;

              color: #315ed5;

              font-size: 8px;

              font-weight: 800;
            }

            .image-result-top p {
              margin: 0;

              color: #8490a2;

              font-size: 6.5px;

              font-weight: 800;

              letter-spacing:
                0.09em;
            }

            .image-file {
              max-width: 65%;

              overflow: hidden;

              color: #26344c;

              font-size: 8px;

              font-weight: 700;

              text-overflow:
                ellipsis;

              white-space: nowrap;
            }

            .image-result-body {
              display: grid;

              grid-template-columns:
                175px
                minmax(0, 1fr);

              align-items: start;

              gap: 16px;
            }

            .image-column img {
              width: 100%;
              height: auto;

              max-height: 180px;

              display: block;

              object-fit: contain;

              border:
                1px solid #e4e8ef;

              border-radius: 6px;

              background:
                #f5f7fa;
            }

            .image-face-count {
              margin-top: 6px;

              color: #788497;

              font-size: 7px;
            }

            .faces-column {
              display: grid;

              gap: 6px;
            }

            .face-row {
              min-height: 42px;

              padding:
                7px
                9px;

              display: grid;

              grid-template-columns:
                29px
                minmax(0, 1fr)
                auto;

              align-items: center;

              gap: 8px;

              border:
                1px solid #e7ebf1;

              border-radius: 6px;
            }

            .face-number {
              width: 27px;
              height: 27px;

              display: grid;

              place-items: center;

              border-radius: 6px;

              color: #315ed5;

              background:
                #eef3ff;

              font-size: 7px;

              font-weight: 800;
            }

            .face-copy small {
              display: block;

              margin-bottom: 1px;

              color: #909aac;

              font-size: 5.8px;

              font-weight: 700;

              letter-spacing:
                0.07em;
            }

            .face-copy strong {
              display: block;

              color: #0b1735;

              font-size: 11px;

              font-weight: 800;
            }

            .face-full-emotion {
              color: #788397;

              font-size: 7px;
            }

            .no-face {
              padding: 11px;

              border:
                1px dashed #d8dee8;

              border-radius: 6px;

              color: #808b9c;

              font-size: 8px;
            }

            .report-notice {
              margin-top: 20px;

              padding-top: 12px;

              border-top:
                1px solid #e1e6ed;

              color: #7b8798;

              font-size: 7px;

              line-height: 1.55;
            }

            .report-footer {
              margin-top: 14px;

              display: flex;

              align-items: center;

              justify-content: space-between;

              gap: 15px;

              color: #929cad;

              font-size: 6.5px;
            }

            @media print {
              .image-result-card {
                break-inside:
                  avoid-page;

                page-break-inside:
                  avoid;
              }
            }
          </style>
        </head>

        <body>
          <main class="report">
            <header class="report-header">
              <div class="report-brand">
                <div class="brand-mark">
                  Z
                </div>

                <div>
                  <h1>
                    ZenLens
                  </h1>

                  <p>
                    Classroom Stress Analytics
                  </p>
                </div>
              </div>

              <div class="report-heading">
                <span>
                  ANALYSIS REPORT
                </span>

                <strong>
                  Classroom Session
                </strong>
              </div>
            </header>

            <section class="session-section">
              <div class="section-label">
                SESSION INFORMATION
              </div>

              <h2 class="session-title">
                ${escapeHtml(
                  subject ||
                    "Classroom Session"
                )}
              </h2>

              <div class="session-grid">
                <div class="session-field">
                  <span>
                    Teacher
                  </span>

                  <strong>
                    ${escapeHtml(
                      teacher ||
                        "Not specified"
                    )}
                  </strong>
                </div>

                <div class="session-field">
                  <span>
                    Room
                  </span>

                  <strong>
                    ${escapeHtml(
                      roomNumber ||
                        "Not specified"
                    )}
                  </strong>
                </div>

                <div class="session-field">
                  <span>
                    Date
                  </span>

                  <strong>
                    ${escapeHtml(
                      date ||
                        "Not specified"
                    )}
                  </strong>
                </div>

                <div class="session-field">
                  <span>
                    Start Time
                  </span>

                  <strong>
                    ${escapeHtml(
                      startTime ||
                        "Not specified"
                    )}
                  </strong>
                </div>

                <div class="session-field">
                  <span>
                    End Time
                  </span>

                  <strong>
                    ${escapeHtml(
                      endTime ||
                        "Not specified"
                    )}
                  </strong>
                </div>

                <div class="session-field">
                  <span>
                    Weather
                  </span>

                  <strong>
                    ${escapeHtml(
                      weather ||
                        "Not specified"
                    )}
                  </strong>
                </div>
              </div>
            </section>

            <section class="summary-section">
              <div class="summary-card primary">
                <span>
                  Stress Level
                </span>

                <strong>
                  ${escapeHtml(
                    stressCategory
                  )}
                </strong>
              </div>

              <div class="summary-card">
                <span>
                  Images Processed
                </span>

                <strong>
                  ${escapeHtml(
                    totalImages
                  )}
                </strong>
              </div>

              <div class="summary-card">
                <span>
                  Faces Detected
                </span>

                <strong>
                  ${escapeHtml(
                    totalFaces
                  )}
                </strong>
              </div>

              <div class="summary-card">
                <span>
                  Dominant Emotion
                </span>

                <strong>
                  ${escapeHtml(
                    dominantEmotionCode
                  )}
                </strong>
              </div>
            </section>

            <section class="emotion-legend">
              <strong class="emotion-legend-title">
                EMOTION CODES
              </strong>

              ${emotionLegendHtml}
            </section>

            <section class="results-heading">
              <h2>
                Image observations
              </h2>

              <p>
                Processed classroom images and emotional classifications for each detected face.
              </p>
            </section>

            ${resultRowsHtml}

            <div class="report-notice">
              ZenLens provides supporting information based on detected classroom emotional patterns. Results should not be interpreted as a medical or psychological diagnosis.
            </div>

            <footer class="report-footer">
              <span>
                ZenLens Classroom Stress Analytics
              </span>

              <span>
                Generated from the recorded classroom session
              </span>
            </footer>
          </main>
        </body>
      </html>
    `);

    printWindow.document.close();

    const waitForImages =
      Array.from(
        printWindow.document.images
      ).map((image) => {
        if (image.complete) {
          return Promise.resolve();
        }

        return new Promise(
          (resolve) => {
            image.onload =
              resolve;

            image.onerror =
              resolve;
          }
        );
      });

    Promise.all(
      waitForImages
    ).then(() => {
      setTimeout(() => {
        printWindow.focus();

        printWindow.print();
      }, 250);
    });
  };

  if (loadingPage) {
    return (
      <div className="zen-analysis-page">
        <ZenLensHeader />

        <main className="zen-analysis-loading">
          <div className="zen-analysis-loading-visual">
            <div className="zen-analysis-loading-ring ring-one" />

            <div className="zen-analysis-loading-ring ring-two" />

            <div className="zen-analysis-loading-core">
              <LoaderCircle />
            </div>
          </div>

          <span>
            ZENLENS ANALYSIS
          </span>

          <h1>
            Reviewing the classroom images.
          </h1>

          <p>
            ZenLens is processing the uploaded session and organizing
            detected emotional observations.
          </p>

          <div className="zen-analysis-loading-status">
            <i />

            Analysis in progress
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="zen-analysis-page">
      <ZenLensHeader />

      <main className="zen-analysis-main">
        {results ? (
          <section className="zen-analysis-results-view">
            <div className="zen-analysis-results-top">
              <div className="zen-analysis-results-heading">
                <button
                  type="button"
                  className="zen-analysis-back-button"
                  onClick={
                    handleNewAnalysis
                  }
                >
                  <ArrowLeft />

                  <span>
                    New analysis
                  </span>
                </button>

                <span className="zen-analysis-section-label">
                  ANALYSIS COMPLETE
                </span>

                <h1>
                  Classroom session results
                </h1>

                <p>
                  Review the emotional observations detected across
                  the uploaded classroom images.
                </p>
              </div>

              <div className="zen-analysis-result-actions">
                <button
                  type="button"
                  className="zen-analysis-print-button"
                  onClick={
                    handlePrint
                  }
                >
                  <Printer />

                  <span>
                    Print results
                  </span>
                </button>

                <button
                  type="button"
                  className="zen-analysis-clear-button"
                  onClick={
                    handleClear
                  }
                >
                  <RotateCcw />

                  <span>
                    Clear session
                  </span>
                </button>
              </div>
            </div>

            <div className="zen-analysis-summary-grid">
              <article className="zen-analysis-summary-card primary">
                <div className="zen-analysis-summary-icon">
                  <Brain />
                </div>

                <span>
                  Stress level
                </span>

                <strong>
                  {results.stress_category ||
                    "Not available"}
                </strong>

                <p>
                  Overall category returned by the ZenLens analysis.
                </p>
              </article>

              <article className="zen-analysis-summary-card">
                <div className="zen-analysis-summary-icon">
                  <ImageIcon />
                </div>

                <span>
                  Images processed
                </span>

                <strong>
                  {totalImages}
                </strong>

                <p>
                  Classroom images included in this session.
                </p>
              </article>

              <article className="zen-analysis-summary-card">
                <div className="zen-analysis-summary-icon">
                  <ScanFace />
                </div>

                <span>
                  Faces detected
                </span>

                <strong>
                  {totalFaces}
                </strong>

                <p>
                  Facial observations included in the analysis.
                </p>
              </article>

              <article className="zen-analysis-summary-card">
                <div className="zen-analysis-summary-icon">
                  <Sparkles />
                </div>

                <span>
                  Most frequent emotion
                </span>

                <strong
                  title={
                    dominantEmotion
                  }
                >
                  {dominantEmotion ===
                  "—"
                    ? "—"
                    : getEmotionShortLabel(
                        dominantEmotion
                      )}
                </strong>

                <p>
                  Most commonly classified emotion in this result set.
                </p>
              </article>
            </div>

            <div
              className="zen-analysis-results-content"
              id="printable-results"
            >
              <div className="zen-analysis-session-summary">
                <div>
                  <span>
                    SESSION INFORMATION
                  </span>

                  <h2>
                    {subject ||
                      "Classroom session"}
                  </h2>
                </div>

                <div className="zen-analysis-session-meta">
                  <span>
                    <GraduationCap />

                    {teacher ||
                      "Teacher not specified"}
                  </span>

                  <span>
                    <MapPin />

                    Room{" "}
                    {roomNumber ||
                      "—"}
                  </span>

                  <span>
                    <CalendarDays />

                    {date ||
                      "Date not specified"}
                  </span>

                  <span>
                    <Clock3 />

                    {startTime ||
                      "—"}{" "}
                    –{" "}
                    {endTime ||
                      "—"}
                  </span>

                  {weather && (
                    <span>
                      <Cloud />

                      {
                        weather
                      }
                    </span>
                  )}
                </div>
              </div>

              <div className="zen-analysis-result-list-head">
                <div>
                  <span>
                    IMAGE OBSERVATIONS
                  </span>

                  <h2>
                    Detected emotional responses
                  </h2>
                </div>

                <p>
                  Each image below shows the processed classroom image
                  and the emotion code identified for each detected face.
                </p>
              </div>

              <div className="zen-analysis-result-list">
                {results.details?.map(
                  (
                    detail,
                    index
                  ) => {
                    const filename =
                      detail.filename
                        .split("/")
                        .pop();

                    const detectedFaces =
                      Object.entries(
                        detail.results ||
                          {}
                      );

                    return (
                      <article
                        className="zen-analysis-result-row"
                        key={`${filename}-${index}`}
                      >
                        <div className="zen-analysis-result-image-wrap">
                          <img
                            src={`${API_BASE_URL}/processed/${encodeURIComponent(
                              filename
                            )}?folder_path=${encodeURIComponent(
                              results.folder_path
                            )}`}
                            alt={
                              filename
                            }
                            onError={(
                              event
                            ) => {
                              event.currentTarget.src =
                                "/placeholder.png";
                            }}
                            className="result-image"
                          />

                          <div className="zen-analysis-image-index">
                            {String(
                              index +
                                1
                            ).padStart(
                              2,
                              "0"
                            )}
                          </div>
                        </div>

                        <div className="zen-analysis-result-detail">
                          <div className="zen-analysis-result-file">
                            <span>
                              IMAGE FILE
                            </span>

                            <h3>
                              {
                                filename
                              }
                            </h3>

                            <p>
                              {
                                detectedFaces.length
                              }{" "}
                              {detectedFaces.length ===
                              1
                                ? "face"
                                : "faces"}{" "}
                              detected
                            </p>
                          </div>

                          <div className="zen-analysis-face-list">
                            {detectedFaces.length ? (
                              detectedFaces.map(
                                (
                                  [
                                    face,
                                    data,
                                  ],
                                  faceIndex
                                ) => {
                                  const fullEmotion =
                                    data?.emotion ||
                                    "Unknown";

                                  return (
                                    <div
                                      className="zen-analysis-face-item"
                                      key={`${face}-${faceIndex}`}
                                      title={
                                        fullEmotion
                                      }
                                    >
                                      <div className="zen-analysis-face-number">
                                        <ScanFace />
                                      </div>

                                      <div>
                                        <span>
                                          Face{" "}
                                          {faceIndex +
                                            1}
                                        </span>

                                        <strong>
                                          {getEmotionShortLabel(
                                            fullEmotion
                                          )}
                                        </strong>
                                      </div>

                                      <Check />
                                    </div>
                                  );
                                }
                              )
                            ) : (
                              <div className="zen-analysis-no-face">
                                <AlertCircle />

                                <span>
                                  No faces were detected in this image.
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            </div>
          </section>
        ) : (
          <>
            <section className="zen-analysis-intro">
              <div className="zen-analysis-intro-copy">
                <div className="zen-analysis-eyebrow">
                  <ScanFace />

                  <span>
                    New classroom analysis
                  </span>
                </div>

                <h1>
                  Analyze a classroom session with context.
                </h1>

                <p>
                  Add the session information and upload the classroom
                  image folder. ZenLens will process the images and
                  organize detected emotional patterns for review.
                </p>
              </div>

              <div className="zen-analysis-intro-guide">
                <span>
                  BEFORE YOU BEGIN
                </span>

                <div>
                  <i>01</i>

                  <p>
                    <strong>
                      Add session information
                    </strong>

                    <small>
                      Record the classroom context for the analysis.
                    </small>
                  </p>
                </div>

                <ChevronRight />

                <div>
                  <i>02</i>

                  <p>
                    <strong>
                      Select image folder
                    </strong>

                    <small>
                      Choose the classroom images for the session.
                    </small>
                  </p>
                </div>

                <ChevronRight />

                <div>
                  <i>03</i>

                  <p>
                    <strong>
                      Run analysis
                    </strong>

                    <small>
                      Review the processed emotional observations.
                    </small>
                  </p>
                </div>
              </div>
            </section>

            {errorMessage && (
              <div className="zen-analysis-error">
                <AlertCircle />

                <span>
                  {errorMessage}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setErrorMessage(
                      ""
                    )
                  }
                  aria-label="Dismiss error"
                >
                  <X />
                </button>
              </div>
            )}

            <section className="zen-analysis-workspace">
              <div className="zen-analysis-form-panel">
                <div className="zen-analysis-panel-heading">
                  <div className="zen-analysis-panel-icon">
                    <GraduationCap />
                  </div>

                  <div>
                    <span>
                      STEP 1
                    </span>

                    <h2>
                      Session information
                    </h2>

                    <p>
                      Add the classroom context associated with these
                      images.
                    </p>
                  </div>
                </div>

                <div className="zen-analysis-form-grid">
                  <div className="zen-analysis-field wide">
                    <label htmlFor="analysis-subject">
                      Subject
                    </label>

                    <div className="zen-analysis-input-wrap">
                      <GraduationCap />

                      <input
                        id="analysis-subject"
                        type="text"
                        placeholder="e.g. Mathematics"
                        value={
                          subject
                        }
                        onChange={(
                          event
                        ) =>
                          setSubject(
                            event.target
                              .value
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="zen-analysis-field">
                    <label htmlFor="analysis-room">
                      Room number
                    </label>

                    <div className="zen-analysis-input-wrap">
                      <MapPin />

                      <input
                        id="analysis-room"
                        type="text"
                        placeholder="e.g. 204"
                        value={
                          roomNumber
                        }
                        onChange={(
                          event
                        ) =>
                          setRoomNumber(
                            event.target
                              .value
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="zen-analysis-field">
                    <label htmlFor="analysis-teacher">
                      Teacher's name
                    </label>

                    <div className="zen-analysis-input-wrap">
                      <UserRound />

                      <input
                        id="analysis-teacher"
                        type="text"
                        placeholder="Enter teacher's name"
                        value={
                          teacher
                        }
                        onChange={(
                          event
                        ) =>
                          setTeacher(
                            event.target
                              .value
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="zen-analysis-field">
                    <label htmlFor="analysis-date">
                      Date
                    </label>

                    <div className="zen-analysis-input-wrap">
                      <CalendarDays />

                      <input
                        id="analysis-date"
                        type="date"
                        value={
                          date
                        }
                        onChange={(
                          event
                        ) =>
                          setDate(
                            event.target
                              .value
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="zen-analysis-field">
                    <label htmlFor="analysis-weather">
                      Weather

                      <span>
                        Optional
                      </span>
                    </label>

                    <div className="zen-analysis-input-wrap">
                      <Cloud />

                      <input
                        id="analysis-weather"
                        type="text"
                        placeholder="e.g. Sunny"
                        value={
                          weather
                        }
                        onChange={(
                          event
                        ) =>
                          setWeather(
                            event.target
                              .value
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="zen-analysis-field">
                    <label htmlFor="analysis-start">
                      Start time
                    </label>

                    <div className="zen-analysis-input-wrap">
                      <Clock3 />

                      <input
                        id="analysis-start"
                        type="time"
                        value={
                          startTime
                        }
                        onChange={(
                          event
                        ) =>
                          setStartTime(
                            event.target
                              .value
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="zen-analysis-field">
                    <label htmlFor="analysis-end">
                      End time
                    </label>

                    <div className="zen-analysis-input-wrap">
                      <Clock3 />

                      <input
                        id="analysis-end"
                        type="time"
                        value={
                          endTime
                        }
                        onChange={(
                          event
                        ) =>
                          setEndTime(
                            event.target
                              .value
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="zen-analysis-form-note">
                  <Sparkles />

                  <p>
                    Session information provides useful context when
                    reviewing the analysis later.
                  </p>
                </div>
              </div>

              <div className="zen-analysis-upload-panel">
                <div className="zen-analysis-panel-heading">
                  <div className="zen-analysis-panel-icon">
                    <FolderOpen />
                  </div>

                  <div>
                    <span>
                      STEP 2
                    </span>

                    <h2>
                      Classroom images
                    </h2>

                    <p>
                      Select the folder containing images captured
                      during this classroom session.
                    </p>
                  </div>
                </div>

                <input
                  ref={
                    fileInputRef
                  }
                  className="zen-analysis-hidden-input"
                  type="file"
                  webkitdirectory="true"
                  directory="true"
                  multiple
                  onChange={
                    handleFileChange
                  }
                />

                <div
                  className={`zen-analysis-dropzone ${
                    isDragging
                      ? "dragging"
                      : ""
                  } ${
                    files.length
                      ? "has-files"
                      : ""
                  }`}
                  role="button"
                  tabIndex={0}
                  onClick={
                    openFolderPicker
                  }
                  onKeyDown={(
                    event
                  ) => {
                    if (
                      event.key ===
                        "Enter" ||
                      event.key ===
                        " "
                    ) {
                      event.preventDefault();

                      openFolderPicker();
                    }
                  }}
                  onDrop={
                    handleDrop
                  }
                  onDragOver={
                    handleDragOver
                  }
                  onDragLeave={
                    handleDragLeave
                  }
                >
                  {files.length ? (
                    <>
                      <div className="zen-analysis-upload-success">
                        <Check />
                      </div>

                      <div className="zen-analysis-upload-selected-copy">
                        <span>
                          FOLDER SELECTED
                        </span>

                        <h3>
                          {
                            selectedFolderName
                          }
                        </h3>

                        <p>
                          {
                            files.length
                          }{" "}
                          {files.length ===
                          1
                            ? "image"
                            : "images"}{" "}
                          ready for analysis
                        </p>
                      </div>

                      <div className="zen-analysis-upload-selected-actions">
                        <span>
                          <FolderOpen />

                          Change folder
                        </span>

                        <button
                          type="button"
                          onClick={
                            clearSelectedFiles
                          }
                        >
                          <X />

                          Remove
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="zen-analysis-upload-icon">
                        <UploadCloud />
                      </div>

                      <span className="zen-analysis-upload-kicker">
                        SELECT CLASSROOM IMAGES
                      </span>

                      <h3>
                        Choose the session folder
                      </h3>

                      <p>
                        Select a folder containing the classroom
                        images you want ZenLens to analyze.
                      </p>

                      <span className="zen-analysis-upload-button">
                        <FolderOpen />

                        Browse folder
                      </span>

                      <small>
                        Image files inside the selected folder will
                        be included.
                      </small>
                    </>
                  )}
                </div>

                <div className="zen-analysis-upload-info">
                  <div>
                    <FileImage />

                    <p>
                      <strong>
                        Image-based
                      </strong>

                      <span>
                        ZenLens analyzes uploaded images rather than
                        continuous live video.
                      </span>
                    </p>
                  </div>

                  <div>
                    <Brain />

                    <p>
                      <strong>
                        Emotion analysis
                      </strong>

                      <span>
                        Facial observations are classified into
                        emotional categories.
                      </span>
                    </p>
                  </div>
                </div>

                <div className="zen-analysis-run-section">
                  <div className="zen-analysis-ready-status">
                    {canAnalyze ? (
                      <>
                        <span className="ready">
                          <Check />
                        </span>

                        <p>
                          <strong>
                            Ready to analyze
                          </strong>

                          <small>
                            Session information and images are ready.
                          </small>
                        </p>
                      </>
                    ) : (
                      <>
                        <span>
                          <AlertCircle />
                        </span>

                        <p>
                          <strong>
                            Analysis setup incomplete
                          </strong>

                          <small>
                            Complete the session information and
                            select an image folder.
                          </small>
                        </p>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    className="zen-analysis-run-button"
                    onClick={
                      handleAnalyze
                    }
                    disabled={
                      !canAnalyze
                    }
                  >
                    <Play />

                    <span>
                      Run analysis
                    </span>
                  </button>
                </div>
              </div>
            </section>

            <section className="zen-analysis-bottom-note">
              <div className="zen-analysis-bottom-note-icon">
                <BarChart3 />
              </div>

              <div>
                <span>
                  WHAT HAPPENS NEXT
                </span>

                <h2>
                  Results are organized into a session you can review
                  later.
                </h2>
              </div>

              <p>
                After processing, ZenLens displays the detected
                emotions for each image and keeps the session
                information connected to the result.
              </p>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default AnalysisPage;