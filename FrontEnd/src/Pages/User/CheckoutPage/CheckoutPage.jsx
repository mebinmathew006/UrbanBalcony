import React, { useCallback, useEffect, useState } from "react";
import { CreditCard, Truck, Wallet } from "lucide-react";
import { useSelector } from "react-redux";
import axiosInstance from "../../../axiosconfig";
import Header from "../../../Components/Feader/header";
import Footer from "../../../Components/Footer/Footer";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [finalTotal, setFinalTotal] = useState();
  const location = useLocation();
  const keyId = import.meta.env.RAZORPAY_KEY_ID;
  const { quantity, productId, type, totalAmount } = location.state || {};
  const [userAddress, setUserAddress] = useState([]);
  const user_id = useSelector((state) => state.userDetails.id);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  // Call calculateFinalTotal when dependencies change
  useEffect(() => {
    fetchUserAddress();
    fetchWallet();
    calculateFinalTotal();
  }, [totalAmount, appliedCoupon, discount]); // ✅ Proper dependencies

  const fetchWallet = async () => {
    try {
      const response = await axiosInstance.get(`userWallet/${user_id}`);
      setWallet(response.data.balance);
    } catch (error) {
      console.error("Error fetching wallet:", error);
    }
  };

  const applyCoupon = async () => {
    try {
      const response = await axiosInstance.post("/validate_coupon", {
        code: couponCode,
        user_id: user_id,
      });

      setAppliedCoupon(response.data);
      setDiscount(
        (parseFloat(totalAmount) * parseFloat(response.data.value)) / 100
      );
    } catch (error) {
      toast.error("Error applying coupon");
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setDiscount(0);
    setFinalTotal(parseFloat(totalAmount) + 100);
  };

  const calculateFinalTotal = useCallback(() => {
    if (!totalAmount) return;

    const amount = parseFloat(totalAmount) || 0;
    const couponDiscount = appliedCoupon?.value
      ? (amount * parseFloat(appliedCoupon.value)) / 100
      : 0;

    const total = Math.max(amount + 100 - couponDiscount, 0).toFixed(2);
    setFinalTotal(total);
  }, [totalAmount, appliedCoupon]);

  const fetchUserAddress = async () => {
    try {
      const response = await axiosInstance.get(`userAddress/${user_id}`);
      setUserAddress(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  // handles all the payment methods

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (paymentMethod === "card") {
        try {
          const razorpayOrderResponse = await axiosInstance.post(
            "/createRazorpayOrder",
            {
              user_id: user_id,
              totalAmount: finalTotal,
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
                const orderResponse = await axiosInstance.post(
                  "/userPlaceOrder",
                  {
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature || "",
                    user_id,
                    addressId: selectedAddress,
                    paymentMethod: paymentMethod,
                    totalAmount: totalAmount,
                    coupon_id: (appliedCoupon && appliedCoupon.id) || 0,
                    type,
                    productId,
                    quantity,
                    status: "success",
                    discoutPercentage:
                      (appliedCoupon && appliedCoupon.value) || 0,
                  }
                );

                if (orderResponse.status === 201) {
                  toast.success("Payment Successful! Order Placed.", {
                    position: "bottom-center",
                  });
                  navigate("/userProfile", { state: { tab: "orders" } });
                }
              } catch (orderError) {
                console.error("Failed to create order:", orderError);
                toast.error(
                  "Payment successful but order creation failed. Our team will contact you."
                );
              }
            },
            modal: {
              ondismiss: function () {
                setLoading(false);
                // Only show message and navigate if it was a cancellation, not a failure
                // We can check this by looking at a flag we'll set in payment.failed
                if (!window.paymentFailedFlag) {
                  setLoading(false);
                  toast.info("Payment cancelled. No order created.", {
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

            try {
              const orderResponse = await axiosInstance.post(
                "/userPlaceOrder",
                {
                  razorpay_payment_id: response.error.metadata.payment_id || "",
                  razorpay_order_id: response.error.metadata.order_id || "",
                  razorpay_signature: "",
                  user_id,
                  addressId: selectedAddress,
                  paymentMethod: paymentMethod,
                  totalAmount: finalTotal,
                  coupon_id: (appliedCoupon && appliedCoupon.id) || 0,
                  type,
                  productId,
                  quantity,
                  status: "pending",
                }
              );

              if (orderResponse.status === 201) {
                toast.success(
                  "Order created with pending payment status. You can retry payment from your orders.",
                  {
                    position: "bottom-center",
                  }
                );
                // Navigate to orders page instead of going back
                navigate("/userProfile", { state: { tab: "orders" } });
              }
            } catch (failedError) {
              setLoading(false);

              console.error(
                "Failed to create order after payment failure:",
                failedError
              );
              toast.error("Could not create order. Please try again.", {
                position: "bottom-center",
              });
              if (type === "buyNow") {
                navigate("/cart");
              } else {
                navigate(-1);
              }
            }

            rzp.close();
            setLoading(false);
          });

          rzp.open();
        } catch (error) {
          setLoading(false);

          console.error("Failed to create Razorpay order:", error);
          toast.error("Failed to initialize payment. Please try again.");
          setLoading(false);
          if (type === "buyNow") {
            navigate("/cart");
          } else {
            navigate(-1);
          }
        }
      } else if (paymentMethod === "wallet") {
        try {
          const orderResponse = await axiosInstance.post("/userPlaceOrder", {
            // razorpay_payment_id: response.error.metadata.payment_id || "",
            // razorpay_order_id: response.error.metadata.order_id || "",
            // razorpay_signature: "",
            user_id,
            addressId: selectedAddress,
            paymentMethod: paymentMethod,
            totalAmount: finalTotal,
            coupon_id: (appliedCoupon && appliedCoupon.id) || 0,
            type,
            productId,
            quantity,
            status: "success",
            discoutPercentage:
            (appliedCoupon && appliedCoupon.value) || 0,
          });
          if (orderResponse.status === 201) {
            toast.success("Order created successfully.", {
              position: "bottom-center",
            });
            // Navigate to orders page instead of going back
            navigate("/userProfile", { state: { tab: "orders" } });
          }
        } catch (error) {
          setLoading(false);

          toast.error("Failed to create Order. Please try again.", {
            position: "bottom-center",
          });
        }
      } else {
        try {
          const orderResponse = await axiosInstance.post("/userPlaceOrder", {
            // razorpay_payment_id: response.error.metadata.payment_id || "",
            // razorpay_order_id: response.error.metadata.order_id || "",
            // razorpay_signature: "",
            user_id,
            addressId: selectedAddress,
            paymentMethod: paymentMethod,
            totalAmount: finalTotal,
            coupon_id: (appliedCoupon && appliedCoupon.id) || 0,
            type,
            productId,
            quantity,
            status: "pending",
            discoutPercentage:
            (appliedCoupon && appliedCoupon.value) || 0,
          });
          if (orderResponse.status === 201) {
            toast.success("Order created successfully.", {
              position: "bottom-center",
            });
            // Navigate to orders page instead of going back
            navigate("/userProfile", { state: { tab: "orders" } });
          }
        } catch (error) {
          setLoading(false);

          toast.error("Failed to create Order. Please try again.", {
            position: "bottom-center",
          });
        }
      }
    } catch (error) {
      console.error("Order placement failed:", error);
      toast.error(
        "An error occurred while placing the order. Please try again."
      );
      setLoading(false);
      if (type === "buyNow") {
        navigate("/cart");
      } else {
        navigate(-1);
      }
    }
  };
  return (
    <div>
      <Header />
      <div className="min-h-screen bg-[#FCF4D2] py-8">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-2xl font-bold mb-8">Checkout</h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Delivery Address Section */}
            <div className="bg-[#E8D7B4] p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <Truck className="mr-2" size={20} />
                  Choose Delivery Address
                </h2>
                <label
                  class="bg-green-700 text-white px-4 py-2 rounded cursor-pointer hover:bg-green-900"
                  onClick={() =>
                    navigate("/userProfile", { state: { tab: "address" } })
                  }
                >
                  New Address ?
                </label>
              </div>

              <div className="space-y-4">
                {userAddress.map((address) => (
                  <label
                    key={address.id}
                    className={`block p-4 border rounded-lg cursor-pointer transition-colors
                    ${
                      selectedAddress == address.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-start">
                      <input
                        type="radio"
                        name="address"
                        value={address.id}
                        checked={selectedAddress == address.id}
                        onChange={(e) => setSelectedAddress(e.target.value)}
                        className="mt-1 mr-4"
                      />
                      <div>
                        <p className="font-medium">{address.address_type}</p>
                        <p className="text-gray-600 text-sm mt-1">
                          {address.land_mark}, {address.city}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {address.state} - {address.pin_code}
                        </p>
                        <p className="text-gray-600 text-sm mt-1">
                          Alternative Phone: {address.alternate_number}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            {/* Coupon Section */}
            <div className="bg-[#E8D7B4] p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <div className="mr-2" size={20} />
                Apply Coupon
              </h2>
              <div className="flex">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-grow mr-2 p-2 border rounded-lg bg-white"
                />
                {appliedCoupon ? (
                  <label
                    onClick={removeCoupon}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                  >
                    Remove
                  </label>
                ) : (
                  <label
                    onClick={applyCoupon}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                    disabled={!couponCode}
                  >
                    Apply
                  </label>
                )}
              </div>
              {appliedCoupon && (
                <div className="mt-2 p-2 bg-green-50 border-l-4 border-green-500">
                  <p className="text-green-700">
                    Coupon "{appliedCoupon.code}" applied
                    <span className="ml-2 font-bold">
                      {appliedCoupon.type === "percentage"
                        ? `${appliedCoupon.value}% off`
                        : `₹${appliedCoupon.value} off`}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Payment Method Section */}
            <div className="bg-[#E8D7B4] p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <CreditCard className="mr-2" size={20} />
                Payment Method
              </h2>

              <div className="space-y-4">
                {/* Credit/Debit Card */}
                <label
                  className={`block p-4 border rounded-lg cursor-pointer transition-colors
                  ${
                    paymentMethod === "card"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-4"
                    />
                    <div>
                      <p className="font-medium">Pay Now</p>
                      <p className="text-gray-600 text-sm mt-1">Pay securely</p>
                    </div>
                  </div>
                </label>

                {/* Wallet */}
                {wallet >= finalTotal ? (
                  <label
                    className={`block p-4 border rounded-lg cursor-pointer transition-colors
                  ${
                    paymentMethod === "wallet"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="payment"
                        value="wallet"
                        checked={paymentMethod === "wallet"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-4"
                      />
                      <div>
                        <p className="font-medium">
                          Your Wallet balance is {wallet}
                        </p>
                        <p className="text-gray-600 text-sm mt-1">Wallet Pay</p>
                      </div>
                    </div>
                  </label>
                ) : (
                  <label
                    className={`block p-4 border rounded-lg cursor-pointer transition-colors
                  ${
                    paymentMethod === "wallet"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                  >
                    <p className="font-medium">
                      You Cant pay using Wallet, Your balance is {wallet}
                    </p>
                  </label>
                )}

                {/* Cash on Delivery */}

                {finalTotal < 1000 ? (
                  <label
                    className={`block p-4 border rounded-lg cursor-pointer transition-colors
                  ${
                    paymentMethod === "cod"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-4"
                      />
                      <div>
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-gray-600 text-sm mt-1">
                          Pay when you receive your order
                        </p>
                      </div>
                    </div>
                  </label>
                ) : (
                  <label
                    className={`block p-4 border rounded-lg cursor-pointer transition-colors
                  ${
                    paymentMethod === "wallet"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                  >
                    <p className="font-medium">
                      COD is Not Available for this order
                    </p>
                  </label>
                )}
              </div>
            </div>

            {/* Update Order Summary to reflect coupon discount */}
            <div className="bg-[#E8D7B4] p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Wallet className="mr-2" size={20} />
                Order Summary
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{totalAmount}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount</span>
                    <span>{discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">₹100</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-semibold">
                      ₹{finalTotal && finalTotal}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* Place Order Button */}
            <button
              type="submit"
              disabled={!selectedAddress || loading}
              className="w-full bg-green-700 text-white py-3 rounded-lg font-medium
              hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500
              disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Place Order"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
