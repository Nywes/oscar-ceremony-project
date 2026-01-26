import './Presentation.css';
import { Category, Nominee } from './types';
import { OscarReveal } from './OscarReveal';
import { NomineeCard } from './NomineeCard';

type CategorySectionProps = {
  category: Category;
  index: number;
  isActive: boolean;
  sectionRef: (el: HTMLElement | null) => void;
  isWinner: (categoryName: string, nominee: Nominee) => boolean;
  isNotSeen: (film: string) => boolean;
  highlightedWinners: { [key: string]: boolean };
  showingReveal: string | null;
  onRevealClick: (categoryName: string) => void;
  onRevealComplete: () => void;
  onNomineeClick: (nominee: Nominee) => void;
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
  isNotSeen,
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
  return (
    <section
      className={`category-section ${isActive ? 'active' : ''}`}
      id={`section-${index + 1}`}
      ref={sectionRef}
    >
      <div className="category-content">
        <h2 className="category-title">{category.name}</h2>

        <div
          className={`${
            category.name === 'Best Picture' ? 'best-picture-container' : 'nominees-container'
          }`}
        >
          {category.nominees.map((nominee, nomineeIndex) => {
            const actorImagePath = nominee.actor
              ? getActorImagePath(nominee.actor, currentImageIndices[nominee.actor] || 0)
              : undefined;
            const filmImagePath = !nominee.actor ? getFilmImagePath(nominee.film) : undefined;

            return (
              <NomineeCard
                key={nomineeIndex}
                nominee={nominee}
                categoryName={category.name}
                isWinner={isWinner(category.name, nominee)}
                isNotSeen={isNotSeen(nominee.film)}
                isLosingNominee={
                  highlightedWinners[category.name] && !isWinner(category.name, nominee)
                }
                actorImagePath={actorImagePath}
                filmImagePath={filmImagePath}
                onClick={() => onNomineeClick(nominee)}
                year={year}
              />
            );
          })}
        </div>

        <button
          className={`reveal-winner-btn ${
            showingReveal === category.name || highlightedWinners[category.name] ? 'revealed' : ''
          }`}
          onClick={() => onRevealClick(category.name)}
          disabled={!category.my_winner}
        >
          Reaveal my choice
        </button>

        {showingReveal === category.name && (
          <OscarReveal isActive={true} onAnimationComplete={onRevealComplete} />
        )}
      </div>
    </section>
  );
};
