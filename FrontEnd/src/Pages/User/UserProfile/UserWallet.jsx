import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../../../axiosconfig";
import { toast } from "react-toastify";
import Pagination from "../../../Components/Pagination/Pagination";

function UserWallet() {
  const user_id = useSelector((state) => state.userDetails.id);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

  useEffect(() => {
    fetchWallet();
  }, [currentPage]);

  const fetchWallet = async () => {
    try {
      const response = await axiosInstance.get(`userWallet/${user_id}`, {
        params: {
          page: currentPage,
          page_size: pageSize,
        },
      });
      setWallet(response.data);
      if (response.data.transactions) {
        setTransactions(response.data.transactions.results);
        setTotalPages(response.data.transactions.total_pages);
        setTotalCount(response.data.transactions.count);
        setPageSize(response.data.transactions.page_size);
      }
    } catch (error) {
      console.error("Error fetching wallet:", error);
      toast.error("Error fetching wallet!", {
        position: "bottom-center",
      });
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

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
            if (!window.paymentFailedFlag) {
              toast.info("Payment cancelled. No Money Added.", {
                position: "bottom-center",
              });
            }
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
        window.paymentFailedFlag = true;
        toast.error("Payment Failed , Try again Later.", {
          position: "bottom-center",
        });
        rzp.close();
        setLoading(false);
      });

      rzp.open();
    } catch (error) {
      toast.error("Failed to initialize payment. Please try again.");
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl text-[#073801] font-bold mb-6">My Wallet</h1>

        {wallet ? (
          <>
            <div className="card mb-4 p-4 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex-grow">
                  <h3 className="font-semibold text-lg text-green-800">
                    Balance
                  </h3>
                  <p className="text-[#BF923F] text-xl font-bold mt-2">
                    ₹{wallet.balance}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleAddFunds(100)}
                    className="bg-green-800 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                  >
                    Add ₹100
                  </button>
                  <button
                    onClick={() => handleAddFunds(500)}
                    className="bg-green-800 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                  >
                    Add ₹500
                  </button>
                </div>
              </div>
            </div>

            {/* Transaction History */}
            <div className="card rounded-lg shadow-lg p-4">
              <h2 className="text-xl font-semibold text-[#073801] mb-4">
                Transaction History
              </h2>

              {transactions.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                            Date & Time
                          </th>
                          
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                            Type
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {transactions.map((transaction) => (
                          <tr
                            key={transaction.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 py-3 text-sm text-gray-600 text-left">
                              {formatDate(transaction.created_at)}
                            </td>
                           
                            <td className="px-4 py-3 text-left text-sm">
                              <span
                                className={`px-2 py-1 rounded-full  text-xs font-semibold ${
                                  transaction.transaction_type === "credit"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {transaction.transaction_type === "credit"
                                  ? "Credit"
                                  : "Debit"}
                              </span>
                            </td>
                            <td
                              className={`px-4 py-3 text-sm text-right font-semibold ${
                                transaction.transaction_type === "credit"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {transaction.transaction_type === "credit"
                                ? "+"
                                : "-"}
                              ₹{Math.abs(transaction.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-4 pb-4 mt-4">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalCount={totalCount}
                      pageSize={pageSize}
                      onPageChange={handlePageChange}
                      maxPageButtons={5}
                      size="md"
                    />
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No transactions yet</p>
                </div>
              )}
            </div>
          </>
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