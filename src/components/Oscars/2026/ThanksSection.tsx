import '../shared/Presentation.css';
import { LegalNotice } from '../shared/LegalNotice';

type ThanksSectionProps = {
  year: number;
  language: 'fr' | 'en';
  onHeartClick: () => void;
  sectionRef: (el: HTMLElement | null) => void;
};

export const ThanksSection = ({ year, language, onHeartClick, sectionRef }: ThanksSectionProps) => {
  return (
    <section className="thanks-section category-section" ref={sectionRef}>
      <div className="thanks-content">
        <h2 className="category-title">Thank You</h2>
        <div className="thanks-text flex flex-col letter-spacing-0">
          {language === 'fr' ? (
            <>
              <p>Merci d'avoir suivi ma propre cérémonie de remise des Oscars {year}.</p>
              <p>N'hésitez pas à partager vos avis et vos pronostics !</p>
              <p>
                Rendez-vous l'année prochaine pour les Oscars {year + 1}, avec un site encore plus
                abouti, c'est promis !
              </p>
              <p>Et d'ici là je compte sur vous pour aller au cinéma !</p>
            </>
          ) : (
            <>
              <p>Thank you for exploring my personal {year} Oscars rewards.</p>
              <p>Feel free to share your thoughts and predictions!</p>
              <p>
                See you next year for the Oscars {year + 1}, with an improved website this time, i
                promise !
              </p>
              <p>And i count on you to go to the movies !</p>
            </>
          )}
        </div>
        <p>
          {language === 'fr' ? `Ajoutez-moi sur Letterboxd :` : 'Add me on Letterboxd :'}
          <a href="https://boxd.it/9eI9r" target="_blank" rel="noopener noreferrer">
            <span className="text-[#FF8000]">https://</span>
            <span className="text-[#00e054]">boxd.it</span>
            <span className="text-[#40bcf4]">/9eI9r</span>
          </a>
        </p>
        <p>Eliott</p>
        <button className="thanks-btn" onClick={onHeartClick}>
          🫶
        </button>
      </div>
      <LegalNotice year={year} />
    </section>
  );
};
