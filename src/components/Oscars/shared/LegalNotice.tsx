import './Presentation.css';

type LegalNoticeProps = {
  year: number;
};

export const LegalNotice = ({ year }: LegalNoticeProps) => {
  if (year !== 2026) return null;

  return (
    <div className="legal-notice">
      <p className="legal-text">
        ©A.M.P.A.S.® "OSCAR®," "OSCARS®," "ACADEMY AWARD®," "ACADEMY AWARDS®," "OSCAR NIGHT®," "A.M.P.A.S.®" and the Award of Merit statuette are registered trademarks and service marks of the Academy of Motion Picture Arts and Sciences.
      </p>
    </div>
  );
};
