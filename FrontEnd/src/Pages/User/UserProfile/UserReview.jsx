import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../../../axiosconfig";
import { toast } from "react-toastify";
import Header from "../../../Components/Header/Header";
import Footer from "../../../Components/Footer/Footer";
import { useLocation, useNavigate } from "react-router-dom";

function UserReview({  }) {
  const user_id = useSelector((state) => state.userDetails.id);
  const location =useLocation()
  const orderId = location.state.orderId
  const productId = location.state.productId
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate =useNavigate()
  // Fetch existing reviews for the product
  useEffect(() => {
  }, []);



  // Handle rating change
  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  // Handle review submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const reviewData = {
      user:user_id,
      product: productId,
      rating,
      description: reviewText,
    };

    try {
      const response = await axiosInstance.post("reviewAndRating", reviewData);
      if (response.status === 201) {
        toast.success("Review submitted successfully!", {
          position: "bottom-center",
        });
        setRating(0);
        setReviewText("");
        navigate(-1)
      }
    } catch (error) {
      toast.error("Failed to submit review. Please try again.", {
        position: "bottom-center",
      });
      console.error("Error submitting review:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="review-content rounded-xl  w-full">
        <div className="flex items-center justify-between px-6 py-4 rounded-lg mb-6">
          <h3 className="text-2xl font-semibold text-gray-800">
            Product Reviews
          </h3>
        </div>

        {/* Review Form */}
        <div className=" p-6 rounded-lg shadow-sm mb-6">
          <h4 className="text-lg font-semibold mb-4">Write a Review</h4>
          <form onSubmit={handleSubmitReview}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="block  space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    className={`text-2xl bg-inherit border-black ${
                      star <= rating ? "text-yellow-500" : "text-white"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-1/4 p-2 border rounded-lg "
                rows="4"
                placeholder="Share your thoughts about the product..."
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#467927] hover:bg-[#386020] text-white px-4 py-2  rounded-md transition-colors duration-200 font-medium"
            >
              {isLoading ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default UserReview;
