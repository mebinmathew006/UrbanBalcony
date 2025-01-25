import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../../../axiosconfig";
import { toast } from "react-toastify";

function UserWallet() {
  const user_id = useSelector((state) => state.userDetails.id);
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const response = await axiosInstance.get(`userWallet/${user_id}`);
      setWallet(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching wallet:", error);
      toast.error("Error fetching wallet!", {
        position: "bottom-center",
      });
    }
  };

  const handleAddFunds = async (amount) => {
    try {
      const formData = new FormData();
      formData.append("amount", amount);
      formData.append("user_id", user_id);
      await axiosInstance.post("/addFundsToWallet", formData);
      toast.success("Funds added successfully!", {
        position: "bottom-center",
      });
      fetchWallet(); // Re-fetch wallet data after adding funds
    } catch (error) {
      console.log(error);
      toast.error("Error adding funds!", {
        position: "bottom-center",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">My Wallet</h1>

        {wallet ? (
          <div className="card mb-4 p-4 bg-white rounded-lg shadow">
            <div className="flex items-center justify-between">
              {/* Wallet Details */}
              <div className="flex-grow">
                <h3 className="font-semibold text-lg">Balance</h3>
                <p className="text-gray-600 mt-2">₹{wallet.balance}</p>
                {/* <p className="text-gray-600 mt-2">Created At: {new Date(wallet.created_at).toLocaleString()}</p>
                <p className="text-gray-600 mt-2">Last Updated: {new Date(wallet.updated_at).toLocaleString()}</p> */}
              </div>

              {/* Action Buttons */}
              {/* <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleAddFunds(100)} // Example: adding 100 units
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                  Add 100 to Wallet
                </button>
                <button
                  onClick={() => handleAddFunds(500)} // Example: adding 500 units
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                  Add 500 to Wallet
                </button>
              </div> */}
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
