import './styles/index.css';
import type { Category2026, Nominee2026 } from './types';
import { OscarReveal } from '../shared/OscarReveal';
import { NomineeCard } from './NomineeCard';
import { useVoting } from '../shared/useVoting';

type CategorySectionProps = {
  category: Category2026;
  index: number;
  isActive: boolean;
  sectionRef: (el: HTMLElement | null) => void;
  isWinner: (categoryName: string, nominee: Nominee2026) => boolean;
  highlightedWinners: { [key: string]: boolean };
  showingReveal: string | null;
  onRevealClick: (categoryName: string) => void;
  onRevealComplete: () => void;
  onNomineeClick: (nominee: Nominee2026) => void;
  getActorImagePath: (actorName: string | undefined, index: number) => string | undefined;
  getFilmImagePath: (filmName: string | undefined) => string | undefined;
  currentImageIndices: { [key: string]: number };
  year: number;
};

export const CategorySection = ({
  category,
  index,
  isActive,
  sectionRef,
  isWinner,
  highlightedWinners,
  showingReveal,
  onRevealClick,
  onRevealComplete,
  onNomineeClick,
  getActorImagePath,
  getFilmImagePath,
  currentImageIndices,
  year,
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
  } = useVoting(category.name, year);

  const isEliottChoiceRevealed = highlightedWinners[category.name];

  return (
    <section
      className={`category-section-2026 ${isActive ? 'active' : ''}`}
      id={`section-${index + 1}`}
      ref={sectionRef}
    >
      <div className="category-content-2026">
        <h2 className="category-title-2026">{category.name}</h2>

        <div
          className={
            category.name === 'Best Picture' ? 'best-picture-container-2026' : 'nominees-container-2026'
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
              ? getFilmImagePath(nominee.film.title)
              : undefined;
            const isNomineeWinner = isWinner(category.name, nominee);
            const isLosing = highlightedWinners[category.name] && !isNomineeWinner;
            const isUserChoice = userChoiceId === nominee.id && hasVoted && showMyVote;

            return (
              <NomineeCard
                key={nominee.id || nomineeIndex}
                nominee={nominee}
                categoryName={category.name}
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
              />
            );
          })}
        </div>

        <div className="category-actions">
          <button
            className={`reveal-winner-btn-2026 ${
              showingReveal === category.name || highlightedWinners[category.name] ? 'revealed' : ''
            }`}
            onClick={() => onRevealClick(category.name)}
            disabled={!category.winners.my_choice}
          >
            {isEliottChoiceRevealed ? 'Hide Eliott Choice' : 'Reveal Eliott Choice'}
          </button>
          <div className="voting-actions">
            {!hasVoted && (
              <button className="vote-btn" onClick={submitVote} disabled={!selectedNomineeId}>
                Vote
              </button>
            )}
            {hasVoted ? (
              <button
                className={`show-results-btn ${showMyVote ? 'active' : ''}`}
                onClick={toggleShowMyVote}
              >
                {showMyVote ? 'Hide my vote' : 'Show my vote'}
              </button>
            ) : (
              <button
                className={`show-results-btn ${showResults ? 'active' : ''}`}
                onClick={toggleShowResults}
              >
                {showResults ? 'Masquer Résultats' : 'Voir Résultats votes'}
              </button>
            )}
          </div>
        </div>

        {showingReveal === category.name && (
          <OscarReveal isActive={true} onAnimationComplete={onRevealComplete} />
        )}
      </div>
    </section>
  );
};
