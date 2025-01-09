import React from 'react'
import Header from '../../../components/header/header'
import Singleprodct from '../../../components/Singleproduct/Singleprodct'
import Footer from '../../../components/footer/Footer'
import Breadcrumbs from '../../../components/Breadcrumps'
import ProductView from '../../../components/productView/ProductView'

function ProductDetails() {
  return (
    <div className=''>
      <Header page='home'/>
      <Breadcrumbs/>
      <Singleprodct/>
      <Footer/>
    </div>
  )
}

export default ProductDetails
