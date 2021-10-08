import React, { useEffect, useState } from 'react'

const Checkbox = () => {

    const [checkBoxState, setCheckBoxState] = useState(false);

    useEffect(()=> {
        console.log('in useEffect');
        return () => {
            console.log('in useEffect cleanup')
        }},[checkBoxState]);

    return ( 

        <input type="checkbox" className="rounded text-pink-500" onChange={()=>setCheckBoxState(!checkBoxState)} />

     );
}
 
export default Checkbox;