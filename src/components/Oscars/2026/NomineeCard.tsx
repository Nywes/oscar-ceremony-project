import './styles/index.css';
import { useState, useEffect, useRef } from 'react';
import type { Nominee2026 } from './types';
import { getActorImagePathSync, checkImageExists } from './utils';

type NomineeCardProps = {
  nominee: Nominee2026;
  categoryName: string;
  isWinner: boolean;
  isUserChoice?: boolean;
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
  isLosingNominee,
  actorImagePath,
  filmImagePath,
  onClick,
  isSelected = false,
  onSelect,
  voteCount = 0,
  showVoteCount = false,
}: NomineeCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hasSecondaryImage, setHasSecondaryImage] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
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

  // Vérifier si l'image secondaire existe pour les acteurs
  useEffect(() => {
    if (nominee.person && actorImagePath) {
      const secondaryImagePath = getActorImagePathSync(nominee.person.name, 1);
      if (secondaryImagePath) {
        checkImageExists(secondaryImagePath).then((exists) => {
          setHasSecondaryImage(exists);
        });
      }
    }
  }, [nominee.person, actorImagePath]);

  // Rotation automatique des images toutes les 6 secondes
  useEffect(() => {
    if (nominee.person && hasSecondaryImage) {
      intervalRef.current = setInterval(() => {
        setIsFlipping(true);
        // Changer l'image au milieu de l'animation (quand elle est à 90 degrés)
        setTimeout(() => {
          setCurrentImageIndex((prev) => (prev === 0 ? 1 : 0));
        }, 600); // Au milieu de l'animation (1200ms / 2)
        // Réinitialiser l'état de flip après l'animation complète
        setTimeout(() => {
          setIsFlipping(false);
        }, 1200); // Durée complète de l'animation (plus lente)
      }, 6000); // 6 secondes

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [nominee.person, hasSecondaryImage]);

  // Obtenir le chemin de l'image actuelle
  const getCurrentImagePath = () => {
    if (!nominee.person) return filmImagePath;
    return getActorImagePathSync(nominee.person.name, currentImageIndex) || actorImagePath;
  };

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
    'nominee-card-2026',
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
      <div className="nominee-info-2026 nominee-info-grid-1">
        <div className="nominee-title">{getNomineeTitle()}</div>
        <div className={needsSmallDescription ? 'nominee-description-sm' : 'nominee-description'}>
          {getNomineeDescription()}
        </div>
      </div>
      <div className="nominee-votes-2026 nominee-info-grid-2">
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
      {nominee.person && actorImagePath && (
        <div className="nominee-image-container nominee-info-grid-3">
          <img
            ref={imageRef}
            src={getCurrentImagePath()}
            alt={nominee.person.name}
            className={`nominee-image nominee-image-2026 ${isFlipping ? 'flipping' : ''}`}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
      {!nominee.person && filmImagePath && (
        <img
          src={filmImagePath}
          alt={nominee.film.title}
          className="nominee-image film-image nominee-image-2026 nominee-info-grid-3"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      )}
    </div>
  );
};
