export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const API_BASE = `${BASE_URL}/api`;

function getToken() {
  return localStorage.getItem("pr_token");
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Remove Content-Type if it's FormData
  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  let data;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = { message: `Unexpected response format: ${response.statusText}` };
    console.error("Non-JSON API response:", text);
  }

  if (!response.ok) {
    throw new Error(data.message || "API Request Failed");
  }

  return data;
}
