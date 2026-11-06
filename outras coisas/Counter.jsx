import { useState } from 'react';

function Counter({label, initial=0}) {
    
    const [count, setCount] = useState(initial); // passa o valor inicial

    // callback para lidar com clique do botão
    function handleClick() {
        setCount(count + 1);
    }

    return (
        <div>
            <h2>{label}</h2>
            <p>Valor atual: {count}</p>
            <button onClick={handleClick}>[ + ]</button>

            {/* <button onClick={ () => setCount(count + 1) }>Incrementar</button> */}
        </div>
    );
}
export default Counter;