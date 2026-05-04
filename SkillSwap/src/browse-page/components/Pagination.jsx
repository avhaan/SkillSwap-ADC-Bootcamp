// Prev/next buttons with current page display
// Used at the bottom of the browse page

/* these props take in the current page we are on, how many total pages are needed and the
page change */
export default function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div className="pagination">

      {/* this is our previous button,  we have it disabled if we are on the
          first page of our browse section.  */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-btn"
      >
        
      </button>

      {/* so Array.from basically creates a new array and it has 3 arguments. the first one
           is basically how many pages we want to create and the second argument is
           (_, i) => i + 1. the _ basically means the current one we are on but we dont 
            really care about that and i is our index starting at 0, and looping up
            till we hit our desired length. we then map each one into a button and
            thats how we see the numbered list.*/}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
        >
          {page}
        </button>
      ))}

      {/* this is our next button and it is disabled whenever we reach the last
          paage, and that is checked by a direct comparison to the totalpages. */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-btn"
      >
        
      </button>

    </div>
  )
}