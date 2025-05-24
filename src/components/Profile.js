import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { getUser, uploadAvatar } from '../utils/api';

const ProfileContainer = styled.div`
  padding: 20px;
  background: var(--tg-theme-bg-color);
  color: var(--tg-theme-text-color);
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 30px;
`;

const AvatarContainer = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  margin-right: 20px;
  cursor: pointer;

  &:hover .avatar-overlay {
    opacity: 1;
  }
`;

const AvatarImage = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: ${props => props.src ? `url(${props.src})` : 'var(--tg-theme-secondary-bg-color)'};
  background-size: cover;
  background-position: center;
`;

const AvatarOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const Username = styled.h2`
  margin: 0;
  color: var(--tg-theme-text-color);
  font-size: 24px;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-top: 20px;
`;

const StatCard = styled.div`
  background: var(--tg-theme-secondary-bg-color);
  padding: 15px;
  border-radius: 8px;
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: var(--tg-theme-text-color);
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: var(--tg-theme-hint-color);
  margin-top: 5px;
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
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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
        setUploadingAvatar(true);
        const updatedUser = await uploadAvatar(telegramId, file);
        setUser(updatedUser);
      } catch (error) {
        console.error('Error uploading avatar:', error);
      } finally {
        setUploadingAvatar(false);
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
    return (
      <ProfileContainer>
        <div style={{ textAlign: 'center' }}>Loading...</div>
      </ProfileContainer>
    );
  }

  if (!user) {
    return (
      <ProfileContainer>
        <div style={{ textAlign: 'center' }}>User not found</div>
      </ProfileContainer>
    );
  }

  const stats = {
    watching: user.animeList?.filter(anime => anime.status === 'watching').length || 0,
    completed: user.animeList?.filter(anime => anime.status === 'completed').length || 0,
    planned: user.animeList?.filter(anime => anime.status === 'planned').length || 0
  };

  const watchedAnime = user.animeList?.filter(anime => anime.status === 'completed') || [];
  const plannedAnime = user.animeList?.filter(anime => anime.status === 'planned') || [];
  const watchingAnime = user.animeList?.filter(anime => anime.status === 'watching') || [];

  return (
    <ProfileContainer>
      <ProfileHeader>
        <AvatarContainer>
          <label htmlFor="avatar-upload" style={{ cursor: 'pointer', display: 'block' }}>
            <AvatarImage src={user.avatarUrl} />
            <AvatarOverlay className="avatar-overlay">
              {uploadingAvatar ? 'Uploading...' : 'Change Photo'}
            </AvatarOverlay>
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            style={{ display: 'none' }}
          />
        </AvatarContainer>
        <UserInfo>
          <Username>{user.username || 'Anonymous'}</Username>
          <div style={{ color: 'var(--tg-theme-hint-color)' }}>
            ID: {user.telegramId}
          </div>
        </UserInfo>
      </ProfileHeader>

      <Stats>
        <StatCard>
          <StatNumber>{stats.watching}</StatNumber>
          <StatLabel>Watching</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.completed}</StatNumber>
          <StatLabel>Completed</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.planned}</StatNumber>
          <StatLabel>Plan to Watch</StatLabel>
        </StatCard>
      </Stats>

      <ProfileId onClick={handleCopyProfileId}>
        Profile ID: {user.profileId}
      </ProfileId>

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

      {user.recommendations?.length > 0 && (
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