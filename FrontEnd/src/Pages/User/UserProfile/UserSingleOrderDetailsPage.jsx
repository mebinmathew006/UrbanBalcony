import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import axiosInstance from "../../../axiosconfig";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import jsPDF from "jspdf";

const UserSingleOrderDetailsPage = () => {
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const orderId = location.state?.orderId;
  const user_id = useSelector((state) => state.userDetails.id);
  const keyId = import.meta.env.RAZORPAY_KEY_ID;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  
  // Define styles for PDF
  const generateInvoice = () => {
    // Initialize PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Invoice', 15, 20);
    
    // Add order details
    doc.setFontSize(12);
    doc.text(`Order ID: #${orderId}`, 15, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 15, 40);
    
    // Add shipping information
    doc.setFontSize(14);
    doc.text('Shipping Information:', 15, 60);
    doc.setFontSize(12);
    doc.text([
      `${order.address_details?.address_type || ''}`,
      `${order.address_details?.land_mark || ''}`,
      `${order.address_details?.city || ''}, ${order.address_details?.state || ''} ${order.address_details?.pin_code || ''}`,
      `Phone: ${order.address_details?.alternate_number || ''}`
    ], 15, 70);
    
    // Add order items table
    doc.setFontSize(14);
    doc.text('Order Details:', 15, 110);
    
    const tableColumn = ['Item', 'Weight', 'Quantity', 'Price', 'Status'];
    const tableRows = [[
      order.variant.product?.title || '',
      order.variant.weight || '',
      order.quantity || '',
      `₹${order.total_amount || ''}`,
      order.status || ''
    ]];

    doc.autoTable({
      startY: 120,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    // Add total
    const finalY = doc.lastAutoTable.finalY || 150;
    doc.setFontSize(14);
    doc.text(`Total Amount: ₹${order.total_amount}`, 15, finalY + 20);
    
    // Save the PDF
    doc.save(`invoice_${orderId}.pdf`);
  };


   const handleCancel = async () => {
    try {
      await axiosInstance.patch(`userOrders/${orderId}`, { action: "Cancelled",user_id });
      fetchOrderDetails();
    } catch (error) {
      console.error("Error cancelling order:", error);
    }
  };

   

   const handleReturn = async () => {
    try {
      await axiosInstance.patch(`userOrders/${orderId}`, { action: "Requested for Return" });
      fetchOrderDetails();
    } catch (error) {
      console.error("Error cancelling order:", error);
    }
  };


  const fetchOrderDetails = async () => {
    try {
      const response = await axiosInstance.get(`singleOrderDetails/${orderId}`);
     
      
      setOrder(response.data);
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  

  if (!order) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-[#E8D7B4] rounded-lg shadow-lg p-6" id="invoice" >
        {/* Order Header */}
        <div className="border-b pb-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Order Details</h1>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
            <p>Order ID: #{orderId}</p>
            {/* <p>Order Date: {new Date(order.created_at).toLocaleDateString()}</p> */}
            <p className="font-semibold">
              {/* Total Amount: ₹{order.order_items.reduce((sum, item) => sum + item.total_amount, 0)} */}
            </p>
          </div>
        </div>

        {/* Shipping Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            Shipping Information
          </h2>
          <div className="bg-[#E8D7B4] p-4 rounded-md">
            <p className="text-gray-700">
              {order.address_details?.address_type}
              <br />
              {order.address_details?.land_mark}
              <br />
              {order.address_details?.city}, {order.address_details?.state}{" "}
              {order.address_details?.pin_code}
              <br />
              Phone: {order.address_details?.alternate_number}
            </p>
          </div>
        </div>

        {/* Order Items */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Order Details
          </h2>
          <div className="space-y-4">
            <div className="border rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
              {/* Product Image */}
              <div className="w-24 h-24 flex-shrink-0">
                <img
                  src={`${import.meta.env.VITE_BASE_URL_WITH_MEDIA}/${order.image_url}`}
                  alt={order.variant.product.title}
                  className="w-full h-full object-cover rounded"
                />
              </div>

              {/* Product Details */}
              <div className="flex-grow">
                <h3 className="font-semibold text-lg text-gray-800">
                  {order.variant.product.title}
                </h3>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p>Weight: {order.variant.weight}</p>
                  <p>Quantity: {order.quantity}</p>
                  <p>Price: ₹{order.total_amount}</p>
                  <p>Shipping: ₹{order.shipping_price_per_order}</p>
                  <p>Total: ₹{parseInt(order.shipping_price_per_order)+parseInt(order.total_amount)}</p>
                  
                  <p>
                    Status:
                    <span
                      className={`ml-2 font-medium ${
                        order.status === "Delivered"
                          ? "text-green-600"
                          : order.status === "Cancelled"
                          ? "text-red-600"
                          : "text-blue-600"
                      }`}
                    >
                      {order.status}
                    </span>
                  </p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex-shrink-0 w-full md:w-auto">
                {order.status !== "Returned" && order.status !== "Delivered Return not Approved" && order.status !== "Delivered" && order.status !== "Cancelled"&& order.status !== "Requested for Return" && (
                  <button
                    onClick={() => handleCancel(order.id)}
                    className="w-full md:w-auto px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors duration-200"
                  >
                    Cancel Item
                  </button>
                )}
                </div>
                <div className="flex-shrink-0 w-full md:w-auto">
                {order.status=='Delivered' && (
                   <button
                   onClick={() => handleReturn(order.id)}
                   className="w-full md:w-auto px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors duration-200"
                 >
                   Return Item
                 </button>
                )}
                </div>

               
            </div>
          </div>
        </div>

      
      </div>
      {/* <button
        onClick={generateInvoice}
        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-200"
      >
        Download Invoice
      </button> */}
    </div>
  );
};

export default UserSingleOrderDetailsPage;

