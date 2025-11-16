// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ReviewContract
 * @dev Stores product reviews immutably on the blockchain.
 */
contract ReviewContract {

    // This is a "struct," like a custom data type or a class object.
    // It defines what a "Review" looks like.
    struct Review {
        string productId;
        uint8 rating;       // A number from 0-255 (perfect for 1-5 stars)
        string comment;
        uint timestamp;    // The time the review was submitted
    }

    // This is our "database."
    // It maps a "string" (the product ID) to an "array of Reviews."
    mapping(string => Review[]) public reviewsByProduct;

    /**
     * @dev Adds a new review to a product's review array.
     * This is the ONLY function our API will "write" to.
     */
    function addReview(string memory _productId, uint8 _rating, string memory _comment) public {
        
        // Get the current time from the blockchain
        uint _timestamp = block.timestamp;
        
        // Create the new Review object in memory
        Review memory newReview = Review(
            _productId,
            _rating,
            _comment,
            _timestamp
        );
        
        // Add the new review to the array for that specific product
        reviewsByProduct[_productId].push(newReview);
    }

    /**
     * @dev Gets all reviews for a specific product ID.
     * NEW FUNCTION: This is needed because web3.js can't read an entire 
     * array from a public mapping directly.
     */
    function getReviewsByProduct(string memory _productId) public view returns (Review[] memory) {
        return reviewsByProduct[_productId];
    }
}