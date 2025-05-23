import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 16px;
`;

const RecommendationCard = styled.div`
  background: var(--tg-theme-secondary-bg-color);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
`;

const Title = styled.h3`
  margin: 0 0 8px 0;
  color: var(--tg-theme-text-color);
`;

const Sender = styled.p`
  margin: 0 0 8px 0;
  color: var(--tg-theme-hint-color);
  font-size: 0.9em;
`;

const Comment = styled.p`
  margin: 0 0 16px 0;
  color: var(--tg-theme-text-color);
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const Button = styled.button`
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  background: ${props => props.variant === 'accept' ? 'var(--tg-theme-button-color)' : 'var(--tg-theme-secondary-bg-color)'};
  color: ${props => props.variant === 'accept' ? 'var(--tg-theme-button-text-color)' : 'var(--tg-theme-text-color)'};
  cursor: pointer;
  flex: 1;
  font-weight: bold;

  &:hover {
    opacity: 0.9;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 32px;
  color: var(--tg-theme-hint-color);
`;

const Recommendations = ({ onAddToList }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/recommendations/received');
      const data = await response.json();
      
      if (data.success) {
        setRecommendations(data.data);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecommendation = async (recommendationId, status, animeTitle) => {
    try {
      const response = await fetch(`/api/recommendations/${recommendationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (data.success) {
        if (status === 'accepted') {
          onAddToList(animeTitle, 'planned');
        }
        setRecommendations(recommendations.filter(r => r._id !== recommendationId));
      }
    } catch (error) {
      console.error('Error updating recommendation:', error);
    }
  };

  if (loading) {
    return <div>Loading recommendations...</div>;
  }

  if (recommendations.length === 0) {
    return (
      <EmptyState>
        No recommendations yet
      </EmptyState>
    );
  }

  return (
    <Container>
      {recommendations.map((recommendation) => (
        <RecommendationCard key={recommendation._id}>
          <Title>{recommendation.animeTitle}</Title>
          <Sender>Recommended by User {recommendation.fromUserId}</Sender>
          {recommendation.comment && (
            <Comment>{recommendation.comment}</Comment>
          )}
          <ButtonGroup>
            <Button
              variant="accept"
              onClick={() => handleRecommendation(recommendation._id, 'accepted', recommendation.animeTitle)}
            >
              Add to Plan to Watch
            </Button>
            <Button
              onClick={() => handleRecommendation(recommendation._id, 'rejected')}
            >
              Dismiss
            </Button>
          </ButtonGroup>
        </RecommendationCard>
      ))}
    </Container>
  );
};

export default Recommendations; 