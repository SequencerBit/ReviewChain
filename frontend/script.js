// Wait for the DOM to be fully loaded before we run our script
document.addEventListener("DOMContentLoaded", () => {

    // API Server URL (from Student 2's plan)
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
                // This will catch the 403 Forbidden errors for invalid/used tokens
                throw new Error(`Review failed! Status: ${response.status} (${response.statusText})`);
            }
            
            resultsDisplay.textContent = "Review submitted successfully! It is now on the blockchain.";
            
            // Clear the form for the next review
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

        resultsDisplay.textContent = `Fetching reviews for ${productId}...`;

        try {
            const response = await fetch(`${API_URL}/reviews/${productId}`, {
                method: "GET"
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const reviews = await response.json();
            
            // Display the JSON data in the <pre> tag, nicely formatted
            resultsDisplay.textContent = JSON.stringify(reviews, null, 2);

        } catch (error) {
            console.error("Error fetching reviews:", error);
            resultsDisplay.textContent = `Error fetching reviews: ${error.message}`;
        }
    });
});