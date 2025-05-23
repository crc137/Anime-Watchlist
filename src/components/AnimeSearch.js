import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { searchAnime, getAnimeDetails } from '../utils/animeApi';
import debounce from 'lodash/debounce';

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

const SuggestionsContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--tg-theme-secondary-bg-color);
  border-radius: 0 0 8px 8px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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

const AnimeTitle = styled.div`
  font-weight: bold;
  margin-bottom: 4px;
`;

const AnimeDetails = styled.div`
  font-size: 0.9em;
  color: var(--tg-theme-hint-color);
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const ActionButton = styled.button`
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  background: var(--tg-theme-button-color);
  color: var(--tg-theme-button-text-color);
  cursor: pointer;
  font-weight: bold;
  flex: 1;

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
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 2000;
  width: 90%;
  max-width: 400px;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1999;
`;

const AnimeSearch = ({ onAddToList }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareProfileId, setShareProfileId] = useState('');

  const debouncedSearch = useCallback(
    debounce(async (term) => {
      if (term.length >= 2) {
        const results = await searchAnime(term);
        setSuggestions(results);
      } else {
        setSuggestions([]);
      }
    }, 300),
    []
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleSelectAnime = async (animeId) => {
    const details = await getAnimeDetails(animeId);
    setSelectedAnime(details);
    setSuggestions([]);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleShareSubmit = async () => {
    if (!shareProfileId || !selectedAnime) return;

    try {
      // Call your API to share the anime
      await fetch(`/api/recommendations/${shareProfileId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          animeTitle: selectedAnime.title,
          comment: `Shared by user`
        })
      });

      setShowShareModal(false);
      setShareProfileId('');
      // Show success message
    } catch (error) {
      console.error('Error sharing anime:', error);
      // Show error message
    }
  };

  return (
    <SearchContainer>
      <Input
        type="text"
        placeholder="Search anime..."
        value={searchTerm}
        onChange={handleInputChange}
        showSuggestions={suggestions.length > 0}
      />

      {suggestions.length > 0 && (
        <SuggestionsContainer>
          {suggestions.map((anime) => (
            <SuggestionItem key={anime.id} onClick={() => handleSelectAnime(anime.id)}>
              <AnimeImage src={anime.image} alt={anime.title} />
              <AnimeInfo>
                <AnimeTitle>{anime.title}</AnimeTitle>
                <AnimeDetails>
                  {anime.type} • {anime.episodes} episodes • Score: {anime.score}
                </AnimeDetails>
              </AnimeInfo>
            </SuggestionItem>
          ))}
        </SuggestionsContainer>
      )}

      {selectedAnime && (
        <div style={{ marginTop: '20px' }}>
          <AnimeTitle>{selectedAnime.title}</AnimeTitle>
          <AnimeImage 
            src={selectedAnime.image} 
            alt={selectedAnime.title} 
            style={{ width: '100%', height: '200px', objectFit: 'cover' }}
          />
          <p>{selectedAnime.synopsis}</p>
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
        </div>
      )}

      {showShareModal && (
        <>
          <Overlay onClick={() => setShowShareModal(false)} />
          <ShareModal>
            <h3>Share Anime</h3>
            <Input
              type="text"
              placeholder="Enter friend's profile ID"
              value={shareProfileId}
              onChange={(e) => setShareProfileId(e.target.value)}
            />
            <ButtonGroup>
              <ActionButton onClick={handleShareSubmit}>Share</ActionButton>
              <ActionButton onClick={() => setShowShareModal(false)}>Cancel</ActionButton>
            </ButtonGroup>
          </ShareModal>
        </>
      )}
    </SearchContainer>
  );
};

export default AnimeSearch; 