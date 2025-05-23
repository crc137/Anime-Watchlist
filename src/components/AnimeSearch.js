import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import debounce from 'lodash/debounce';
import { searchAnime, getAnimeDetails } from '../utils/animeApi';

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 20px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: var(--tg-theme-secondary-bg-color);
  color: var(--tg-theme-text-color);
  margin-bottom: ${props => props.showSuggestions ? '0' : '10px'};
`;

const SuggestionsList = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--tg-theme-secondary-bg-color);
  border-radius: 0 0 8px 8px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
`;

const SuggestionItem = styled.div`
  padding: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: background-color 0.2s;

  &:hover {
    background: var(--tg-theme-bg-color);
  }
`;

const AnimeImage = styled.img`
  width: 50px;
  height: 70px;
  object-fit: cover;
  border-radius: 4px;
`;

const AnimeInfo = styled.div`
  flex: 1;
`;

const Title = styled.div`
  font-weight: bold;
  margin-bottom: 4px;
`;

const Score = styled.div`
  font-size: 0.9em;
  color: var(--tg-theme-hint-color);
`;

const DetailedAnimeCard = styled.div`
  background: var(--tg-theme-secondary-bg-color);
  border-radius: 8px;
  padding: 16px;
  margin-top: 20px;
`;

const DetailedImage = styled.img`
  width: 100%;
  max-width: 200px;
  height: auto;
  border-radius: 8px;
  margin-bottom: 12px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background: var(--tg-theme-button-color);
  color: var(--tg-theme-button-text-color);
  cursor: pointer;
  font-weight: bold;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ShareModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--tg-theme-bg-color);
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 300px;
  z-index: 1001;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
`;

const AnimeSearch = ({ onAddToList }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [friendId, setFriendId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const debouncedSearch = useCallback(
    debounce(async (term) => {
      if (term.length >= 2) {
        setIsLoading(true);
        setError(null);
        try {
          console.log('Searching for:', term);
          const results = await searchAnime(term);
          console.log('Search results:', results);
          setSuggestions(results);
          setShowSuggestions(true);
        } catch (err) {
          console.error('Search error:', err);
          setError('Failed to search anime');
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500),
    []
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.length >= 2) {
      console.log('Triggering search for:', value);
      debouncedSearch(value);
    }
  };

  const handleSelectAnime = async (animeId) => {
    const details = await getAnimeDetails(animeId);
    setSelectedAnime(details);
    setShowSuggestions(false);
    setSearchTerm('');
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleSendToFriend = async () => {
    if (!friendId.trim() || !selectedAnime) return;

    try {
      // Here you would implement the logic to send the recommendation
      // to the friend using their ID
      console.log('Sending recommendation to friend:', friendId);
      setShowShareModal(false);
      setFriendId('');
    } catch (error) {
      console.error('Error sending recommendation:', error);
    }
  };

  return (
    <>
      <SearchContainer>
        <Input
          type="text"
          placeholder="Search anime..."
          value={searchTerm}
          onChange={handleInputChange}
          showSuggestions={showSuggestions && suggestions.length > 0}
        />
        {isLoading && <div>Loading...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {showSuggestions && suggestions.length > 0 && (
          <SuggestionsList>
            {suggestions.map((anime) => (
              <SuggestionItem key={anime.id} onClick={() => handleSelectAnime(anime.id)}>
                <AnimeImage src={anime.image} alt={anime.title} />
                <AnimeInfo>
                  <Title>{anime.title}</Title>
                  <Score>Score: {anime.score || 'N/A'}</Score>
                </AnimeInfo>
              </SuggestionItem>
            ))}
          </SuggestionsList>
        )}
      </SearchContainer>

      {selectedAnime && (
        <DetailedAnimeCard>
          <DetailedImage src={selectedAnime.image} alt={selectedAnime.title} />
          <Title>{selectedAnime.title}</Title>
          <Score>Score: {selectedAnime.score || 'N/A'}</Score>
          <div>{selectedAnime.synopsis}</div>
          <ButtonGroup>
            <ActionButton onClick={() => onAddToList(selectedAnime.title, 'watching')}>
              Add to Watching
            </ActionButton>
            <ActionButton onClick={() => onAddToList(selectedAnime.title, 'planned')}>
              Plan to Watch
            </ActionButton>
            <ActionButton onClick={handleShare}>
              Share
            </ActionButton>
          </ButtonGroup>
        </DetailedAnimeCard>
      )}

      {showShareModal && (
        <>
          <Overlay onClick={() => setShowShareModal(false)} />
          <ShareModal>
            <h3>Share with Friend</h3>
            <Input
              type="text"
              placeholder="Enter friend's ID"
              value={friendId}
              onChange={(e) => setFriendId(e.target.value)}
            />
            <ButtonGroup>
              <ActionButton onClick={handleSendToFriend}>Send</ActionButton>
              <ActionButton onClick={() => setShowShareModal(false)}>Cancel</ActionButton>
            </ButtonGroup>
          </ShareModal>
        </>
      )}
    </>
  );
};

export default AnimeSearch; 