import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import "./App.css";

import {
  analyzeText,
  analyzeFile,
  updateCaseStatus,
  getAllCases,
  getCase,
  getDashboardStats,
  askAssistant as askAssistantAPI,
  deleteCaseAsUser,
  deleteCaseAsAdmin,
} from "./services/api";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function App() {
  const [text, setText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState(null);
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        menuOpen &&
        !event.target.closest(".side-menu") &&
        !event.target.closest(".menu-button")
      ) {
        setMenuOpen(false);
      }
    };
  
    document.addEventListener("click", handleOutsideClick);
  
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [menuOpen]);
  const [assistantOpen, setAssistantOpen] = useState(false);
  console.log("assistantOpen:", assistantOpen);
  const [imageFile, setImageFile] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);
  const chatEndRef = useRef(null);
  const suggestionsRef = useRef(null);
  const [audioFile, setAudioFile] = useState(null);
  const assistantCardRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [showHomeButton, setShowHomeButton] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [sourceType, setSourceType] = useState("SMS");
  const [bankName, setBankName] = useState("");
  const [context, setContext] = useState("");

  const [loading, setLoading] = useState(false);

  const [cases, setCases] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);

  const [selectedCase, setSelectedCase] = useState(null);
  const [caseLoading, setCaseLoading] = useState(false);
  const [caseStatusMessage, setCaseStatusMessage] = useState("");
  const [caseType, setCaseType] = useState(null);
  const [riskFilter, setRiskFilter] = useState("ALL");

  const loadCases = async () => {
    try {
      const data = await getAllCases();
      setCases(data.cases);
  
      const stats = await getDashboardStats();
      setDashboardStats(stats);
  
    } catch (err) {
      console.error("Dashboard error:", err);
      console.error("Response:", err.response?.data);
    }
  };
  const handleCaseClick = async (caseId) => {
    if (selectedCase?.case_id === caseId) {
      setSelectedCase(null);
      setAnalysisResult(null);
      setChatMessages([]);
      return;
    }
  
    try {
      setCaseLoading(true);
  
      const data = await getCase(caseId);
  
      setSelectedCase(data);
  
      setAnalysisResult(null);
  
      setChatMessages([]);
  
    } catch (err) {
      console.error("Unable to load case:", err);
    } finally {
      setCaseLoading(false);
    }
  };

  const handleUserDelete = async () => {
    if (!selectedCase || !deleteToken.trim()) {
      setDeleteMessage("Please enter your delete token.");
      return;
    }
  
    try {
      setDeleteLoading(true);
      setDeleteMessage("");
  
      await deleteCaseAsUser(
        selectedCase.case_id,
        deleteToken.trim()
      );
  
      setDeleteMessage("Case deleted successfully.");
  
      setSelectedCase(null);
      setDeleteToken("");
  
      const data = await getAllCases();
      setCases(data.cases || []);
  
      const stats = await getDashboardStats();
      setDashboardStats(stats);
  
    } catch (error) {
      console.error("User delete error:", error);
  
      setDeleteMessage(
        error.response?.data?.detail ||
        "Unable to delete the case."
      );
    } finally {
      setDeleteLoading(false);
    }
  };
  const handleAdminDelete = async () => {
    if (!selectedCase) {
      setDeleteMessage("No case selected.");
      return;
    }
  
    const adminPin = window.prompt(
      "Enter the authority admin PIN:"
    );
  
    if (!adminPin) {
      return;
    }
  
    try {
      setDeleteLoading(true);
      setDeleteMessage("");
  
      await deleteCaseAsAdmin(
        selectedCase.case_id,
        adminPin
      );
  
      setDeleteMessage(
        "Case deleted successfully by authority."
      );
  
      setSelectedCase(null);
      setDeleteToken("");
  
      const data = await getAllCases();
      setCases(data.cases || []);
  
      const stats = await getDashboardStats();
      setDashboardStats(stats);
  
    } catch (error) {
      console.error("Admin delete error:", error);
  
      setDeleteMessage(
        error.response?.data?.detail ||
        "Unable to delete the case."
      );
    } finally {
      setDeleteLoading(false);
    }
  };
  
  const updateSelectedCaseStatus = async (status) => {
    if (!selectedCase?.case_id) return;
  
    try {
      setCaseLoading(true);
      setCaseStatusMessage("");
  
      const updated = await updateCaseStatus(
        selectedCase.case_id,
        status
      );
  
      setSelectedCase((prev) => ({
        ...prev,
        status: updated.status,
      }));
  
      await loadCases();
  
      setCaseStatusMessage(
        `Case status updated to ${updated.status}.`
      );
  
    } catch (err) {
      console.error("Unable to update case status:", err);
      setCaseStatusMessage("Unable to update case status.");
  
    } finally {
      setCaseLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);
const [error, setError] = useState("");
const [analysisResult, setAnalysisResult] = useState(null);
const [chatInput, setChatInput] = useState("");
const [chatMessages, setChatMessages] = useState([]);

const [decisionLoading, setDecisionLoading] = useState(false);
const [decisionMessage, setDecisionMessage] = useState("");
const [deleteToken, setDeleteToken] = useState("");
const [deleteMessage, setDeleteMessage] = useState("");
const [deleteLoading, setDeleteLoading] = useState(false);

useEffect(() => {
  const handleScroll = () => {
    const detailsSection = document.querySelector(".details-card");

    if (!detailsSection) return;

    const rect = detailsSection.getBoundingClientRect();

    setShowHomeButton(rect.top <= 100);
  };

  window.addEventListener("scroll", handleScroll);

  return () => {
    window.removeEventListener("scroll", handleScroll);
  };
}, []);

useEffect(() => {
  const lastMessage = chatMessages[chatMessages.length - 1];

  if (lastMessage?.role === "assistant") {
    chatEndRef.current?.scrollIntoView({
      behavior: "auto",
      block: "end",
    });
  }
}, [chatMessages]);

const typeAssistantMessage = (text) => {
  text = text.replace(/(\d+)\.\s+/g, "\n\n$1. ");
  let index = 0;

  setChatMessages((previous) => [
    ...previous,
    {
      role: "assistant",
      text: "",
    },
  ]);

  const interval = setInterval(() => {
    index++;

    setChatMessages((previous) => {
      const updated = [...previous];
    
      updated[updated.length - 1] = {
        role: "assistant",
        text: text.slice(0, index),
      };
    
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({
          behavior: "auto",
          block: "end",
        });
      }, 0);
    
      return updated;
    });

    if (index >= text.length) {
      clearInterval(interval);
    
      setTimeout(() => {
        suggestionsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }, 100);
    }
  }, 20);
};

