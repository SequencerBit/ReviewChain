const express = require('express');
const app = express();
const port = process.env.PORT || 8000;
const reviewTokens = new Map();
app.use(express.json());
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
app.post('/request-review-token', (req, res) => {
  const { userId, productId } = req.body;

  // Validation
  if (!userId || !productId) {
    return res.status(400).json({ error: "userId and productId are required" });
  }

  // Generate a unique token  
  const token = crypto.randomUUID();

  // Store token data
  reviewTokens.set(token, {
    userId,
    productId,
    used: false
  });

  // Return the token
  res.json({ reviewToken: token });
});
app.post('/submit-review', (req, res) => {
  const { reviewToken, rating, comment } = req.body;

  if (!reviewToken) {
    return res.status(400).json({ error: "reviewToken is required" });
  }

  // Lookup token
  const tokenData = reviewTokens.get(reviewToken);

  // Validation
  if (!tokenData) {
    return res.status(403).json({ error: "Invalid token" });
  }

  if (tokenData.used) {
    return res.status(403).json({ error: "Token already used" });
  }

  // Token is valid → mark as used
  tokenData.used = true;

  // (Later: integrate Web3.js here)
  console.log("Received review:", {
    userId: tokenData.userId,
    productId: tokenData.productId,
    rating,
    comment
  });

  return res.json({ success: true, message: "Review submitted" });
});
