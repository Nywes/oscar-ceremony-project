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
  actorRotationPhase?: number;
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
  actorRotationPhase = 0,
}: NomineeCardProps) => {
  const [displayedIndex, setDisplayedIndex] = useState(actorRotationPhase);
  const [hasSecondaryImage, setHasSecondaryImage] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const prevPhaseRef = useRef(actorRotationPhase);
  const getNomineeTitle = () => {
    // Cas spécial : Music (Original Song) → on affiche le titre de la chanson
    if (categoryName === 'Music (Original Song)' && nominee.metadata?.songTitle) {
      return nominee.metadata.songTitle;
    }

    return nominee.person && nominee.film ? nominee.person.name : nominee.film.title;
  };

  const getNomineeDescription = () => {
    // Cas spécial : Music (Original Song) → on affiche la phrase complète depuis les métadonnées
    if (categoryName === 'Music (Original Song)' && nominee.metadata?.notes) {
      return nominee.metadata.notes;
    }

    if (nominee.person) return nominee.film.title;
    if (nominee.crew?.length) return nominee.crew.map((c) => c.name).join(', ');
    return '';
  };

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

  // Synchronisation avec la phase globale : flip quand phase change
  useEffect(() => {
    if (nominee.person && hasSecondaryImage && actorRotationPhase !== prevPhaseRef.current) {
      prevPhaseRef.current = actorRotationPhase;
      setIsFlipping(true);
      const t1 = setTimeout(() => setDisplayedIndex(actorRotationPhase), 600);
      const t2 = setTimeout(() => setIsFlipping(false), 1200);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [actorRotationPhase, hasSecondaryImage, nominee.person]);

  // Sync initiale quand l'image secondaire devient disponible
  useEffect(() => {
    if (hasSecondaryImage && nominee.person) {
      setDisplayedIndex(actorRotationPhase);
      prevPhaseRef.current = actorRotationPhase;
    }
  }, [hasSecondaryImage, nominee.person, actorRotationPhase]);

  // Obtenir le chemin de l'image actuelle
  const getCurrentImagePath = () => {
    if (!nominee.person) return filmImagePath;
    return getActorImagePathSync(nominee.person.name, displayedIndex) || actorImagePath;
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
        <div className="nominee-description">
          {getNomineeDescription()}
        </div>
      </div>
      <div className="nominee-votes-2026 nominee-info-grid-2">
        {showVoteCount && (
          <div className="vote-count-badge">
            <span className="vote-count-badge__number">{voteCount}</span>
            <span className="vote-count-badge__label">{voteCount === 1 ? 'vote' : 'votes'}</span>
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