const handleVoiceRecording = async () => {
  if (isRecording) {
    mediaRecorder?.stop();
    setIsRecording(false);
    return;
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  const recorder = new MediaRecorder(stream);
  const chunks = [];

  recorder.ondataavailable = (event) => {
    chunks.push(event.data);
  };

  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: "audio/webm" });
    const file = new File([blob], "voice-recording.webm", {
      type: "audio/webm",
    });

    setAudioFile(file);
    stream.getTracks().forEach((track) => track.stop());
  };

  recorder.start();

  setMediaRecorder(recorder);
  setIsRecording(true);
};

const openCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false,
    });

    setCameraStream(stream);
    setCameraOpen(true);

    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    }, 100);
  } catch (error) {
    console.error("Camera access error:", error);
    setError("Unable to access the camera. Please allow camera permission.");
  }
};

const capturePhoto = () => {
  const video = videoRef.current;

  if (!video || video.readyState < 2) {
    console.log("Camera is not ready");
    return;
  }

  const canvas = document.createElement("canvas");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const context = canvas.getContext("2d");
  context.drawImage(video, 0, 0);

  canvas.toBlob((blob) => {
    if (!blob) return;

    const file = new File([blob], "camera-photo.jpg", {
      type: "image/jpeg",
    });

    setImageFile(file);

    cameraStream?.getTracks().forEach((track) => track.stop());

    setCameraStream(null);
    setCameraOpen(false);
  }, "image/jpeg");
};

const handleAnalyze = async () => {
  setError("");

  if (!text.trim() && !imageFile && !audioFile) {
    setError("Please enter text or upload evidence first.");
    return;
  }

  try {
    setLoading(true);

    let result;

    if (text.trim()) {
      result = await analyzeText(text);

    } else if (imageFile) {
      result = await analyzeFile(imageFile);

    } else if (audioFile) {
      result = await analyzeFile(audioFile);
    }

    setAnalysisResult(result);

  } catch (err) {

    console.error(err);

    setError(
      err.response?.data?.detail ||
      "Unable to analyze the evidence."
    );

  } finally {

    setLoading(false);

  }
};

