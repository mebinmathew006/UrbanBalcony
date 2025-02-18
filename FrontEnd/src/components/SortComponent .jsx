import React, { useState } from 'react';

const SortComponent = ({ items }) => {
  const [sortType, setSortType] = useState('price');

  const sortItems = (type) => {

    setSortType(type);
    
  };

  return (
    <div className='flex items-center'>
        <select name="" id="" className=' bg-blue-300 border-black rounded-md w-15 h-8' onChange={(event)=>sortItems(event.target.value)}>
            <option value="">Sort by</option>
            <option value="alphabets">Alphabets</option>
            <option value="rating">Rating</option>
            <option value="price">Price</option>
        </select>
    </div>
  );
};

export default SortComponent;
