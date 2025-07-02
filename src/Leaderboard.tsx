import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ref, onValue } from 'firebase/database';
import { db } from './firebase/firebase';

const LeaderboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
`;

const LeaderboardEntry = styled.div<{rank: number}>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 85%;
  background-color: ${({ rank }) => rank === 1 ? 'rgb(255, 215, 0)' : rank === 2 ? 'rgb(192, 192, 192)' : rank === 3 ? 'rgb(205, 127, 50)' : 'rgb(255, 255, 255)'};
  border-radius: 10px;
  border: 4px solid black;
  box-shadow: 0px 4px 0px black;
  padding: 10px;
  margin: 10px;
  font-size: 24px;
  font-weight: bold;
`;

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userRef = ref(db, 'users');
    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const sortedData = Object.entries(data)
          .filter((entry: any) => entry[1] && entry[1].highScore) // Filter out entries without high scores
          .sort((a: any, b: any) => b[1].highScore - a[1].highScore)
          .slice(0, 10); // Only show top 10
        setLeaderboard(sortedData);
      } else {
        setLeaderboard([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <LeaderboardContainer>
      {loading ? (
        <div style={{ fontSize: '20px', color: 'black' }}>Loading leaderboard...</div>
      ) : leaderboard.length === 0 ? (
        <div style={{ fontSize: '20px', color: 'black' }}>No scores yet! Be the first to play!</div>
      ) : (
        leaderboard.map((entry, index) => (
          <LeaderboardEntry key={entry[0]} rank={index + 1}>
            <div>#{index + 1}</div>
            <div>{entry[1].username || 'Anonymous'}</div>
            <div>{entry[1].highScore}</div>
          </LeaderboardEntry>
        ))
      )}
    </LeaderboardContainer>
  );
};

export default Leaderboard;