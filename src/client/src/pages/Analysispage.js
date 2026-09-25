import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  CalendarDays,
  Check,
  Clock3,
  Cloud,
  FileImage,
  FolderOpen,
  GraduationCap,
  History,
  Home,
  Image as ImageIcon,
  Info,
  LineChart,
  LoaderCircle,
  LogOut,
  MapPin,
  Menu,
  Play,
  Printer,
  RotateCcw,
  ScanFace,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  UserRound,
  X,
} from "lucide-react";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  auth,
  db,
} from "../components/firebase";

import zenlensLogo from "../image/app.png";

import "./Analysispage.css";

const API_BASE_URL =
  "http://127.0.0.1:5001";

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

const getEmotionShortLabel = (
  emotion
) => {
  if (!emotion) {
    return "UNK";
  }

  const normalizedEmotion =
    String(emotion)
      .trim()
      .toLowerCase();

  if (
    EMOTION_CODE_MAP[
      normalizedEmotion
    ]
  ) {
    return EMOTION_CODE_MAP[
      normalizedEmotion
    ];
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

const navigationItems = [
  {
    label: "Home",
    icon: Home,
    route: "/home",
  },
  {
    label: "New Analysis",
    icon: ScanFace,
    route: "/stressdetection",
  },
  {
    label: "Monitoring",
    icon: Activity,
    route: "/stressmonitoring",
  },
  {
    label: "Session History",
    icon: Clock3,
    route: "/sessionhistory",
  },
  {
    label: "Overall Insights",
    icon: BarChart3,
    route: "/overallhistory",
  },
  {
    label: "Stress History",
    icon: History,
    route: "/stresshistory",
  },
];

const supportNavigation = [
  {
    label: "About ZenLens",
    icon: Info,
    route: "/about",
  },
  {
    label: "How It Works",
    icon: BookOpen,
    route: "/how-it-works",
  },
];

const AnalysisPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [userDetails, setUserDetails] =
    useState(null);

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  const [files, setFiles] =
    useState([]);

  const [subject, setSubject] =
    useState("");

  const [
    roomNumber,
    setRoomNumber,
  ] = useState("");

  const [teacher, setTeacher] =
    useState("");

  const [weather, setWeather] =
    useState("");

  const [date, setDate] =
    useState("");

  const [
    startTime,
    setStartTime,
  ] = useState("");

  const [
    endTime,
    setEndTime,
  ] = useState("");

  const [results, setResults] =
    useState(null);

  const [
    loadingPage,
    setLoadingPage,
  ] = useState(false);

  const [
    isDragging,
    setIsDragging,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const fileInputId =
    "zen-analysis-folder-input";

  /* ======================================================
     USER
  ====================================================== */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {
          if (!user) {
            setUserDetails(null);
            return;
          }

          try {
            const userRef = doc(
              db,
              "Users",
              user.uid
            );

            const snapshot =
              await getDoc(userRef);

            if (
              snapshot.exists()
            ) {
              setUserDetails(
                snapshot.data()
              );
            } else {
              setUserDetails({
                email:
                  user.email ||
                  "",
                firstName: "",
                lastName: "",
              });
            }
          } catch (error) {
            console.error(
              "Unable to load user details:",
              error
            );

            setUserDetails({
              email:
                user.email ||
                "",
              firstName: "",
              lastName: "",
            });
          }
        }
      );

    return () =>
      unsubscribe();
  }, []);

  const firstName =
    userDetails?.firstName ||
    "";

  const lastName =
    userDetails?.lastName ||
    "";

  const email =
    userDetails?.email ||
    auth.currentUser?.email ||
    "";

  const fullName =
    `${firstName} ${lastName}`.trim() ||
    email?.split("@")[0] ||
    "ZenLens User";

  const initials = (() => {
    if (
      firstName ||
      lastName
    ) {
      return `${
        firstName?.[0] || ""
      }${
        lastName?.[0] || ""
      }`.toUpperCase();
    }

    return (
      email?.[0] || "Z"
    ).toUpperCase();
  })();

  const goTo = (route) => {
    setMobileMenuOpen(false);

    navigate(route);
  };

  const handleLogout =
    async () => {
      try {
        await signOut(auth);

        navigate("/login");
      } catch (error) {
        console.error(
          "Unable to sign out:",
          error
        );
      }
    };

  /* ======================================================
     RESTORE FORM
  ====================================================== */

  useEffect(() => {
    try {
      const savedFormData =
        JSON.parse(
          localStorage.getItem(
            "formData"
          )
        );

      if (savedFormData) {
        setSubject(
          savedFormData.subject ||
            ""
        );

        setRoomNumber(
          savedFormData.roomNumber ||
            ""
        );

        setTeacher(
          savedFormData.teacher ||
            ""
        );

        setWeather(
          savedFormData.weather ||
            ""
        );

        setDate(
          savedFormData.date ||
            ""
        );

        setStartTime(
          savedFormData.startTime ||
            ""
        );

        setEndTime(
          savedFormData.endTime ||
            ""
        );
      }
    } catch (error) {
      console.error(
        "Unable to restore saved analysis form:",
        error
      );
    }
  }, []);

  /* ======================================================
     FILE INPUT
  ====================================================== */

  const updateFiles = (
    selectedFiles
  ) => {
    if (!selectedFiles) {
      return;
    }

    const normalizedFiles =
      Array.from(
        selectedFiles
      ).filter(
        (file) =>
          file.type?.startsWith(
            "image/"
          ) ||
          /\.(jpg|jpeg|png|webp|bmp)$/i.test(
            file.name
          )
      );

    setFiles(
      normalizedFiles
    );

    setErrorMessage("");
  };

  const handleFileChange = (
    event
  ) => {
    updateFiles(
      event.target.files
    );
  };

  const handleDrop = (
    event
  ) => {
    event.preventDefault();

    setIsDragging(false);

    updateFiles(
      event.dataTransfer.files
    );
  };

  const handleDragOver = (
    event
  ) => {
    event.preventDefault();

    setIsDragging(true);
  };

  const handleDragLeave = (
    event
  ) => {
    event.preventDefault();

    setIsDragging(false);
  };

  const openFolderPicker =
    () => {
      document
        .getElementById(
          fileInputId
        )
        ?.click();
    };

  const clearSelectedFiles = (
    event
  ) => {
    event.stopPropagation();

    setFiles([]);

    const input =
      document.getElementById(
        fileInputId
      );

    if (input) {
      input.value = "";
    }
  };

  const selectedFolderName =
    useMemo(() => {
      if (!files.length) {
        return "";
      }

      const firstFile =
        files[0];

      if (
        firstFile.webkitRelativePath
      ) {
        return firstFile.webkitRelativePath.split(
          "/"
        )[0];
      }

      return "Selected images";
    }, [files]);

  /* ======================================================
     VALIDATION
  ====================================================== */

  const requiredFieldsComplete =
    subject.trim() &&
    roomNumber.trim() &&
    teacher.trim() &&
    date &&
    startTime &&
    endTime;

  const canAnalyze =
    Boolean(
      requiredFieldsComplete
    ) &&
    files.length > 0 &&
    !loadingPage;

  /* ======================================================
     ANALYZE
  ====================================================== */

  const handleAnalyze =
    async () => {
      setErrorMessage("");

      if (
        !requiredFieldsComplete
      ) {
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

      const formData =
        new FormData();

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

      files.forEach(
        (file) => {
          formData.append(
            "folder",
            file
          );
        }
      );

      try {
        const response =
          await axios.post(
            `${API_BASE_URL}/analyze`,
            formData
          );

        setResults(
          response.data
        );

        localStorage.setItem(
          "formData",
          JSON.stringify({
            subject,
            roomNumber,
            teacher,
            weather,
            date,
            startTime,
            endTime,
          })
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
            error.response
              ?.data?.error ||
            error.response
              ?.data
              ?.message ||
            "The ZenLens server returned an error while processing the session.";

          setErrorMessage(
            serverMessage
          );
        } else if (
          error.request
        ) {
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

  /* ======================================================
     CLEAR
  ====================================================== */

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

    const input =
      document.getElementById(
        fileInputId
      );

    if (input) {
      input.value = "";
    }

    localStorage.removeItem(
      "formData"
    );

    localStorage.removeItem(
      "analysisResults"
    );
  };

  const handleNewAnalysis =
    () => {
      setResults(null);

      setFiles([]);

      setErrorMessage("");

      const input =
        document.getElementById(
          fileInputId
        );

      if (input) {
        input.value = "";
      }

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

  /* ======================================================
     RESULT DATA
  ====================================================== */

  const totalImages =
    results?.details?.length ||
    0;

  const totalFaces =
    useMemo(() => {
      if (!results?.details) {
        return 0;
      }

      return results.details.reduce(
        (
          total,
          detail
        ) =>
          total +
          Object.keys(
            detail.results ||
              {}
          ).length,
        0
      );
    }, [results]);

  const emotionCounts =
    useMemo(() => {
      if (!results?.details) {
        return {};
      }

      const counts = {};

      results.details.forEach(
        (detail) => {
          Object.values(
            detail.results ||
              {}
          ).forEach(
            (data) => {
              const emotion =
                data?.emotion ||
                "Unknown";

              counts[emotion] =
                (counts[
                  emotion
                ] || 0) + 1;
            }
          );
        }
      );

      return counts;
    }, [results]);

  const dominantEmotion =
    useMemo(() => {
      const entries =
        Object.entries(
          emotionCounts
        );

      if (!entries.length) {
        return "—";
      }

      return [...entries].sort(
        (a, b) =>
          b[1] - a[1]
      )[0][0];
    }, [emotionCounts]);

  /* ======================================================
     PRINT
  ====================================================== */

  const handlePrint = () => {
    if (!results) {
      return;
    }

    const printWindow =
      window.open(
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

    const dominantCode =
      dominantEmotion === "—"
        ? "—"
        : getEmotionShortLabel(
            dominantEmotion
          );

    const emotionLegend =
      EMOTION_CODES.map(
        (item) => `
          <div class="legend-item">
            <strong>${escapeHtml(
              item.code
            )}</strong>
            <span>${escapeHtml(
              item.label
            )}</span>
          </div>
        `
      ).join("");

    const imageRows =
      (
        results.details ||
        []
      )
        .map(
          (
            detail,
            index
          ) => {
            const filename =
              detail.filename
                ?.split("/")
                .pop() ||
              `Image ${
                index + 1
              }`;

            const faces =
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
              faces.length
                ? faces
                    .map(
                      (
                        [
                          face,
                          data,
                        ],
                        faceIndex
                      ) => {
                        const emotion =
                          data
                            ?.emotion ||
                          "Unknown";

                        return `
                          <div class="face-row">
                            <span>
                              Face ${
                                faceIndex +
                                1
                              }
                            </span>

                            <strong>
                              ${escapeHtml(
                                getEmotionShortLabel(
                                  emotion
                                )
                              )}
                            </strong>

                            <small>
                              ${escapeHtml(
                                emotion
                              )}
                            </small>
                          </div>
                        `;
                      }
                    )
                    .join("")
                : `
                    <div class="empty-face">
                      No faces detected.
                    </div>
                  `;

            return `
              <article class="result-row">
                <div class="result-index">
                  ${String(
                    index + 1
                  ).padStart(
                    2,
                    "0"
                  )}
                </div>

                <div class="result-image">
                  <img
                    src="${imageUrl}"
                    alt="${escapeHtml(
                      filename
                    )}"
                  />
                </div>

                <div class="result-info">
                  <span class="label">
                    IMAGE FILE
                  </span>

                  <h3>
                    ${escapeHtml(
                      filename
                    )}
                  </h3>

                  <p>
                    ${
                      faces.length
                    } ${
                      faces.length ===
                      1
                        ? "face"
                        : "faces"
                    } detected
                  </p>

                  <div class="face-list">
                    ${faceRows}
                  </div>
                </div>
              </article>
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
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 36px;

              color: #142341;

              font-family:
                Arial,
                sans-serif;

              background: #ffffff;
            }

            .report {
              max-width: 1000px;
              margin: auto;
            }

            .header {
              padding-bottom: 24px;

              display: flex;
              justify-content:
                space-between;
              align-items:
                flex-start;

              border-bottom:
                1px solid #dfe6f1;
            }

            .brand {
              display: flex;
              align-items: center;
              gap: 12px;
            }

            .brand-mark {
              width: 42px;
              height: 42px;

              display: grid;
              place-items: center;

              border-radius: 12px;

              color: white;

              background:
                linear-gradient(
                  145deg,
                  #315ed5,
                  #6d6fe7
                );

              font-weight: 800;
            }

            h1,
            h2,
            h3,
            p {
              margin-top: 0;
            }

            .header h1 {
              margin-bottom: 4px;

              color: #081935;

              font-size: 22px;
            }

            .header p {
              margin: 0;

              color: #6d7a92;

              font-size: 11px;
            }

            .report-title {
              text-align: right;
            }

            .report-title span,
            .label {
              display: block;

              margin-bottom: 6px;

              color: #315ed5;

              font-size: 9px;

              font-weight: 800;

              letter-spacing:
                0.08em;
            }

            .session {
              margin-top: 28px;

              padding: 22px;

              border:
                1px solid #dfe6f1;

              border-radius: 16px;
            }

            .session h2 {
              margin-bottom: 16px;

              color: #081935;
            }

            .session-grid {
              display: grid;

              grid-template-columns:
                repeat(
                  3,
                  1fr
                );

              gap: 16px;
            }

            .session-grid div {
              padding-bottom: 10px;

              border-bottom:
                1px solid #edf0f5;
            }

            .session-grid span {
              display: block;

              margin-bottom: 4px;

              color: #98a4b8;

              font-size: 9px;
            }

            .session-grid strong {
              font-size: 12px;
            }

            .summary {
              margin-top: 18px;

              display: grid;

              grid-template-columns:
                repeat(
                  4,
                  1fr
                );

              gap: 10px;
            }

            .summary div {
              padding: 17px;

              border:
                1px solid #dfe6f1;

              border-radius: 14px;
            }

            .summary span {
              display: block;

              margin-bottom: 9px;

              color: #6d7a92;

              font-size: 9px;
            }

            .summary strong {
              color: #081935;

              font-size: 22px;
            }

            .legend {
              margin-top: 18px;

              padding: 14px;

              display: flex;
              flex-wrap: wrap;
              gap: 12px;

              border:
                1px solid #dfe6f1;

              border-radius: 14px;

              background: #f8faff;
            }

            .legend-item {
              display: flex;
              align-items: center;
              gap: 6px;
            }

            .legend-item strong {
              padding:
                4px
                6px;

              border-radius: 5px;

              color: #315ed5;

              background: #edf3ff;

              font-size: 9px;
            }

            .legend-item span {
              color: #6d7a92;

              font-size: 9px;
            }

            .observations {
              margin-top: 28px;
            }

            .result-row {
              margin-top: 12px;

              padding: 14px;

              display: grid;

              grid-template-columns:
                38px
                220px
                1fr;

              gap: 16px;

              border:
                1px solid #dfe6f1;

              border-radius: 14px;

              page-break-inside:
                avoid;
            }

            .result-index {
              color: #315ed5;

              font-size: 12px;
              font-weight: 800;
            }

            .result-image img {
              width: 100%;

              border-radius: 10px;
            }

            .result-info h3 {
              margin-bottom: 4px;

              color: #081935;
            }

            .result-info p {
              color: #6d7a92;

              font-size: 10px;
            }

            .face-list {
              margin-top: 12px;

              display: grid;

              gap: 7px;
            }

            .face-row {
              padding:
                8px
                10px;

              display: grid;

              grid-template-columns:
                1fr
                50px
                100px;

              align-items: center;

              border:
                1px solid #edf0f5;

              border-radius: 8px;
            }

            .face-row span,
            .face-row small {
              color: #6d7a92;

              font-size: 9px;
            }

            .face-row strong {
              color: #315ed5;
            }

            .empty-face {
              color: #b64859;

              font-size: 10px;
            }

            .notice {
              margin-top: 24px;

              padding: 16px;

              border-radius: 12px;

              background: #f4f7ff;

              color: #6d7a92;

              font-size: 10px;

              line-height: 1.5;
            }

            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>

        <body>
          <main class="report">
            <header class="header">
              <div class="brand">
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

              <div class="report-title">
                <span>
                  ANALYSIS REPORT
                </span>

                <strong>
                  Classroom Session
                </strong>
              </div>
            </header>

            <section class="session">
              <span class="label">
                SESSION INFORMATION
              </span>

              <h2>
                ${escapeHtml(
                  subject ||
                    "Classroom session"
                )}
              </h2>

              <div class="session-grid">
                <div>
                  <span>
                    Teacher
                  </span>

                  <strong>
                    ${escapeHtml(
                      teacher ||
                        "—"
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Room
                  </span>

                  <strong>
                    ${escapeHtml(
                      roomNumber ||
                        "—"
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Date
                  </span>

                  <strong>
                    ${escapeHtml(
                      date ||
                        "—"
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Start
                  </span>

                  <strong>
                    ${escapeHtml(
                      startTime ||
                        "—"
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    End
                  </span>

                  <strong>
                    ${escapeHtml(
                      endTime ||
                        "—"
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Weather
                  </span>

                  <strong>
                    ${escapeHtml(
                      weather ||
                        "—"
                    )}
                  </strong>
                </div>
              </div>
            </section>

            <section class="summary">
              <div>
                <span>
                  Stress Level
                </span>

                <strong>
                  ${escapeHtml(
                    stressCategory
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Images
                </span>

                <strong>
                  ${escapeHtml(
                    totalImages
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Faces
                </span>

                <strong>
                  ${escapeHtml(
                    totalFaces
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Dominant Emotion
                </span>

                <strong>
                  ${escapeHtml(
                    dominantCode
                  )}
                </strong>
              </div>
            </section>

            <section class="legend">
              ${emotionLegend}
            </section>

            <section class="observations">
              <span class="label">
                IMAGE OBSERVATIONS
              </span>

              <h2>
                Detected emotional responses
              </h2>

              ${imageRows}
            </section>

            <div class="notice">
              ZenLens provides supporting information based on detected classroom emotional patterns. Results should not be interpreted as a medical or psychological diagnosis.
            </div>
          </main>
        </body>
      </html>
    `);

    printWindow.document.close();

    const images =
      Array.from(
        printWindow.document.images
      );

    Promise.all(
      images.map(
        (image) => {
          if (
            image.complete
          ) {
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
        }
      )
    ).then(() => {
      setTimeout(() => {
        printWindow.focus();

        printWindow.print();
      }, 250);
    });
  };

  /* ======================================================
     GLOW
  ====================================================== */

  const handleGlowMove = (
    event
  ) => {
    const element =
      event.currentTarget;

    const rect =
      element.getBoundingClientRect();

    element.style.setProperty(
      "--analysis-glow-x",
      `${
        event.clientX -
        rect.left
      }px`
    );

    element.style.setProperty(
      "--analysis-glow-y",
      `${
        event.clientY -
        rect.top
      }px`
    );

    element.style.setProperty(
      "--analysis-glow-opacity",
      "1"
    );
  };

  const handleGlowLeave = (
    event
  ) => {
    event.currentTarget.style.setProperty(
      "--analysis-glow-opacity",
      "0"
    );
  };

  const glowProps = {
    onMouseMove:
      handleGlowMove,
    onMouseLeave:
      handleGlowLeave,
  };

  /* ======================================================
     SHARED SIDEBAR
  ====================================================== */

  const renderSidebar = () => (
    <>
      <aside className="zen-analysis-sidebar">
        <div className="zen-analysis-sidebar-inner">
          <button
            type="button"
            className="zen-analysis-brand"
            onClick={() =>
              goTo("/home")
            }
          >
            <span className="zen-analysis-brand-mark">
              <img
                src={zenlensLogo}
                alt="ZenLens"
              />
            </span>

            <span className="zen-analysis-brand-copy">
              <strong>
                ZenLens
              </strong>

              <small>
                Classroom Stress Analytics
              </small>
            </span>
          </button>

          <div className="zen-analysis-nav-scroll">
            <p className="zen-analysis-nav-label">
              Workspace
            </p>

            <nav className="zen-analysis-navigation">
              {navigationItems.map(
                (item) => {
                  const Icon =
                    item.icon;

                  const active =
                    location.pathname ===
                    item.route;

                  return (
                    <button
                      type="button"
                      key={
                        item.label
                      }
                      className={`zen-analysis-nav-item ${
                        active
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        goTo(
                          item.route
                        )
                      }
                    >
                      <span className="zen-analysis-nav-icon">
                        <Icon />
                      </span>

                      <span>
                        {
                          item.label
                        }
                      </span>
                    </button>
                  );
                }
              )}
            </nav>

            <div className="zen-analysis-nav-divider" />

            <p className="zen-analysis-nav-label">
              Support
            </p>

            <nav className="zen-analysis-navigation">
              {supportNavigation.map(
                (item) => {
                  const Icon =
                    item.icon;

                  return (
                    <button
                      type="button"
                      key={
                        item.label
                      }
                      className="zen-analysis-nav-item"
                      onClick={() =>
                        goTo(
                          item.route
                        )
                      }
                    >
                      <span className="zen-analysis-nav-icon">
                        <Icon />
                      </span>

                      <span>
                        {
                          item.label
                        }
                      </span>
                    </button>
                  );
                }
              )}
            </nav>
          </div>

          <div className="zen-analysis-sidebar-bottom">
            <div className="zen-analysis-user">
              <span className="zen-analysis-user-avatar">
                {initials}
              </span>

              <div className="zen-analysis-user-copy">
                <strong>
                  {fullName}
                </strong>

                <small>
                  {email}
                </small>
              </div>
            </div>

            <button
              type="button"
              className="zen-analysis-signout"
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
        </div>
      </aside>

      <header className="zen-analysis-mobile-header">
        <button
          type="button"
          className="zen-analysis-mobile-brand"
          onClick={() =>
            goTo("/home")
          }
        >
          <span>
            <img
              src={zenlensLogo}
              alt="ZenLens"
            />
          </span>

          <strong>
            ZenLens
          </strong>
        </button>

        <button
          type="button"
          className="zen-analysis-mobile-toggle"
          aria-label="Toggle navigation"
          onClick={() =>
            setMobileMenuOpen(
              (current) =>
                !current
            )
          }
        >
          {mobileMenuOpen ? (
            <X />
          ) : (
            <Menu />
          )}
        </button>
      </header>

      {mobileMenuOpen && (
        <div className="zen-analysis-mobile-drawer">
          <div className="zen-analysis-mobile-user">
            <span className="zen-analysis-user-avatar">
              {initials}
            </span>

            <div>
              <strong>
                {fullName}
              </strong>

              <small>
                {email}
              </small>
            </div>
          </div>

          <nav>
            {[
              ...navigationItems,
              ...supportNavigation,
            ].map((item) => {
              const Icon =
                item.icon;

              const active =
                location.pathname ===
                item.route;

              return (
                <button
                  type="button"
                  key={
                    item.label
                  }
                  className={
                    active
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    goTo(
                      item.route
                    )
                  }
                >
                  <Icon />

                  <span>
                    {
                      item.label
                    }
                  </span>
                </button>
              );
            })}

            <button
              type="button"
              className="logout"
              onClick={
                handleLogout
              }
            >
              <LogOut />

              <span>
                Sign out
              </span>
            </button>
          </nav>
        </div>
      )}
    </>
  );

  /* ======================================================
     UI
  ====================================================== */

  return (
    <div className="zen-analysis-page">
      {renderSidebar()}

      <main className="zen-analysis-main">
        <div className="zen-analysis-orb orb-one" />
        <div className="zen-analysis-orb orb-two" />

        <div className="zen-analysis-content">
          {loadingPage ? (
            <section className="zen-analysis-loading-card">
              <div className="zen-analysis-loading-visual">
                <span className="zen-analysis-loading-ring ring-one" />

                <span className="zen-analysis-loading-ring ring-two" />

                <span className="zen-analysis-loading-core">
                  <LoaderCircle />
                </span>
              </div>

              <span className="zen-analysis-loading-kicker">
                ZENLENS ANALYSIS
              </span>

              <h1>
                Reviewing the classroom images.
              </h1>

              <p>
                ZenLens is processing the uploaded session and organizing detected emotional observations.
              </p>

              <div className="zen-analysis-loading-status">
                <i />

                Analysis in progress
              </div>
            </section>
          ) : results ? (
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
                    Classroom session
                    <span>
                      {" "}
                      results.
                    </span>
                  </h1>

                  <p>
                    Review the emotional observations detected across the uploaded classroom images.
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
                <article
                  className="zen-analysis-summary-card primary zen-analysis-glow-card"
                  {...glowProps}
                >
                  <span className="zen-analysis-card-glow" />

                  <div className="zen-analysis-card-layer">
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
                  </div>
                </article>

                <article
                  className="zen-analysis-summary-card zen-analysis-glow-card"
                  {...glowProps}
                >
                  <span className="zen-analysis-card-glow" />

                  <div className="zen-analysis-card-layer">
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
                  </div>
                </article>

                <article
                  className="zen-analysis-summary-card zen-analysis-glow-card"
                  {...glowProps}
                >
                  <span className="zen-analysis-card-glow" />

                  <div className="zen-analysis-card-layer">
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
                  </div>
                </article>

                <article
                  className="zen-analysis-summary-card zen-analysis-glow-card"
                  {...glowProps}
                >
                  <span className="zen-analysis-card-glow" />

                  <div className="zen-analysis-card-layer">
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
                  </div>
                </article>
              </div>

              <section
                className="zen-analysis-session-result zen-analysis-glow-card"
                {...glowProps}
              >
                <span className="zen-analysis-card-glow" />

                <div className="zen-analysis-card-layer">
                  <div className="zen-analysis-session-head">
                    <div>
                      <span className="zen-analysis-section-label">
                        SESSION INFORMATION
                      </span>

                      <h2>
                        {subject ||
                          "Classroom session"}
                      </h2>
                    </div>

                    <ShieldCheck />
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

                        {weather}
                      </span>
                    )}
                  </div>
                </div>
              </section>

              <div className="zen-analysis-result-list-head">
                <div>
                  <span className="zen-analysis-section-label">
                    IMAGE OBSERVATIONS
                  </span>

                  <h2>
                    Detected emotional responses
                  </h2>
                </div>

                <p>
                  Each result shows the processed classroom image and the emotion identified for every detected face.
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
                        ?.split("/")
                        .pop() ||
                      `Image ${
                        index + 1
                      }`;

                    const detectedFaces =
                      Object.entries(
                        detail.results ||
                          {}
                      );

                    return (
                      <article
                        className="zen-analysis-result-row zen-analysis-glow-card"
                        key={`${filename}-${index}`}
                        {...glowProps}
                      >
                        <span className="zen-analysis-card-glow" />

                        <div className="zen-analysis-card-layer result">
                          <div className="zen-analysis-result-image-wrap">
                            <img
                              src={`${API_BASE_URL}/processed/${encodeURIComponent(
                                filename
                              )}?folder_path=${encodeURIComponent(
                                results.folder_path ||
                                  ""
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
                            />

                            <span className="zen-analysis-image-index">
                              {String(
                                index +
                                  1
                              ).padStart(
                                2,
                                "0"
                              )}
                            </span>
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
                                      data
                                        ?.emotion ||
                                      "Unknown";

                                    return (
                                      <div
                                        className="zen-analysis-face-item"
                                        key={`${face}-${faceIndex}`}
                                        title={
                                          fullEmotion
                                        }
                                      >
                                        <span className="zen-analysis-face-number">
                                          <ScanFace />
                                        </span>

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

                                          <small>
                                            {
                                              fullEmotion
                                            }
                                          </small>
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
                        </div>
                      </article>
                    );
                  }
                )}
              </div>

              <section className="zen-analysis-bottom-note">
                <div className="zen-analysis-bottom-note-icon">
                  <ShieldCheck />
                </div>

                <div>
                  <span>
                    INTERPRETATION SUPPORT
                  </span>

                  <h2>
                    ZenLens supports classroom stress assessment.
                  </h2>
                </div>

                <p>
                  Results help organize classroom emotional patterns and should be interpreted alongside appropriate educational and professional judgment.
                </p>
              </section>
            </section>
          ) : (
            <>
              <section className="zen-analysis-intro">
                <div className="zen-analysis-intro-copy">
                  <span className="zen-analysis-eyebrow">
                    <Sparkles />

                    ZenLens analysis workspace
                  </span>

                  <p className="zen-analysis-overline">
                    Image-based classroom analysis
                  </p>

                  <h1>
                    New Classroom
                    <span>
                      {" "}
                      Analysis
                    </span>
                  </h1>

                  <p className="zen-analysis-description">
                    Add the classroom context and upload the session image folder. ZenLens will process the images and organize detected emotional patterns for review.
                  </p>
                </div>

                <div className="zen-analysis-intro-guide">
                  <div>
                    <i>
                      01
                    </i>

                    <p>
                      <strong>
                        Session information
                      </strong>

                      <small>
                        Add classroom context
                      </small>
                    </p>
                  </div>

                  <ArrowRight />

                  <div>
                    <i>
                      02
                    </i>

                    <p>
                      <strong>
                        Classroom images
                      </strong>

                      <small>
                        Select the image folder
                      </small>
                    </p>
                  </div>

                  <ArrowRight />

                  <div>
                    <i>
                      03
                    </i>

                    <p>
                      <strong>
                        Analyze
                      </strong>

                      <small>
                        Review the session
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
                <article
                  className="zen-analysis-form-panel zen-analysis-glow-card"
                  {...glowProps}
                >
                  <span className="zen-analysis-card-glow" />

                  <div className="zen-analysis-card-layer">
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
                          Add the classroom context associated with the images.
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
                                event
                                  .target
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
                                event
                                  .target
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
                                event
                                  .target
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
                                event
                                  .target
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
                                event
                                  .target
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
                                event
                                  .target
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
                                event
                                  .target
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
                        Session information stays connected to the analysis so the result can be understood in context later.
                      </p>
                    </div>
                  </div>
                </article>

                <article
                  className="zen-analysis-upload-panel zen-analysis-glow-card"
                  {...glowProps}
                >
                  <span className="zen-analysis-card-glow" />

                  <div className="zen-analysis-card-layer">
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
                          Select the folder containing images captured during this classroom session.
                        </p>
                      </div>
                    </div>

                    <input
                      id={
                        fileInputId
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
                            Select a folder containing the classroom images you want ZenLens to analyze.
                          </p>

                          <span className="zen-analysis-upload-button">
                            <FolderOpen />

                            Browse folder
                          </span>

                          <small>
                            JPG, JPEG, PNG, WEBP and BMP images are supported.
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
                            ZenLens analyzes uploaded images rather than continuous live video.
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
                            Facial observations are organized into supported emotional categories.
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
                                Setup incomplete
                              </strong>

                              <small>
                                Complete the required fields and select an image folder.
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
                          Analyze session
                        </span>
                      </button>
                    </div>
                  </div>
                </article>
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
                    Results are organized into a classroom session you can review later.
                  </h2>
                </div>

                <p>
                  ZenLens displays detected emotions for each processed image and keeps the classroom context connected to the analysis result.
                </p>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AnalysisPage;