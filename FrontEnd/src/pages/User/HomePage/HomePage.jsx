import React, { useEffect, useState } from 'react'
import Header from '../../../components/header/header';
import Footer from '../../../components/footer/Footer';
import axiosInstance from '../../../axiosconfig';
import { useSelector } from 'react-redux';
import ProductView from '../../../components/productView/ProductView';
function HomePage() {
  const usser=useSelector((state)=>state.userDetails)
  console.log(usser);
  
    const [data,setData]=useState([])

    useEffect(()=>{
      fetchProducts();
    },[])

    async function fetchProducts(){
    const response= await axiosInstance.get('')
  
    setData(response.data)
    console.log(data)

    }
    
     return (
       <div>
         <Header page='home'/>
         <ProductView data={data} category='Prodcuts'></ProductView>
         
        <Footer/>
  
       </div>
     )
}

export default HomePage
