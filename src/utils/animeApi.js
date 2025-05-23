// Using Jikan API (MyAnimeList unofficial API)
const JIKAN_API_BASE = 'https://api.jikan.moe/v4';

export const searchAnime = async (query) => {
  try {
    const response = await fetch(`${JIKAN_API_BASE}/anime?q=${encodeURIComponent(query)}&limit=5`);
    const data = await response.json();
    return data.data.map(anime => ({
      id: anime.mal_id,
      title: anime.title,
      image: anime.images.jpg.image_url,
      synopsis: anime.synopsis,
      score: anime.score,
      episodes: anime.episodes,
      status: anime.status,
      type: anime.type
    }));
  } catch (error) {
    console.error('Error searching anime:', error);
    return [];
  }
};

export const getAnimeDetails = async (animeId) => {
  try {
    const response = await fetch(`${JIKAN_API_BASE}/anime/${animeId}/full`);
    const data = await response.json();
    return {
      id: data.data.mal_id,
      title: data.data.title,
      image: data.data.images.jpg.image_url,
      synopsis: data.data.synopsis,
      score: data.data.score,
      episodes: data.data.episodes,
      status: data.data.status,
      type: data.data.type,
      genres: data.data.genres.map(g => g.name),
      studios: data.data.studios.map(s => s.name),
      aired: data.data.aired.string
    };
  } catch (error) {
    console.error('Error getting anime details:', error);
    return null;
  }
}; 