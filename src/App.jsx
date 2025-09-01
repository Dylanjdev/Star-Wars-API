import { useEffect, useState } from 'react'
import './index.css'
import Skeleton from '../components/Skeleton.jsx'

const API_BASE = 'https://swapi.py4e.com/api'; // Use py4e SWAPI mirror for production

export default function App() {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [page, setPage] = useState(1)
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasNext, setHasNext] = useState(false)
  const [selected, setSelected] = useState(null)
  const [homeworld, setHomeworld] = useState(null)

  // Search effect
  useEffect(() => {
    if (search.trim() === "") {
      setSearchResults([]);
      return;
    }
    let ignore = false;
    const fetchSearch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/people/?search=${encodeURIComponent(search)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (ignore) return;
        setSearchResults(data.results || []);
      } catch (e) {
        if (!ignore) setError(e.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchSearch();
    return () => { ignore = true; };
  }, [search]);

  // Pagination effect
  useEffect(() => {
    let ignore = false;
    const fetchPeople = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE}/people/?page=${page}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (ignore) return;
        setPeople(data.results || []);
        setHasNext(Boolean(data.next));
      } catch (e) {
        if (!ignore) setError(e.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchPeople();
    return () => { ignore = true; };
  }, [page]);

  const selectPerson = async (person) => {
    setSelected(person)
    setHomeworld(null)
    try {
      if (person.homeworld) {
        // ensure https
        const hwUrl = person.homeworld.replace('http://', 'https://')
        const res = await fetch(hwUrl)
        if (res.ok) {
          const hw = await res.json()
          setHomeworld(hw.name || 'Unknown')
        } else {
          setHomeworld('Unknown')
        }
      }
    } catch {
      setHomeworld('Unknown')
    }
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '24px', fontSize: '2.5rem', fontWeight: 700, letterSpacing: '1px' }}>⭐ Star Wars Characters</h1>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search Star Wars characters..."
          style={{
            padding: '0.75em 1em',
            width: '100%',
            maxWidth: 400,
            borderRadius: '8px',
            border: '1px solid #444',
            fontSize: '1.1rem',
            background: '#161616',
            color: '#eee',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}
        />
      </div>

      <div className="controls" style={{ justifyContent: 'center', marginBottom: '24px' }}>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading || search}>
          ← Prev
        </button>
        <span style={{ fontWeight: 500, fontSize: '1.1rem' }}>Page {page}</span>
        <button onClick={() => setPage(p => (hasNext ? p + 1 : p))} disabled={!hasNext || loading || search}>
          Next →
        </button>
      </div>

      {error && <p className="error">Error: {error}</p>}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginTop: '32px' }}>
          <Skeleton width="200px" height="20px" />
          <Skeleton width="150px" height="20px" />
          <Skeleton width="180px" height="20px" />
        </div>
      ) : (
        <div className="grid">
          {(search ? searchResults : people).map((p) => (
            <button key={p.url} className="card" onClick={() => selectPerson(p)}>
              {p.name}
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="details" style={{ textAlign: 'center', marginTop: '32px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>{selected.name}</h2>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '1.1rem', color: '#ccc' }}>
            <li><strong>Height:</strong> {selected.height} cm</li>
            <li><strong>Mass:</strong> {selected.mass} kg</li>
            <li><strong>Birth Year:</strong> {selected.birth_year}</li>
            <li><strong>Gender:</strong> {selected.gender}</li>
            <li><strong>Homeworld:</strong> {homeworld ?? 'Loading…'}</li>
          </ul>
        </div>
      )}
    </div>
  )
}





