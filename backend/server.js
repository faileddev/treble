const express = require("express");
const axios = require("axios");
const app = express();
const PORT = 5000;

app.use(express.json());

// Proxy endpoint to fetch token list
app.get("/api/token-list", async (req, res) => {
  const walletAddress = req.query.id; // Extract 'id' parameter from query

  if (!walletAddress) {
    return res.status(400).json({ error: "Wallet address (id) is required" });
  }

  try {
    const response = await axios.get("https://pro-openapi.debank.com/v1/user/token_list", {
      headers: { Authorization: `Bearer f2cccb512bb7e5001296a63f70c44c8be8fb2d64` },
      params: { id: walletAddress },
    });
    res.status(200).json(response.data); // Forward API response to the client
  } catch (error) {
    console.error("Error fetching token list from DeBank:", error.message);
    res.status(500).json({ error: "Failed to fetch token list" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
