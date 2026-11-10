
import { useRef, useState } from "react";
import {
  Upload,
  FileAudio,
  AudioLines,
  Loader2,
  Languages,
  Clock,
  Copy,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";

import { transcribeAudio } from "../services/speechService";

function SpeechToTextPage() {
  const fileInputRef = useRef(null);

  const [audioFile, setAudioFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Validate and select audio file
  function handleFileChange(event) {
    const file = event.target.files?.[0];

    setError("");
    setResult(null);
    setAudioFile(null);

    if (!file) return;

    const extension = file.name.split(".").pop().toLowerCase();

    if (!["mp3", "wav"].includes(extension)) {
      setError("Please select an MP3 or WAV audio file.");
      event.target.value = "";
      return;
    }

    // Check audio duration using browser metadata
    const audio = document.createElement("audio");
    const objectUrl = URL.createObjectURL(file);

    audio.preload = "metadata";

    audio.onloadedmetadata = () => {
      const duration = audio.duration;

      URL.revokeObjectURL(objectUrl);

      if (!Number.isFinite(duration)) {
        setError("Unable to read the audio duration.");
        event.target.value = "";
        return;
      }

      if (duration > 30) {
        setError("Audio duration must not exceed 30 seconds.");
        event.target.value = "";
        return;
      }

      if (duration <= 0) {
        setError("The selected audio file appears to be empty.");
        event.target.value = "";
        return;
      }

      setAudioFile(file);
    };

    audio.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setError("Unable to read this audio file. Please try another MP3 or WAV file.");
      event.target.value = "";
    };

    audio.src = objectUrl;
  }

  // Send audio to backend
  async function handleTranscription() {
    if (!audioFile || loading) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await transcribeAudio(audioFile);

      setResult(data);
    } catch (err) {
      setError(
        err.message || "Something went wrong during transcription."
      );
    } finally {
      setLoading(false);
    }
  }

  // Copy transcript
  async function handleCopy() {
    if (!result?.transcript) return;

    try {
      await navigator.clipboard.writeText(result.transcript);
      setCopied(true);

      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Unable to copy the transcript.");
    }
  }

  function handleRemoveFile() {
    setAudioFile(null);
    setResult(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <main className="min-h-screen max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">

      {/* Header */}
      <section className="mb-8">

        <div className="flex items-center gap-2 text-violet-400 mb-4">
          <AudioLines size={20} />

          <span className="text-sm font-semibold tracking-wide">
            AI AUDIO INTELLIGENCE
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          Speech-to-Text
        </h1>

        <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
          Convert audio recordings into readable text using
          AI-powered speech recognition.
        </p>

      </section>

      {/* Upload section */}
      <section className="bg-[#121218] border border-white/10 rounded-2xl p-5 sm:p-7 mb-6">

        <div className="flex items-center gap-3 mb-6">

          <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400">
            <FileAudio size={23} />
          </div>

          <div>
            <h2 className="text-white font-semibold">
              Upload Audio
            </h2>

            <p className="text-gray-500 text-xs mt-1">
              Select an audio file for transcription
            </p>
          </div>

        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".mp3,.wav,audio/mpeg,audio/wav,audio/x-wav"
          onChange={handleFileChange}
          className="hidden"
        />

        {!audioFile ? (

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="w-full border-2 border-dashed border-white/10 hover:border-violet-500/50 bg-[#09090b] rounded-xl p-8 sm:p-12 flex flex-col items-center justify-center transition-all"
          >

            <div className="p-4 rounded-full bg-violet-500/10 text-violet-400 mb-4">
              <Upload size={28} />
            </div>

            <p className="text-white font-medium mb-2">
              Click to upload audio
            </p>

            <p className="text-gray-500 text-xs">
              Supported formats: MP3 and WAV
            </p>

            <p className="text-gray-600 text-xs mt-2">
              Maximum duration: 30 seconds
            </p>

          </button>

        ) : (

          <div className="bg-[#09090b] border border-violet-500/30 rounded-xl p-5">

            <div className="flex items-center gap-3">

              <div className="p-3 rounded-lg bg-violet-500/10 text-violet-400">
                <FileAudio size={24} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {audioFile.name}
                </p>

                <p className="text-gray-500 text-xs mt-1">
                  {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>

              <button
                type="button"
                onClick={handleRemoveFile}
                disabled={loading}
                className="text-gray-500 hover:text-red-400 p-2"
                aria-label="Remove audio file"
              >
                <X size={19} />
              </button>

            </div>

          </div>

        )}

        {/* Error */}
        {error && (
          <div className="mt-5 flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">

            <AlertCircle size={19} className="text-red-400 shrink-0" />

            <p className="text-red-300 text-sm">
              {error}
            </p>

          </div>
        )}

        {/* Transcribe button */}
        <button
          type="button"
          onClick={handleTranscription}
          disabled={!audioFile || loading}
          className="w-full mt-6 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all"
        >

          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Processing audio...
            </>
          ) : (
            <>
              <AudioLines size={18} />
              Convert Speech to Text
            </>
          )}

        </button>

      </section>

      {/* Loading state */}
      {loading && (
        <div className="bg-[#121218] border border-violet-500/20 rounded-2xl p-8 text-center mb-6">

          <Loader2
            size={32}
            className="text-violet-400 animate-spin mx-auto mb-4"
          />

          <p className="text-white font-medium">
            Transcription in progress
          </p>

          <p className="text-gray-500 text-xs mt-2">
            Please wait while AI processes your audio.
          </p>

        </div>
      )}

      {/* Transcription result */}
      {result && (
        <section className="bg-[#121218] border border-white/10 rounded-2xl p-5 sm:p-7">

          <div className="flex items-center justify-between gap-3 mb-6">

            <div className="flex items-center gap-3">

              <div className="p-3 rounded-xl bg-green-500/10 text-green-400">
                <CheckCircle size={22} />
              </div>

              <div>
                <h2 className="text-white font-semibold">
                  Transcription Complete
                </h2>

                <p className="text-gray-500 text-xs mt-1">
                  Audio converted successfully
                </p>
              </div>

            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 text-xs"
            >
              {copied ? <CheckCircle size={15} /> : <Copy size={15} />}
              {copied ? "Copied" : "Copy"}
            </button>

          </div>

          {/* Transcript */}
          <div className="bg-[#09090b] border border-white/10 rounded-xl p-5 mb-6">

            <p className="text-violet-400 text-xs font-semibold tracking-wider mb-4">
              TRANSCRIPT
            </p>

            <p className="text-gray-200 text-sm leading-7 whitespace-pre-wrap break-words">
              {result.transcript || "No speech detected."}
            </p>

          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            <div className="bg-[#09090b] border border-white/10 rounded-xl p-4">

              <div className="flex items-center gap-2 text-violet-400 mb-3">
                <Languages size={18} />
                <span className="text-xs">Detected Language</span>
              </div>

              <p className="text-white font-semibold text-sm">
                {result.detected_language_code || "Not available"}
              </p>

            </div>

            <div className="bg-[#09090b] border border-white/10 rounded-xl p-4">

              <div className="flex items-center gap-2 text-violet-400 mb-3">
                <Clock size={18} />
                <span className="text-xs">Processing Time</span>
              </div>

              <p className="text-white font-semibold text-sm">
                {result.processing_time ?? "Not available"}
                {result.processing_time != null ? " seconds" : ""}
              </p>

            </div>

            <div className="bg-[#09090b] border border-white/10 rounded-xl p-4">

              <div className="flex items-center gap-2 text-violet-400 mb-3">
                <AudioLines size={18} />
                <span className="text-xs">AI Model</span>
              </div>

              <p className="text-white font-semibold text-sm break-all">
                {result.model || "Not available"}
              </p>

            </div>

          </div>

        </section>
      )}

    </main>
  );
}

export default SpeechToTextPage;
