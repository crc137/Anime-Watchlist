import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { createUser, updateAnimeList, getUser } from './utils/api';
import Profile from './components/Profile';
import AnimeSearch from './components/AnimeSearch';

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: var(--tg-theme-bg-color);
  color: var(--tg-theme-text-color);
  min-height: 100vh;
  padding-bottom: 60px;
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
              <AnimeItem key={index}>
                <span>{anime.title}</span>
                <StatusButton
                  status={anime.status}
                  onClick={() => handleStatusChange(
                    anime.title,
                    anime.status === 'planned' ? 'watching' :
                    anime.status === 'watching' ? 'completed' : 'planned'
                  )}
                >
                  {anime.status}
                </StatusButton>
              </AnimeItem>
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

function App() {
  return <AppContent />;
}

export default App;
