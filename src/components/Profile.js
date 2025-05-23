import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { getUser, uploadAvatar } from '../utils/api';

const ProfileContainer = styled.div`
  padding: 20px;
  background: var(--tg-theme-bg-color);
  color: var(--tg-theme-text-color);
`;

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 20px;
  background: var(--tg-theme-secondary-bg-color);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Stats = styled.div`
  display: flex;
  justify-content: space-around;
  margin: 20px 0;
  
  div {
    text-align: center;
    
    span {
      display: block;
      font-size: 24px;
      font-weight: bold;
      color: var(--tg-theme-button-color);
    }
  }
`;

const ProfileId = styled.div`
  text-align: center;
  padding: 10px;
  background: var(--tg-theme-secondary-bg-color);
  border-radius: 8px;
  margin: 10px 0;
  font-family: monospace;
  cursor: pointer;
`;

const Section = styled.div`
  margin: 20px 0;
  
  h3 {
    color: var(--tg-theme-button-color);
    margin-bottom: 10px;
  }
`;

const AnimeItem = styled.div`
  background: var(--tg-theme-secondary-bg-color);
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
  
  .title {
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .date {
    font-size: 12px;
    color: var(--tg-theme-hint-color);
  }
`;

const Profile = ({ telegramId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = useCallback(async () => {
    try {
      const userData = await getUser(telegramId);
      setUser(userData);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }, [telegramId]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const updatedUser = await uploadAvatar(telegramId, file);
        setUser(updatedUser);
      } catch (error) {
        console.error('Error uploading avatar:', error);
      }
    }
  };

  const handleCopyProfileId = () => {
    if (user?.profileId) {
      navigator.clipboard.writeText(user.profileId);
      // You could add a toast notification here
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  const watchedAnime = user.animeList.filter(anime => anime.status === 'completed');
  const plannedAnime = user.animeList.filter(anime => anime.status === 'planned');
  const watchingAnime = user.animeList.filter(anime => anime.status === 'watching');

  return (
    <ProfileContainer>
      <Avatar>
        {user?.avatar ? (
          <img src={user.avatar} alt="Profile" />
        ) : (
          <label htmlFor="avatar-upload" style={{ cursor: 'pointer', display: 'block', height: '100%' }}>
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Upload
            </div>
          </label>
        )}
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onChange={handleAvatarUpload}
          style={{ display: 'none' }}
        />
      </Avatar>

      <h2 style={{ textAlign: 'center' }}>{user?.username}</h2>
      
      <ProfileId onClick={handleCopyProfileId}>
        Profile ID: {user?.profileId}
      </ProfileId>

      <Stats>
        <div>
          <span>{watchedAnime.length}</span>
          Watched
        </div>
        <div>
          <span>{watchingAnime.length}</span>
          Watching
        </div>
        <div>
          <span>{plannedAnime.length}</span>
          Plan to Watch
        </div>
      </Stats>

      <Section>
        <h3>Currently Watching</h3>
        {watchingAnime.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--tg-theme-hint-color)' }}>
            Not watching anything right now
          </div>
        ) : (
          watchingAnime.map((anime, index) => (
            <AnimeItem key={index}>
              <div className="title">{anime.title}</div>
              <div className="date">Started: {new Date(anime.addedAt).toLocaleDateString()}</div>
            </AnimeItem>
          ))
        )}
      </Section>

      <Section>
        <h3>Completed</h3>
        {watchedAnime.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--tg-theme-hint-color)' }}>
            Haven't completed any anime yet
          </div>
        ) : (
          watchedAnime.map((anime, index) => (
            <AnimeItem key={index}>
              <div className="title">{anime.title}</div>
              <div className="date">Completed: {new Date(anime.addedAt).toLocaleDateString()}</div>
            </AnimeItem>
          ))
        )}
      </Section>

      <Section>
        <h3>Plan to Watch</h3>
        {plannedAnime.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--tg-theme-hint-color)' }}>
            No planned anime yet
          </div>
        ) : (
          plannedAnime.map((anime, index) => (
            <AnimeItem key={index}>
              <div className="title">{anime.title}</div>
              <div className="date">Added: {new Date(anime.addedAt).toLocaleDateString()}</div>
            </AnimeItem>
          ))
        )}
      </Section>

      {user.recommendations && user.recommendations.length > 0 && (
        <Section>
          <h3>Shared Recommendations</h3>
          {user.recommendations.map((rec, index) => (
            <AnimeItem key={index}>
              <div className="title">{rec.title}</div>
              <div className="date">Shared: {new Date(rec.sharedAt).toLocaleDateString()}</div>
            </AnimeItem>
          ))}
        </Section>
      )}
    </ProfileContainer>
  );
};

export default Profile; 