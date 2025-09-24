import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../../../axiosconfig";
import { toast } from "react-toastify";

function UserWallet() {
  const user_id = useSelector((state) => state.userDetails.id);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const response = await axiosInstance.get(`userWallet/${user_id}`);
      setWallet(response.data);
    } catch (error) {
      console.error("Error fetching wallet:", error);
      toast.error("Error fetching wallet!", {
        position: "bottom-center",
      });
    }
  };

  // -----------------------------------------------
  const handleAddFunds = async (amounts) => {
    console.log(amounts);

    try {
      const razorpayOrderResponse = await axiosInstance.post(
        "/createRazorpayOrder",
        {
          user_id: user_id,
          totalAmount: amounts,
        }
      );

      const { razorpay_order_id, amount, currency } =
        razorpayOrderResponse.data;

      const options = {
        key: keyId,
        amount: amount * 100,
        currency,
        name: "Spice Forest",
        description: "Order Payment",
        order_id: razorpay_order_id,
        handler: async (response) => {
          try {
            const orderResponse = await axiosInstance.patch(
              `/userWallet/${wallet.id}`,
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature || "",

                totalAmount: amounts,
              }
            );

            toast.success("Payment Successful!", {
              position: "bottom-center",
            });
            fetchWallet();
          } catch (orderError) {
            console.error("Failed to create order:", orderError);
            toast.error(
              "Payment successful but updation failed. please contact our team."
            );
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            // Only show message and navigate if it was a cancellation, not a failure
            // We can check this by looking at a flag we'll set in payment.failed
            if (!window.paymentFailedFlag) {
              toast.info("Payment cancelled. No Money Added.", {
                position: "bottom-center",
              });
              if (type === "buyNow") {
                navigate("/cart");
              } else {
                navigate(-1);
              }
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
          email: "customercare@spiceforest.com",
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

        toast.error(
          "Payment Failed , Try again Later.",
          {
            position: "bottom-center",
          }
        );
        // Navigate to orders page instead of going back

        rzp.close();
        setLoading(false);
      });

      rzp.open();
    } catch (error) {
      toast.error("Failed to initialize payment. Please try again.");
      setLoading(false);
      if (type === "buyNow") {
        navigate("/cart");
      } else {
        navigate(-1);
      }
    }
  };

  return (
    <div className="min-h-screen  py-8 ">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl text-[#073801] font-bold mb-6">My Wallet</h1>

        {wallet ? (
          <div
            className="card mb-4 p-4 rounded-lg shadow "
            style={{ backgroundColor: "#E8D7B4" }}
          >
            <div className="flex items-center justify-between ">
              {/* Wallet Details */}
              <div className="flex-grow ">
                <h3 className="font-semibold text-lg text-green-800">
                  Balance
                </h3>
                <p className="text-[#BF923F] text-xl font-bold mt-2">
                  ₹{wallet.balance}
                </p>
              </div>

              {/*Action Buttons */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleAddFunds(100)} // Example: adding 100 units
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                  Add ₹100
                </button>
                <button
                  onClick={() => handleAddFunds(500)} // Example: adding 500 units
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                  Add ₹500
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">Your wallet is empty.</p>
            <p className="text-gray-400 mt-2">
              Add funds to your wallet to make purchases.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserWallet;
