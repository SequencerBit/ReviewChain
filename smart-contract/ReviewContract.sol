// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ReviewContract {

    struct Review {
        string userId;
        string productId;
        uint8 rating;
        string comment;
        uint timestamp;
    }

    // Map ProductID => Array of Reviews
    mapping(string => Review[]) public reviewsByProduct;

    // NEW: Map ProductID => UserID => HasReviewed (To track edits)
    mapping(string => mapping(string => bool)) public userHasReviewed;

    // NEW: Events to log distinct actions
    event ReviewAdded(string indexed productId, string indexed userId, uint timestamp);
    event ReviewUpdated(string indexed productId, string indexed userId, uint timestamp);

    function addReview(string memory _userId, string memory _productId, uint8 _rating, string memory _comment) public {
        
        uint _timestamp = block.timestamp;

        Review memory newReview = Review(
            _userId,
            _productId,
            _rating,
            _comment,
            _timestamp
        );

        // Push the review to the array (History is ALWAYS preserved on blockchain)
        reviewsByProduct[_productId].push(newReview);

        // NEW: Logic to determine if this is a specific Edit or a New Review
        if (userHasReviewed[_productId][_userId]) {
            // User has reviewed before, so this is an UPDATE
            emit ReviewUpdated(_productId, _userId, _timestamp);
        } else {
            // First time reviewing this product
            userHasReviewed[_productId][_userId] = true;
            emit ReviewAdded(_productId, _userId, _timestamp);
        }
    }

    function getReviewsByProduct(string memory _productId) public view returns (Review[] memory) {
        return reviewsByProduct[_productId];
    }
}
