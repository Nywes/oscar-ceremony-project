import './styles/index.css';
import { useRef, useEffect, useCallback } from 'react';
import type { Category2026, Nominee2026, Lang } from './types';
import { t, tImage } from './utils';
import { NomineeCard } from './NomineeCard';
import { useVoting } from '../shared/useVoting';

const UI_LABELS = {
  revealEliottChoice: { en: 'Reveal Eliott Choice', fr: "Révéler le choix d'Eliott" },
  hideEliottChoice: { en: 'Hide Eliott Choice', fr: "Masquer le choix d'Eliott" },
  vote: { en: 'Vote', fr: 'Voter' },
  hideMyVote: { en: 'Hide my vote', fr: 'Masquer mon vote' },
  showMyVote: { en: 'Show my vote', fr: 'Afficher mon vote' },
  hideResults: { en: 'Hide Results', fr: 'Masquer Résultats' },
  showResults: { en: 'See Vote Results', fr: 'Voir Résultats votes' },
};

type CategorySectionProps = {
  category: Category2026;
  index: number;
  isActive: boolean;
  sectionRef: (el: HTMLElement | null) => void;
  isWinner: (categoryId: string, nominee: Nominee2026) => boolean;
  highlightedWinners: { [key: string]: boolean };
  onRevealClick: (categoryId: string) => void;
  onNomineeClick: (nominee: Nominee2026) => void;
  getActorImagePath: (actorName: string | undefined, index: number) => string | undefined;
  getFilmImagePath: (filmName: string | undefined) => string | undefined;
  currentImageIndices: { [key: string]: number };
  actorRotationPhase: number;
  year: number;
  language: Lang;
};

export const CategorySection = ({
  category,
  index,
  isActive,
  sectionRef,
  isWinner,
  highlightedWinners,
  onRevealClick,
  onNomineeClick,
  getActorImagePath,
  getFilmImagePath,
  currentImageIndices,
  actorRotationPhase,
  year,
  language,
}: CategorySectionProps) => {
  const {
    selectedNomineeId,
    voteStats,
    hasVoted,
    showResults,
    showMyVote,
    userChoiceId,
    selectNominee,
    submitVote,
    toggleShowResults,
    toggleShowMyVote,
  } = useVoting(category.id, year);

  const isEliottChoiceRevealed = highlightedWinners[category.id];
  const titleRef = useRef<HTMLHeadingElement>(null);

  const fitTitle = useCallback(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.fontSize = '';
    const maxWidth = el.parentElement?.clientWidth ?? el.clientWidth;
    let size = 32;
    el.style.fontSize = `${size}px`;
    while (el.scrollWidth > maxWidth && size > 8) {
      size -= 0.5;
      el.style.fontSize = `${size}px`;
    }
  }, []);

  useEffect(() => {
    fitTitle();
    window.addEventListener('resize', fitTitle);
    return () => window.removeEventListener('resize', fitTitle);
  }, [fitTitle, language]);

  return (
    <section
      className={`category-section-2026 ${category.id === 'best-picture' ? 'category-best-picture' : ''} ${isActive ? 'active' : ''}`}
      id={`section-${index + 1}`}
      ref={sectionRef}
    >
      <div className="category-content-2026">
        <h2 className="category-title-2026" ref={titleRef}>{t(category.name, language)}</h2>

        <div
          className={
            category.id === 'best-picture' ? 'best-picture-container-2026' : 'nominees-container-2026'
          }
        >
          {category.nominees.map((nominee, nomineeIndex) => {
            const actorImagePath = nominee.person
              ? getActorImagePath(
                  nominee.person.name,
                  currentImageIndices[nominee.person.name] || 0
                )
              : undefined;
            const filmImagePath = !nominee.person
              ? (tImage(nominee.film.poster, language)?.path
                || getFilmImagePath(t(nominee.film.title, 'en')))
              : undefined;
            const isNomineeWinner = isWinner(category.id, nominee);
            const isLosing = highlightedWinners[category.id] && !isNomineeWinner;
            const isUserChoice = userChoiceId === nominee.id && hasVoted && showMyVote;

            return (
              <NomineeCard
                key={nominee.id || nomineeIndex}
                nominee={nominee}
                categoryId={category.id}
                isWinner={isNomineeWinner}
                isUserChoice={isUserChoice}
                isLosingNominee={isLosing}
                actorImagePath={actorImagePath}
                filmImagePath={filmImagePath}
                onClick={() => onNomineeClick(nominee)}
                isSelected={!hasVoted && selectedNomineeId === nominee.id}
                onSelect={() => selectNominee(nominee.id)}
                voteCount={voteStats[nominee.id] || 0}
                showVoteCount={showResults || hasVoted}
                actorRotationPhase={actorRotationPhase}
                language={language}
              />
            );
          })}
        </div>

        <div className="category-actions">
          <button
            className={`reveal-winner-btn-2026 ${
              highlightedWinners[category.id] ? 'revealed' : ''
            }`}
            onClick={() => onRevealClick(category.id)}
            disabled={!category.winners.my_choice}
          >
            {isEliottChoiceRevealed ? t(UI_LABELS.hideEliottChoice, language) : t(UI_LABELS.revealEliottChoice, language)}
          </button>
          <div className="voting-actions">
            {!hasVoted && (
              <button className="vote-btn" onClick={submitVote} disabled={!selectedNomineeId}>
                {t(UI_LABELS.vote, language)}
              </button>
            )}
            {hasVoted ? (
              <button
                className={`show-results-btn show-results-btn--my-vote ${showMyVote ? 'active' : ''}`}
                onClick={toggleShowMyVote}
              >
                {showMyVote ? t(UI_LABELS.hideMyVote, language) : t(UI_LABELS.showMyVote, language)}
              </button>
            ) : (
              <button
                className={`show-results-btn show-results-btn--results ${showResults ? 'active' : ''}`}
                onClick={toggleShowResults}
              >
                {showResults ? t(UI_LABELS.hideResults, language) : t(UI_LABELS.showResults, language)}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
