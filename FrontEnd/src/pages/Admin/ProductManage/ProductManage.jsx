import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/Admin/Sidebar/Sidebar";
import adminaxiosInstance from "../../../adminaxiosconfig";
import { useNavigate } from "react-router-dom";
function ProductManage() {
const baseurl=import.meta.env.VITE_BASE_URL

  const navigate = useNavigate();
    const toggleProductStatus = async (id) => {
        try {
          await adminaxiosInstance.patch(`/productmanage/${id}`); 
          fetchProduct();
        } catch (error) {
          console.log(error);
      }
    }
      const [product, setProduct] = useState();
      const fetchProduct = async () => {
        try {
          const response = await adminaxiosInstance.get("/productmanage");
          setProduct(response.data);
          console.log(response.data);
        } catch (error) {
          console.log(error);
        }
      };
    
      useEffect(() => {
        fetchProduct();
      }, []);
    
      return (
        <div className="d-flex vh-100 bg-light h-full">
          <div className="h-full">
          <Sidebar  />

          </div>
          <div className="d-flex flex-column flex-grow-1">
            <main className="bg-light">
              <div className="container">
                <div className="d-flex justify-content-center gap-5 pb-5">  
                <h3>Product Details</h3>
                <button className="btn btn-info" onClick={()=>navigate('/ProductAdd')}>ADD</button></div>
                <table class="table">
                  <thead class="thead-dark">
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Image</th>
                      <th scope="col">Title</th>
                      <th scope="col">Category</th>
                      <th scope="col">Quantity</th>
                      <th scope="col">Description</th>
                      <th scope="col">Shelf life</th>
                      <th scope="col">Varients</th>
                      <th scope="col">Block/Unblock</th>
                      <th scope="col">Edit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product &&
                      product.map((product, index) => (
                        <tr key={index}>
                          <th scope="row">{index + 1}</th>
                          <td><img src={`${baseurl}${product.product_img1}`} alt="Product Image" width={100} height={100}/></td>
                          <td>{product.title}</td>
                          <td>{product.category.name}</td>
                          <td>{product.available_quantity}</td>
                          <td>{product.description}</td>
                          <td>{product.shelf_life}</td>
                          <td ><button className="btn btn-dark"  onClick={()=>navigate('/ProductVarientManage',{state:product.id})}>View</button></td>
                          <td>
                            <button
                              className={`btn ${
                                product.is_active ? "btn-primary" : "btn-danger"
                              }`}
                              onClick={() => toggleProductStatus(product.id)}
                            >
                              {product.is_active ? "Block" : "Unblock"}
                            </button>
                          </td>
                          <td ><button className="btn btn-success"  onClick={()=>navigate('/ProductEdit',{state:product})}>Edit</button></td>
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

export default ProductManage
