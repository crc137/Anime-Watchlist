import React, { useState } from 'react';
import styled from 'styled-components';
import { uploadAvatar } from '../utils/api';

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
  width: 100px;
  height: 100px;
  margin-right: 20px;
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;
  background: var(--tg-theme-secondary-bg-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

  &:hover .avatar-overlay {
    opacity: 1;
  }
`;

const AvatarImage = styled.div`
  width: 100%;
  height: 100%;
  background: ${props => props.src ? `url(${props.src})` : 'var(--tg-theme-secondary-bg-color)'};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--tg-theme-hint-color);
  font-size: 40px;

  &::after {
    content: '${props => !props.src ? "+" : ""}';
  }
`;

const AvatarOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.2s;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const Username = styled.h2`
  margin: 0;
  color: var(--tg-theme-text-color);
  font-size: 24px;
  margin-bottom: 5px;
`;

const UserStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-top: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: var(--tg-theme-secondary-bg-color);
  padding: 15px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const StatNumber = styled.div`
  font-size: 28px;
  font-weight: bold;
  color: var(--tg-theme-text-color);
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: var(--tg-theme-hint-color);
`;

const AnimeListSection = styled.div`
  margin: 20px 0;
`;

const SectionTitle = styled.h3`
  color: var(--tg-theme-text-color);
  margin-bottom: 15px;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const AnimeCard = styled.div`
  background: var(--tg-theme-secondary-bg-color);
  border-radius: 12px;
  margin-bottom: 15px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
`;

const AnimeImage = styled.img`
  width: 100px;
  height: 140px;
  object-fit: cover;
`;

const AnimeInfo = styled.div`
  padding: 15px;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const AnimeTitle = styled.div`
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 8px;
`;

const AnimeDetails = styled.div`
  font-size: 14px;
  color: var(--tg-theme-hint-color);
  margin-bottom: 10px;
`;

const StatusBadge = styled.div`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => 
    props.status === 'watching' ? '#ffd700' :
    props.status === 'completed' ? '#4caf50' :
    props.status === 'planned' ? '#2196f3' : 'var(--tg-theme-button-color)'
  };
  color: white;
  margin-top: auto;
`;

const EmptyMessage = styled.div`
  text-align: center;
  color: var(--tg-theme-hint-color);
  padding: 30px;
  background: var(--tg-theme-secondary-bg-color);
  border-radius: 12px;
  margin: 10px 0;
`;

const Profile = ({ user, animeList }) => {
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (file && currentUser?.telegramId) {
      try {
        setUploadingAvatar(true);
        const updatedUser = await uploadAvatar(currentUser.telegramId, file);
        setCurrentUser(updatedUser);
      } catch (error) {
        console.error('Error uploading avatar:', error);
      } finally {
        setUploadingAvatar(false);
      }
    }
  };

  if (!currentUser) {
    return (
      <ProfileContainer>
        <EmptyMessage>User not found</EmptyMessage>
      </ProfileContainer>
    );
  }

  const stats = {
    watching: animeList?.filter(anime => anime.status === 'watching').length || 0,
    completed: animeList?.filter(anime => anime.status === 'completed').length || 0,
    planned: animeList?.filter(anime => anime.status === 'planned').length || 0
  };

  const watchingAnime = animeList?.filter(anime => anime.status === 'watching') || [];
  const completedAnime = animeList?.filter(anime => anime.status === 'completed') || [];
  const plannedAnime = animeList?.filter(anime => anime.status === 'planned') || [];

  return (
    <ProfileContainer>
      <ProfileHeader>
        <AvatarContainer>
          <label htmlFor="avatar-upload" style={{ cursor: 'pointer', display: 'block', height: '100%' }}>
            <AvatarImage src={currentUser.avatar} />
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
          <Username>{currentUser.username || 'Anonymous'}</Username>
          <div style={{ color: 'var(--tg-theme-hint-color)' }}>
            Profile ID: {currentUser.profileId}
          </div>
        </UserInfo>
      </ProfileHeader>

      <UserStats>
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
      </UserStats>

      <AnimeListSection>
        <SectionTitle>Currently Watching</SectionTitle>
        {watchingAnime.length === 0 ? (
          <EmptyMessage>Not watching anything right now</EmptyMessage>
        ) : (
          watchingAnime.map((anime, index) => (
            <AnimeCard key={index}>
              <AnimeImage src={anime.image || 'https://via.placeholder.com/100x140'} alt={anime.title} />
              <AnimeInfo>
                <AnimeTitle>{anime.title}</AnimeTitle>
                <AnimeDetails>
                  {anime.episodes && `Episodes: ${anime.episodes}`}
                  {anime.score && ` • Score: ${anime.score}`}
                </AnimeDetails>
                <StatusBadge status="watching">Watching</StatusBadge>
              </AnimeInfo>
            </AnimeCard>
          ))
        )}
      </AnimeListSection>

      <AnimeListSection>
        <SectionTitle>Completed</SectionTitle>
        {completedAnime.length === 0 ? (
          <EmptyMessage>Haven't completed any anime yet</EmptyMessage>
        ) : (
          completedAnime.map((anime, index) => (
            <AnimeCard key={index}>
              <AnimeImage src={anime.image || 'https://via.placeholder.com/100x140'} alt={anime.title} />
              <AnimeInfo>
                <AnimeTitle>{anime.title}</AnimeTitle>
                <AnimeDetails>
                  {anime.episodes && `Episodes: ${anime.episodes}`}
                  {anime.score && ` • Score: ${anime.score}`}
                </AnimeDetails>
                <StatusBadge status="completed">Completed</StatusBadge>
              </AnimeInfo>
            </AnimeCard>
          ))
        )}
      </AnimeListSection>

      <AnimeListSection>
        <SectionTitle>Plan to Watch</SectionTitle>
        {plannedAnime.length === 0 ? (
          <EmptyMessage>No planned anime yet</EmptyMessage>
        ) : (
          plannedAnime.map((anime, index) => (
            <AnimeCard key={index}>
              <AnimeImage src={anime.image || 'https://via.placeholder.com/100x140'} alt={anime.title} />
              <AnimeInfo>
                <AnimeTitle>{anime.title}</AnimeTitle>
                <AnimeDetails>
                  {anime.episodes && `Episodes: ${anime.episodes}`}
                  {anime.score && ` • Score: ${anime.score}`}
                </AnimeDetails>
                <StatusBadge status="planned">Plan to Watch</StatusBadge>
              </AnimeInfo>
            </AnimeCard>
          ))
        )}
      </AnimeListSection>
    </ProfileContainer>
  );
};

export default Profile; 