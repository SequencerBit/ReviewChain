document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "http://localhost:3000";
    
    // State
    let currentUser = null;
    let currentProduct = null;
    let activeReviewToken = null;

    // --- MOCK DATABASE ---
    
    // 1. Existing Users (No items purchased yet)
    const validUsers = [
        { username: "Alice", password: "password123" },
        { username: "Bob",   password: "password123" },
        { username: "Charlie", password: "password123" }
    ];

    // 2. Hardcoded Products
    const products = [
        {
            id: "Product-A",
            title: "Wireless Noise Cancelling Headphones, Bluetooth 5.0",
            price: 299.99,
            image:"images/earphone.png",
            desc: "Experience world-class noise cancellation and premium sound quality with these top-tier headphones."
        },
        {
            id: "Product-B",
            title: "4K Ultra HD Smart LED TV, 55-Inch Class",
            price: 450.00,
            image: "images/tv.jpg",
            desc: "Stunning 4K visuals with vibrant colors and built-in smart streaming apps."
        },
        {
            id: "Product-C",
            title: "Mechanical Gaming Keyboard, RGB Backlit",
            price: 89.99,
            image: "images/keyboard.jpg",
            desc: "Tactile mechanical switches for the ultimate gaming performance and typing experience."
        },
        {
            id: "Product-D",
            title: "Stainless Steel Insulated Water Bottle, 32oz",
            price: 24.95,
            image: "images/bottle.jpg",
            desc: "Keeps beverages cold for 24 hours or hot for 12 hours. Durable and leak-proof."
        }
    ];

    // --- NAVIGATION ---
    const loginPage = document.getElementById("login-page");
    const homePage = document.getElementById("home-page");
    const productPage = document.getElementById("product-page");
    const navbar = document.getElementById("navbar");
    const navGreeting = document.getElementById("nav-greeting");

    function showLogin() {
        loginPage.classList.remove("hidden");
        homePage.classList.add("hidden");
        productPage.classList.add("hidden");
        navbar.classList.add("hidden");
        
        // Clear inputs
        document.getElementById("username-input").value = "";
        document.getElementById("password-input").value = "";
    }

    function showHome() {
        loginPage.classList.add("hidden");
        homePage.classList.remove("hidden");
        productPage.classList.add("hidden");
        navbar.classList.remove("hidden");
        renderProductGrid();
    }

    function showProduct(product) {
        currentProduct = product;
        activeReviewToken = null; // Reset token on new product view
        
        loginPage.classList.add("hidden");
        homePage.classList.add("hidden");
        productPage.classList.remove("hidden");
        navbar.classList.remove("hidden");

        // Fill Info
        document.getElementById("detail-image").src = product.image;
        document.getElementById("detail-title").textContent = product.title;
        document.getElementById("detail-price").textContent = product.price;
        document.getElementById("buy-box-price").textContent = product.price;
        document.getElementById("detail-desc").textContent = product.desc;

        // Reset Buy Box State
        document.getElementById("buy-now-btn").classList.remove("hidden");
        document.getElementById("purchase-message").classList.add("hidden");
        document.getElementById("write-review-container").classList.add("hidden");

        // Load Reviews from Blockchain
        fetchReviews(product.id);
    }

    // --- LOGIN LOGIC (Updated) ---
    document.getElementById("login-btn").addEventListener("click", () => {
        const usernameInput = document.getElementById("username-input").value.trim();
        const passwordInput = document.getElementById("password-input").value.trim();

        // Check against mock DB
        const user = validUsers.find(u => u.username === usernameInput && u.password === passwordInput);

        if (user) {
            currentUser = user.username;
            navGreeting.textContent = `Hello, ${currentUser}`;
            showHome();
        } else {
            alert("Invalid username or password. Please try again.");
        }
    });

    // --- HOME PAGE LOGIC ---
    function renderProductGrid() {
        const grid = document.getElementById("product-grid");
        grid.innerHTML = "";
        products.forEach(p => {
            const card = document.createElement("div");
            card.className = "product-card";
            card.innerHTML = `
                <img src="${p.image}" alt="${p.title}">
                <div class="p-title">${p.title}</div>
                <div class="p-price"><sup>$</sup>${Math.floor(p.price)}<sup>${(p.price % 1).toFixed(2).substring(2)}</sup></div>
            `;
            card.addEventListener("click", () => showProduct(p));
            grid.appendChild(card);
        });
    }

    // --- PRODUCT DETAILS LOGIC ---
    document.getElementById("back-btn").addEventListener("click", showHome);

    // BUY BUTTON (Simulates Purchase -> Requests Token)
    document.getElementById("buy-now-btn").addEventListener("click", async () => {
        if (!currentUser || !currentProduct) return;

        const btn = document.getElementById("buy-now-btn");
        btn.textContent = "Processing...";
        btn.disabled = true;

        try {
            // Request token from backend
            const response = await fetch(`${API_URL}/request-review-token`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: currentUser, productId: currentProduct.id })
            });

            if (!response.ok) throw new Error("Purchase failed");

            const data = await response.json();
            activeReviewToken = data.reviewToken;

            // Update UI to show "Verified Purchase" state
            btn.classList.add("hidden");
            document.getElementById("purchase-message").classList.remove("hidden");
            document.getElementById("write-review-container").classList.remove("hidden"); // Unlock Review Form
            
            alert("Purchase Successful! You can now review this product.");

        } catch (error) {
            console.error("Buy error:", error);
            alert("Error processing purchase.");
        } finally {
            btn.disabled = false;
            btn.textContent = "Buy Now";
        }
    });

    // SUBMIT REVIEW
    document.getElementById("submit-review-btn").addEventListener("click", async () => {
        const rating = document.getElementById("review-rating").value;
        const comment = document.getElementById("review-comment").value;

        if (!rating || !comment) {
            alert("Please provide a rating and comment.");
            return;
        }

        const btn = document.getElementById("submit-review-btn");
        btn.textContent = "Submitting to Blockchain...";
        btn.disabled = true;

        try {
            const response = await fetch(`${API_URL}/submit-review`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    reviewToken: activeReviewToken, 
                    rating: parseInt(rating), 
                    comment: comment 
                })
            });

            if (!response.ok) throw new Error("Submission failed");

            // Success
            document.getElementById("review-comment").value = "";
            alert("Review submitted successfully!");
            fetchReviews(currentProduct.id); // Refresh list

        } catch (error) {
            console.error("Submit error:", error);
            alert("Failed to submit review. " + error.message);
        } finally {
            btn.disabled = false;
            btn.textContent = "Submit Review";
        }
    });

    // --- FETCH & RENDER REVIEWS (One Review Per User Logic) ---
    async function fetchReviews(productId) {
        const list = document.getElementById("reviews-list");
        const badge = document.getElementById("review-count-badge");
        list.innerHTML = "<p>Loading reviews from blockchain...</p>";

        try {
            const response = await fetch(`${API_URL}/reviews/${productId}`);
            if (!response.ok) throw new Error("Fetch failed");
            
            const rawReviews = await response.json();
            badge.textContent = `(${rawReviews.length})`;

            if (rawReviews.length === 0) {
                list.innerHTML = "<p>No reviews yet.</p>";
                return;
            }

            // GROUPING LOGIC (One Review Per User + History)
            const grouped = {};
            rawReviews.forEach(r => {
                if (!grouped[r.userId]) grouped[r.userId] = [];
                grouped[r.userId].push(r);
            });

            let html = "";
            for (const user in grouped) {
                // Sort descending by timestamp
                const history = grouped[user].sort((a, b) => b.timestamp - a.timestamp);
                const latest = history[0];
                const older = history.slice(1);

                html += `
                    <div class="review-card">
                        <div class="review-user">
                            <img src="https://via.placeholder.com/30?text=U" style="border-radius:50%; width:25px;"> 
                            ${latest.userId}
                        </div>
                        <div class="review-stars">${"⭐".repeat(latest.rating)}</div>
                        <div class="review-meta">Reviewed on ${new Date(latest.timestamp * 1000).toLocaleDateString()}</div>
                        <div class="review-body">${latest.comment}</div>
                        
                        ${older.length > 0 ? renderHistory(older) : ""}
                    </div>
                `;
            }
            list.innerHTML = html;

        } catch (error) {
            console.error(error);
            list.innerHTML = "<p>Error loading reviews.</p>";
        }
    }

    function renderHistory(historyItems) {
        const itemsHtml = historyItems.map(r => `
            <li style="margin-top: 5px; border-top: 1px solid #eee; padding-top: 5px;">
                <span style="font-size:11px; color:#888;">${new Date(r.timestamp * 1000).toLocaleString()}</span><br>
                <span>${"⭐".repeat(r.rating)}</span> ${r.comment}
            </li>
        `).join("");

        return `
            <details style="margin-top: 10px;">
                <summary style="color: #007185; cursor: pointer; font-size: 13px;">View Edit History</summary>
                <ul style="list-style:none; padding-left: 10px; font-size: 13px;">${itemsHtml}</ul>
            </details>
        `;
    }

    // Start on Login Page
    showLogin();
});