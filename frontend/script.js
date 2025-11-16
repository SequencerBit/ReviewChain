// Wait for the DOM to be fully loaded before we run our script
document.addEventListener("DOMContentLoaded", () => {

    // API Server URL 
    const API_URL = "http://localhost:3000";

    // --- Part 1 Elements ---
    const userSelect = document.getElementById("user-select");
    const productSelectRequest = document.getElementById("product-select-request");
    const getTokenBtn = document.getElementById("get-token-btn");

    // --- Part 2 Elements ---
    const tokenInput = document.getElementById("token-input");
    const ratingInput = document.getElementById("rating-input");
    const commentInput = document.getElementById("comment-input");
    const submitReviewBtn = document.getElementById("submit-review-btn");

    // --- Part 3 Elements ---
    const productSelectView = document.getElementById("product-select-view");
    const fetchReviewsBtn = document.getElementById("fetch-reviews-btn");
    const resultsDisplay = document.getElementById("results-display");

    // --- Event Listener for "Get Token" Button ---
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

            // Auto-fill the token into the next form
            tokenInput.value = data.reviewToken;
            resultsDisplay.textContent = `Token received: ${data.reviewToken}`;

        } catch (error) {
            console.error("Error getting token:", error);
            resultsDisplay.textContent = `Error getting token: ${error.message}`;
        }
    });

    // --- Event Listener for "Submit Review" Button ---
    submitReviewBtn.addEventListener("click", async () => {
        const reviewToken = tokenInput.value;
        const rating = parseInt(ratingInput.value, 10);
        const comment = commentInput.value;

        if (!reviewToken || !rating || !comment) {
            resultsDisplay.textContent = "Error: Please fill in token, rating, and comment.";
            return;
        }

        resultsDisplay.textContent = "Submitting review...";

        try {
            const response = await fetch(`${API_URL}/submit-review`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reviewToken, rating, comment })
            });

            if (!response.ok) {
                throw new Error(`Review failed! Status: ${response.status} (${response.statusText})`);
            }

            resultsDisplay.textContent = "Review submitted successfully! It is now on the blockchain.";

            // Clear the form 
            tokenInput.value = "";
            ratingInput.value = "";
            commentInput.value = "";

        } catch (error) {
            console.error("Error submitting review:", error);
            resultsDisplay.textContent = `Error submitting review: ${error.message}`;
        }
    });

    // --- Event Listener for "Fetch Reviews" Button ---
    fetchReviewsBtn.addEventListener("click", async () => {
        const productId = productSelectView.value;

        resultsDisplay.innerHTML = `<p>Fetching reviews for ${productId}...</p>`;

        try {
            const response = await fetch(`${API_URL}/reviews/${productId}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const reviews = await response.json();

            if (reviews.length === 0) {
                resultsDisplay.innerHTML = `<p>No reviews yet for ${productId}.</p>`;
                return;
            }

            // Build formatted cards
            resultsDisplay.innerHTML = reviews.map(r => `
                <div class="review-card">
                    <div class="stars">${"⭐".repeat(r.rating)}</div>
                    <div class="review-comment">"${r.comment}"</div>
                    <div class="review-meta">
                        <b>User:</b> ${r.userId}<br>

                        <b>Timestamp:</b> ${new Date(r.timestamp * 1000).toLocaleString()}
                    </div>
                </div>
            `).join("");

        } catch (error) {
            console.error("Error fetching reviews:", error);
            resultsDisplay.innerHTML = `<p>Error fetching reviews: ${error.message}</p>`;
        }
    });

}); // <-- THIS was missing!
