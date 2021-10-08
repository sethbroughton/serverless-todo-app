import React, { useState, useEffect } from 'react';

const Counter = () => {
    const [count, setCount] = useState(0);

    const timeout = async () => {
        await new Promise( r=> setTimeout(r, 2000));
    }

    //After render this get's fired.  
    useEffect(() => {
        document.title = `You clicked ${count} times`;
        
        return (()=> {
            timeout().then(() => alert('all done'));
        })
    }, []);

    //only runs if the count has changed.  

    return ( 
        <div>
            <p>You clicked {count} times</p>
            <button onClick={() => setCount(count+1)}>
                Click me
            </button>
        </div>
     );
}
 
export default Counter;