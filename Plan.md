# PROJECT PLAN: Modular Blockchain Review System
**Date:** November 16, 2025
**Project:** 4-Hour College Project (4 Members)
**Objective:** Create a modular, blockchain-based review system that ensures review authenticity by validating customer purchases.

---

## 1. 🚀 Project Overview

**The Problem:** Most review systems are unreliable. It's easy to create fake accounts and post fake reviews, which misleads real customers.

**Our Solution:** We will build a **hybrid system** that uses a private blockchain (Ganache) as an **immutable, tamper-proof database** for reviews. To ensure only real customers can post, we will *not* build a full DApp. Instead, we'll build a simple API "module" that the "Host Platform" (like an e-commerce site) can use to verify a purchase *before* a review is ever written to the blockchain.

**Core Features:**
* **Modular:** Our system will be a simple API. Any platform can integrate with it.
* **Authentic:** Only customers who have made a purchase (verified by the host) can submit a review.
* **Immutable:** Once a review is on the blockchain, it cannot be deleted or altered.

---

## 2. 🏛️ System Architecture & Idea

Our system has three parts. This is **NOT** a full DApp. It's a **Centralized API** that writes to a **Decentralized Database**.

1.  **The Blockchain (Ganache):** A **free**, local blockchain running on one of our computers. This is our trusted, unchangeable "ledger" for storing reviews.
2.  **The Smart Contract (Solidity):** A simple program deployed on Ganache. Its only jobs are `addReview()` and `getReviews()`.
3.  **The Review API (Node.js/Express):** This is the "modular" part. It's the gatekeeper. The outside world *only* talks to this API, never directly to the blockchain. It handles the "business logic."

### Data Flow (The "Token" System)

This is the clever part. The blockchain can't check a host's order history. So, our API will do it using a "one-time-use token" system.



1.  **Step 1: Verification (Backend-to-Backend)**
    * A customer (User A) buys a product (Product X) on the **Host Platform**.
    * The **Host Platform's SERVER** (which knows User A is a real customer) makes a secure API call to our **Review API**: `POST /request-review-token`.
    * It sends: `{ "userId": "user-A", "productId": "product-X" }`.

2.  **Step 2: Token Generation (Our API)**
    * Our **Review API** receives this, trusts the Host Platform, and generates a unique, **one-time-use token** (e.g., `abc-123`).
    * It stores this token in a simple list (a JavaScript `Map`) like this: `reviewTokens.set("abc-123", { userId: "user-A", productId: "product-X", used: false })`.
    * It sends the token back to the Host Platform's server.

3.  **Step 3: Submission (Frontend-to-API)**
    * The **Host Platform's WEBSITE** shows the review form to User A and secretly includes the `abc-123` token.
    * User A writes their review (5 stars, "Great product!") and hits "Submit."
    * The customer's *browser* sends the review to *our* **Review API**: `POST /submit-review`.
    * It sends: `{ "reviewToken": "abc-123", "rating": 5, "comment": "Great product!" }`.

4.  **Step 4: Validation & Blockchain Write (API-to-Blockchain)**
    * Our **Review API** gets the submission.
    * It checks its token list: "Is `abc-123` a valid token? And has it been used (`used: false`)?"
    * If **YES**: It marks the token as `used: true`, finds the associated `productId`, and then...
    * It calls the `addReview()` function on our **Smart Contract**, writing the review to the Ganache blockchain forever.
    * If **NO** (token is fake or already used): It rejects the review.

---

## 3. 🛠️ Technology Stack (All Free)

* **Blockchain Simulator:** **Ganache** (Free desktop app).
* **Smart Contract:** **Solidity** (The language).
* **Contract IDE:** **Remix IDE** (Free web-based tool. No install needed).
* **API Server:** **Node.js** & **Express** (Free).
* **API <-> Blockchain Link:** **Web3.js** (A Node.js library).
* **API Tester:** **Postman** (Free desktop app).
* **Host Simulator:** A single `index.html` file + `script.js` file (vanilla JavaScript).

---

## 4. ⏱️ 4-Hour Action Plan & Team Roles

This is how we'll get it done in 4 hours.

