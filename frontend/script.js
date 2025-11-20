document.addEventListener("DOMContentLoaded", () => {

    const API_URL = "http://localhost:3000";

    // Elements
    const userSelect = document.getElementById("user-select");
    const productSelectRequest = document.getElementById("product-select-request");
    const getTokenBtn = document.getElementById("get-token-btn");
    
    const tokenInput = document.getElementById("token-input");
    const ratingInput = document.getElementById("rating-input");
    const commentInput = document.getElementById("comment-input");
    const submitReviewBtn = document.getElementById("submit-review-btn");

    const productSelectView = document.getElementById("product-select-view");
    const fetchReviewsBtn = document.getElementById("fetch-reviews-btn");
    const resultsDisplay = document.getElementById("results-display");

    // 1. Get Token
    getTokenBtn.addEventListener("click", async () => {
        const userId = userSelect.value;
        const productId = productSelectRequest.value;
        resultsDisplay.textContent = "Requesting token...";

        try {
            const response = await fetch(`${API_URL}/request-review-token`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, productId })
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            tokenInput.value = data.reviewToken;
            resultsDisplay.textContent = `Token received: ${data.reviewToken} (Use this to submit or edit)`;
        } catch (error) {
            console.error("Error getting token:", error);
            resultsDisplay.textContent = `Error getting token: ${error.message}`;
        }
    });

    // 2. Submit Review
    submitReviewBtn.addEventListener("click", async () => {
        const reviewToken = tokenInput.value;
        const rating = parseInt(ratingInput.value, 10);
        const comment = commentInput.value;

        if (!reviewToken || !rating || !comment) {
            resultsDisplay.textContent = "Error: Please fill in token, rating, and comment.";
            return;
        }

        resultsDisplay.textContent = "Submitting to blockchain...";

        try {
            const response = await fetch(`${API_URL}/submit-review`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reviewToken, rating, comment })
            });

            if (!response.ok) throw new Error(`Review failed! Status: ${response.status}`);
            resultsDisplay.textContent = "Review submitted/updated successfully!";
            
            tokenInput.value = "";
            ratingInput.value = "";
            commentInput.value = "";
        } catch (error) {
            console.error("Error submitting review:", error);
            resultsDisplay.textContent = `Error submitting review: ${error.message}`;
        }
    });

    // 3. Fetch & Process Reviews (Logic Changed Here)
    fetchReviewsBtn.addEventListener("click", async () => {
        const productId = productSelectView.value;
        resultsDisplay.innerHTML = `<p>Fetching reviews for ${productId}...</p>`;

        try {
            const response = await fetch(`${API_URL}/reviews/${productId}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const rawReviews = await response.json();

            if (rawReviews.length === 0) {
                resultsDisplay.innerHTML = `<p>No reviews yet for ${productId}.</p>`;
                return;
            }

            // --- NEW GROUPING LOGIC ---
            const groupedReviews = {};

            // Group reviews by User ID
            rawReviews.forEach(review => {
                if (!groupedReviews[review.userId]) {
                    groupedReviews[review.userId] = [];
                }
                groupedReviews[review.userId].push(review);
            });

            // Sort within groups by timestamp (newest first) and generate HTML
            let htmlOutput = "";

            for (const userId in groupedReviews) {
                // Sort descending (newest time first)
                const userHistory = groupedReviews[userId].sort((a, b) => b.timestamp - a.timestamp);
                
                // The most recent review is the "Active" one
                const latest = userHistory[0];
                // The rest are "History"
                const history = userHistory.slice(1);

                htmlOutput += `
                    <div class="review-card" style="border-left: 4px solid #9b59b6;">
                        <div style="display:flex; justify-content:space-between;">
                            <strong>User: ${latest.userId}</strong>
                            <span style="color:#888; font-size:0.8em;">${new Date(latest.timestamp * 1000).toLocaleString()}</span>
                        </div>
                        <div class="stars">${"⭐".repeat(latest.rating)}</div>
                        <div class="review-comment" style="font-size: 1.1em; margin: 8px 0;">"${latest.comment}"</div>
                        
                        ${history.length > 0 ? generateHistoryHtml(history) : ''}
                    </div>
                `;
            }

            resultsDisplay.innerHTML = htmlOutput;

        } catch (error) {
            console.error("Error fetching reviews:", error);
            resultsDisplay.innerHTML = `<p>Error fetching reviews: ${error.message}</p>`;
        }
    });

    // Helper function to generate HTML for edit history
    function generateHistoryHtml(historyReviews) {
        let historyItems = historyReviews.map(r => `
            <li style="margin-bottom: 5px; padding-bottom: 5px; border-bottom: 1px solid #444;">
                <small style="color: #aaa;">${new Date(r.timestamp * 1000).toLocaleString()}</small><br>
                <span>${"⭐".repeat(r.rating)}</span> - <i style="color: #ccc;">"${r.comment}"</i>
            </li>
        `).join("");

        return `
            <details style="margin-top: 10px; background: #222; padding: 5px; border-radius: 4px;">
                <summary style="cursor: pointer; color: #9b59b6; font-size: 0.9em;">View Edit History (${historyReviews.length} older versions)</summary>
                <ul style="list-style: none; padding-left: 5px; margin-top: 10px;">
                    ${historyItems}
                </ul>
            </details>
        `;
    }
});