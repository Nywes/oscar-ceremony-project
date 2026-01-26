'use client';
import { useState } from 'react';
import { YearSelector } from './shared/YearSelector';
import { Presentation2025 } from './2025/Presentation';
import { Presentation2026 } from './2026/Presentation';

type YearComponentMap = {
  2025: React.ComponentType;
  2026: React.ComponentType;
};

const yearComponents: YearComponentMap = {
  2025: Presentation2025,
  2026: Presentation2026,
};

export const Presentation = () => {
  const [selectedYear, setSelectedYear] = useState<2025 | 2026>(2026);

  const YearComponent = yearComponents[selectedYear];

  return (
    <>
      <YearSelector selectedYear={selectedYear} onYearChange={setSelectedYear} />
      <YearComponent />
    </>
  );
};
