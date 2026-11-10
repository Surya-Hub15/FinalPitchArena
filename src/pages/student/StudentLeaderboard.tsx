import React from 'react';
import { LeaderboardPage } from '../public/LeaderboardPage.tsx';

// Re-uses the public leaderboard component inside the student layout with cohort highlights
export const StudentLeaderboard: React.FC = () => {
  return (
    <div className="space-y-6 font-sans">
      <LeaderboardPage />
    </div>
  );
};
