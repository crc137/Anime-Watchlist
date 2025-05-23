// Using Jikan API (MyAnimeList unofficial API)
const API_BASE_URL = 'https://api.jikan.moe/v4';

export const searchAnime = async (query) => {
  if (!query || query.trim() === '') {
    return [];
  }
  
  try {
    // Add a small delay to prevent API rate limiting issues
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const response = await fetch(`${API_BASE_URL}/anime?q=${encodeURIComponent(query)}&limit=5`);
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    
    // Transform the response to our format
    return data.data.map(anime => ({
      id: anime.mal_id,
      title: anime.title,
      image: anime.images.jpg.image_url,
      year: anime.year || 'Unknown',
      score: anime.score || 'N/A',
      synopsis: anime.synopsis || 'No description available'
    }));
  } catch (error) {
    console.error('Error fetching anime data:', error);
    return [];
  }
};

export const getAnimeDetails = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/anime/${id}`);
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    
    return {
      id: data.data.mal_id,
      title: data.data.title,
      image: data.data.images.jpg.image_url,
      year: data.data.year || 'Unknown',
      score: data.data.score || 'N/A',
      synopsis: data.data.synopsis || 'No description available',
      episodes: data.data.episodes || 'Unknown',
      status: data.data.status || 'Unknown'
    };
  } catch (error) {
    console.error('Error fetching anime details:', error);
    return null;
  }
}; 