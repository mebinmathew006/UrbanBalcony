import React, { useEffect, useState } from 'react'
import Header from '../../components/header/header';
import Footer from '../../components/footer/Footer';
import ProductView from '../../components/productView/ProductView'
import axiosInstance from '../../axiosconfig';
function HomePage() {
    const [data,setData]=useState([])
    const [data1,setData1]=useState([])

    useEffect(()=>{
      fetchProducts();
    },[])

    async function fetchProducts(){
    const response= await axiosInstance.get('')
    console.log(response)
  
    setData(response.data.data1)
    setData1(response.data.data2)
    }
    
     return (
       <div>
         <Header page='home'/>
         <ProductView data={data} category='Nuts'></ProductView>
         <ProductView data={data1} category='Offer'></ProductView>
         <ProductView data={data} category='Offer'></ProductView>
         <ProductView data={data1} category='Offer'></ProductView>
        <Footer/>
  
       </div>
     )
}

export default HomePage
