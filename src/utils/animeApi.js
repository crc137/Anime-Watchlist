// Using Jikan API (MyAnimeList unofficial API)
const JIKAN_API_BASE = 'https://api.jikan.moe/v4';

export const searchAnime = async (query) => {
  if (!query || query.trim() === '') {
    console.log('Empty query, returning empty results');
    return [];
  }
  
  try {
    console.log(`Fetching anime for query: "${query}"`);
    
    // Add a small delay to prevent API rate limiting issues
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const response = await fetch(`${JIKAN_API_BASE}/anime?q=${encodeURIComponent(query)}&limit=5&sfw=true`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API Response:', data);
    
    if (!data.data || !Array.isArray(data.data)) {
      console.error('Invalid API response format:', data);
      return [];
    }
    
    // Transform the response to our format
    const results = data.data.map(anime => ({
      id: anime.mal_id,
      title: anime.title,
      image: anime.images?.jpg?.image_url || '',
      year: anime.year || 'Unknown',
      score: anime.score || 'N/A',
      synopsis: anime.synopsis || 'No description available'
    }));
    
    console.log('Transformed results:', results);
    return results;
    
  } catch (error) {
    console.error('Error in searchAnime:', error);
    throw error;
  }
};

export const getAnimeDetails = async (id) => {
  try {
    console.log(`Fetching details for anime ID: ${id}`);
    
    const response = await fetch(`${JIKAN_API_BASE}/anime/${id}/full`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API Response for details:', data);
    
    if (!data.data) {
      console.error('Invalid API response format for details:', data);
      return null;
    }
    
    // Используем оригинальное название аниме
    const title = data.data.title_english || data.data.title;
    
    return {
      id: data.data.mal_id,
      title: title,
      image: data.data.images?.jpg?.image_url || '',
      synopsis: data.data.synopsis || 'No description available',
      score: data.data.score || 'N/A',
      episodes: data.data.episodes || 'Unknown',
      status: data.data.status || 'Unknown',
      genres: data.data.genres?.map(g => g.name) || [],
      rating: data.data.rating || 'Unknown',
      duration: data.data.duration || 'Unknown'
    };
  } catch (error) {
    console.error('Error in getAnimeDetails:', error);
    throw error;
  }
}; 