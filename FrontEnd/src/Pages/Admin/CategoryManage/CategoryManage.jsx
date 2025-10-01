import React, { useEffect, useState } from "react";
import Sidebar from "../../../Components/Admin/Sidebar/Sidebar";
import adminaxiosInstance from "../../../adminaxiosconfig";
import { useNavigate } from "react-router-dom";
import Pagination from "../../../Components/Pagination/Pagination";
function CategoryManage() {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const fetchCategory = async (page = 1) => {
    try {
      const response = await adminaxiosInstance.get(
        `/categorymanage?page=${page}`
      );
      setCategory(response.data.results);
      setTotalCount(response.data.count);
      setTotalPages(Math.ceil(response.data.count / pageSize));
      setCurrentPage(page);
    } catch (error) {
      console.log(error);
    }
  };
  const navigate = useNavigate();

  const handlePageChange = (page) => {
    fetchCategory(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const toggleCategoryStatus = async (id) => {
    try {
      await adminaxiosInstance.patch(`/categorymanage/${id}`);
      fetchCategory();
    } catch (error) {
      console.log(error);
    }
  };
  const [category, setCategory] = useState();

  useEffect(() => {
    fetchCategory();
  }, []);

  return (
    <div className="d-flex vh-100 bg-light">
      <Sidebar />
      <div className="d-flex flex-column flex-grow-1">
        <main className="bg-light">
          <div className="container-fluid">
            <div className="d-flex justify-content-center gap-5 pb-5">
              <h3>Category Details</h3>
              <button
                className="btn btn-info"
                onClick={() => navigate("/CategoryAdd")}
              >
                ADD
              </button>
            </div>
            <table className="table">
              <thead className="thead-dark">
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Name</th>
                  <th scope="col">Block/Unblock</th>
                  <th scope="col">Edit</th>
                </tr>
              </thead>
              <tbody>
                {category &&
                  category.map((category, index) => (
                    <tr key={index}>
                      <th scope="row">{index + 1}</th>
                      <td>{category.name}</td>

                      <td>
                        <button
                          className={`btn ${
                            category.is_active ? "btn-primary" : "btn-danger"
                          }`}
                          onClick={() => toggleCategoryStatus(category.id)}
                        >
                          {category.is_active ? "Block" : "Unblock"}
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn btn-success"
                          onClick={() =>
                            navigate("/CategoryUpdate", { state: category })
                          }
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </main>
        <div className="px-4 pb-4">
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
      </div>
    </div>
  );
}

export default CategoryManage;
