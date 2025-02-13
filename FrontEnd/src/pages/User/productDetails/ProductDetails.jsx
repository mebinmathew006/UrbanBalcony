import React, { useEffect, useState } from 'react'
import Header from '../../../components/header/header'
import Singleprodct from '../../../components/Singleproduct/Singleprodct'
import Footer from '../../../components/footer/Footer'
import Breadcrumbs from '../../../components/Breadcrumps'
import ProductView from '../../../components/productView/ProductView'
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
