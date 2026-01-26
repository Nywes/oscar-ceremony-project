'use client';
import { useState, useEffect, useRef } from 'react';
import './styles/index.css';
import oscarsData2026Json from './oscars-data-2026.json';
import { YouTubeModal } from '../shared/YouTubeModal';
import { MissingPoster } from '../shared/MissingPoster';
import { IntroSection } from './IntroSection';
import { CategorySection } from './CategorySection';
import { ThanksSection } from './ThanksSection';
import type { OscarsData2026, Nominee2026 } from './types';
import {
  getActorImagePathSync,
  getFilmImagePathSync,
  isNotSeen,
  checkImageExists,
  getNomineeImagePaths,
} from './utils';

export const Presentation2026 = () => {
  const [scrollY, setScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const [highlightedWinners, setHighlightedWinners] = useState<{ [key: string]: boolean }>({});
  const [showingReveal, setShowingReveal] = useState<string | null>(null);
  const [animatedCategories, setAnimatedCategories] = useState<{ [key: string]: boolean }>({});
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [validImagePaths, setValidImagePaths] = useState<{ [key: string]: boolean }>({});
  const [currentImageIndices, setCurrentImageIndices] = useState<{ [key: string]: number }>({});
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const scrollTimeout = useRef<number | undefined>(undefined);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');

  const oscarsData: OscarsData2026 = oscarsData2026Json as OscarsData2026;
  const { year, categories } = oscarsData;

  useEffect(() => {
    const preloadImages = async () => {
      const actorNames = new Set<string>();
      const filmNames = new Set<string>();

      categories.forEach((category) => {
        category.nominees.forEach((nominee) => {
          if (nominee.person) {
            actorNames.add(nominee.person.name);
          }
          if (nominee.film) {
            filmNames.add(nominee.film.title);
          }
        });
      });

      const results = await Promise.all([
        ...Array.from(actorNames).map(async (actorName) => {
          const path = await checkImageExists(
            `/actors/2026/${actorName
              .replace(/\s+/g, '-')
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')}.jpg`
          );
          return [actorName, path] as [string, boolean];
        }),
        ...Array.from(filmNames).map(async (filmName) => {
          const path = await checkImageExists(
            `/films/2026/${filmName
              .replace(/\s+/g, '-')
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')}.jpg`
          );
          return [filmName, path] as [string, boolean];
        }),
      ]);

      setValidImagePaths(Object.fromEntries(results));
    };

    preloadImages();
  }, [categories]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDiff = Math.abs(currentScrollY - lastScrollY);

      if (isAnimating && scrollDiff > 50) {
        if (showingReveal) {
          handleRevealComplete();
        }
      }

      setLastScrollY(currentScrollY);
      setScrollY(currentScrollY);

      if (scrollTimeout.current) {
        window.clearTimeout(scrollTimeout.current);
      }

      scrollTimeout.current = window.setTimeout(() => {
        setLastScrollY(window.scrollY);
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) {
        window.clearTimeout(scrollTimeout.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastScrollY, isAnimating, showingReveal]);

  useEffect(() => {
    const sectionHeight = window.innerHeight;
    const currentSection = Math.floor(scrollY / sectionHeight);
    setActiveSection(Math.min(currentSection, categories.length + 1));

    const introSection = document.querySelector('.intro-section');
    if (introSection) {
      if (scrollY > window.innerHeight * 0.3) {
        introSection.classList.add('fade-out');
      } else {
        introSection.classList.remove('fade-out');
      }
    }
  }, [scrollY, categories.length]);

  const navigateToSection = (index: number) => {
    if (sectionRefs.current[index]) {
      sectionRefs.current[index]?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const revealWinner = (categoryName: string) => {
    const isCurrentlyRevealed = highlightedWinners[categoryName];
    
    if (isCurrentlyRevealed) {
      setHighlightedWinners((prev) => {
        const newState = { ...prev };
        delete newState[categoryName];
        return newState;
      });
      setShowingReveal(null);
      return;
    }

    const categoryIndex = categories.findIndex((cat) => cat.name === categoryName);
    const isLastFourCategories = categoryIndex >= categories.length - 4;

    if (!animatedCategories[categoryName] && isLastFourCategories) {
      setShowingReveal(categoryName);
      setIsAnimating(true);
      setAnimatedCategories((prev) => ({
        ...prev,
        [categoryName]: true,
      }));
    } else {
      setHighlightedWinners((prev) => ({
        ...prev,
        [categoryName]: true,
      }));
      if (categoryName === 'Music (Original Score)') {
        setSelectedVideoId('2TAZJHgGt_c');
      }
    }
  };

  const handleRevealComplete = () => {
    if (showingReveal) {
      setHighlightedWinners((prev) => ({
        ...prev,
        [showingReveal]: true,
      }));
      if (showingReveal === 'Music (Original Score)') {
        setSelectedVideoId('2TAZJHgGt_c');
      }
      setShowingReveal(null);
      setIsAnimating(false);
    }
  };

  const isWinner = (categoryName: string, nominee: Nominee2026) => {
    const category = categories.find((c) => c.name === categoryName);
    if (!category || !category.winners.my_choice) return false;

    return (
      category.winners.my_choice === nominee.id && highlightedWinners[categoryName]
    );
  };

  const assignRef = (index: number) => (el: HTMLElement | null) => {
    sectionRefs.current[index] = el;
  };

  const createFallingHeart = () => {
    const element = document.createElement('div');
    element.className = 'falling-heart';

    const size = Math.floor(Math.random() * (50 - 15 + 1)) + 15;
    element.style.width = `${size}px`;
    element.style.height = `${size}px`;

    const generateRandomRed = (baseLightness: number) => {
      const baseHue = 0;
      const saturation = Math.floor(Math.random() * (100 - 85) + 85);
      const lightness = Math.max(0, Math.min(100, baseLightness + (Math.random() * 10 - 5)));
      return `hsl(${baseHue}, ${saturation}%, ${lightness}%)`;
    };

    const gradient = [
      generateRandomRed(65),
      generateRandomRed(55),
      generateRandomRed(45),
      generateRandomRed(35),
      generateRandomRed(30),
      generateRandomRed(25),
      generateRandomRed(20),
    ];

    const gradientString = `linear-gradient(135deg, 
        ${gradient[0]} 0%,
        ${gradient[1]} 20%,
        ${gradient[2]} 35%,
        ${gradient[3]} 50%,
        ${gradient[4]} 65%,
        ${gradient[5]} 80%,
        ${gradient[6]} 100%
      )`;

    element.style.setProperty('--heart-gradient', gradientString);

    const randomLeft = Math.random() * (window.innerWidth - size);
    element.style.left = `${randomLeft}px`;

    const spinAmount = 360 * (Math.floor(Math.random() * 4) + 1);
    element.style.setProperty('--spin-amount', `${spinAmount}deg`);

    document.body.appendChild(element);

    element.addEventListener('animationend', () => {
      document.body.removeChild(element);
    });
  };

  const handleNomineeClick = async (nominee: Nominee2026) => {
    if (nominee.person?.name === 'Monica Barbaro') {
      createFallingHeart();
    }
    if (nominee.person) {
      const nomineeCard = document.querySelector(`[data-actor="${nominee.person.name}"]`);
      if (nomineeCard) {
        const categorySection = nomineeCard.closest('.category-section');
        const categoryTitle = categorySection?.querySelector('.category-title')?.textContent;

        if (categoryTitle && categoryTitle !== 'Directing') {
          const image = nomineeCard.querySelector('.nominee-image') as HTMLElement;
          if (image) {
            const actorName = nominee.person.name;
            const currentIndex = currentImageIndices[actorName] || 0;
            const imagePaths = getNomineeImagePaths(nominee);
            const totalPhotos = imagePaths.length || 1;
            const nextIndex = (currentIndex + 1) % totalPhotos;

            setCurrentImageIndices((prev) => ({
              ...prev,
              [actorName]: nextIndex,
            }));

            image.classList.remove('spinning');
            void image.offsetWidth;
            image.classList.add('spinning');

            const newImagePath = imagePaths[nextIndex] || getActorImagePathSync(actorName, nextIndex);
            if (newImagePath) {
              image.setAttribute('src', newImagePath);
            }
          }
        }
      }
    }

    if (nominee.film.trailer) {
      const videoId = nominee.film.trailer.match(
        /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
      )?.[1];
      if (videoId) {
        setSelectedVideoId(videoId);
        return;
      }
    }

    const videoId = await searchTrailer(nominee.film.title);
    setSelectedVideoId(videoId);
  };

  const handleModalClose = () => {
    setSelectedVideoId(null);
  };

  const createHeartAvalanche = () => {
    const startTime = Date.now();
    const duration = 5000;
    const interval = 100;

    const createHeart = () => {
      const element = document.createElement('div');
      element.className = 'falling-heart';

      const size = Math.floor(Math.random() * (50 - 15 + 1)) + 15;
      element.style.width = `${size}px`;
      element.style.height = `${size}px`;

      const generateRandomRed = (baseLightness: number) => {
        const baseHue = 0;
        const saturation = Math.floor(Math.random() * (100 - 85) + 85);
        const lightness = Math.max(0, Math.min(100, baseLightness + (Math.random() * 10 - 5)));
        return `hsl(${baseHue}, ${saturation}%, ${lightness}%)`;
      };

      const gradient = [
        generateRandomRed(65),
        generateRandomRed(55),
        generateRandomRed(45),
        generateRandomRed(35),
        generateRandomRed(30),
        generateRandomRed(25),
        generateRandomRed(20),
      ];

      const gradientString = `linear-gradient(135deg, 
        ${gradient[0]} 0%,
        ${gradient[1]} 20%,
        ${gradient[2]} 35%,
        ${gradient[3]} 50%,
        ${gradient[4]} 65%,
        ${gradient[5]} 80%,
        ${gradient[6]} 100%
      )`;

      element.style.setProperty('--heart-gradient', gradientString);

      const randomLeft = Math.random() * (window.innerWidth - size);
      element.style.left = `${randomLeft}px`;

      const spinAmount = 360 * (Math.floor(Math.random() * 4) + 1);
      element.style.setProperty('--spin-amount', `${spinAmount}deg`);

      document.body.appendChild(element);

      element.addEventListener('animationend', () => {
        document.body.removeChild(element);
      });
    };

    const heartInterval = setInterval(() => {
      if (Date.now() - startTime >= duration) {
        clearInterval(heartInterval);
        return;
      }
      createHeart();
    }, interval);
  };

  const handleLanguageChange = () => {
    if (language === 'fr') {
      setLanguage('en');
    } else {
      setLanguage('fr');
    }
  };

  const searchTrailer = async (movieTitle: string) => {
    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    if (!apiKey) {
      console.error('YouTube API key is not configured');
      return null;
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(
          movieTitle + ' trailer official'
        )}&type=video&key=${apiKey}`
      );
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        return data.items[0].id.videoId;
      }
      return null;
    } catch (error) {
      console.error('Error searching YouTube:', error);
      return null;
    }
  };

  return (
    <div className="oscars-presentation">
      <IntroSection
        year={year}
        language={language}
        onLanguageChange={handleLanguageChange}
        onScrollClick={() => navigateToSection(1)}
        sectionRef={assignRef(0)}
      />

      {categories.map((category, index) => (
        <CategorySection
          key={category.id || category.name}
          category={category}
          index={index}
          isActive={activeSection === index + 1}
          sectionRef={assignRef(index + 1)}
          isWinner={isWinner}
          isNotSeen={isNotSeen}
          highlightedWinners={highlightedWinners}
          showingReveal={showingReveal}
          onRevealClick={revealWinner}
          onRevealComplete={handleRevealComplete}
          onNomineeClick={handleNomineeClick}
          getActorImagePath={getActorImagePathSync}
          getFilmImagePath={(filmName) => getFilmImagePathSync(filmName, validImagePaths)}
          currentImageIndices={currentImageIndices}
          year={year}
        />
      ))}

      <ThanksSection
        year={year}
        language={language}
        onHeartClick={createHeartAvalanche}
        sectionRef={assignRef(categories.length + 2)}
      />

      <YouTubeModal videoId={selectedVideoId} onClose={handleModalClose} />
      <footer className="oscars-footer">
        <div className="missing-poster-container pt-40" style={{ margin: '40px auto' }}>
          <MissingPoster
            name="CHALLENGERS"
            lastSeen="APRIL 29, 2024"
            photoUrl="/films/Challengers.jpg"
          />
        </div>
      </footer>
    </div>
  );
};
