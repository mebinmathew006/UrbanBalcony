 import React, { useEffect, useState } from 'react'
import ProductView from '../../components/productView/ProductView'
import Footer from "../../components/footer/Footer";
import axiosInstance from '../../axiosconfig';
import Header from '../../components/header/header';
 
 function Index() {

  const [data,setData]=useState([])

  useEffect(()=>{
    fetchProducts();
  },[])
  async function fetchProducts(){
  const response= await axiosInstance.get('')

  setData(response.data.data1)

  }
  
   return (
     <div>
       <Header page='index'/>
       <ProductView data={data} category='Nuts'></ProductView>
       <ProductView data={data} category='Offer'></ProductView>
       <ProductView data={data} category='Offer'></ProductView>
       <ProductView data={data} category='Offer'></ProductView>
      <Footer/>

     </div>
   )
 }
 
 export default Index
 