const askAssistant = async (question) => {

  if (!question.trim()) {
    return;
  }

  const userMessage = {
    role: "user",
    text: question,
  };

  setChatMessages((previous) => [
    ...previous,
    userMessage,
  ]);

  setChatInput("");

  try {

    const evidenceText =
  analysisResult?.evidence?.text ||
  selectedCase?.evidence_text ||
  "";

  const riskAnalysis =
  analysisResult?.risk_analysis ||
  (selectedCase
    ? {
        risk_score: selectedCase.risk_score || 0,
        risk_level: selectedCase.risk_level || "LOW",
        indicators: selectedCase.indicators || [],
      }
    : {});

const reasoning =
  analysisResult?.llm_reasoning ||
  selectedCase?.llm_reasoning ||
  "";

const response = await askAssistantAPI(
  question,
  evidenceText,
  riskAnalysis,
  reasoning
);

typeAssistantMessage(response.answer);

  } catch (error) {

    console.error("AI Assistant error:", error);

    setChatMessages((previous) => [
      ...previous,
      {
        role: "assistant",
        text: "Unable to connect to the AI Assistant. Please try again.",
      },
    ]);
  }
};

  const handleDecision = async (status) => {

    const caseId = analysisResult?.case_id;
  
    if (!caseId) {
      setDecisionMessage(
        "Case ID is not available for this analysis."
      );
      return;
    }
  
    try {
  
      setDecisionLoading(true);
      setDecisionMessage("");
  
      const result = await updateCaseStatus(
        caseId,
        status
      );
  
  
      setDecisionMessage(
        `Case status updated to ${result.status}.`
      );
  
    } catch (err) {
  
      console.error(err);
  
      setDecisionMessage(
        err.response?.data?.detail ||
        "Unable to update case status."
      );
  
    } finally {
  
      setDecisionLoading(false);
  
    }
  };

  const riskScore =
  analysisResult?.risk_analysis?.risk_score ?? 0;

const riskLevel =
  analysisResult?.risk_analysis?.risk_level ?? "LOW";

const indicators =
  analysisResult?.risk_analysis?.indicators ?? [];

const entities =
  analysisResult?.entities ?? {};

const llmReasoning =
  analysisResult?.llm_reasoning ?? "";

const ragResults =
  analysisResult?.rag_results ?? [];

const gaugeRotation = -90 + (riskScore * 1.8);
const filteredCases = cases
  .filter(
  (item) =>
    caseType === "all" ||
caseType === null ||
item.source_type?.toLowerCase() === caseType
)
  .filter(
    (item) =>
      riskFilter === "ALL" ||
      item.risk_level?.toUpperCase() === riskFilter
  );

  return (
    <div className={`app ${darkMode ? "dark-mode-page" : ""}`}>

      {/* Header */}
      <header className="topbar">

        <div className="brand-section">

        <button
  className="menu-button"
  style={{
    color: darkMode ? "#1e293b" : "#344563"
  }}
  onClick={() => setMenuOpen(!menuOpen)}
>
  ☰
</button>

          <div className="shield-icon">
            🛡
          </div>

          <div>
            <h1>Secure Banking Scam Analysis</h1>
            <p>Upload or enter evidence to detect potential fraud</p>
          </div>

        </div>
        {menuOpen && (
  <div className="side-menu">
    <button
  className={activeMenuItem === "dashboard" ? "menu-item-active" : ""}
  onPointerDown={() => {
    setActiveMenuItem("dashboard");
  }}
  onClick={() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    setTimeout(() => {
      setMenuOpen(false);
      setActiveMenuItem(null);
    }, 500);
  }}
>
  Dashboard
</button>
<button
  onClick={() => {
    document.getElementById("analyze")?.scrollIntoView({
      behavior: "smooth"
    });
    setMenuOpen(false);
  }}
>
  Analyze Evidence
</button>
    <button
  onClick={() => {
    document.getElementById("investigations")?.scrollIntoView({
      behavior: "smooth"
    });
    setMenuOpen(false);
  }}
>
  Investigations
</button>
    <button
  onClick={() => {
    document.getElementById("analytics")?.scrollIntoView({
      behavior: "smooth"
    });
    setMenuOpen(false);
  }}
>
  Analytics
</button>
<button
  onClick={() => {
    setMenuOpen(false);
    setAssistantOpen(true);
  }}
>
  AI Assistant
</button>
<button
  onClick={() => {
    document.getElementById("safety")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
    setMenuOpen(false);
  }}
>
  Safety & Banking Tips
</button>
  </div>
)}
<button
  className="dark-mode-button"
  onClick={() => setDarkMode(!darkMode)}
  title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
>
  {darkMode ? "☀️" : "🌙"}
</button>

      </header>


      {/* Main Content */}
      <main className={`main-content ${darkMode ? "dark-mode" : ""}`}>

      <section
  id="analyze"
  className="page-heading"
>
          <h2>Analyze Evidence</h2>
          <p>
            Submit suspicious banking messages, screenshots, documents or
            audio for investigation.
          </p>
        </section>

        {/* Evidence Input Cards */}
        <section className="input-grid">

          {/* Text Input */}
          <div className="input-card text-card">

          <div className="card-icon blue-icon">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 2h9l5 5v15H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
    <path d="M14 2v6h6" />
    <path d="M8 13h8M8 17h6" />
  </svg>
