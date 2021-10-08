import React, { useState, useEffect } from 'react';

const Input = () => {
    const [isLoading, setIsLoading] = useState(true);
    useEffect(()=> {
        setTimeout(()=>{
            setIsLoading(false);
        },2000)
    });

    return isLoading ? <div>Loading...</div> : <input placeholder="Enter some test" />
}
 
export default Input;