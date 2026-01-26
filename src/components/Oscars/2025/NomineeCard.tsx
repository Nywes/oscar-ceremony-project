import './styles/index.css';
import { Nominee } from './types';

type NomineeCardProps = {
  nominee: Nominee;
  categoryName: string;
  isWinner: boolean;
  isNotSeen: boolean;
  isLosingNominee: boolean;
  actorImagePath?: string;
  filmImagePath?: string;
  onClick: () => void;
};

export const NomineeCard = ({
  nominee,
  categoryName,
  isWinner,
  isNotSeen,
  isLosingNominee,
  actorImagePath,
  filmImagePath,
  onClick,
}: NomineeCardProps) => {
  const getNomineeTitle = () => {
    if (nominee.actor && nominee.film) return nominee.actor;
    return nominee.film;
  };

  const getNomineeDescription = () => {
    if (nominee.actor) return nominee.film;
    if (nominee.crew) return nominee.crew;
    return nominee.actor;
  };

  const needsSmallDescription =
    categoryName === 'Sound' ||
    categoryName === 'Visual Effects' ||
    categoryName === 'Makeup and Hairstyling' ||
    categoryName === 'Music (Original Song)';

  return (
    <div
      data-actor={nominee.actor}
      className={`nominee-card-2025 ${isWinner ? 'winner-card-2025' : ''} ${isNotSeen ? 'not-seen-card-2025' : ''} ${
        isLosingNominee ? 'losing-nominee' : ''
      } ${!nominee.actor ? 'with-film-image' : ''}`}
      onClick={onClick}
    >
      <div className="nominee-info-2025">
        <div className="nominee-title-2025">{getNomineeTitle()}</div>
        <div className={needsSmallDescription ? 'nominee-description-sm-2025' : 'nominee-description-2025'}>
          {getNomineeDescription()}
        </div>
      </div>
      {isNotSeen && (
        <div
          className="not-seen-indicator-2025"
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
          <img
            src="/Oscar-Statuette-Logo.png"
            alt="Oscar Statuette"
            className={`oscar-statuette ${nominee.actor ? 'with-actor' : 'with-film'}`}
          />
      )}
      {nominee.actor && actorImagePath && (
        <img
          src={actorImagePath}
          alt={nominee.actor}
          className="nominee-image-2025"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      )}
      {!nominee.actor && filmImagePath && (
        <img
          src={filmImagePath}
          alt={nominee.film}
          className="nominee-image-2025 film-image"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      )}
    </div>
  );
};
