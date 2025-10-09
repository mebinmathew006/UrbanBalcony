import React, { useEffect, useState } from "react";
import Sidebar from "../../../Components/Admin/Sidebar/Sidebar";
import adminaxiosInstance from "../../../adminaxiosconfig";
import Pagination from "../../../Components/Pagination/Pagination";

function UserManage() {
  const [users, setUsers] = useState();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(10); // Items per page
  const fetchUsers = async (page = 1) => {
    try {
      const response = await adminaxiosInstance.get(`/usermanage?page=${page}`);
      console.log(response.data);
      setUsers(response.data.results);
      setTotalCount(response.data.count);
      setTotalPages(Math.ceil(response.data.count / pageSize));
      setCurrentPage(page);
    } catch (error) {
      console.log(error);
    }
  };

  const handlePageChange = (page) => {
    fetchUsers(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const toggleUserStatus = async (id) => {
    try {
      await adminaxiosInstance.patch(`/usermanage/${id}`);
      fetchUsers();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="d-flex vh-100 bg-light">
      <Sidebar />
      <div className="d-flex flex-column flex-grow-1">
        <main className="bg-light">
          <div className="container-fluid">
            <h3>User Details</h3>
            <table class="table">
              <thead class="thead-dark">
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">First</th>
                  <th scope="col">Last</th>
                  <th scope="col">Email</th>
                  <th scope="col">phone_number</th>
                  <th scope="col">Block/Unblock</th>
                </tr>
              </thead>
              <tbody>
                {users &&
                  users.map((user, index) => (
                    <tr>
                      <th scope="row">{index + 1}</th>
                      <td>{user.first_name}</td>
                      <td>{user.last_name}</td>
                      <td>{user.email}</td>
                      <td>{user.phone_number}</td>
                      <td>
                        <button
                          className={`btn ${
                            user.is_active ? "btn-primary" : "btn-danger"
                          }`}
                          onClick={() => toggleUserStatus(user.id)}
                        >
                          {user.is_active ? "Block" : "Unblock"}
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

export default UserManage;
