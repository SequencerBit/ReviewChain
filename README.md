# ReviewChain

A modular review system built on Ethereum blockchain for immutable product reviews. This project consists of a backend API, a frontend dashboard, and a Solidity smart contract to store reviews securely on the blockchain.

## Features

- **Immutable Reviews**: All reviews are stored on the Ethereum blockchain, ensuring they cannot be altered or deleted.
- **Token-Based Review System**: Users must obtain a review token (simulating a purchase) before submitting a review to prevent spam.
- **Product-Specific Reviews**: Reviews are organized by product ID, allowing easy retrieval and display.
- **RESTful API**: Backend provides endpoints for token requests, review submissions, and review fetching.
- **Web Dashboard**: Frontend provides a user-friendly interface to simulate purchases, submit reviews, and view existing reviews.
- **Blockchain Integration**: Uses Web3.js to interact with the Ethereum network (local Ganache for development).

## Project Structure

```
ReviewChain/
├── backend/                 # Node.js/Express API server
│   ├── index.js            # Main server file with API endpoints
│   ├── package.json        # Backend dependencies
│   └── package-lock.json   # Lockfile for dependencies
├── frontend/               # Static web dashboard
│   ├── index.html          # Main HTML page
│   ├── script.js           # Frontend JavaScript for API interactions
│   └── style.css           # Styling for the dashboard
├── smart-contract/         # Solidity smart contract
│   └── ReviewContract.sol  # Contract for storing reviews
├── README.md               # This file
└── .gitignore              # Git ignore rules
```

## Prerequisites

- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)
- **Ganache** (local Ethereum blockchain for development)

## Setup Instructions

### 1. Smart Contract Deployment

1. Start Ganache and note the RPC server URL (default: `http://127.0.0.1:7545`).
2. Deploy the `ReviewContract.sol` to your local Ganache network.
3. Note the deployed contract address and update it in `backend/index.js` (currently hardcoded as `0x1e5D87C1563Ae2FBB68cEED8aF0b66B909709e06`).
4. Ensure one of your Ganache accounts is set as the `myAccount` in `backend/index.js` (currently `0x164bF75d30A04604E466237F5ee3fDBBb6D27C3c`).

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   node index.js
   ```

   The server will run on `http://localhost:3000` by default.

### 3. Frontend Setup

The frontend is static and requires no build process. Simply open `frontend/index.html` in a web browser. For the best experience, serve it via a local server:

1. If you have Python installed:
   ```bash
   cd frontend
   python -m http.server 8080
   ```
   Then open `http://localhost:8080` in your browser.

2. Or use any static file server of your choice.

## Usage

1. **Simulate Purchase**: Select a user and product, then click "Purchase" to get a review token.
2. **Submit Review**: Use the obtained token to submit a rating (1-5) and comment for the product.
3. **View Reviews**: Select a product and fetch its reviews to see all submitted reviews with timestamps.

## API Documentation

### POST /request-review-token
Request a review token for a user and product.

**Request Body:**
```json
{
  "userId": "string",
  "productId": "string"
}
```

**Response:**
```json
{
  "reviewToken": "uuid-string"
}
```

### POST /submit-review
Submit a review using a valid token.

**Request Body:**
```json
{
  "reviewToken": "uuid-string",
  "rating": 5,
  "comment": "string"
}
```

**Response:**
```json
{
  "message": "Review successfully submitted to the blockchain!"
}
```

### GET /reviews/:productId
Fetch all reviews for a specific product.

**Response:**
```json
[
  {
    "productId": "string",
    "rating": "5",
    "comment": "string",
    "timestamp": "1640995200"
  }
]
```

## Blockchain Integration Notes

- The system uses Web3.js v4 to interact with the Ethereum network.
- Reviews are stored immutably on the blockchain, ensuring data integrity.
- BigInt values (like timestamps) are converted to strings for JSON serialization.
- Gas limits are set for transactions; adjust as needed for complex operations.
- For production, deploy to a testnet (e.g., Sepolia) or mainnet and update the contract address and RPC URL.

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Test thoroughly, especially blockchain interactions.
5. Submit a pull request.

## License

This project is licensed under the MIT License.
