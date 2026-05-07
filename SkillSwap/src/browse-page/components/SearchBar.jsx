export default function SearchBar({value, onChange, onSearch}){
    function keyPressed(e){
        if(e.key === 'Enter'){
            onSearch()
        }
    }
    return(
        <div className="searchbar">

            <input type="text" placeholder="Search skills..." value={value} 
             onChange={onChange} onKeyDown={keyPressed} className="searchbar-input"/>

            <button onClick={onSearch} className="searchbar-btn">
                Search
            </button>
        </div>
    )
}
