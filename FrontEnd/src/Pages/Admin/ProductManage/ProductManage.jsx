import React, { useEffect, useState } from "react";
import Sidebar from "../../../Components/Admin/Sidebar/Sidebar";
import adminaxiosInstance from "../../../adminaxiosconfig";
import { useNavigate } from "react-router-dom";
import Pagination from "../../../Components/Pagination/Pagination";

function ProductManage() {
  const baseurl = import.meta.env.VITE_BASE_URL_FOR_IMAGE;
  const navigate = useNavigate();

  const [product, setProduct] = useState();
  const [loading, setLoading] = useState(true);
  const fetchProduct = async (page=1) => {
    try {
      setLoading(true);
      const response = await adminaxiosInstance.get(`/productmanage?page=${page}`);
      setProduct(response.data.results);
      setTotalCount(response.data.count);
      setTotalPages(Math.ceil(response.data.count / pageSize));
      setCurrentPage(page);
      console.log(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(10); // Items per page

  const handlePageChange = (page) => {
    fetchProduct(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const toggleProductStatus = async (id) => {
    try {
      await adminaxiosInstance.patch(`/productmanage/${id}`);
      fetchProduct();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  return (
    <div className="d-flex vh-100 bg-light">
      <div className="h-full">
        <Sidebar />
      </div>
      <div className="d-flex flex-column flex-grow-1 overflow-auto">
        <main
          className="flex-grow-1 p-4"
          style={{ backgroundColor: "#f8f9fa" }}
        >
          <div className="container-fluid">
            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2 className="mb-1 fw-bold" style={{ color: "#2c3e50" }}>
                  Product Management
                </h2>
                <p className="text-muted mb-0">Manage your product inventory</p>
              </div>
              <button
                className="btn btn-primary px-4 py-2 shadow-sm"
                style={{
                  borderRadius: "8px",
                  fontWeight: "500",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                }}
                onClick={() => navigate("/ProductAdd")}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Add New Product
              </button>
            </div>

            {/* Stats Cards */}
            <div className="row mb-4">
              <div className="col-md-3">
                <div
                  className="card border-0 shadow-sm"
                  style={{ borderRadius: "12px" }}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <p
                          className="text-muted mb-1"
                          style={{ fontSize: "0.9rem" }}
                        >
                          Total Products
                        </p>
                        <h3 className="mb-0 fw-bold">{product?.length || 0}</h3>
                      </div>
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: "50px",
                          height: "50px",
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        }}
                      >
                        <i className="bi bi-box-seam text-white fs-4"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div
                  className="card border-0 shadow-sm"
                  style={{ borderRadius: "12px" }}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <p
                          className="text-muted mb-1"
                          style={{ fontSize: "0.9rem" }}
                        >
                          Active Products
                        </p>
                        <h3
                          className="mb-0 fw-bold"
                          style={{ color: "#10b981" }}
                        >
                          {product?.filter((p) => p.is_active).length || 0}
                        </h3>
                      </div>
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: "50px",
                          height: "50px",
                          backgroundColor: "#d1fae5",
                        }}
                      >
                        <i className="bi bi-check-circle text-success fs-4"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div
                  className="card border-0 shadow-sm"
                  style={{ borderRadius: "12px" }}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <p
                          className="text-muted mb-1"
                          style={{ fontSize: "0.9rem" }}
                        >
                          Blocked Products
                        </p>
                        <h3
                          className="mb-0 fw-bold"
                          style={{ color: "#ef4444" }}
                        >
                          {product?.filter((p) => !p.is_active).length || 0}
                        </h3>
                      </div>
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: "50px",
                          height: "50px",
                          backgroundColor: "#fee2e2",
                        }}
                      >
                        <i className="bi bi-x-circle text-danger fs-4"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div
                  className="card border-0 shadow-sm"
                  style={{ borderRadius: "12px" }}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <p
                          className="text-muted mb-1"
                          style={{ fontSize: "0.9rem" }}
                        >
                          Categories
                        </p>
                        <h3 className="mb-0 fw-bold">
                          {[...new Set(product?.map((p) => p.category.id))]
                            .length || 0}
                        </h3>
                      </div>
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: "50px",
                          height: "50px",
                          backgroundColor: "#fef3c7",
                        }}
                      >
                        <i className="bi bi-grid text-warning fs-4"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Table Section */}
            <div
              className="card border-0 shadow-sm"
              style={{ borderRadius: "12px" }}
            >
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead style={{ backgroundColor: "#f8f9fa" }}>
                      <tr>
                        <th
                          className="py-3 px-4 fw-semibold"
                          style={{ color: "#64748b", fontSize: "0.875rem" }}
                        >
                          #
                        </th>
                        <th
                          className="py-3 px-4 fw-semibold"
                          style={{ color: "#64748b", fontSize: "0.875rem" }}
                        >
                          Image
                        </th>
                        <th
                          className="py-3 px-4 fw-semibold"
                          style={{ color: "#64748b", fontSize: "0.875rem" }}
                        >
                          Product
                        </th>
                        <th
                          className="py-3 px-4 fw-semibold"
                          style={{ color: "#64748b", fontSize: "0.875rem" }}
                        >
                          Category
                        </th>
                        <th
                          className="py-3 px-4 fw-semibold"
                          style={{ color: "#64748b", fontSize: "0.875rem" }}
                        >
                          Quantity
                        </th>
                        <th
                          className="py-3 px-4 fw-semibold"
                          style={{ color: "#64748b", fontSize: "0.875rem" }}
                        >
                          Description
                        </th>
                        <th
                          className="py-3 px-4 fw-semibold"
                          style={{ color: "#64748b", fontSize: "0.875rem" }}
                        >
                          Shelf Life
                        </th>
                        <th
                          className="py-3 px-4 fw-semibold text-center"
                          style={{ color: "#64748b", fontSize: "0.875rem" }}
                        >
                          Status
                        </th>
                        <th
                          className="py-3 px-4 fw-semibold text-center"
                          style={{ color: "#64748b", fontSize: "0.875rem" }}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="9" className="text-center py-5">
                            <div
                              className="spinner-border text-primary"
                              role="status"
                            >
                              <span className="visually-hidden">
                                Loading...
                              </span>
                            </div>
                          </td>
                        </tr>
                      ) : product && product.length > 0 ? (
                        product.map((product, index) => (
                          <tr
                            key={index}
                            style={{ borderBottom: "1px solid #e5e7eb" }}
                          >
                            <td className="py-3 px-4 align-middle">
                              <span
                                className="fw-medium"
                                style={{ color: "#64748b" }}
                              >
                                {index + 1}
                              </span>
                            </td>
                            <td className="py-3 px-4 align-middle">
                              <img
                                src={`${baseurl}${product.product_img1}`}
                                alt="Product"
                                className="rounded"
                                style={{
                                  width: "60px",
                                  height: "60px",
                                  objectFit: "cover",
                                  border: "2px solid #f1f5f9",
                                }}
                              />
                            </td>
                            <td className="py-3 px-4 align-middle">
                              <div>
                                <div
                                  className="fw-semibold"
                                  style={{ color: "#1e293b" }}
                                >
                                  {product.title}
                                </div>
                                <div
                                  className="text-muted"
                                  style={{ fontSize: "0.875rem" }}
                                >
                                  ₹{product.price}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 align-middle">
                              <span
                                className="badge px-3 py-2"
                                style={{
                                  backgroundColor: "#e0e7ff",
                                  color: "#4f46e5",
                                  fontWeight: "500",
                                  fontSize: "0.813rem",
                                }}
                              >
                                {product.category.name}
                              </span>
                            </td>
                            <td className="py-3 px-4 align-middle">
                              <span
                                className={`badge px-3 py-2 ${
                                  product.available_quantity > 10
                                    ? "bg-success"
                                    : product.available_quantity > 0
                                    ? "bg-warning"
                                    : "bg-danger"
                                }`}
                                style={{ fontSize: "0.813rem" }}
                              >
                                {product.available_quantity} units
                              </span>
                            </td>
                            <td
                              className="py-3 px-4 align-middle"
                              style={{ maxWidth: "200px" }}
                            >
                              <span
                                className="text-muted"
                                style={{ fontSize: "0.875rem" }}
                              >
                                {product.description.substring(0, 50)}
                                {product.description.length > 50 ? "..." : ""}
                              </span>
                            </td>
                            <td className="py-3 px-4 align-middle">
                              <span
                                className="text-muted"
                                style={{ fontSize: "0.875rem" }}
                              >
                                {product.shelf_life}
                              </span>
                            </td>
                            <td className="py-3 px-4 align-middle text-center">
                              <button
                                className={`btn btn-sm px-3 py-1 ${
                                  product.is_active
                                    ? "btn-success"
                                    : "btn-danger"
                                }`}
                                style={{
                                  borderRadius: "6px",
                                  fontSize: "0.813rem",
                                  fontWeight: "500",
                                }}
                                onClick={() => toggleProductStatus(product.id)}
                              >
                                {product.is_active ? (
                                  <>
                                    <i className="bi bi-check-circle me-1"></i>
                                    Active
                                  </>
                                ) : (
                                  <>
                                    <i className="bi bi-x-circle me-1"></i>
                                    Blocked
                                  </>
                                )}
                              </button>
                            </td>
                            <td className="py-3 px-4 align-middle">
                              <div className="d-flex gap-2 justify-content-center">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  style={{
                                    borderRadius: "6px",
                                    fontSize: "0.813rem",
                                    fontWeight: "500",
                                  }}
                                  onClick={() =>
                                    navigate("/ProductVarientManage", {
                                      state: product.id,
                                    })
                                  }
                                  title="View Variants"
                                >
                                  Variants
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-success"
                                  style={{
                                    borderRadius: "6px",
                                    fontSize: "0.813rem",
                                    fontWeight: "500",
                                  }}
                                  onClick={() =>
                                    navigate("/ProductEdit", { state: product })
                                  }
                                  title="Edit Product"
                                >
                                  Edit
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" className="text-center py-5">
                            <div className="text-muted">
                              <i className="bi bi-inbox fs-1 d-block mb-3"></i>
                              <p className="mb-0">No products found</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
        {/* Pagination Component */}
        <div className="px-4 pb-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            maxPageButtons={10 / 2}
            size="md"
          />
        </div>
      </div>
    </div>
  );
}

export default ProductManage;
