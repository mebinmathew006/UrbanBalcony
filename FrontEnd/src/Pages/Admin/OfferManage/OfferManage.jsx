import React, { useEffect, useState } from "react";
import Sidebar from "../../../Components/Admin/Sidebar/Sidebar";
import adminaxiosInstance from "../../../adminaxiosconfig";
import { useNavigate } from "react-router-dom";

function OfferManage() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);

  // Fetch offers from the backend
  const fetchOffers = async () => {
    try {
      const response = await adminaxiosInstance.get("/offerManage");
      setOffers(response.data);
    } catch (error) {
      console.error("Error fetching offers:", error);
    }
  };

  // Toggle offer status (active/inactive)
  const toggleOfferStatus = async (id) => {
    try {
      await adminaxiosInstance.patch(`/offerManage/${id}`);
      fetchOffers();
    } catch (error) {
      console.error("Error toggling offer status:", error);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  return (
    <div className="d-flex vh-100 bg-light">
      <Sidebar />
      <div className="d-flex flex-column flex-grow-1">
        <main className="bg-light">
          <div className="container-fluid">
            <div className="d-flex justify-content-center gap-5 pb-5">
              <h3>Offer Details</h3>
              <button
                className="btn btn-info"
                onClick={() => navigate("/addOffer")}
              >
                ADD
              </button>
            </div>
            <table className="table">
              <thead className="thead-dark">
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Product</th>
                  <th scope="col">Discount Percentage</th>
                  <th scope="col">Status</th>
                  
                  <th scope="col">Block/Unblock</th>
                  <th scope="col">Edit</th>
                </tr>
              </thead>
              <tbody>
                {offers &&
                  offers.map((offer, index) => (
                    <tr key={index}>
                      <th scope="row">{index + 1}</th>
                      <td>{offer.product_name}</td>
                      <td>{offer.discount_percentage}%</td>
                      <td>{offer.is_active ? "Active" : "Inactive"}</td>
                     
                      <td>
                        <button
                          className={`btn ${
                            offer.is_active ? "btn-primary" : "btn-danger"
                          }`}
                          onClick={() => toggleOfferStatus(offer.id)}
                        >
                          {offer.is_active ? "Block" : "Unblock"}
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn btn-success"
                          onClick={() =>
                            navigate("/editOffer", { state: offer })
                          }
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}

export default OfferManage;
