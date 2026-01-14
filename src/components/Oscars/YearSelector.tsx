import './Presentation.css';

type YearSelectorProps = {
  selectedYear: 2025 | 2026;
  onYearChange: (year: 2025 | 2026) => void;
};

export const YearSelector = ({ selectedYear, onYearChange }: YearSelectorProps) => {
  return (
    <div className="year-selector">
      <button
        className={`year-btn ${selectedYear === 2025 ? 'active' : ''}`}
        onClick={() => onYearChange(2025)}
      >
        2025
      </button>
      <button
        className={`year-btn ${selectedYear === 2026 ? 'active' : ''}`}
        onClick={() => onYearChange(2026)}
      >
        2026
      </button>
    </div>
  );
};
