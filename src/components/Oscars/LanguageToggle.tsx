import './Presentation.css';

type LanguageToggleProps = {
  language: 'fr' | 'en';
  onLanguageChange: () => void;
};

export const LanguageToggle = ({ language, onLanguageChange }: LanguageToggleProps) => {
  return (
    <div className="mt-4">
      <div className="language-toggle-btn" onClick={onLanguageChange}>
        {language === 'fr' ? 'English' : 'Français'}
      </div>
    </div>
  );
};
