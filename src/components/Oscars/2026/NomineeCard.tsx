import '../shared/Presentation.css';
import type { Nominee2026 } from './types';

type NomineeCardProps = {
  nominee: Nominee2026;
  categoryName: string;
  isWinner: boolean;
  isUserChoice?: boolean;
  isNotSeen: boolean;
  isLosingNominee: boolean;
  actorImagePath?: string;
  filmImagePath?: string;
  onClick: () => void;
  isSelected?: boolean;
  onSelect?: () => void;
  voteCount?: number;
  showVoteCount?: boolean;
};

export const NomineeCard = ({
  nominee,
  categoryName,
  isWinner,
  isUserChoice = false,
  isNotSeen,
  isLosingNominee,
  actorImagePath,
  filmImagePath,
  onClick,
  isSelected = false,
  onSelect,
  voteCount = 0,
  showVoteCount = false,
}: NomineeCardProps) => {
  const getNomineeTitle = () => {
    return nominee.person && nominee.film ? nominee.person.name : nominee.film.title;
  };

  const getNomineeDescription = () => {
    if (nominee.person) return nominee.film.title;
    if (nominee.crew?.length) return nominee.crew.map((c) => c.name).join(', ');
    return '';
  };

  const needsSmallDescription = [
    'Sound',
    'Visual Effects',
    'Makeup and Hairstyling',
    'Music (Original Song)',
  ].includes(categoryName);

  const notSeen = nominee.metadata?.notSeen || false;

  const handleCardClick = (e: React.MouseEvent) => {
    if (onSelect) {
      e.stopPropagation();
      onSelect();
    } else {
      onClick();
    }
  };

  const isBothWinnerAndUserChoice = isWinner && isUserChoice;

  const cardClasses = [
    'nominee-card',
    isBothWinnerAndUserChoice && 'winner-user-choice-card',
    !isBothWinnerAndUserChoice && isWinner && 'winner-card',
    !isBothWinnerAndUserChoice && isUserChoice && 'user-choice-card',
    notSeen && 'not-seen-card',
    isLosingNominee && 'losing-nominee',
    !nominee.person && 'with-film-image',
    isSelected && 'selected',
    onSelect && 'selectable',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div data-actor={nominee.person?.name} className={cardClasses} onClick={handleCardClick}>
      <div className="nominee-info">
        <div className="nominee-title">{getNomineeTitle()}</div>
        <div className={needsSmallDescription ? 'nominee-description-sm' : 'nominee-description'}>
          {getNomineeDescription()}
        </div>
        {showVoteCount && (
          <div className="vote-count-badge">
            {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
          </div>
        )}
      </div>
      {notSeen && (
        <div
          className="not-seen-indicator"
          style={{
            position: 'absolute',
            top: '4px',
            left: '50%',
            transform: 'translateX(-50%)',
            right: 'auto',
          }}
        >
          NOT SEEN
        </div>
      )}
      {isWinner && (
        <div className="oscar-statuette-wrapper">
          <img
            src="/Oscar-Statuette-Logo.png"
            alt="Oscar Statuette"
            className={`oscar-statuette ${nominee.person ? 'with-actor' : 'with-film'}`}
          />
          <span className="statuette-copyright">Oscar statuette ©A.M.P.A.S.®</span>
        </div>
      )}
      {nominee.person && actorImagePath && (
        <img
          src={actorImagePath}
          alt={nominee.person.name}
          className="nominee-image"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      )}
      {!nominee.person && filmImagePath && (
        <img
          src={filmImagePath}
          alt={nominee.film.title}
          className="nominee-image film-image"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      )}
    </div>
  );
};
