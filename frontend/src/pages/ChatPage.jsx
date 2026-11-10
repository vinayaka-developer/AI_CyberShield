
import { useEffect, useRef, useState } from "react";

import {
  Bot,
  Send,
  User,
  Trash2,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { sendChatMessage } from "../services/chatService";

const suggestedPrompts = [
  {
    title: "Phishing Attacks",
    description: "How to identify phishing emails?",
    prompt:
      "How can I identify and protect myself from phishing attacks?",
    icon: "🎣",
  },
  {
    title: "SQL Injection",
    description: "Understand SQL injection with examples.",
    prompt:
      "Explain SQL injection attacks with examples and prevention methods.",
    icon: "💻",
  },
  {
    title: "Password Security",
    description: "Learn how to secure your passwords.",
    prompt:
      "What are the best practices for creating and protecting secure passwords?",
    icon: "🔐",
  },
  {
    title: "Network Security",
    description: "Explore common network attacks.",
    prompt:
      "Explain common network attacks and how to prevent them.",
    icon: "🌐",
  },
];

function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);

  // Automatically scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  // Send message to Gemini backend
  const handleSendMessage = async (e) => {
    e.preventDefault();

    const userMessage = input.trim();

    if (!userMessage || loading) return;

    setInput("");
    setError("");

    // Display user message immediately
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    setLoading(true);

    try {
      // Send message and previous successful conversation history
      const reply = await sendChatMessage(
        userMessage,
        chatHistory
      );

      // Display AI response
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
        },
      ]);

      // Save successful conversation history
      setChatHistory((prev) => [
        ...prev,
        {
          role: "user",
          content: userMessage,
        },
        {
          role: "assistant",
          content: reply,
        },
      ]);
    } catch (err) {
      // Display error inside chatbot
      setError(
        err.message || "Something went wrong. Please try again."
      );

      // Remove failed message from visible conversation
      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1];

        if (
          lastMessage?.role === "user" &&
          lastMessage.content === userMessage
        ) {
          return prev.slice(0, -1);
        }

        return prev;
      });

      // Restore message for retry
      setInput(userMessage);
    } finally {
      // Always stop loading, even when request fails
      setLoading(false);
    }
  };

  // Enter sends; Shift + Enter creates a new line
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Select a suggested prompt
  const handleSuggestedPrompt = (prompt) => {
    setInput(prompt);
    setError("");
  };

  // Clear conversation
  const handleClearChat = () => {
    if (loading) return;

    setMessages([]);
    setChatHistory([]);
    setError("");
    setInput("");
  };

  return (
    <main className="min-h-[calc(100vh-64px)] p-4 md:p-8 max-w-7xl mx-auto flex flex-col">

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">

        <div>
          <div className="flex items-center gap-2 text-violet-400 mb-2">
            <ShieldCheck size={20} />

            <span className="text-sm font-medium">
              AI Security Workspace
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-white">
            AI Security Assistant
          </h1>

          <p className="text-gray-400 text-sm mt-2">
            Ask questions about cybersecurity, threats, and protection.
          </p>
        </div>

        <button
          onClick={handleClearChat}
          disabled={loading || messages.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <Trash2 size={16} />
          <span className="text-sm">Clear Chat</span>
        </button>

      </div>

      {/* Chat Container */}
      <div className="flex-1 min-h-[450px] bg-[#121218] border border-white/10 rounded-2xl flex flex-col overflow-hidden">

        {/* Chat Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">

          <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
            <Bot className="text-violet-400" size={22} />
          </div>

          <div>
            <h2 className="text-white font-semibold text-sm">
              CyberShield AI
            </h2>

            <p className="text-green-400 text-xs">
              Ready to assist
            </p>
          </div>

        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

          {/* Welcome Screen and Suggested Prompts */}
          {messages.length === 0 && (
            <div className="min-h-[350px] flex flex-col items-center justify-center text-center">

              <div className="w-16 h-16 rounded-2xl bg-violet-500/15 flex items-center justify-center mb-5">
                <Sparkles
                  size={30}
                  className="text-violet-400"
                />
              </div>

              <h2 className="text-white text-xl font-semibold mb-2">
                How can I help you today?
              </h2>

              <p className="text-gray-400 text-sm max-w-md mb-8">
                Your AI cybersecurity assistant. Choose a topic
                or ask your own question.
              </p>

              {/* Suggested Prompt Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">

                {suggestedPrompts.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() =>
                      handleSuggestedPrompt(item.prompt)
                    }
                    className="text-left p-4 rounded-xl bg-[#1c1c27] border border-white/10 hover:border-violet-500/50 hover:bg-violet-500/5 transition group"
                  >
                    <div className="flex items-center gap-3 mb-2">

                      <span className="text-xl">
                        {item.icon}
                      </span>

                      <span className="text-white text-sm font-semibold group-hover:text-violet-300 transition">
                        {item.title}
                      </span>

                    </div>

                    <p className="text-gray-400 text-xs leading-5">
                      {item.description}
                    </p>

                  </button>
                ))}

              </div>

            </div>
          )}

          {/* Conversation Messages */}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >

              {/* AI Icon */}
              {message.role === "assistant" && (
                <div className="w-9 h-9 shrink-0 rounded-xl bg-violet-500/15 flex items-center justify-center">
                  <Bot
                    size={19}
                    className="text-violet-400"
                  />
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] md:max-w-[75%] min-w-0 rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-violet-600 text-white rounded-tr-sm"
                    : "bg-[#1c1c27] border border-white/10 text-gray-200 rounded-tl-sm"
                }`}
              >

                <p className="text-xs font-semibold mb-2 opacity-70">
                  {message.role === "user"
                    ? "You"
                    : "CyberShield AI"}
                </p>

                {/* Markdown Rendering */}
                {message.role === "assistant" ? (
                  <div className="text-sm leading-7 break-words">

                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-xl font-bold text-white mt-4 mb-2">
                            {children}
                          </h1>
                        ),

                        h2: ({ children }) => (
                          <h2 className="text-lg font-bold text-white mt-4 mb-2">
                            {children}
                          </h2>
                        ),

                        h3: ({ children }) => (
                          <h3 className="text-base font-semibold text-violet-300 mt-3 mb-2">
                            {children}
                          </h3>
                        ),

                        p: ({ children }) => (
                          <p className="mb-3 text-gray-200">
                            {children}
                          </p>
                        ),

                        strong: ({ children }) => (
                          <strong className="font-bold text-white">
                            {children}
                          </strong>
                        ),

                        ul: ({ children }) => (
                          <ul className="list-disc pl-6 space-y-2 mb-3">
                            {children}
                          </ul>
                        ),

                        ol: ({ children }) => (
                          <ol className="list-decimal pl-6 space-y-2 mb-3">
                            {children}
                          </ol>
                        ),

                        li: ({ children }) => (
                          <li className="text-gray-200 pl-1">
                            {children}
                          </li>
                        ),

                        a: ({ href, children }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-violet-400 underline break-all hover:text-violet-300"
                          >
                            {children}
                          </a>
                        ),

                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-violet-500 pl-4 py-1 text-gray-400 italic">
                            {children}
                          </blockquote>
                        ),

                        code: ({ children, className }) => {
                          const isBlock =
                            className?.startsWith("language-");

                          return isBlock ? (
                            <code className="block bg-black/40 p-3 rounded-lg overflow-x-auto text-violet-300 text-xs">
                              {children}
                            </code>
                          ) : (
                            <code className="bg-black/40 px-1.5 py-0.5 rounded text-violet-300 text-xs">
                              {children}
                            </code>
                          );
                        },

                        pre: ({ children }) => (
                          <pre className="bg-black/40 border border-white/10 rounded-lg p-3 overflow-x-auto mb-3">
                            {children}
                          </pre>
                        ),

                        hr: () => (
                          <hr className="border-white/10 my-4" />
                        ),

                        table: ({ children }) => (
                          <div className="overflow-x-auto mb-3">
                            <table className="w-full text-left border-collapse text-sm">
                              {children}
                            </table>
                          </div>
                        ),

                        th: ({ children }) => (
                          <th className="border border-white/10 bg-white/5 px-3 py-2 text-white font-semibold">
                            {children}
                          </th>
                        ),

                        td: ({ children }) => (
                          <td className="border border-white/10 px-3 py-2">
                            {children}
                          </td>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>

                  </div>
                ) : (
                  <p className="text-sm leading-7 whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                )}

              </div>

              {/* User Icon */}
              {message.role === "user" && (
                <div className="w-9 h-9 shrink-0 rounded-xl bg-white/10 flex items-center justify-center">
                  <User
                    size={19}
                    className="text-gray-300"
                  />
                </div>
              )}

            </div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-center gap-3">

              <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center">
                <Bot
                  size={19}
                  className="text-violet-400"
                />
              </div>

              <div className="bg-[#1c1c27] border border-white/10 rounded-xl px-4 py-3 flex items-center gap-2">

                <LoaderCircle
                  size={16}
                  className="animate-spin text-violet-400"
                />

                <span className="text-sm text-gray-400">
                  AI is thinking...
                </span>

              </div>

            </div>
          )}

          <div ref={messagesEndRef} />

        </div>

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="mx-4 mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2"
          >
            <AlertCircle
              size={17}
              className="text-red-400 shrink-0 mt-0.5"
            />

            <div className="min-w-0">
              <p className="text-sm font-medium text-red-300">
                Request failed
              </p>

              <p className="text-sm text-red-300/90 break-words mt-1">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Message Input */}
        <form
          onSubmit={handleSendMessage}
          className="p-4 border-t border-white/10"
        >

          <div className="flex items-end gap-3 bg-[#1c1c27] border border-white/10 rounded-xl p-2 focus-within:border-violet-500/50 transition">

            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (error) setError("");
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask your cybersecurity question..."
              rows={1}
              disabled={loading}
              className="flex-1 resize-none bg-transparent text-white text-sm p-2 outline-none placeholder:text-gray-500 max-h-32"
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-10 h-10 shrink-0 rounded-lg bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <LoaderCircle
                  size={19}
                  className="animate-spin"
                />
              ) : (
                <Send size={18} />
              )}
            </button>

          </div>

          <p className="text-gray-500 text-xs mt-3 text-center">
            Enter to send · Shift + Enter for a new line
          </p>

        </form>

      </div>

    </main>
  );
}

export default ChatPage;
