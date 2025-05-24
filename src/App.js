import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { createUser, updateAnimeList } from './utils/api';
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
  const webApp = window.Telegram?.WebApp;

  const initUser = useCallback(async () => {
    if (!webApp?.initDataUnsafe?.user) {
      console.warn('No user data in WebApp init data');
      return;
    }

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
  }, [webApp]);

  useEffect(() => {
    if (webApp) {
      console.log('WebApp is available, calling ready()');
      webApp.ready();
      initUser();
    }
  }, [webApp, initUser]);

  const handleAddToList = async (anime, status) => {
    try {
      if (!user) {
        console.error('No user data available');
        return;
      }

      const updatedList = [...animeList, { title: anime.title, status }];
      const result = await updateAnimeList(user.id, updatedList);
      
      if (result.success) {
        setAnimeList(updatedList);
      }
    } catch (error) {
      console.error('Error adding anime to list:', error);
    }
  };

  const handleStatusChange = async (title, newStatus) => {
    try {
      if (!user) {
        console.error('No user data available');
        return;
      }

      const updatedList = animeList.map(item =>
        item.title === title ? { ...item, status: newStatus } : item
      );

      const result = await updateAnimeList(user.id, updatedList);
      
      if (result.success) {
        setAnimeList(updatedList);
      }
    } catch (error) {
      console.error('Error updating anime status:', error);
    }
  };

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
