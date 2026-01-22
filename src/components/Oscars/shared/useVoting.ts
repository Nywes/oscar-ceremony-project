import { useState, useEffect, useCallback } from 'react';

type VoteStats = {
  [nomineeId: string]: number;
};

type VotingState = {
  selectedNomineeId: string | null;
  voteStats: VoteStats;
  hasVoted: boolean;
  showResults: boolean;
  userChoiceId: string | null;
};

const STORAGE_KEY_PREFIX = 'oscars_vote_';
const VOTE_STATS_KEY = 'oscars_vote_stats';

export function useVoting(categoryName: string, year: number) {
  const storageKey = `${STORAGE_KEY_PREFIX}${year}_${categoryName}`;

  const [state, setState] = useState<VotingState>(() => {
    const hasVoted = localStorage.getItem(storageKey) !== null;
    const savedStats = localStorage.getItem(VOTE_STATS_KEY);
    const allStats = savedStats ? JSON.parse(savedStats) : {};
    const categoryStats = allStats[`${year}_${categoryName}`] || {};
    const userChoiceId = hasVoted ? localStorage.getItem(`${storageKey}_choice`) : null;

    return {
      selectedNomineeId: null,
      voteStats: categoryStats,
      hasVoted,
      showResults: false,
      userChoiceId: userChoiceId || null,
    };
  });

  const selectNominee = useCallback(
    (nomineeId: string) => {
      if (state.hasVoted) return;

      setState((prev) => ({
        ...prev,
        selectedNomineeId: prev.selectedNomineeId === nomineeId ? null : nomineeId,
      }));
    },
    [state.hasVoted]
  );

  const submitVote = useCallback(async () => {
    if (!state.selectedNomineeId || state.hasVoted) return;

    try {
      const savedStats = localStorage.getItem(VOTE_STATS_KEY);
      const allStats = savedStats ? JSON.parse(savedStats) : {};
      const categoryKey = `${year}_${categoryName}`;
      const categoryStats = allStats[categoryKey] || {};

      categoryStats[state.selectedNomineeId] = (categoryStats[state.selectedNomineeId] || 0) + 1;
      allStats[categoryKey] = categoryStats;
      localStorage.setItem(VOTE_STATS_KEY, JSON.stringify(allStats));
      localStorage.setItem(storageKey, 'true');
      localStorage.setItem(`${storageKey}_choice`, state.selectedNomineeId);

      setState((prev) => ({
        ...prev,
        hasVoted: true,
        voteStats: categoryStats,
        userChoiceId: state.selectedNomineeId,
        selectedNomineeId: null,
      }));
    } catch (error) {
      console.error('Error submitting vote:', error);
    }
  }, [state.selectedNomineeId, state.hasVoted, storageKey, categoryName, year]);

  const toggleShowResults = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showResults: !prev.showResults,
    }));
  }, []);

  useEffect(() => {
    const savedStats = localStorage.getItem(VOTE_STATS_KEY);
    if (savedStats) {
      const allStats = JSON.parse(savedStats);
      const categoryKey = `${year}_${categoryName}`;
      const categoryStats = allStats[categoryKey] || {};
      setState((prev) => ({
        ...prev,
        voteStats: categoryStats,
      }));
    }
  }, [categoryName, year]);

  return {
    selectedNomineeId: state.selectedNomineeId,
    voteStats: state.voteStats,
    hasVoted: state.hasVoted,
    showResults: state.showResults,
    userChoiceId: state.userChoiceId,
    selectNominee,
    submitVote,
    toggleShowResults,
  };
}
