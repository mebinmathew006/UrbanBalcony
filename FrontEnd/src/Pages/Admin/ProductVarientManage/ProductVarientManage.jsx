import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/Admin/Sidebar/Sidebar";
import adminaxiosInstance from "../../../adminaxiosconfig";
import { useLocation, useNavigate } from "react-router-dom";

function ProductVarientManage() {
  const location =useLocation()
  const product_id=location.state
  
  const navigate = useNavigate();
  const toggleProductStatus = async (id) => {
    try {
      await adminaxiosInstance.patch(`/productVarientmanage/${id}`);
      fetchProduct();
    } catch (error) {
      console.log(error);
    }
  };
  const [productVarients, setProductVarients] = useState();
  const fetchProduct = async () => {
    try {
      const response = await adminaxiosInstance.get(`/productVarientmanage/${product_id}`);
      setProductVarients(response.data);
      console.log(productVarients);
      
    } catch (error) {}
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  return (
    <div className="d-flex vh-100 bg-light">
      <Sidebar />
      <div className="d-flex flex-column flex-grow-1">
        <main className="bg-light">
          <div className="container-fluid">
            <div className="d-flex justify-content-center gap-5 pb-5">
              <h3>Varient Details</h3>
              <button
                className="btn btn-info"
                onClick={() => navigate("/ProductVarientAdd", { state: product_id })}
              >
                ADD
              </button>
            </div>
            <table class="table">
              <thead class="thead-dark">
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Weight</th>
                  <th scope="col">Price</th>
                  <th scope="col">Stock</th>
                  <th scope="col">Block/Unblock</th>
                  <th scope="col">Edit</th>
                </tr>
              </thead>
              <tbody>
                {productVarients &&
                  productVarients.map((productVarient, index) => (
                    <tr key={index}>
                      <th scope="row">{index + 1}</th>
                      <td>{productVarient.weight}</td>
                      <td>{productVarient.variant_price}</td>
                      <td>{productVarient.stock}</td>
                      <td>
                        <button
                          className={`btn ${
                            productVarient.is_active ? "btn-primary" : "btn-danger"
                          }`}
                          onClick={() => toggleProductStatus(productVarient.id)}
                        >
                          {productVarient.is_active ? "Block" : "Unblock"}
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn btn-success"
                          onClick={() =>
                            navigate("/ProductVarientEdit", { state: productVarient })
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
      </div>
    </div>
  );
}

export default ProductVarientManage;