</div>

            <div className="card-heading">
              <h3>Text Input</h3>
            </div>

            <p className="card-description">
              Paste a suspicious SMS, email or banking message.
            </p>

            <textarea
              className="text-input"
              placeholder="Paste suspicious message here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <div className="input-footer">
              <span>{text.length} characters</span>
            </div>

          </div>


          {/* Image Input */}
          <div className="input-card image-card">

          <div className="card-icon purple-icon">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="m21 15-5-5L5 21" />
  </svg>
</div>

            <div className="card-heading">
              <h3>Image Input</h3>
            </div>

            <p className="card-description">
              Upload a screenshot of a suspicious banking message.
            </p>

            <label className="upload-box">

  <div className="upload-icon">
    ↑
  </div>

  <strong>
    {imageFile ? imageFile.name : "Upload image"}
  </strong>

  <span>
    PNG, JPG, JPEG or WEBP
  </span>

  <input
    type="file"
    accept=".png,.jpg,.jpeg,.webp,.pdf"
    onChange={(e) => setImageFile(e.target.files[0])}
  />

  {imageFile && (
    <button
      type="button"
      className="remove-file-button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setImageFile(null);
      }}
    >
      ×
    </button>
  )}

</label>

            {cameraOpen && (
  <div className="camera-container">
    <video
      ref={videoRef}
      autoPlay
      playsInline
      className="camera-preview"
    />
    
    <button
      type="button"
      className="capture-button"
      onClick={capturePhoto}
    >
      📸 Capture Photo
    </button>
  </div>
)}

{!cameraOpen && (
  <button
    type="button"
    className="camera-button"
    onClick={openCamera}
  >
    📷 Take Photo
  </button>
)}

<input
  id="camera-input"
  type="file"
  accept="image/*"
  capture="environment"
  style={{ display: "none" }}
  onChange={(e) => setImageFile(e.target.files[0])}
/>

          </div>


          {/* Audio Input */}
          <div className="input-card audio-card">

          <div className="card-icon green-icon">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 10v4M8 7v10M12 4v16M16 7v10M20 10v4" />
  </svg>
</div>

            <div className="card-heading">
              <h3>Audio Input</h3>
            </div>

            <p className="card-description">
              Upload a suspicious call recording or voice message.
            </p>

            <label className="upload-box">

  <div className="upload-icon">
    🎙
  </div>

  <strong>
    {audioFile ? audioFile.name : "Upload audio"}
  </strong>

  <span>
    MP3, WAV, M4A
  </span>

  <input
    type="file"
    accept=".mp3,.wav,.m4a,.mp4,.webm"
    onChange={(e) => setAudioFile(e.target.files[0])}
  />

  {audioFile && (
    <button
      type="button"
      className="remove-file-button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setAudioFile(null);
      }}
    >
      ×
    </button>
  )}

</label>
            <button
  type="button"
  className="voice-record-button"
  onClick={handleVoiceRecording}
>
  {isRecording ? "⏹ Stop Recording" : "🎙️ Listen or Record Voice"}
</button> 

          </div>

        </section>


        {/* Optional Information */}
        <section className="details-card">

          <div className="details-heading">
            <div>
              <h3>Additional Information</h3>
              <p>
                Optional information can help provide better investigation
                context.
              </p>
            </div>
          </div>

          <div className="details-grid">

            <div className="form-group">
              <label>Source Type</label>

              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
              >
                <option>SMS</option>
                <option>Email</option>
                <option>WhatsApp</option>
                <option>Banking App</option>
                <option>Phone Call</option>
                <option>Other</option>
              </select>
            </div>


            <div className="form-group">
              <label>Bank Name <span>(Optional)</span></label>

              <input
                type="text"
                placeholder="e.g. SBI"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </div>

            <div className="form-group context-group">
              <label>Additional Context <span>(Optional)</span></label>

              <input
                type="text"
                placeholder="Add any relevant information..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
              />
            </div>
            </div>

        </section>

        {/* Analyze Button */}
        <div className="analyze-section">

        <button
  className="analyze-button"
  onClick={handleAnalyze}
  disabled={loading}
>
  {loading ? "Analyzing..." : "Analyze Evidence"}

  {!loading && <span>→</span>}
</button>

