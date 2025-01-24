 import React, { useEffect, useState } from 'react'
import Footer from "../../../components/footer/Footer";
import axiosInstance from '../../../axiosconfig';
import Header from '../../../components/header/header';
import ProductView from '../../../components/productView/ProductView';
 
 function Index() {

  const [data,setData]=useState([])

  useEffect(()=>{
    fetchProducts();
  },[])
  async function fetchProducts(){
  const response= await axiosInstance.get('')

  setData(response.data)

  }
  
   return (
     <div>
       <Header page='index'/>
       <ProductView data={data} ></ProductView>
       
      <Footer/>

     </div>
   )
 }
 
 export default Index
 