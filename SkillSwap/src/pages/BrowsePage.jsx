// this is the main marketplace page.

import { useState, useEffect } from 'react'
import { apiBrowseUsers } from '../api/api.jsx'
import SkillCard from '../browse-page/components/SkillCard.jsx'
import SearchBar from '../browse-page/components/SearchBar.jsx'
import FilterPanel from '../browse-page/components/FilterPanel.jsx'
import Pagination from '../browse-page/components/Pagination.jsx'
import "../browse-page/style.css";


export default function BrowsePage() {

  // store the list of users returned from the API
  const [users, setUsers] = useState([])

  // store the total number of pages for pagination
  const [totalPages, setTotalPages] = useState(1)

  // current page number
  const [page, setPage] = useState(1)

  // this is for search input
  const [search, setSearch] = useState('')

  // selected category filter
  const [category, setCategory] = useState('')

  // our proficiency filter
  const [proficiency, setProficiency] = useState('')

  // loading state — we set it to false intially but it is true when waiting for API
  const [loading, setLoading] = useState(false)

  // fetchUsers — calls the API with current filters and updates the users list
  async function fetchUsers() {
    /* setting our loading to true while we wait */
    setLoading(true)
    try {
        /* we fetch our api users and how many pages need to be shown, if it does not work we catch it and log
           the error in the console.*/
      const data = await apiBrowseUsers({ search, category, proficiency, page, limit: 12 })
      setUsers(data.users)
      setTotalPages(data.total_pages)
    } catch (err) {
      console.error('Failed to fetch users:', err)
    }
    /* set our loading to false after  */
    setLoading(false)
  }

  // anytime the page changes we fetch our users.
  useEffect(() => {
    fetchUsers()
  }, [page])

  // runs when user clicks search button
  function handleSearch() {
    setPage(1) // after each search we set our page back to 1
    fetchUsers()
  }

  return (
    <div className="browse">

      {/* page title */}
      <h1 className="browse-title">The <span className="accent">marketplace</span></h1>

      {/* search and filter row */}
      <div className="browse-controls">
        <SearchBar
          value={search}
          onChange={e => setSearch(e.target.value)}
          onSearch={handleSearch}
        />
        <FilterPanel
          category={category}
          proficiency={proficiency}
          onCategoryChange={e => setCategory(e.target.value)}
          onProficiencyChange={e => setProficiency(e.target.value)}
        />
      </div>

      {/* loading  the state */}
      {loading && <p className="browse-loading">Loading...</p>}

      {/* empty state, our api found nothing */}
      {!loading && users.length === 0 && (
        <p className="browse-empty">No users found. Try a different search.</p>
      )}

      {/* user card grid */}
      <div className="browse-grid">
        {users.map(user => (
          <SkillCard key={user._id} user={user} />
        ))}
      </div>

      {/* pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

    </div>
  )
}