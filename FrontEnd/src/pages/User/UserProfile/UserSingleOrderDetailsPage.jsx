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

  // const generateInvoice = async () => {
  //   const invoiceElement = document.getElementById("invoice");
  
  //   if (!invoiceElement) {
  //     console.error("Invoice element not found!");
  //     return;
  //   }
  
  //   try {
  //     const canvas = await html2canvas(invoiceElement, { scale: 2 });
  //     const imgData = canvas.toDataURL("image/png");
  
  //     const pdf = new jsPDF("p", "mm", "a4");
  //     const imgWidth = 190; // Fit within A4 width
  //     const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  //     pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
  //     pdf.save(`Invoice_Order_${orderId}.pdf`);
  //   } catch (error) {
  //     console.error("Error generating invoice:", error);
  //   }
  // };
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
      await axiosInstance.patch(`userOrders/${orderId}`, { action: "Cancelled" });
      fetchOrderDetails();
    } catch (error) {
      console.error("Error cancelling order:", error);
    }
  };

   const handlePayment = async () => {
    try {
          const razorpayOrderResponse = await axiosInstance.post(
            "/createRazorpayOrder",
            {
              user_id: user_id,
              totalAmount: order.total_amount,
            }
          );

          const { razorpay_order_id, amount, currency } =
            razorpayOrderResponse.data;

          const options = {
            key: keyId,
            amount: amount * 100,
            currency,
            name: "Urban Balcony",
            description: "Order Payment",
            order_id: razorpay_order_id,
            handler: async (response) => {
              try {
                const orderResponse = await axiosInstance.patch(
                  "/changePaymentstatus",
                  {
                    payment_id: (order.payment_details && order.payment_details.id),
                  }
                );
                fetchOrderDetails();
                if (orderResponse.status === 201) {
                  toast.success("Payment Successful! ", {
                    position: "bottom-center",
                  });
                  // navigate("/userProfile", { state: { tab: "orders" } });
                 
                }
              } catch (orderError) {
                console.error("Failed:", orderError);
                // toast.error(
                //   "Payment successful but order creation failed. Our team will contact you."
                // );
              }
            },
            modal: {
              ondismiss: function () {
                setLoading(false);
                // Only show message and navigate if it was a cancellation, not a failure
                // We can check this by looking at a flag we'll set in payment.failed
                if (!window.paymentFailedFlag) {
                  toast.info("Payment cancelled. No order created.", {
                    position: "bottom-center",
                  });
                  // if (type === "buyNow") {
                  //   navigate("/cart");
                  // } else {
                  //   navigate(-1);
                  // }
                }
                // Reset the flag
                window.paymentFailedFlag = false;
              },
              confirm_close: true,
              escape: true,
              animation: true,
            },
            retry: {
              enabled: false,
            },
            prefill: {
              name: "Guest",
              email: "customercare@urbanbalcony.com",
              contact: "7356332693",
            },
            theme: {
              color: "#3399cc",
            },
          };

          const rzp = new Razorpay(options);

          rzp.on("payment.failed", async function (response) {
            // Set flag to indicate this was a failure, not a cancellation
            window.paymentFailedFlag = true;

            rzp.close();
            setLoading(false);
          });

          rzp.open();
        } catch (error) {
          console.error("Failed to create Razorpay order:", error);
          toast.error("Failed to initialize payment. Please try again.");
          setLoading(false);
          // if (type === "buyNow") {
          //   navigate("/cart");
          // } else {
          //   navigate(-1);
          // }
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
      console.log(response.data);

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
      <div className="bg-white rounded-lg shadow-lg p-6" id="invoice" >
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
          <div className="bg-gray-50 p-4 rounded-md">
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
                  src={`http://localhost:8000/${order.variant.product.product_img1}`}
                  alt={order.variant.product.title}
                  className="w-full h-full object-cover rounded"
                />
              </div>

              {/* Product Details */}
              <div className="flex-grow">
                {/* <h3 className="font-semibold text-lg text-gray-800">
                  {order.variant.weight}
                </h3> */}
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p>Weight: {order.variant.weight}</p>
                  <p>Quantity: {order.quantity}</p>
                  <p>Price: ₹{order.total_amount}</p>
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

                <div className="flex-shrink-0 w-full md:w-auto">
                {order.payment_details.status=='pending' && (
                   <button
                   onClick={() => handlePayment(order.id)}
                   className="w-full md:w-auto px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors duration-200"
                 >
                   Pay Now
                 </button>
                )}
              </div>
            </div>
          </div>
        </div>

      
      </div>
      <button
        onClick={generateInvoice}
        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-200"
      >
        Download Invoice
      </button>
    </div>
  );
};

export default UserSingleOrderDetailsPage;

