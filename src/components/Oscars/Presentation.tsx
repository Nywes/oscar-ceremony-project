'use client';
import { useState, useEffect } from 'react';
import { YearSelector } from './shared/YearSelector';
import { Presentation2025 } from './2025/Presentation';
import { Presentation2026 } from './2026/Presentation';

export const Presentation = () => {
  const [selectedYear, setSelectedYear] = useState<2025 | 2026>(2026);
  const [showYearSelector, setShowYearSelector] = useState(true);

  useEffect(() => {
    if (selectedYear === 2025) setShowYearSelector(true);
  }, [selectedYear]);

  const handleSectionChange = (show: boolean) => {
    setShowYearSelector(show);
  };

  return (
    <>
      {showYearSelector && (
        <YearSelector selectedYear={selectedYear} onYearChange={setSelectedYear} />
      )}
      {selectedYear === 2025 && <Presentation2025 />}
      {selectedYear === 2026 && (
        <Presentation2026 onActiveSectionChange={handleSectionChange} />
      )}
    </>
  );
};
