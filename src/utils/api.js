const API_BASE_URL = '/api';

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: `HTTP error! status: ${response.status}`
    }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const createUser = async (telegramId, username) => {
  if (!telegramId) {
    throw new Error('Telegram ID is required');
  }

  try {
    console.log('Creating user:', { telegramId, username });
    const response = await fetch(`${API_BASE_URL}/user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        telegramId: telegramId.toString(),
        username: username || 'Anonymous'
      })
    });
    const data = await handleResponse(response);
    console.log('Create user response:', data);
    return data;
  } catch (error) {
    console.error('Error in createUser:', error);
    throw error;
  }
};

export const getUser = async (telegramId) => {
  if (!telegramId) {
    throw new Error('Telegram ID is required');
  }

  try {
    console.log('Getting user:', telegramId);
    const response = await fetch(`${API_BASE_URL}/user/${telegramId}`);
    const data = await handleResponse(response);
    console.log('Get user response:', data);
    return data;
  } catch (error) {
    console.error('Error in getUser:', error);
    throw error;
  }
};

export const uploadAvatar = async (telegramId, file) => {
  if (!telegramId || !file) {
    throw new Error('Both Telegram ID and file are required');
  }

  try {
    console.log('Uploading avatar for:', telegramId);
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await fetch(`${API_BASE_URL}/user/avatar/${telegramId}`, {
      method: 'POST',
      body: formData
    });
    const data = await handleResponse(response);
    console.log('Upload avatar response:', data);
    return data;
  } catch (error) {
    console.error('Error in uploadAvatar:', error);
    throw error;
  }
};

export const updateAnimeList = async (telegramId, title, status) => {
  if (!telegramId || !title || !status) {
    throw new Error('Telegram ID, title and status are required');
  }

  try {
    console.log('Updating anime list:', { telegramId, title, status });
    const response = await fetch(`${API_BASE_URL}/user/anime/${telegramId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, status })
    });
    const data = await handleResponse(response);
    console.log('Update anime list response:', data);
    return data;
  } catch (error) {
    console.error('Error in updateAnimeList:', error);
    throw error;
  }
};

export const getUserByProfileId = async (profileId) => {
  if (!profileId) {
    throw new Error('Profile ID is required');
  }

  try {
    console.log('Getting user by profile ID:', profileId);
    const response = await fetch(`${API_BASE_URL}/profile/${profileId}`);
    const data = await handleResponse(response);
    console.log('Get user by profile ID response:', data);
    return data;
  } catch (error) {
    console.error('Error in getUserByProfileId:', error);
    throw error;
  }
};

export const addRecommendation = async (telegramId, animeTitle, comment) => {
  if (!telegramId || !animeTitle) {
    throw new Error('Telegram ID and anime title are required');
  }

  try {
    console.log('Adding recommendation:', { telegramId, animeTitle, comment });
    const response = await fetch(`${API_BASE_URL}/recommendations/${telegramId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ animeTitle, comment })
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error in addRecommendation:', error);
    throw error;
  }
}; 