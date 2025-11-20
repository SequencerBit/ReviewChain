const express = require('express');
const crypto = require('crypto');
const { Web3 } = require('web3'); // Correct import for modern web3
const cors = require('cors'); // Import cors

// --- START: BLOCKCHAIN CONNECTION ---

// 1. Connection Details
const ganacheUrl = 'http://127.0.0.1:7545';
const web3 = new Web3(ganacheUrl); // Correct constructor for modern web3

// 2. Contract ABI
const contractABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_userId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_productId",
				"type": "string"
			},
			{
				"internalType": "uint8",
				"name": "_rating",
				"type": "uint8"
			},
			{
				"internalType": "string",
				"name": "_comment",
				"type": "string"
			}
		],
		"name": "addReview",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "string",
				"name": "productId",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "string",
				"name": "userId",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "ReviewAdded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "string",
				"name": "productId",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "string",
				"name": "userId",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "ReviewUpdated",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_productId",
				"type": "string"
			}
		],
		"name": "getReviewsByProduct",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "userId",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "productId",
						"type": "string"
					},
					{
						"internalType": "uint8",
						"name": "rating",
						"type": "uint8"
					},
					{
						"internalType": "string",
						"name": "comment",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					}
				],
				"internalType": "struct ReviewContract.Review[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "reviewsByProduct",
		"outputs": [
			{
				"internalType": "string",
				"name": "userId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "productId",
				"type": "string"
			},
			{
				"internalType": "uint8",
				"name": "rating",
				"type": "uint8"
			},
			{
				"internalType": "string",
				"name": "comment",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "userHasReviewed",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

// 3. Contract Address
const contractAddress = '0xdAae53b60c2E0D3DEB81fCd7c803fAdac7801fe3';

// 4. Account (Make sure this is one of your Ganache accounts)
const myAccount = '0x164bF75d30A04604E466237F5ee3fDBBb6D27C3c';

// 5. Create the Contract Object
const reviewContract = new web3.eth.Contract(contractABI, contractAddress);

console.log('Connected to Ganache and contract is loaded.');

const app = express();
const port = process.env.PORT || 3000;
const reviewTokens = new Map();
app.use(express.json()); // Middleware to parse JSON bodies
app.use(cors()); // Middleware to allow cross-origin requests

// Endpoint to request a token
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

  console.log(`Issued token ${token} for ${userId} / ${productId}`);
  // Return the token
  res.json({ reviewToken: token });
});

// Endpoint to submit a review
app.post('/submit-review', async (req, res) => { 
    
    const { reviewToken, rating, comment } = req.body;
    const tokenData = reviewTokens.get(reviewToken);

    // 1. Validation logic
    if (!tokenData) {
        console.warn(`Invalid token received: ${reviewToken}`);
        return res.status(403).send('Invalid token.');
    }
    if (tokenData.used) {
        console.warn(`Used token received: ${reviewToken}`);
        return res.status(403).send('Token has already been used.');
    }

    // 2. Mark token as used
    tokenData.used = true;

    // 3. --- BLOCKCHAIN CODE ---
    try {
        console.log('Sending transaction to blockchain...');
        const { userId, productId } = tokenData; 
        
        await reviewContract.methods.addReview(
            userId,
            productId,
            rating,
            comment
        ).send({ from: myAccount, gas: '1000000' });

        console.log('Transaction successful!');
        res.status(200).send({ message: 'Review successfully submitted to the blockchain!' });

    } catch (error) {
        console.error('Blockchain write error:', error);
        // Un-mark the token so they can try again
        tokenData.used = false; 
        res.status(500).send({ message: 'Error writing review to blockchain.' });
    }
});

// Endpoint to get reviews for a product
app.get('/reviews/:productId', async (req, res) => {
    
    const { productId } = req.params;

    try {
        console.log(`Fetching reviews for product: ${productId}`);

        // Get reviews from blockchain
        const reviews = await reviewContract.methods.getReviewsByProduct(productId).call();

        // --- START: BIGINT FIX ---
        // Convert BigInts to strings for JSON serialization
        const serializableReviews = reviews.map(review => {
            return {
                userId: review.userId,
                productId: review.productId,
                rating: review.rating.toString(), // Convert BigInt to string
                comment: review.comment,
                timestamp: review.timestamp.toString() // Convert BigInt to string
            }
        });
        // --- END: BIGINT FIX ---

        // Send the new, safe array
        res.status(200).json(serializableReviews);

    } catch (error) {
        console.error('Blockchain read error:', error);
        res.status(500).send({ message: 'Error reading reviews from blockchain.' });
    }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});