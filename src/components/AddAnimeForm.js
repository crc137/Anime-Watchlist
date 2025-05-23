import React, { useState, useEffect, useRef } from 'react';
import { searchAnime } from '../utils/animeApi';

const AddAnimeForm = ({ onAdd }) => {
  const [title, setTitle] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Clear previous timeout if it exists
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (title.trim() === '') {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    // Set a timeout to avoid too many API calls
    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      const results = await searchAnime(title);
      setSearchResults(results);
      setIsSearching(false);
      setIsDropdownOpen(results.length > 0);
    }, 500);

    // Cleanup function
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [title]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title);
      setTitle('');
      setSearchResults([]);
      setIsDropdownOpen(false);
    }
  };

  const handleSelect = (anime) => {
    onAdd(anime.title, anime);
    setTitle('');
    setSearchResults([]);
    setIsDropdownOpen(false);
  };

  return (
    <div className="add-anime-container">
      <form className="add-form" onSubmit={handleSubmit}>
        <div className="search-container" ref={dropdownRef}>
          <input
            type="text"
            className="add-input"
            placeholder="Search for anime..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setIsDropdownOpen(searchResults.length > 0)}
          />
          {isDropdownOpen && (
            <div className="search-dropdown">
              {isSearching ? (
                <div className="search-loading">Loading...</div>
              ) : (
                <>
                  {searchResults.map((anime) => (
                    <div
                      key={anime.id}
                      className="search-result-item"
                      onClick={() => handleSelect(anime)}
                    >
                      <img 
                        src={anime.image} 
                        alt={anime.title} 
                        className="anime-thumbnail"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/50x70?text=No+Image';
                        }}
                      />
                      <div className="anime-info">
                        <div className="anime-title-year">
                          <span className="anime-title-text">{anime.title}</span>
                          <span className="anime-year">{anime.year}</span>
                        </div>
                        <div className="anime-score">
                          Score: {anime.score}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {searchResults.length === 0 && title.trim() !== '' && (
                    <div className="no-results">No results found</div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
        <button type="submit" className="action-button">
          Add
        </button>
      </form>
    </div>
  );
};

export default AddAnimeForm;
