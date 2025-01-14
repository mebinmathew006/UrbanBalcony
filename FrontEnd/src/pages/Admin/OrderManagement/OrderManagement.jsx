import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../../components/Admin/Sidebar/Sidebar';
import adminaxiosInstance from '../../../adminaxiosconfig';

function OrderManagement() {
    const navigate = useNavigate();
    const [userOrders, setUserOrders] = useState([]);
    const user_id = useSelector((state) => state.userDetails.id);
  
    // const handleCancel = async (id) => {
    //   try {
    //     await axiosInstance.patch(`userOrders/${id}`);
    //     fetchUserOrders();
    //     console.log();
        
    //   } catch (error) {
    //     console.log(error);
    //   }
    // };
  
    const fetchUserOrders = async () => {
      try {
        const response = await adminaxiosInstance.get(`/admingetuserOrders`);
        console.log(response.data);
        
        setUserOrders(response.data);
      } catch (error) {
        console.log(error);
      }
    };
  
    useEffect(() => {
      fetchUserOrders();
    }, []);
  
    return (
      <div className="d-flex vh-100 bg-light">
        <Sidebar />
        <div className="d-flex flex-column flex-grow-1">
          <main className="bg-light">
            <div className="container-fluid">
              <div className="d-flex justify-content-center gap-5 pb-5">
                <h3>Order Details</h3>
              </div>
              <table className="table">
                <thead className="thead-dark">
                  <tr>
                    <th scope="col">Product</th>
                    <th scope="col">Quantity</th>
                    <th scope="col">Total Amount</th>
                    <th scope="col">Status</th>
                    <th scope="col">Cancel</th>
                  </tr>
                </thead>
                <tbody>
                  {userOrders &&
                    userOrders.map((order, index) => (
                      <tr key={index}>
                        
                        <td>
                          {order.order_items.map((item, itemIndex) => (
                            <div key={itemIndex}>
                              {item.product.title || "N/A"}
                            </div>
                          ))}
                        </td>
                        <td>
                          {order.order_items.map((item, itemIndex) => (
                            <div key={itemIndex}>{item.quantity}</div>
                          ))}
                        </td>
                        <td>
                          {order.order_items.map((item, itemIndex) => (
                            <div key={itemIndex}>{item.total_amount}</div>
                          ))}
                        </td>
                        <td>
                          {order.order_items.map((item, itemIndex) => (
                            <div key={itemIndex}>{item.status}</div>
                          ))}
                        </td>
                        <td>
                          {order.order_items.map(
                            (item, itemIndex) =>
                              item.status === "Pending" && (
                                <button
                                  className="btn btn-danger"
                                  onClick={() => handleCancel(item.id)}
                                >
                                  Cancel
                                </button>
                              )
                          )}
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

export default OrderManagement
