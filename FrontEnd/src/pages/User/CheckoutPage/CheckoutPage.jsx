import React, { useEffect, useState } from "react";
import { CreditCard, Truck, Wallet } from "lucide-react";
import { useSelector } from "react-redux";
import axiosInstance from "../../../axiosconfig";
import Header from "../../../components/header/header";
import Footer from "../../../components/footer/Footer";
import { useLocation } from "react-router-dom";

const CheckoutPage = () => {
  const location = useLocation();
  console.log(location);
  
  const {cart,totalAmount}=location.state || {}

  const [userAddress, setUserAddress] = useState([]);
  const user_id = useSelector((state) => state.userDetails.id);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserAddress();
  }, []);

  const fetchUserAddress = async () => {
    try {
      const response = await axiosInstance.get(`userAddress/${user_id}`);
      setUserAddress(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      // Prepare order data
      const orderData = {
        user_id,
        addressId: selectedAddress,
        paymentMethod: paymentMethod, // e.g., 'cod', 'card', 'upi'
        cart: cart,              // Pass cart details
        totalAmount: totalAmount,    // Include total amount
      };
  
      // Call the order placement function
      const response = await axiosInstance.post('/userPlaceOrder',orderData);
      if (response.status === 201) {
        // Navigate to a success page or show confirmation
        console.log("Order placed successfully:", response.data);
        navigate('/order-success', { state: { order: response.data } });
      } else {
        console.error("Unexpected response:", response);
        alert("Failed to place the order. Please try again.");
      }
    } catch (error) {
      console.error("Order placement failed:", error);
      alert("An error occurred while placing the order. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-2xl font-bold mb-8">Checkout</h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Delivery Address Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Truck className="mr-2" size={20} />
                Choose Delivery Address
              </h2>

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

            {/* Payment Method Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <CreditCard className="mr-2" size={20} />
                Payment Method
              </h2>

              <div className="space-y-4">
                {/* Credit/Debit Card */}
                {/* <label
                className={`block p-4 border rounded-lg cursor-pointer transition-colors
                  ${paymentMethod === 'card'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                  }`}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-4"
                  />
                  <div>
                    <p className="font-medium">Credit/Debit Card</p>
                    <p className="text-gray-600 text-sm mt-1">
                      Pay securely with your card
                    </p>
                  </div>
                </div>
              </label> */}

                {/* Cash on Delivery */}
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

                {/* UPI Payment */}
                {/* <label
                className={`block p-4 border rounded-lg cursor-pointer transition-colors
                  ${paymentMethod === 'upi'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                  }`}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-4"
                  />
                  <div>
                    <p className="font-medium">UPI Payment</p>
                    <p className="text-gray-600 text-sm mt-1">
                      Pay using UPI apps like Google Pay, PhonePe
                    </p>
                  </div>
                </div>
              </label> */}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Wallet className="mr-2" size={20} />
                Order Summary
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">₹100</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-semibold">₹{totalAmount+100}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              type="submit"
              disabled={!selectedAddress || loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium
              hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
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
