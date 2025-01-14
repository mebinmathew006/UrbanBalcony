import React, { useEffect, useState } from "react";
import axiosInstance from "../../../axiosconfig";
import { useSelector } from "react-redux";

function UserOrderDetails() {
  const [userOrders, setUserOrders] = useState();
  const user_id = useSelector((state)=>state.userDetails.id)
  const handleCancel=async (id)=>{
    try {
        const response=await axiosInstance.patch(`userOrders/${id}`)
    } catch (error) {
        
    }

  }
  useEffect(()=>{
    fetchUserOrders();
  },[])

  const fetchUserOrders = async ()=>{
    try {
        const response = await axiosInstance.get(`userOrders/${user_id}`)
        setUserOrders(response.data)
        console.log(response.data)
        
    } catch (error) {
        
    }
  }
  return (
    <div>
        <h1>Order Details</h1>
    {userOrders &&
      userOrders.map((order, index) => (
        <div className="card mb-3" key={index}>
          <div className="card-body">
            <h5 className="card-title"></h5>

            {order.order_items.map((item, itemIndex) => (
              <div key={itemIndex} className="flex items-center gap-52 mt-10">
              <div>
                <img 
                  src={`http://localhost:8000/${item.product.product_img1}`} 
                  className="w-36 h-36" 
                  alt="Not Found" 
                />
              </div>
              <div>
                <p>
                  Product: {item.product.title || "N/A"}
                  <br />
                  Quantity: {item.quantity}
                  <br />
                  Total Amount: {item.total_amount}
                  <br />
                  Status: {item.status}
                </p>
              </div>
              <div className="ml-auto">
              {item.status==='Pending' && <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={handleCancel(item.id)}>Cancel</button>}  
              </div>
            </div>
            ))}
  
            
          </div>
        </div>
      ))}
  </div>
  
  );
}

export default UserOrderDetails;
