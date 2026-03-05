import { useState, useEffect, useCallback } from 'react';
import {
  isSupabaseConfigured,
  addVoteForNominee,
  getVoteCountsByCategory,
} from '../../../lib/supabase-oscars';

type VoteStats = {
  [nomineeId: string]: number;
};

type VotingState = {
  selectedNomineeId: string | null;
  voteStats: VoteStats;
  hasVoted: boolean;
  showResults: boolean;
  showMyVote: boolean;
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
      showMyVote: hasVoted,
      userChoiceId: userChoiceId || null,
    };
  });

  // Charger les stats depuis Supabase quand configuré
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let cancelled = false;
    getVoteCountsByCategory(year, categoryName).then((stats: VoteStats) => {
      if (cancelled) return;
      setState((prev) => ({ ...prev, voteStats: stats }));
    });
    return () => {
      cancelled = true;
    };
  }, [year, categoryName]);

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

    const nomineeId = state.selectedNomineeId;

    try {
      if (isSupabaseConfigured()) {
        const ok = await addVoteForNominee(year, categoryName, nomineeId);
        if (!ok) {
          console.error('Failed to submit vote to Supabase');
          return;
        }
        const freshStats = await getVoteCountsByCategory(year, categoryName);
        setState((prev) => ({
          ...prev,
          hasVoted: true,
          voteStats: freshStats,
          userChoiceId: nomineeId,
          selectedNomineeId: null,
          showMyVote: true,
        }));
      } else {
        const savedStats = localStorage.getItem(VOTE_STATS_KEY);
        const allStats = savedStats ? JSON.parse(savedStats) : {};
        const categoryKey = `${year}_${categoryName}`;
        const categoryStats = allStats[categoryKey] || {};
        categoryStats[nomineeId] = (categoryStats[nomineeId] || 0) + 1;
        allStats[categoryKey] = categoryStats;
        localStorage.setItem(VOTE_STATS_KEY, JSON.stringify(allStats));
        setState((prev) => ({
          ...prev,
          hasVoted: true,
          voteStats: categoryStats,
          userChoiceId: nomineeId,
          selectedNomineeId: null,
          showMyVote: true,
        }));
      }

      localStorage.setItem(storageKey, 'true');
      localStorage.setItem(`${storageKey}_choice`, nomineeId);
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

  const toggleShowMyVote = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showMyVote: !prev.showMyVote,
    }));
  }, []);

  // Synchroniser les stats depuis le localStorage uniquement si Supabase n'est pas utilisé
  useEffect(() => {
    if (isSupabaseConfigured()) return;

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
    showMyVote: state.showMyVote,
    userChoiceId: state.userChoiceId,
    selectNominee,
    submitVote,
    toggleShowResults,
    toggleShowMyVote,
  };
}
