import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/Admin/Sidebar/Sidebar";
import adminaxiosInstance from "../../../adminaxiosconfig";
import { useNavigate } from "react-router-dom";

function CouponManage() {
  const navigate = useNavigate();
  
  // Function to toggle coupon status
  const toggleCouponStatus = async (id) => {
    try {
      await adminaxiosInstance.patch(`/couponManage/${id}`);
      fetchCoupons();
    } catch (error) {
      console.error("Error toggling coupon status:", error);
    }
  };

  const [coupons, setCoupons] = useState([]);

  // Fetch coupons from the backend
  const fetchCoupons = async () => {
    try {
      const response = await adminaxiosInstance.get("/couponManage");
      setCoupons(response.data);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  return (
    <div className="d-flex vh-100 bg-light">
      <Sidebar />
      <div className="d-flex flex-column flex-grow-1">
        <main className="bg-light">
          <div className="container-fluid">
            <div className="d-flex justify-content-center gap-5 pb-5">
              <h3>Coupon Details</h3>
              <button className="btn btn-info" onClick={() => navigate("/CouponAdd")}>
                ADD
              </button>
            </div>
            <table className="table">
              <thead className="thead-dark">
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Code</th>
                  <th scope="col">Coupon Percentage</th>
                  <th scope="col">Expire Date</th>
                  <th scope="col">Status</th>
                  <th scope="col">Created At</th>
                  <th scope="col">Block/Unblock</th>
                  <th scope="col">Edit</th>
                </tr>
              </thead>
              <tbody>
                {coupons &&
                  coupons.map((coupon, index) => (
                    <tr key={index}>
                      <th scope="row">{index + 1}</th>
                      <td>{coupon.code}</td>
                      <td>{coupon.coupon_percent}%</td>
                      <td>{coupon.expire_date}</td>
                      <td>{coupon.is_active ? "Active" : "Inactive"}</td>
                      <td>{new Date(coupon.created_at).toLocaleDateString()}</td>
                      <td>
                        <button
                          className={`btn ${
                            coupon.is_active ? "btn-primary" : "btn-danger"
                          }`}
                          onClick={() => toggleCouponStatus(coupon.id)}
                        >
                          {coupon.is_active ? "Block" : "Unblock"}
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn btn-success"
                          onClick={() => navigate("/CouponEdit", { state: coupon })}
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

export default CouponManage;
