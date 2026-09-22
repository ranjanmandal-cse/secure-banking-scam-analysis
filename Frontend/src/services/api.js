import axios from "axios";

const API = axios.create({
  baseURL: "/api",
});

export const analyzeText = async (text) => {
  const response = await API.post("/analyze", {
    text: text,
  });

  return response.data;
};

export const analyzeFile = async (file) => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await API.post(
    "/upload/analyze",
    formData
  );

  return response.data;
};

export const getDashboardStats = async () => {
  const response = await API.get("/dashboard/stats");

  return response.data;
};

export const getCase = async (caseId) => {
  const response = await API.get(`/cases/${caseId}`);

  return response.data;
};

export const getAllCases = async () => {
    const response = await API.get("/cases");
  
    return response.data;
  };

export const getCaseReport = async (caseId) => {
  const response = await API.get(
    `/cases/${caseId}/report`
  );

  return response.data;
};
export const updateCaseStatus = async (caseId, status) => {
    const response = await API.patch(
      `/cases/${caseId}/status`,
      {
        status: status,
      }
    );
  
    return response.data;
  };
  export const askAssistant = async (
    question,
    evidenceText,
    riskAnalysis,
    llmReasoning
  ) => {
    const response = await API.post(
      "/assistant/ask",
      {
        question: question,
        evidence_text: evidenceText,
        risk_analysis: riskAnalysis,
        llm_reasoning: llmReasoning,
      }
    );
  
    return response.data;
  };
  export const deleteCaseAsUser = async (
    caseId,
    deleteToken
  ) => {
    const response = await API.delete(
      `/cases/${caseId}/user`,
      {
        data: {
          delete_token: deleteToken,
        },
      }
    );
  
    return response.data;
  };
  export const deleteCaseAsAdmin = async (
    caseId,
    adminPin
  ) => {
    const response = await API.delete(
      `/cases/${caseId}/admin`,
      {
        data: {
          admin_pin: adminPin,
        },
      }
    );
  
    return response.data;
  };