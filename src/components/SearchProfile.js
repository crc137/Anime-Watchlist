import React, { useState } from 'react';
import styled from 'styled-components';
import { getUserByProfileId } from '../utils/api';

const SearchContainer = styled.div`
  padding: 20px;
  background: var(--tg-theme-bg-color);
  color: var(--tg-theme-text-color);
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background: var(--tg-theme-secondary-bg-color);
  color: var(--tg-theme-text-color);
  margin-bottom: 20px;
`;

const SearchButton = styled.button`
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: var(--tg-theme-button-color);
  color: var(--tg-theme-button-text-color);
  font-weight: bold;
  cursor: pointer;
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const RecommendationsList = styled.div`
  margin-top: 20px;
`;

const RecommendationItem = styled.div`
  background: var(--tg-theme-secondary-bg-color);
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
  
  h3 {
    margin: 0 0 10px 0;
    color: var(--tg-theme-button-color);
  }
  
  p {
    margin: 0;
    font-size: 14px;
  }
`;

const SearchProfile = () => {
  const [profileId, setProfileId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!profileId.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const user = await getUserByProfileId(profileId);
      setSearchResult(user);
    } catch (error) {
      setError('Profile not found or error occurred');
      setSearchResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SearchContainer>
      <h2>Find Profile</h2>
      
      <SearchInput
        type="text"
        placeholder="Enter Profile ID"
        value={profileId}
        onChange={(e) => setProfileId(e.target.value)}
      />
      
      <SearchButton
        onClick={handleSearch}
        disabled={loading || !profileId.trim()}
      >
        {loading ? 'Searching...' : 'Search'}
      </SearchButton>

      {error && (
        <div style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {searchResult && (
        <div style={{ marginTop: '20px' }}>
          <h3>{searchResult.username}'s Recommendations</h3>
          
          <RecommendationsList>
            {searchResult.recommendations?.map((rec, index) => (
              <RecommendationItem key={index}>
                <h3>{rec.animeTitle}</h3>
                <p>{rec.comment}</p>
                <small>Shared: {new Date(rec.sharedAt).toLocaleDateString()}</small>
              </RecommendationItem>
            ))}
            
            {(!searchResult.recommendations || searchResult.recommendations.length === 0) && (
              <p style={{ textAlign: 'center' }}>No recommendations yet</p>
            )}
          </RecommendationsList>
        </div>
      )}
    </SearchContainer>
  );
};

export default SearchProfile; 