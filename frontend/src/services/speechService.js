
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Speech-to-Text API
export async function transcribeAudio(audioFile) {
  if (!audioFile) {
    throw new Error("Please select an audio file.");
  }

  const allowedTypes = [
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/x-wav",
  ];

  const extension = audioFile.name.split(".").pop().toLowerCase();

  if (
    !allowedTypes.includes(audioFile.type) &&
    !["mp3", "wav"].includes(extension)
  ) {
    throw new Error("Only MP3 and WAV audio files are supported.");
  }

  const formData = new FormData();

  // Exact field name required by the backend
  formData.append("audio_file", audioFile);

  let response;

  try {
    response = await fetch(
      `${API_BASE_URL}/api/speech-to-text`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      }
    );
  } catch {
    throw new Error(
      "Unable to connect to the backend. Please check the server connection."
    );
  }

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      `The backend returned an invalid response (${response.status}).`
    );
  }

  if (!response.ok) {
    const detail = data.detail;

    const message =
      typeof detail === "string"
        ? detail
        : detail
          ? JSON.stringify(detail)
          : data.message || `Transcription failed: ${response.status}`;

    throw new Error(message);
  }

  if (data.success === false) {
    throw new Error(
      data.message ||
      data.detail ||
      "The backend could not transcribe this audio."
    );
  }

  if (typeof data.transcript !== "string") {
    throw new Error("The backend did not return a valid transcript.");
  }

  return data;
}
