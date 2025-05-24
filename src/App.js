import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { createUser, updateAnimeList, getUser } from './utils/api';
import Profile from './components/Profile';
import AnimeSearch from './components/AnimeSearch';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: var(--tg-theme-bg-color);
  color: var(--tg-theme-text-color);
  min-height: 100vh;
  padding-bottom: 80px;
`;

const AnimeList = styled.div`
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
`;

const AnimeCard = styled.div`
  background: var(--tg-theme-secondary-bg-color);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const AnimeImage = styled.div`
  width: 100%;
  height: 150px;
  background: ${props => props.image ? `url(${props.image})` : 'var(--tg-theme-secondary-bg-color)'};
  background-size: cover;
  background-position: center;
`;

const AnimeInfo = styled.div`
  padding: 15px;
`;

const AnimeTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  color: var(--tg-theme-text-color);
  margin-bottom: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StatusBadge = styled.div`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => 
    props.status === 'watching' ? '#ffd700' :
    props.status === 'completed' ? '#4caf50' :
    props.status === 'planned' ? '#2196f3' : 'var(--tg-theme-button-color)'
  };
  color: ${props => props.status === 'watching' ? '#000' : '#fff'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    filter: brightness(1.1);
  }
`;

const AnimeDetails = styled.div`
  font-size: 14px;
  color: var(--tg-theme-hint-color);
  margin-bottom: 10px;
`;

const BottomNavigation = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: var(--tg-theme-bg-color);
  border-top: 1px solid var(--tg-theme-hint-color);
  backdrop-filter: blur(10px);
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: ${props => props.active ? 'var(--tg-theme-button-color)' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

function AppContent() {
  const [activeTab, setActiveTab] = useState('main');
  const [animeList, setAnimeList] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Получаем Telegram WebApp из глобального объекта
  const webApp = window.Telegram?.WebApp;

  useEffect(() => {
    // Проверяем доступность Telegram WebApp
    if (!webApp) {
      console.error('Telegram WebApp is not available');
      setError('Please open this app through Telegram.');
      setIsLoading(false);
      return;
    }

    // Активируем WebApp
    webApp.ready();

    // Получаем данные пользователя
    const initData = webApp.initDataUnsafe;
    if (!initData || !initData.user) {
      console.error('No user data in WebApp init data:', initData);
      setError('Could not get user data. Please try again.');
      setIsLoading(false);
      return;
    }

    // Инициализируем пользователя
    const initUser = async () => {
      try {
        const telegramId = initData.user.id.toString();
        console.log('Telegram user ID:', telegramId);
        
        // Пробуем получить существующего пользователя
        let userData;
        try {
          userData = await getUser(telegramId);
          console.log('Found existing user:', userData);
        } catch (error) {
          // Если пользователь не найден, создаем нового
          if (error.message.includes('404')) {
            console.log('Creating new user...');
            userData = await createUser(
              telegramId,
              initData.user.username || 'Anonymous'
            );
            console.log('Created new user:', userData);
          } else {
            throw error;
          }
        }

        setUser(userData);
        setAnimeList(userData.animeList || []);
      } catch (error) {
        console.error('Error initializing user:', error);
        setError('Failed to initialize user. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    initUser();
  }, [webApp]);

  const handleAddToList = async (anime, status) => {
    try {
      if (!user) {
        setError('Please log in to add anime to your list');
        return;
      }

      if (!anime || !anime.title || !status) {
        console.error('Missing required parameters:', { anime, status });
        return;
      }

      console.log('Adding anime to list:', { anime, status, telegramId: user.telegramId });
      const result = await updateAnimeList(user.telegramId, anime.title, status);
      
      if (result.success) {
        const updatedList = [...animeList, {
          title: anime.title,
          status,
          addedAt: new Date(),
          image: anime.image,
          episodes: anime.episodes,
          score: anime.score,
          synopsis: anime.synopsis
        }];
        setAnimeList(updatedList);
      }
    } catch (error) {
      console.error('Error adding anime to list:', error);
      setError('Failed to add anime to list. Please try again.');
    }
  };

  const handleStatusChange = async (title, newStatus) => {
    try {
      if (!user) {
        setError('Please log in to update anime status');
        return;
      }

      const result = await updateAnimeList(user.telegramId, title, newStatus);
      
      if (result.success) {
        const updatedList = animeList.map(item =>
          item.title === title ? { ...item, status: newStatus } : item
        );
        setAnimeList(updatedList);
      }
    } catch (error) {
      console.error('Error updating anime status:', error);
      setError('Failed to update anime status. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>
          {error}
          <br />
          <small style={{ color: 'var(--tg-theme-hint-color)' }}>
            {webApp ? 'WebApp is available' : 'WebApp is not available'}
          </small>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      {activeTab === 'main' ? (
        <>
          <AnimeSearch onAddToList={handleAddToList} />
          <AnimeList>
            {animeList.map((anime, index) => (
              <AnimeCard key={index}>
                <AnimeImage image={anime.image} />
                <AnimeInfo>
                  <AnimeTitle>{anime.title}</AnimeTitle>
                  <AnimeDetails>
                    {anime.episodes && `Episodes: ${anime.episodes}`}
                    {anime.score && ` • Score: ${anime.score}`}
                  </AnimeDetails>
                  <StatusBadge
                    status={anime.status}
                    onClick={() => handleStatusChange(
                      anime.title,
                      anime.status === 'planned' ? 'watching' :
                      anime.status === 'watching' ? 'completed' : 'planned'
                    )}
                  >
                    {anime.status.charAt(0).toUpperCase() + anime.status.slice(1)}
                  </StatusBadge>
                </AnimeInfo>
              </AnimeCard>
            ))}
          </AnimeList>
        </>
      ) : (
        <Profile user={user} animeList={animeList} />
      )}
      
      <BottomNavigation>
        <NavButton
          active={activeTab === 'main'}
          onClick={() => setActiveTab('main')}
        >
          <span role="img" aria-label="home">🏠</span>
          Main
        </NavButton>
        <NavButton
          active={activeTab === 'profile'}
          onClick={() => setActiveTab('profile')}
        >
          <span role="img" aria-label="profile">👤</span>
          Profile
        </NavButton>
      </BottomNavigation>
    </Container>
  );
}

function App() {
  return <AppContent />;
}

export default App;
