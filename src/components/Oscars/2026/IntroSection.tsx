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
    lastTwo >= 11 && lastTwo <= 13
      ? 'th'
      : last === 1
        ? 'st'
        : last === 2
          ? 'nd'
          : last === 3
            ? 'rd'
            : 'th';
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
            Bienvenue sur ma propre cérémonie des Oscars {year}.
            <br />
            <br />
            Ayant vu une grande partie des films nominés cette année, ce site est là pour vous
            partager les films que j'ai aimés cette année ainsi que pour voir les votres.
            <br />
            <br />
            Vous pouvez voter pour les films et acteurs qui méritent d'être récompensés dans chacune des différentes catégories.
            <br />
            <br />
            Vous pourrez donc voir mes choix ainsi que ceux des autres personnes ayant participé.
            <br />
            <i>(Je vous conseille donc de voter avant de découvrir les autres avis pour éviter toute influence)</i>
            <br />
            <br />
            Je vous laisse vous balader et explorer le site en défilant vers le bas, et je vous souhaite bonne découverte !
          </p>
        ) : (
          <p className="text-md">
            Welcome to my own {year} Oscars ceremony.
            <br />
            <br />
            Having watched a large portion of this year's nominated films, this site is here to
            share the films I loved this year and to see yours.
            <br />
            <br />
            You can vote for the films and actors who deserve to be rewarded in each category.
            <br />
            <br />
            You'll be able to see my choices as well as those of everyone who took part.
            <br />
            <i>(I recommend voting before discovering the other choices to avoid any influence)</i>  
            <br />
            <br />
            Feel free to browse and explore by scrolling down
            <br />
            Enjoy!
          </p>
        )}
        <LanguageToggle language={language} onLanguageChange={onLanguageChange} />
      </div>
      <ScrollIndicator onScrollClick={onScrollClick} />
    </div>
  );
};
