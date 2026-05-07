import { useState } from "react";

export default function SearchBar({ initialValue = "", onSearch }){
    const [value, setValue] = useState(initialValue);

    function keyPressed(e){
        if(e.key === 'Enter'){
            onSearch(value)
        }
    }

    return(
        <div className="searchbar">

            <input type="text" placeholder="Search skills..." value={value} 
             onChange={e => setValue(e.target.value)} onKeyDown={keyPressed} className="searchbar-input"/>

            <button onClick={() => onSearch(value)} className="searchbar-btn">
                Search
            </button>
        </div>
    )
}
