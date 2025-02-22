import React, { useEffect, useState } from "react";
import axiosInstance from "../../../axiosconfig";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import Header from "../../../Components/Header/Header";
import Breadcrumbs from "../../../Components/Breadcrumps";
import Footer from "../../../Components/Footer/Footer";

const Review = () => {
  const { id } = useParams();
  const [reviews, setReviews] = useState([]);
  const navigate=useNavigate()
  useEffect(() => {
    fetchReviewAndRating();
  }, []);
  const fetchReviewAndRating = async () => {
    try {
      const response = await axiosInstance.get(`/reviewAndRating/${id}`);
      setReviews(response.data);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div>
  <Header page="home" />
  <div className="min-h-screen bg-[#FCF4D2] py-8">
    <div className="max-w-3xl mx-auto px-4">
      <div className="flex justify-between">
      <h1 className="text-2xl font-bold mb-8">User Reviews</h1>
      <button className="bg-green-800 m-0"
      onClick={()=>navigate(-1)}>Back</button>
      </div>
      
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-[#E8D7B4] p-6 rounded-lg shadow-sm"
            >
              <div className="flex items-center mb-4">
                <div className="text-yellow-500 text-xl">
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  by {review.user_name}
                </span>
              </div>
              <p className="text-gray-800">{review.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No reviews available.</p>
      )}
    </div>
  </div>
  <Footer />
</div>
  );
};

export default Review;