{error && (
  <div className="error-message">
    {error}
  </div>
)}
          <p>
            Analysis uses deterministic risk indicators and AI-assisted
            investigation.
          </p>

        </div>

        {/* Result Preview */}
        {analysisResult && (

          <section className="results-section">

            <div className="analysis-complete">
              <div className="complete-icon">✓</div>

              <div>
                <strong>Analysis Complete</strong>
                <p>
                  Evidence has been processed successfully.
                </p>
              </div>
            </div>
            {/* Prediction */}
<div className="result-card risk-card">

  <span className="section-label">PREDICTION</span>

  <h3>Potential Scam Risk</h3>

  <div className="risk-gauge">

    <div className="gauge-track"></div>

    <div className="gauge-center">
      <strong>{riskScore}</strong>
      <span>/ 100</span>
    </div>

  </div>

  <div className={`risk-level ${riskLevel.toLowerCase()}`}>
    {riskLevel} RISK
  </div>

  <p className="risk-description">
  {riskScore === 0
    ? "No suspicious indicators were detected. Review the evidence before taking any action."
    : "Multiple suspicious indicators were detected. Review the evidence before taking any action."}
</p>

</div>


{/* Detected Risk Indicators */}
<div className="indicators-section">

  <div className="indicators-header">

    <div className="indicators-title">

      <div className="indicators-icon">
        !
      </div>

      <div>
        <h3>Detected Risk Indicators</h3>
        <p>
          These indicators were found in your evidence and contribute
          to the overall risk score.
        </p>
      </div>

    </div>

    <div className="total-risk">
      <span>Total Risk Score</span>
      <strong>{riskScore} / 100</strong>
    </div>
  </div>

  <div className="indicator-cards">

    {indicators.map((indicator, index) => (

      <div
        className="indicator-card"
        key={index}
      >

        <div className="indicator-card-icon">
          !
        </div>

        <h4>
          {indicator.name}
        </h4>

        <strong className="indicator-score">
          +{indicator.score}
        </strong>

        <p>
          {indicator.description}
        </p>
      </div>

    ))}

  </div>
</div>

            <div className="result-grid">

            </div>

            {/* Analyzed Evidence */}
<div className="analyzed-evidence-card">

  <div className="analyzed-evidence-header">

    <div>
      <span className="section-label">
        EVIDENCE REVIEW
      </span>

      <h3>INPUT</h3>
    </div>

    <span className="evidence-type">
      {analysisResult.evidence?.source_type || "TEXT"}
    </span>
  </div>
  <div className="evidence-content">
    {analysisResult.evidence?.text || "No evidence text available."}
  </div>

  {/* Extracted Entities */}

  {Object.values(entities).some(
    (items) => items && items.length > 0
  ) && (

    <div className="entities-section">

      <h4>Detected Entities</h4>

      <div className="entity-list">

        {Object.entries(entities).map(
          ([type, values]) => {

            if (!values || values.length === 0) {
              return null;
            }

            return values.map(
              (value, index) => (

                <span
                  className="entity-pill"
                  key={`${type}-${index}`}
                >
                  <small>
                    {type.replaceAll("_", " ")}
                  </small>

                  {value}
                </span>

              )
            );

          }
        )}

      </div>

    </div>
    
  )}

</div>

{/* AI Investigation */}
<div className="ai-investigation-card">

  <div className="ai-investigation-header">

    <div className="ai-title-wrapper">

      <div className="ai-icon">
        ✦
      </div>

      <div>
        <span className="section-label">
          AI INVESTIGATION
        </span>

        <h3>Investigation Findings</h3>

        <p>
          AI-assisted reasoning based on the evidence, risk indicators
          and retrieved banking guidance.
        </p>
      </div>

    </div>

    <span className="ai-badge">
      AI ASSISTED
    </span>

  </div>

  {/* Human Decision */}
<div className="decision-card">

  <div className="decision-header">

    <div className="decision-title">

      <div className="decision-icon">
        ✓
      </div>

      <div>
        <span className="section-label">
          INVESTIGATOR REVIEW
        </span>

        <h3>Human Decision</h3>

        <p>
          Review the evidence and AI findings before making the final
          investigation decision.
        </p>
      </div>

    </div>

    <span className="review-badge">
      HUMAN IN THE LOOP
    </span>

  </div>

  <div className="decision-options">

    <button
  className="decision-option approve"
  onClick={() => updateSelectedCaseStatus("RESOLVED")}

  disabled={decisionLoading}
>

      <div className="decision-option-icon">
        ✓
      </div>

      <div>
        <strong>Approve</strong>

        <span>
          Evidence reviewed and case can be resolved.
        </span>
      </div>

    </button>


    <button
  className="decision-option escalate"
  onClick={() => handleDecision("ESCALATED")}
  disabled={decisionLoading}
>

      <div className="decision-option-icon">
        ↑
      </div>

      <div>
        <strong>Escalate</strong>

        <span>
          Send the case for further investigation.
        </span>
      </div>

    </button>
    <button
  className="decision-option reject"
  onClick={() => handleDecision("CLOSED")}
  disabled={decisionLoading}
>

      <div className="decision-option-icon">
        ×
      </div>

      <div>
        <strong>Reject</strong>

        <span>
          Mark the investigation result as rejected.
        </span>
      </div>

    </button>
    {decisionMessage && (
  <div className="decision-message">
    {decisionMessage}
  </div>
)}
  </div>

  <div className="investigator-note">

    <label>
      Investigator Note
      <span>(Optional)</span>
    </label>

    <textarea
      placeholder="Add your investigation notes..."
    />
  </div>
  <div className="decision-footer">

    <span>
      AI analysis is advisory. Final action remains with the investigator.
    </span>

    <button className="save-decision-button">
      Save Decision
    </button>

  </div>
</div>

  {/* Retrieved Guidance */}

  {ragResults.length > 0 && (

    <div className="guidance-section">

      <div className="guidance-heading">

        <div className="guidance-icon">
          ✓
        </div>

        <div>
          <h4>Relevant Banking Guidance</h4>

          <p>
            Information retrieved from the investigation knowledge base.
          </p>
        </div>

      </div>


      <div className="guidance-list">

        {ragResults.map((result, index) => (

          <div
            className="guidance-item"
            key={index}
          >

            <span className="guidance-number">
              {index + 1}
            </span>

            <p>
              {result.text}
            </p>

          </div>

        ))}

      </div>

    </div>

  )}

</div>

</section>

)}

        {/* AI Assistant */}
        {assistantOpen && (
  <div className="assistant-overlay">
    <div className="assistant-modal">
    <button
  className="assistant-close-button"
  onClick={() => setAssistantOpen(false)}
>
  ✕
</button>
<div
  id="assistant"
  className="assistant-card"
  ref={assistantCardRef}
>
  <div className="assistant-header">


    <div className="assistant-title">


      <div className="assistant-icon">
        ✦
      </div>
      <div>
        <span className="section-label">
          AI ASSISTANT
        </span>
        <h3>Talk to AI Assistant</h3>
        <p>
          Ask questions about the analyzed evidence and investigation.
        </p>
      </div>
    </div>

    <span className="assistant-status">
      ● ONLINE
      </span>

</div>

<div className="assistant-chat-body">

{chatMessages.map((message, index) => (
<div
className={`chat-message ${message.role}`}
key={index}
ref={index === chatMessages.length - 1 ? chatEndRef : null}
>

  {message.role === "assistant" && (
    <div className="assistant-avatar">
      ✦
    </div>
  )}

  <div className="message-bubble">

    <strong>
      {message.role === "assistant"
        ? "AI Assistant"
        : "You"}
    </strong>

    <p>
      {message.text}
    </p>

  </div>
</div>
))}

<div
  className="suggested-questions"
  ref={suggestionsRef}
>


    <button
      onClick={() =>
        askAssistant("Why is this message risky?")
      }
    >
      Why is this message risky?
    </button>
    <button
      onClick={() =>
        askAssistant("What indicators were detected?")
      }
    >
      What indicators were detected?
    </button>
    <button
      onClick={() =>
        askAssistant("What should I do next?")
      }
    >
      What should I do next?
    </button>
  </div>
  </div>
  <div className="chat-input">

    <input
      type="text"
      placeholder="Ask the AI assistant..."
      value={chatInput}
      onChange={(e) => setChatInput(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          askAssistant(chatInput);
        }
      }}
    />
    <button
      onClick={() => askAssistant(chatInput)}
    >
      →
    </button>
  </div>
</div>
</div>
</div>
        )}

