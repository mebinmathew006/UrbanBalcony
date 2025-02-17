import React, { useEffect, useState } from 'react'
import Header from '../../../Components/Header/Header'
import Singleprodct from '../../../Components/Singleproduct/Singleprodct'
import Footer from '../../../Components/Footer/Footer'
import Breadcrumbs from '../../../Components/Breadcrumps'
import ProductView from '../../../Components/ProductView/ProductView'
import { useLocation } from 'react-router-dom'
import axiosInstance from '../../../axiosconfig'

function ProductDetails() {
  const location = useLocation()
  const product_id = location.state.spiceDetails.id;
  const [relatedProducts,setRelatedProducts]=useState([]);
  useEffect(()=>{
    fetchRelatedProducts();
  },[])

  const  fetchRelatedProducts=async ()=>{
    try {
    const response= await axiosInstance.get(`/relatedProductData/${product_id}`)
     console.log(response.data);
     setRelatedProducts(response.data)
    } catch (error) {
      
    }
  }
  
  return (
    <div className='bg-[#FCF4D2]'>
      <Header page='home'/>
      <Breadcrumbs/>
      <Singleprodct/>
      <ProductView data={relatedProducts || []} category="Related Products" />
      <Footer/>
    </div>
  )
}

export default ProductDetails
