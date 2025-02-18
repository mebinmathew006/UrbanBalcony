import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../../../axiosconfig";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import { toast } from "react-toastify";
const UserOrderDetails = () => {
  const baseurl = import.meta.env.VITE_BASE_URL_FOR_IMAGE;
  const keyId = import.meta.env.RAZORPAY_KEY_ID;

  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const user_id = useSelector((state) => state.userDetails.id);

  const handlePayment = async (order) => {
    try {
      const totalAmount = order.order_items.reduce(
        (sum, item) =>
          sum +
          parseFloat(item.total_amount || 0) +
          parseFloat(item.shipping_price_per_order || 0),
        0
      );
      const razorpayOrderResponse = await axiosInstance.post(
        "/createRazorpayOrder",
        {
          user_id: user_id,
          totalAmount: totalAmount,
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
                payment_id: order.payment_details && order.payment_details.id,
              }
            );
            fetchUserOrders();
            if (orderResponse.status === 201) {
              toast.success("Payment Successful! ", {
                position: "bottom-center",
              });
              // navigate("/userProfile", { state: { tab: "orders" } });
            }
          } catch (orderError) {
            console.error("Failed:", orderError);
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
    }
  };

  const generateInvoice = (order) => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(35);
    doc.text("Spice Forest", 15, 20);
    doc.setFontSize(20);
    doc.text("Invoice", 15, 28);

    // Add order details
    doc.setFontSize(12);
    doc.text(`Order ID: #${order.id}`, 15, 35);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 15, 45);

    // Add shipping information
    doc.setFontSize(14);
    doc.text("Shipping Information:", 15, 65);
    doc.setFontSize(12);
    doc.text(
      [
        `${order.address_details?.address_type || ""}`,
        `${order.address_details?.land_mark || ""}`,
        `${order.address_details?.city || ""}, ${
          order.address_details?.state || ""
        } ${order.address_details?.pin_code || ""}`,
        `Phone: ${order.address_details?.alternate_number || ""}`,
      ],
      15,
      75
    );

    // Add order items table
    doc.setFontSize(14);
    doc.text("Order Details:", 15, 115);

    const tableColumn = [
      "Item",
      "Weight",
      "Quantity",
      "Price",
      "Shipping",
      "Status",
    ];
    const tableRows = order.order_items.map((item) => [
      item.variant?.product?.title || "N/A",
      item.variant?.weight || "N/A",
      item.quantity || 0,
      `₹${item.total_amount || 0}`,
      `₹${item.shipping_price_per_order || 0}`,
      item.status || "N/A",
    ]);

    doc.autoTable({
      startY: 120,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [66, 139, 202] },
    });

    // Calculate totals
    const totalItemAmount = order.order_items.reduce(
      (sum, item) => sum + parseFloat(item.total_amount || 0),
      0
    );
    const totalShipping = order.order_items.reduce(
      (sum, item) => sum + parseFloat(item.shipping_price_per_order || 0),
      0
    );
    const grandTotal = totalItemAmount + totalShipping;

    // Add totals to the invoice
    const finalY = doc.lastAutoTable.finalY || 150;
    doc.setFontSize(14);
    doc.text(
      `Total Item Amount: ₹${totalItemAmount.toFixed(2)}`,
      15,
      finalY + 10
    );
    doc.text(`Total Shipping: ₹${totalShipping.toFixed(2)}`, 15, finalY + 20);
    doc.text(`Grand Total: ₹${grandTotal.toFixed(2)}`, 15, finalY + 30);

    // Save the PDF
    doc.save(`invoice_${order.id}.pdf`);
  };

  const fetchUserOrders = async () => {
    try {
      const response = await axiosInstance.get(`userOrders/${user_id}`);
      console.log(response.data);
      setAllProducts(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      <div className="grid gap-4">
        {allProducts.map((order) => (
          <div key={order.id} className="bg-[#E8D7B4] rounded-lg shadow-md">
            <div>
              <div className="p-4">
                <h2 className="text-lg font-semibold">Order ID: {order.id}</h2>
                <p className="text-sm text-gray-500">
                  Order Date: {order.order_date}
                </p>
                <p className="text-sm text-gray-500">
                  Total Amount: ₹{order.net_amount}
                </p>
                {/* <p className="text-sm text-gray-500">
                  Shipping Charge: ₹{order.shipping_charge}
                </p> */}
                <hr />
                {/* Order Items */}
                <div className="mt-4 space-y-3">
                  {order.order_items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-72 border-b pb-3"
                    >
                      <img
                        src={`${baseurl}/media/${item.image_url}`}
                        alt={item.variant?.product?.title || "Product Image"}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">
                          {item.variant?.product?.title || "N/A"}
                        </h3>
                        <p>Quantity: {item.quantity}</p>
                        <p>Weight: {item.variant?.weight}</p>
                        <p>Total Amount: ₹{item.total_amount}</p>
                        <p
                          className={`font-medium ${
                            item.status === "Delivered"
                              ? "text-green-600"
                              : item.status === "Cancelled"
                              ? "text-red-600"
                              : "text-blue-600"
                          }`}
                        >
                          Status: {item.status}
                        </p>
                      </div>
                      <button
                        className="mt-4 px-4 py-2 bg-[#467927] hover:bg-green-900 text-white rounded transition-colors"
                        onClick={() =>
                          navigate("/userProfile", {
                            state: { orderId: item.id, tab: "orderDetails" },
                          })
                        }
                      >
                        More Details
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`flex pb-8 ${order.payment_details.status == "pending" ? 'justify-between' :'justify-center'}`}>
                <div className="ms-5">
                  <button
                    onClick={() => generateInvoice(order)}
                    className="mt-4 px-4 py-2 bg-[#073801] hover:bg-green-900 text-white rounded transition-colors duration-200"
                  >
                    Download Invoice
                  </button>
                </div>
                {order.payment_details.status == "pending" && (
                  <div className="me-5">
                    <button
                      onClick={() => handlePayment(order)}
                      className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors duration-200"
                    >
                      Pay Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserOrderDetails;
