import { useState, useEffect, useRef } from 'react';
import './Presentation.css';

type YearSelectorProps = {
  selectedYear: 2025 | 2026;
  onYearChange: (year: 2025 | 2026) => void;
};

export const YearSelector = ({ selectedYear, onYearChange }: YearSelectorProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const HIDE_DELAY = 2500; // 2.5 secondes

  const collapse = () => {
    setIsCollapsed(true);
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const resetTimeout = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    setIsCollapsed(false);
    timeoutRef.current = window.setTimeout(() => {
      setIsCollapsed(true);
    }, HIDE_DELAY);
  };

  useEffect(() => {
    resetTimeout();

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Détecter les clics en dehors du composant
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        !isCollapsed
      ) {
        collapse();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCollapsed]);

  const handleYearClick = (year: 2025 | 2026) => {
    onYearChange(year);
    resetTimeout();
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    setIsCollapsed(false);
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    resetTimeout();
  };

  const handleTouchStart = () => {
    setIsCollapsed(false);
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
  };

  const getYearShort = (year: 2025 | 2026) => {
    return year.toString().slice(-2);
  };

  return (
    <div
      ref={containerRef}
      className={`year-selector ${isCollapsed ? 'collapsed' : ''} ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
    >
      <div className="year-selector-content">
        <button
          className={`year-btn ${selectedYear === 2025 ? 'active' : ''}`}
          onClick={() => handleYearClick(2025)}
          aria-label="Select year 2025"
        >
          2025
        </button>
        <span className="year-separator">/</span>
        <button
          className={`year-btn ${selectedYear === 2026 ? 'active' : ''}`}
          onClick={() => handleYearClick(2026)}
          aria-label="Select year 2026"
        >
          2026
        </button>
      </div>
      <div className="year-badge">
        <div className="year-badge-inner">
          <span className="year-badge-text">{getYearShort(selectedYear)}</span>
        </div>
      </div>
    </div>
  );
};