{dashboardStats && (
  <div
  id="analytics"
  className="dashboard-summary"
>
<div
  className="dashboard-card"
  onClick={() => {
    setRiskFilter("ALL");
    document.querySelector(".cases-card")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }}
>
  <span>Total Cases</span>
  <strong>{dashboardStats.total_cases}</strong>
</div>

<div
  className="dashboard-card"
  onClick={() => {
    setRiskFilter("HIGH");
    document.querySelector(".cases-card")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }}
>
  <span>High Risk</span>
  <strong>{dashboardStats.risk_distribution.high}</strong>
</div>

<div
  className="dashboard-card"
  onClick={() => {
    setRiskFilter("MEDIUM");
    document.querySelector(".cases-card")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }}
>
  <span>Medium Risk</span>
  <strong>{dashboardStats.risk_distribution.medium}</strong>
</div>

<div
  className="dashboard-card"
  onClick={() => {
    setRiskFilter("LOW");
    document.querySelector(".cases-card")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }}
>
  <span>Low Risk</span>
  <strong>{dashboardStats.risk_distribution.low}</strong>
</div>
  </div>
        )}
  {dashboardStats && (
  <div className="risk-chart-card">
    <h3>Risk Distribution</h3>


    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={[
            {
              name: "High Risk",
              value: dashboardStats.risk_distribution.high,
            },
            {
              name: "Medium Risk",
              value: dashboardStats.risk_distribution.medium,
            },
            {
              name: "Low Risk",
              value: dashboardStats.risk_distribution.low,
            },
          ]}
          cx="50%"
          cy="50%"
          outerRadius={90}
          dataKey="value"
          label
        >
          <Cell fill="#ef4444" />
          <Cell fill="#f59e0b" />
          <Cell fill="#22c55e" />
        </Pie>


        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
)}
{dashboardStats && (
  <div className="risk-chart-card">
    <h3>Status Distribution</h3>


    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={[
            {
              name: "Open",
              value: dashboardStats.status_distribution.open,
            },
            {
              name: "Under Review",
              value: dashboardStats.status_distribution.under_review,
            },
            {
              name: "Escalated",
              value: dashboardStats.status_distribution.escalated,
            },
            {
              name: "Resolved",
              value: dashboardStats.status_distribution.resolved,
            },
            {
              name: "Closed",
              value: dashboardStats.status_distribution.closed,
            },
          ]}
          cx="50%"
          cy="50%"
          outerRadius={90}
          dataKey="value"
          label
        >
          <Cell fill="#3b82f6" />
          <Cell fill="#8b5cf6" />
          <Cell fill="#ef4444" />
          <Cell fill="#22c55e" />
          <Cell fill="#64748b" />
        </Pie>


        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
)}
  {dashboardStats && (
    <div className="status-summary">
      <div className="status-card">
        <span>Open</span>
        <strong>{dashboardStats.status_distribution.open}</strong>
      </div>
  
      <div className="status-card">
        <span>Under Review</span>
        <strong>{dashboardStats.status_distribution.under_review}</strong>
      </div>
  
      <div className="status-card">
        <span>Escalated</span>
        <strong>{dashboardStats.status_distribution.escalated}</strong>
      </div>
  
      <div className="status-card">
        <span>Resolved</span>
        <strong>{dashboardStats.status_distribution.resolved}</strong>
      </div>
  
      <div className="status-card">
        <span>Closed</span>
        <strong>{dashboardStats.status_distribution.closed}</strong>
      </div>
    </div>
  )}

        {/* Recent Investigations */}

        <div
  id="investigations"
  className="cases-card"
