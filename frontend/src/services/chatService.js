
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function getErrorMessage(data, status) {
  const detail = data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => item.msg || "Invalid request")
      .join(". ");
  }

  if (detail && typeof detail === "object") {
    return detail.message || JSON.stringify(detail);
  }

  if (typeof data?.message === "string") {
    return data.message;
  }

  return `Chat request failed: ${status}`;
}

// Send a message to the Gemini chatbot
export async function sendChatMessage(message, history = []) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        message,
        history: history.slice(-20),
      }),
    });
  } catch {
    throw new Error(
      "Unable to connect to AI CyberShield. Please try again."
    );
  }

  let data;

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(data, response.status));
  }

  if (typeof data.reply !== "string") {
    throw new Error("The chatbot returned an invalid response.");
  }

  return data.reply;
}
