import React from 'react'
import Header from '../../components/header/header'
import Singleprodct from '../../components/Singleproduct/Singleprodct'
import Footer from '../../components/footer/Footer'

function ProductDetails() {
  return (
    <div className='container-fluid'>
      <Header page='home'/>
      <Singleprodct/>
      <Footer/>
    </div>
  )
}

export default ProductDetails
