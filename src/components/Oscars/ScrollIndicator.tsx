import './Presentation.css';

type ScrollIndicatorProps = {
  onScrollClick: () => void;
};

export const ScrollIndicator = ({ onScrollClick }: ScrollIndicatorProps) => {
  return (
    <div className="scroll-indicator" onClick={onScrollClick}>
      <span>Scroll</span>
      <div className="scroll-arrow"></div>
    </div>
  );
};
