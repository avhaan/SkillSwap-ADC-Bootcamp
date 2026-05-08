import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { apiBrowseUsers } from '../api/api.jsx'
import SkillCard from '../browse-page/components/SkillCard.jsx'
import SearchBar from '../browse-page/components/SearchBar.jsx'
import FilterPanel from '../browse-page/components/FilterPanel.jsx'
import Pagination from '../browse-page/components/Pagination.jsx'
import "../browse-page/style.css";

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlSearch = searchParams.get('search') || ''

  const [users, setUsers] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [lastUrlSearch, setLastUrlSearch] = useState(urlSearch)
  const [category, setCategory] = useState('')
  const [proficiency, setProficiency] = useState('')
  const [loading, setLoading] = useState(false)

  if (lastUrlSearch !== urlSearch) {
    setLastUrlSearch(urlSearch)
    if (page !== 1) {
      setPage(1)
    }
  }

  useEffect(() => {
    let cancelled = false

    const timer = window.setTimeout(async () => {
      setLoading(true)
      try {
        const data = await apiBrowseUsers({ search: urlSearch, category, proficiency, page, limit: 12 })
        if (!cancelled) {
          setUsers(data.users)
          setTotalPages(data.total_pages)
        }
      } catch (err) {
        console.error('Failed to fetch users:', err)
      }

      if (!cancelled) {
        setLoading(false)
      }
    }, 0)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [page, category, proficiency, urlSearch])

  function handleSearch(searchValue) {
    const nextSearch = searchValue.trim()
    const nextParams = new URLSearchParams(searchParams)

    if (nextSearch) {
      nextParams.set('search', nextSearch)
    } else {
      nextParams.delete('search')
    }

    setPage(1)
    setSearchParams(nextParams)
  }

  return (
    <div className="browse">
      <h1 className="browse-title">The <span className="accent">marketplace</span></h1>
      <div className="browse-title-line"></div>

      <div className="browse-controls">
        <SearchBar
          key={urlSearch}
          initialValue={urlSearch}
          onSearch={handleSearch}
        />
        <FilterPanel
          category={category}
          proficiency={proficiency}
          onCategoryChange={e => setCategory(e.target.value)}
          onProficiencyChange={e => setProficiency(e.target.value)}
        />
      </div>

      {loading && <p className="browse-loading">Loading...</p>}

      {!loading && users.length === 0 && (
        <p className="browse-empty">No users found. Try a different search.</p>
      )}

      <div className="browse-grid">
        {users.map(user => (
          <SkillCard key={user._id} user={user} />
        ))}
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  )
}