### Student 1: Blockchain Lead (The "Architect")
* **Goal:** Set up the blockchain and write the smart contract.
* **Tools:** Ganache, Remix IDE.

### Student 2: Backend Lead (The "Gatekeeper")
* **Goal:** Build the Node.js/Express API server and its endpoints.
* **Tools:** VS Code, Node.js, Express.

### Student 3: Integration Lead (The "Plumber")
* **Goal:** Connect the API (Student 2) to the Blockchain (Student 1).
* **Tools:** VS Code, Web3.js, Postman.

### Student 4: Frontend/Dashboard Lead (The "Host Simulator")
* **Goal:** Build an interactive "Host Simulator Dashboard" to simulate multiple users, multiple products, and test the full API flow.
* **Tools:** VS Code, 1 `index.html` file, 1 `script.js` file, Web Browser.

---

## 5. ✅ Detailed Task Checklist

### **[Student 1: Blockchain Lead] (No Change)**

* [ ] **(0:00 - 0:15)** Download, install, and run **Ganache**.
* [ ] **(0:15 - 0:30)** Click "Quickstart" to launch a local blockchain. Keep it running.
* [ ] **(0:30 - 1:30)** Open **Remix IDE** (remix.ethereum.org) in your browser.
* [ ] **(1:30 - 2:00)** Write the `ReviewContract.sol` smart contract. It needs:
    * A `struct` called `Review` (with `productId`, `rating`, `comment`, `timestamp`).
    * A `mapping(string => Review[]) public reviewsByProduct;`
    * A `function addReview(string memory _productId, uint8 _rating, string memory _comment) public` that adds a new `Review` to the mapping.
* [ ] **(2:00 - 2:15)** In Remix, set your "Environment" to "Injected Web3" (if you have MetaMask) or "Web3 Provider" (to connect to `http://127.0.0.1:7545` - your Ganache RPC server).
* [ ] **(2:15 - 2:30)** Deploy the contract to your Ganache instance.
* [ ] **(2:30 - 2:45)** **Deliverable:** Copy the **Contract ABI** and the **Contract Address**. Share these two pieces of text (e.g., in a `.txt` file) with **Student 3**.
* [ ] **(2:45 - 4:00)** Assist Student 3 with integration and answer any blockchain questions.

### **[Student 2: Backend Lead] (Updated Task)**

* [ ] **(0:00 - 0:30)** Set up a new Node.js project: `npm init -y` and `npm install express`.
* [ ] **(0:30 - 1:00)** Create `index.js`. Set up a basic Express server that `listen`s on a port (e.g., 3000).
* [ ] **(1:00 - 1:15)** At the top of your file, create the token store: `const reviewTokens = new Map();`
* [ ] **(1:15 - 2:15)** Build **Endpoint 1: `POST /request-review-token`**:
    * **(Updated)** It should expect a JSON body like `{ "userId": "...", "productId": "..." }`.
    * Generate a unique token (e.g., `const token = "token-" + Date.now();` or use `crypto.randomUUID()`).
    * **(Updated)** Store it: `reviewTokens.set(token, { userId: req.body.userId, productId: req.body.productId, used: false });`
    * Send back the token: `res.json({ reviewToken: token });`
* [ ] **(2:15 - 3:00)** Build **Endpoint 2: `POST /submit-review` (Logic STUB)**:
    * It should expect a JSON body like `{ "reviewToken": "...", "rating": 5, "comment": "..." }`.
    * Get the token: `const tokenData = reviewTokens.get(req.body.reviewToken);`
    * **Validation Logic:**
        * `if (!tokenData)` -> send `403 Forbidden` (Invalid Token).
        * `if (tokenData.used)` -> send `403 Forbidden` (Token already used).
    * If valid: Mark as used `tokenData.used = true;` and send `200 OK`.
* [ ] **(3:00 - 4:00)** Work with **Student 3** to integrate the Web3.js code into your `/submit-review` endpoint.

### **[Student 3: Integration Lead] (No Change)**

