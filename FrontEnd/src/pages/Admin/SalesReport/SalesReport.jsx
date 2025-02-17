import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Calendar,
  Download,
  TrendingUp,
  ShoppingCart,
  DollarSign,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Sidebar from "../../../components/Admin/Sidebar/Sidebar";
import adminaxiosInstance from "../../../adminaxiosconfig";
import Papa from "papaparse";
import jsPDF from "jspdf";
import "jspdf-autotable";

function SalesReport() {
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), 0, 1)
  );
  const [endDate, setEndDate] = useState(new Date());
  const [salesData, setSalesData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topSellingProducts: [],
    dailySales: [],
    sales_details: [],
    top_categories: [],
  });

  // for exporting to pdf
  const exportToPDF = (data, fileName) => {
    // Initialize jsPDF instance
    const doc = new jsPDF();

    // Add Title
    doc.text("Sales Report", 14, 16);

    // Define Table Columns
    const tableColumn = ["Product", "Quantity", "Discount", "Revenue"];

    // Map Data to Rows
    const tableRows = data.map((product) => [
      product.name,
      product.quantity,
      product.discount,
      `₹${product.revenue.toLocaleString()}`, // Format revenue with currency
    ]);

    // Add Table to PDF
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 22, // Start below the title
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] }, // Blue header
    });

    // Save the PDF
    doc.save(fileName);
  };

  // Usage
  const handleExportPDF = () => {
    const pdfData = salesData.topSellingProducts.map((product) => ({
      name: product.name,
      quantity: product.quantity,
      Discount: product.discount,
      revenue: product.revenue,
    }));

    exportToPDF(pdfData, "sales_report.pdf");
  };

  // for exporting to csv
  const exportToCSV = (data, fileName) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Usage
  const handleExportCSV = () => {
    const csvData = salesData.topSellingProducts.map((product) => ({
      Product: product.name,
      Quantity: product.quantity,
      Discount: product.discount,
      Revenue: product.revenue,
    }));
    exportToCSV(csvData, "sales_report.csv");
  };
  const fetchSalesReport = async () => {
    try {
      const response = await adminaxiosInstance.get("/salesReportView", {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });
      console.log(response.data);
      setSalesData(response.data);
      
    } catch (error) {
      console.error("Error fetching sales report", error);
    }
  };

  

  useEffect(() => {
    fetchSalesReport();
  }, [startDate, endDate]);

  return (
    <div className="flex">
      <Sidebar />
      <div className="container mx-auto p-6 bg-gray-50">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Sales Report</h1>
          <button
            onClick={handleExportCSV}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Download className="mr-2" size={18} />
            Export CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Download className="mr-2" size={18} />
            Export PDF
          </button>
        </div>

        {/* Date Range Selector */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Calendar className="text-gray-500" size={20} />
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                className="border p-2 rounded-lg bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                className="border p-2 rounded-lg bg-white"
              />
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
            <DollarSign className="text-green-500 mr-4" size={24} />
            <div>
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <p className="text-xl font-bold">
                ₹{salesData.totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
            <ShoppingCart className="text-blue-500 mr-4" size={24} />
            <div>
              <p className="text-gray-500 text-sm">Total Orders</p>
              <p className="text-xl font-bold">{salesData.totalOrders}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
            <TrendingUp className="text-purple-500 mr-4" size={24} />
            <div>
              <p className="text-gray-500 text-sm">Avg. Order Value</p>
              <p className="text-xl font-bold">
                ₹{salesData.averageOrderValue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Sales Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-4">Daily Sales</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData.dailySales}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" />
              <Bar dataKey="orders" fill="#10B981" name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Top Selling Products</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Product</th>
                <th className="text-right py-2">Quantity Sold</th>
                <th className="text-right py-2">Total Price</th>
                <th className="text-right py-2">Discount</th>
                <th className="text-right py-2">Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {salesData.topSellingProducts.map((product, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-2">{product.name}</td>
                  <td className="text-right py-2">{product.quantity}</td>
                  <td className="text-right py-2">{product.price}</td>
                  <td className="text-right py-2">{product.discount}</td>
                  <td className="text-right py-2">
                    ₹{product.revenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Top Selling Category*/}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Top Selling Categories</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Category</th>
                <th className="text-right py-2">Quantity Sold</th>
                <th className="text-right py-2">Total Price</th>
                {/* <th className="text-right py-2">Discount</th> */}
                <th className="text-right py-2">Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {salesData.top_categories.map((product, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-2">{product.category}</td>
                  <td className="text-right py-2">{product.total_quantity}</td>
                  <td className="text-right py-2">{product.total_price}</td>
                  {/* <td className="text-right py-2">{product.total_discount}</td> */}
                  <td className="text-right py-2">
                    ₹{product.total_revenue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>


      </div>
    </div>
  );
}

export default SalesReport;