>

  <div className="cases-header">
    <div>
      <span className="section-label">
        CASE MANAGEMENT
      </span>

      <h3>Recent Investigations</h3>
      <div className="case-type-tabs">
  <button onClick={() => setCaseType("all")}>ALL</button>
  <button onClick={() => setCaseType("text")}>TEXT</button>
  <button onClick={() => setCaseType("image")}>IMAGE</button>
  <button onClick={() => setCaseType("audio")}>AUDIO</button>
</div>


    </div>

    <span className="cases-count">
    {filteredCases.length} Cases
    </span>
  </div>

  <div className="cases-list">

    {caseType === null ? (
  <p className="no-cases">
    Select a category to view cases.
  </p>
) : cases.length === 0 ? (

      <p className="no-cases">
        No investigation cases found.
      </p>

    ) : (

      filteredCases
  .map((item) => (
    <div key={item.case_id}>
      
          <div
            className="case-row"
            onClick={() => handleCaseClick(item.case_id)}
          >
            <div className="case-main">
              <strong>
                {item.case_id}
                <span className="case-view-hint">
                  View details →
                </span>
              </strong>
      
              <span>
                {item.source_type}
                {item.filename
                  ? ` • ${item.filename}`
                  : ""}
              </span>
            </div>
      
            <span
              className={`case-risk ${item.risk_level.toLowerCase()}`}
            >
              {item.risk_level}
            </span>
      
            <span
              className={`case-status ${item.status.toLowerCase()}`}
            >
              {item.status.replace("_", " ")}
            </span>
      
            <span className="case-score">
              {item.risk_score}/100
            </span>
          </div>

          {selectedCase?.case_id === item.case_id && (
  <div className="selected-case-card">
    <h3>CASE DETAILS</h3>
    <div className="case-detail-section">
  <h4>1. What is Input?</h4>
  <p>
    {selectedCase.evidence_text || "No input available."}
  </p>
</div>

<div className="case-detail-section">
  <h4>2. What are Detecting Factors?</h4>

  <div className="indicator-cards">
    {(selectedCase.indicators || []).map((indicator, index) => (
      <div className="indicator-card" key={index}>
        <h4>{indicator.name}</h4>
        <strong>+{indicator.score}</strong>
        <p>{indicator.description}</p>
      </div>
    ))}
  </div>
</div>
<div className="case-detail-section">
  <h4>3. Investigation Findings</h4>
  <ReactMarkdown>
  {selectedCase.llm_reasoning || "No investigation findings available."}
</ReactMarkdown>
</div>
<div className="case-detail-section">
  <h4>5. What do you want to do now?</h4>

  <div className="decision-options">
    <button
      className="decision-option approve"
      onClick={() => updateSelectedCaseStatus("RESOLVED")}
      disabled={caseLoading}
    >
      <strong>Approve</strong>
      <span>Resolve this case.</span>
    </button>

    <button
      className="decision-option escalate"
      onClick={() => updateSelectedCaseStatus("ESCALATED")}
      disabled={caseLoading}
    >
      <strong>Escalate</strong>
      <span>Send this case for further investigation.</span>
    </button>

    <button
      className="decision-option reject"
      onClick={() => updateSelectedCaseStatus("CLOSED")}
      disabled={caseLoading}
    >
      <strong>Reject</strong>
      <span>Close this investigation as rejected.</span>
    </button>
  </div>

  {caseStatusMessage && (
    <div
    className="decision-message"
    style={{
      display: "block",
      marginTop: "10px",
      color: "#16a34a",
      fontWeight: "600"
    }}
  >
    {caseStatusMessage}
  </div>
  )}
</div>
<div className="case-detail-section delete-case-section">
  <h4>6. Delete This Case</h4>

  <p>
    Enter your private delete token to permanently delete this case.
  </p>

  <div className="delete-case-form">
    <input
      type="password"
      placeholder="Enter your delete token"
      value={deleteToken}
      onChange={(e) => setDeleteToken(e.target.value)}
    />

    <button
      type="button"
      onClick={handleUserDelete}
      disabled={deleteLoading}
    >
      {deleteLoading ? "Deleting..." : "Delete Case"}
    </button>
  </div>
  <button
  type="button"
  className="admin-delete-button"
  onClick={handleAdminDelete}
  disabled={deleteLoading}
>
  {deleteLoading
    ? "Deleting..."
    : "Authority Delete Case"}
</button>

  {deleteMessage && (
    <div className="delete-message">
      {deleteMessage}
    </div>
  )}
</div>
  </div>
)}
</div>
))
)}
</div>
</div>

