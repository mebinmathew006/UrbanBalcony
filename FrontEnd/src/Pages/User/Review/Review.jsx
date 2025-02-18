import React, { useEffect, useState } from "react";
import axiosInstance from "../../../axiosconfig";
import { useParams } from "react-router-dom";
import Header from "../../../components/header/header";
import Breadcrumbs from "../../../components/Breadcrumps";
import Footer from "../../../components/footer/Footer";

const Review = () => {
  const { id } = useParams();
  const [reviews, setReviews] = useState([]);

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
    <div >
      <Header page="home" />
      <Breadcrumbs />
      <div className="h-screen">
      <h1>User Reviews</h1>
      {reviews.length > 0 ? (
        <ul>
          {reviews.map((review) => (
            <li key={review.id} style={{textDecoration:'none',listStyleType:'none'}}>
              <p>{review.description}</p>
              <p>Rating: {review.rating}</p>
              <div>
                {"★".repeat(review.rating) + "☆".repeat(5 - review.rating)}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No reviews available.</p>
      )}
      </div>
      <Footer />
    </div>
  );
};

export default Review;
