import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { WebApp } from '@vkruglikov/react-telegram-web-app';
import { createUser, updateAnimeList } from './utils/api';
import Profile from './components/Profile';
import debounce from 'lodash/debounce';

// Move mock database outside component
const MOCK_ANIME_DATABASE = [
  "Naruto",
  "One Piece",
  "Attack on Titan",
  "Death Note",
  "My Hero Academia",
  "Demon Slayer",
  "Dragon Ball",
  "Fullmetal Alchemist",
  "Tokyo Ghoul",
  "Sword Art Online"
];

// Create debounced search function outside component
const createDebouncedSearch = (callback) => 
  debounce((searchTerm) => callback(searchTerm), 300);

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: var(--tg-theme-bg-color);
  color: var(--tg-theme-text-color);
  min-height: 100vh;
  padding-bottom: 60px; /* Space for bottom navigation */
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: none;
  border-radius: 8px;
  background: var(--tg-theme-secondary-bg-color);
  color: var(--tg-theme-text-color);
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: var(--tg-theme-button-color);
  color: var(--tg-theme-button-text-color);
  margin-bottom: 10px;
  cursor: pointer;
  font-weight: bold;
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const AnimeList = styled.div`
  margin-top: 20px;
`;

const AnimeItem = styled.div`
  background: var(--tg-theme-secondary-bg-color);
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StatusButton = styled.button`
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  background: ${props => 
    props.status === 'watching' ? '#ffd700' :
    props.status === 'completed' ? '#4caf50' :
    props.status === 'planned' ? '#2196f3' : 'var(--tg-theme-button-color)'
  };
  color: white;
  cursor: pointer;
  font-weight: bold;
`;

const BottomNavigation = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: var(--tg-theme-bg-color);
  border-top: 1px solid var(--tg-theme-hint-color);
  z-index: 1000;
`;

const NavButton = styled.button`
  flex: 1;
  padding: 15px;
  border: none;
  background: ${props => props.active ? 'var(--tg-theme-button-color)' : 'transparent'};
  color: ${props => props.active ? 'var(--tg-theme-button-text-color)' : 'var(--tg-theme-text-color)'};
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
`;

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 20px;
`;

const SuggestionsContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--tg-theme-secondary-bg-color);
  border-radius: 8px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const SuggestionItem = styled.div`
  padding: 10px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: var(--tg-theme-bg-color);
  }
`;

function App() {
  const [activeTab, setActiveTab] = useState('main');
  const [animeTitle, setAnimeTitle] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [animeList, setAnimeList] = useState([]);
  const [user, setUser] = useState(null);
  const webApp = WebApp();

  const getFilteredSuggestions = useCallback((searchTerm) => {
    if (searchTerm.length >= 2) {
      return MOCK_ANIME_DATABASE.filter(anime =>
        anime.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5);
    }
    return [];
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    createDebouncedSearch((searchTerm) => {
      setSuggestions(getFilteredSuggestions(searchTerm));
    }),
    [getFilteredSuggestions]
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setAnimeTitle(value);
    debouncedSearch(value);
  };

  const handleSuggestionClick = (suggestion) => {
    setAnimeTitle(suggestion);
    setSuggestions([]);
  };

  useEffect(() => {
    const initUser = async () => {
      console.log('WebApp init data:', webApp?.initDataUnsafe);
      if (webApp?.initDataUnsafe?.user) {
        try {
          console.log('Initializing user with data:', webApp.initDataUnsafe.user);
          const userData = await createUser(
            webApp.initDataUnsafe.user.id.toString(),
            webApp.initDataUnsafe.user.username || 'Anonymous'
          );
          console.log('User data received:', userData);
          setUser(userData);
          setAnimeList(userData.animeList || []);
        } catch (error) {
          console.error('Error initializing user:', error);
        }
      } else {
        console.warn('No user data in WebApp init data');
      }
    };

    if (webApp) {
      console.log('WebApp is available, calling ready()');
      webApp.ready();
      initUser();
    } else {
      console.warn('WebApp is not available');
    }
  }, [webApp]);

  const handleAddAnime = async () => {
    if (!animeTitle.trim() || !user) return;

    try {
      const updatedUser = await updateAnimeList(user.telegramId, animeTitle, 'planned');
      setAnimeList(updatedUser.animeList);
      setAnimeTitle('');
    } catch (error) {
      console.error('Error adding anime:', error);
    }
  };

  const handleStatusChange = async (title, newStatus) => {
    if (!user) return;

    try {
      const updatedUser = await updateAnimeList(user.telegramId, title, newStatus);
      setAnimeList(updatedUser.animeList);
    } catch (error) {
      console.error('Error updating anime status:', error);
    }
  };

  console.log('Current state:', { activeTab, user, animeList });

  return (
    <Container>
      {activeTab === 'main' && (
        <>
          <SearchContainer>
            <Input
              type="text"
              placeholder="Enter anime title"
              value={animeTitle}
              onChange={handleInputChange}
              onBlur={() => {
                // Delay hiding suggestions to allow click events
                setTimeout(() => setSuggestions([]), 200);
              }}
            />
            {suggestions.length > 0 && (
              <SuggestionsContainer>
                {suggestions.map((suggestion, index) => (
                  <SuggestionItem
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </SuggestionItem>
                ))}
              </SuggestionsContainer>
            )}
          </SearchContainer>
          <Button onClick={handleAddAnime} disabled={!animeTitle.trim()}>
            Add to List
          </Button>

          <AnimeList>
            {animeList.length === 0 ? (
              <div style={{ textAlign: 'center', marginTop: '20px', color: 'var(--tg-theme-hint-color)' }}>
                Your watchlist is empty. Add some anime to watch!
              </div>
            ) : (
              animeList.map((anime, index) => (
                <AnimeItem key={index}>
                  <div>{anime.title}</div>
                  <div>
                    <StatusButton
                      status={anime.status}
                      onClick={() => {
                        const nextStatus = {
                          planned: 'watching',
                          watching: 'completed',
                          completed: 'planned'
                        }[anime.status];
                        handleStatusChange(anime.title, nextStatus);
                      }}
                    >
                      {anime.status}
                    </StatusButton>
                  </div>
                </AnimeItem>
              ))
            )}
          </AnimeList>
        </>
      )}

      {activeTab === 'profile' && user && (
        <Profile telegramId={user.telegramId} />
      )}

      <BottomNavigation>
        <NavButton 
          active={activeTab === 'main'} 
          onClick={() => setActiveTab('main')}
        >
          Main
        </NavButton>
        <NavButton 
          active={activeTab === 'profile'} 
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </NavButton>
      </BottomNavigation>
    </Container>
  );
}

export default App;
