import React, { useEffect, useState } from "react";
import Sidebar from "../../../Components/Admin/Sidebar/Sidebar";
import adminaxiosInstance from "../../../adminaxiosconfig";

function UserManage() {
  const toggleUserStatus = async (id) => {
    try {
      await adminaxiosInstance.patch(`/usermanage/${id}`); 
      fetchUsers();
    } catch (error) {
      console.log(error);
  }
}
  const [users, setUsers] = useState();
  const fetchUsers = async () => {
    try {
      const response = await adminaxiosInstance.get("/usermanage");
      setUsers(response.data);
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
      </div>
    </div>
  );
}

export default UserManage;