* [ ] **(0:00 - 0:30)** Set up your environment. Install **Postman**. Install Node.js if you don't have it.
* [ ] **(0:30 - 1:00)** In the *same* Node.js project as Student 2, run `npm install web3`.
* [ ] **(1:00 - 2:30)** Create a `blockchain.js` file (or just add to `index.js`). Write the setup code to connect to Ganache using Web3.js. You'll need the RPC Server URL from Student 1 (`http://127.0.0.1:7545`).
* [ ] **(2:30 - 2:45)** Wait for the **ABI** and **Contract Address** from Student 1.
* [ ] **(2:45 - 3:30)** In the `/submit-review` endpoint (in Student 2's code), inside the "If valid" block, add the Web3.js code to call the `addReview` function.
    * `const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);`
    * `await contract.methods.addReview(productId, rating, comment).send({ from: 'YOUR_GANACHE_ACCOUNT_ADDRESS_0' });` (Get the account address from Ganache).
* [ ] **(3:30 - 4:00)** Build **Endpoint 3: `GET /reviews/:productId`**:
    * This endpoint will call the *read-only* mapping on the contract.
    * `const reviews = await contract.methods.reviewsByProduct(req.params.productId).call();`
    * `res.json(reviews);`
* [ ] **(All Times)** Use Postman to test the endpoints as they are built.

### **[Student 4: Frontend/Dashboard Lead] (Updated Plan)**

* [ ] **(0:00 - 0:30)** Create an `index.html` file and a `script.js` file. Link `script.js` in your HTML.
* [ ] **(0:30 - 1:30)** **Build UI Part 1: "Simulate Purchase"** (`index.html`)
    * Create a `<select id="user-select">` dropdown with options for "User-123" and "User-456".
    * Create a `<select id="product-select-request">` dropdown with options for "Product-A" and "Product-B".
    * Add a button: `<button id="get-token-btn">Get Review Token</button>`.
* [ ] **(1:30 - 2:00)** **Build UI Part 2: "Submit Review Form"** (`index.html`)
    * Add text inputs: `<input id="token-input" placeholder="Token...">`.
    * Add text inputs: `<input id="rating-input" placeholder="Rating (1-5)...">`.
    * Add text inputs: `<input id="comment-input" placeholder="Comment...">`.
    * Add a button: `<button id="submit-review-btn">Submit Review</button>`.
* [ ] **(2:00 - 2:30)** **Build UI Part 3: "View Reviews"** (`index.html`)
    * Create a `<select id="product-select-view">` (can copy from Part 1).
    * Add a button: `<button id="fetch-reviews-btn">Fetch Reviews</button>`.
    * Add a "results" block: `<pre id="results-display">Reviews will show here...</pre>`.
* [ ] **(2:30 - 3:30)** **Implement JavaScript (`script.js`)**
    * Add an event listener for `get-token-btn`.
        * Inside, get the selected user and product values.
        * Use `fetch()` to `POST` to `http://localhost:3000/request-review-token` with `{ userId, productId }`.
        * Log the returned token to the console and display it on the page.
    * Add an event listener for `submit-review-btn`.
        * Inside, get the values from the token, rating, and comment inputs.
        * Use `fetch()` to `POST` to `http://localhost:3000/submit-review`.
    * Add an event listener for `fetch-reviews-btn`.
        * Inside, get the selected product ID.
        * Use `fetch()` to `GET` from `http://localhost:3000/reviews/PRODUCT_ID_HERE`.
        * Display the JSON response in the `results-display` block.
* [ ] **(3:30 - 4:00)** **Full End-to-End Testing:** Run the entire demo from the browser. Test all features and try to break the logic (e.g., use a token twice, try to submit for a different product).

---

## 6. 🏆 What Success Looks Like (at 4 Hours)

1.  We have a Ganache instance running with our `ReviewContract` deployed.
2.  We have a Node.js API server running.
3.  We can use our **`index.html` dashboard** to:
    a. Get a valid, one-time-use token for a *specific* user and product.
    b. Use that token to successfully submit a review.
    c. See that review appear as a transaction in Ganache.
    d. Fetch and see the review data for a specific product on our dashboard.
    e. **Prove** that submitting a review with a fake token or a used token *fails*.