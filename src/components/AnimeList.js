import React from 'react';

const AnimeList = ({ items, actionLabel, onAction, onRemove, emptyMessage }) => {
  if (items.length === 0) {
    return <div className="empty-message">{emptyMessage}</div>;
  }

  return (
    <ul className="anime-list">
      {items.map(item => (
        <li key={item.id} className="anime-item">
          {item.image && (
            <img 
              src={item.image} 
              alt={item.title} 
              className="anime-thumbnail"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/50x70?text=No+Image';
              }}
            />
          )}
          <div className="anime-details">
            <span className="anime-title">{item.title}</span>
            {item.year && <span className="anime-year">({item.year})</span>}
            {item.score && <span className="anime-score">Score: {item.score}</span>}
          </div>
          <div className="anime-actions">
            <button 
              className="action-button" 
              onClick={() => onAction(item.id)}
              style={{ marginRight: '8px' }}
            >
              {actionLabel}
            </button>
            <button 
              className="action-button" 
              onClick={() => onRemove(item.id)}
              style={{ backgroundColor: 'var(--tg-theme-destructive-color, #e53935)' }}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default AnimeList; 