<section
  id="safety"
  className="safety-tips-section"
>
  <div className="safety-tips-header">
  <div className="safety-title">
  <span className="safety-pulse"></span>
  <h2>Safety Tips</h2>
</div>
  </div>

  <div className="safety-tips-grid">
  <div className="safety-tip">
  <div className="tip-icon">!</div>
  <div>
    <strong>Never share sensitive information</strong>
    <p>Never share OTP, PIN, CVV, or passwords with anyone.</p>
  </div>
</div>

<div className="safety-tip">
  <div className="tip-icon">!</div>
  <div>
    <strong>Avoid suspicious links</strong>
    <p>Do not click unknown or suspicious links received in messages.</p>
  </div>
</div>

<div className="safety-tip">
  <div className="tip-icon">!</div>
  <div>
    <strong>Verify before acting</strong>
    <p>Verify the sender and request through an official banking channel.</p>
  </div>
</div>

<div className="safety-tip">
  <div className="tip-icon">!</div>
  <div>
    <strong>Beware of urgent threats</strong>
    <p>Be cautious of messages demanding immediate action or payment.</p>
  </div>
</div>

<div className="safety-tip">
  <div className="tip-icon">!</div>
  <div>
    <strong>Banks don't ask for confidential credentials</strong>
    <p>Never provide OTPs, PINs, or passwords in response to a request.</p>
  </div>
</div>

<div className="safety-tip">
  <div className="tip-icon">!</div>
  <div>
    <strong>Report suspicious activity</strong>
    <p>Contact your bank through its official channels if something looks suspicious.</p>
  </div>
</div>
  </div>
</section>

{showHomeButton && (
  <button
    className="floating-home-button"
    onClick={() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }}
  >
    Home
  </button>
)}
{!assistantOpen && (
  <button
    className="floating-ai-button"
    onClick={() => {
      setAssistantOpen(true);
    }}
  >
    🤖 AI Assistant
  </button>
)}
      </main>

    </div>
  );
}

export default App;