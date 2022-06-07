import React, { useEffect } from "react";
import Item from "./Item";

const sortFunc = (list, key, onRemoveItem) => {
const newListCopy = [...list];

if(key){
  newListCopy.sort((a, b) => {
    const firstValue = a[key];
    const secondValue = b[key]
    if(typeof firstValue === 'string'){
      return firstValue.localeCompare(secondValue)
    }else{
      return firstValue - secondValue
    }
  }); 
}
  return newListCopy.map(item => (
  <Item
   key={item.objectID}
   item={item}
   onRemoveItem={onRemoveItem}
 />
));
}

const List = ({ list, sortBy, onRemoveItem }) =>{
  console.log(sortBy)
  return sortFunc(list, sortBy, onRemoveItem);
}

export default List;
