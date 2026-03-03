import './styles/index.css';
import { LanguageToggle } from '../shared/LanguageToggle';
import { ScrollIndicator } from '../shared/ScrollIndicator';

type IntroSectionProps = {
  year: number;
  language: 'fr' | 'en';
  onLanguageChange: () => void;
  onScrollClick: () => void;
  sectionRef: (el: HTMLDivElement | null) => void;
};

const getIntroTitle = (year: number, language: 'fr' | 'en') => {
  const n = year - 1928;
  if (language === 'fr') {
    return `La ${n}e cérémonie des`;
  }
  const last = n % 10;
  const lastTwo = n % 100;
  const suffix =
    lastTwo >= 11 && lastTwo <= 13 ? 'th' : last === 1 ? 'st' : last === 2 ? 'nd' : last === 3 ? 'rd' : 'th';
  return `The ${n}${suffix} Academy Awards`;
};

export const IntroSection = ({
  year,
  language,
  onLanguageChange,
  onScrollClick,
  sectionRef,
}: IntroSectionProps) => {
  return (
    <div className="intro-section-2026" ref={sectionRef}>
      <div className="flex flex-col items-center justify-center mb-12 gap-4">
        <h1>{getIntroTitle(year, language)}</h1>
        <div className="oscars-text-logo-container">
          <div className="oscars-text-logo" />
          <span className="academy-copyright">©A.M.P.A.S.®</span>
        </div>
      </div>
      <div className="relative flex flex-col items-center">
        {language === 'fr' ? (
          <p className="text-md">
            Bienvenue dans ma propre cérémonie de remise des Oscars {year}.
            <br />
            Ayant vu une grande partie des films nominés cette année, j'ai fait ça pour vous partager
            les films que j'ai préféré cette année.
            <br />
            Je vous laisse vous balader et explorer le site en défilant vers le bas.
            <br />
            J'espère que vous aimerez !
          </p>
        ) : (
          <p className="text-md">
            Welcome to my very own {year} Oscars ceremony.
            <br />
            Having watched a large portion of this year's nominated films, I created this to share my
            favorite films of the year with you.
            <br />
            Feel free to explore by scrolling down.
            <br />I hope you enjoy it!
          </p>
        )}
        <LanguageToggle language={language} onLanguageChange={onLanguageChange} />
      </div>
      <ScrollIndicator onScrollClick={onScrollClick} />
    </div>
  );
};
