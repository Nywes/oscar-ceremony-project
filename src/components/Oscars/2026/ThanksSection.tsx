import './styles/index.css';
import { useState, useEffect, useCallback } from 'react';
import { LegalNotice } from '../shared/LegalNotice';
import {
  isSupabaseConfigured,
  getGuestbookMessages,
  addGuestbookMessage,
  voteGuestbookMessage,
  type GuestbookMessage,
} from '../../../lib/supabase-oscars';

type ThanksSectionProps = {
  year: number;
  language: 'fr' | 'en';
  onHeartClick: () => void;
  sectionRef: (el: HTMLElement | null) => void;
};

const MAX_CHARS = 240;
const VOTES_KEY = 'oscars_guestbook_votes';

type VoteMap = Record<string, 'up' | 'down'>;
type SortMode = 'recent' | 'top';

function loadVotes(year: number): VoteMap {
  try {
    return JSON.parse(localStorage.getItem(`${VOTES_KEY}_${year}`) || '{}');
  } catch {
    return {};
  }
}

function saveVotes(year: number, votes: VoteMap) {
  localStorage.setItem(`${VOTES_KEY}_${year}`, JSON.stringify(votes));
}

export const ThanksSection = ({ year, language, onHeartClick, sectionRef }: ThanksSectionProps) => {
  const [messages, setMessages] = useState<GuestbookMessage[]>([]);
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [votes, setVotes] = useState<VoteMap>(() => loadVotes(year));
  const [sort, setSort] = useState<SortMode>('recent');

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    getGuestbookMessages(year).then(setMessages);
  }, [year]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !author.trim() || sending) return;

    setSending(true);
    const msg = await addGuestbookMessage(year, author.trim(), text);
    setSending(false);

    if (msg) {
      setMessages((prev) => [msg, ...prev]);
      setText('');
    }
  };

  const handleVote = useCallback(
    async (msgId: string, direction: 'up' | 'down') => {
      const prev = votes[msgId];
      const next: VoteMap = { ...votes };

      if (prev === direction) {
        // Undo vote
        delete next[msgId];
        setVotes(next);
        saveVotes(year, next);
        setMessages((msgs) =>
          msgs.map((m) =>
            m.id === msgId
              ? {
                  ...m,
                  [direction === 'up' ? 'upvotes' : 'downvotes']: Math.max(
                    0,
                    (direction === 'up' ? m.upvotes : m.downvotes) - 1,
                  ),
                }
              : m,
          ),
        );
        voteGuestbookMessage(msgId, direction === 'up' ? 'upvotes' : 'downvotes', -1);
      } else {
        // New vote or switch
        next[msgId] = direction;
        setVotes(next);
        saveVotes(year, next);

        setMessages((msgs) =>
          msgs.map((m) => {
            if (m.id !== msgId) return m;
            const updated = { ...m };
            if (direction === 'up') {
              updated.upvotes += 1;
              if (prev === 'down') updated.downvotes = Math.max(0, updated.downvotes - 1);
            } else {
              updated.downvotes += 1;
              if (prev === 'up') updated.upvotes = Math.max(0, updated.upvotes - 1);
            }
            return updated;
          }),
        );

        voteGuestbookMessage(msgId, direction === 'up' ? 'upvotes' : 'downvotes', 1);
        if (prev) {
          voteGuestbookMessage(msgId, prev === 'up' ? 'upvotes' : 'downvotes', -1);
        }
      }
    },
    [votes, year],
  );

  const sortedMessages = [...messages].sort((a, b) => {
    if (sort === 'top') return b.upvotes - b.downvotes - (a.upvotes - a.downvotes);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const charsLeft = MAX_CHARS - text.length;

  return (
    <section className="thanks-section category-section-2026" ref={sectionRef}>
      <div className="thanks-content-2026">
        <h2 className="category-title-2026">{language === 'fr' ? 'Merci' : 'Thank You'}</h2>
        <div className="thanks-text thanks-text-small flex flex-col letter-spacing-0">
          {language === 'fr' ? (
            <>
              <p>Merci d'avoir suivi ma propre cérémonie de remise des Oscars.</p>
              <p>N'hésitez pas à partager vos avis et vos pronostics !</p>
              <p>Rendez-vous l'année prochaine</p>
              <p>Et d'ici là je compte sur vous pour aller au cinéma !</p>
            </>
          ) : (
            <>
              <p>Thank you for exploring my personal Oscars ceremony.</p>
              <p>Feel free to share your thoughts and predictions!</p>
              <p>See you next year</p>
              <p>And i count on you to go to the movies !</p>
            </>
          )}
        </div>
        <p className="thanks-letterboxd">
          <a href="https://boxd.it/9eI9r" target="_blank" rel="noopener noreferrer">
            <span className="text-[#FF8000]">{language === 'fr' ? `Ajoutez-moi` : 'Add me'}</span>
            <span className="text-[#00e054]">{language === 'fr' ? ` sur ` : ' on '}</span>
            <span className="text-[#40bcf4]">Letterboxd</span>
            <span> 🥺</span>
          </a>
        </p>
        <button className="thanks-btn-2026" onClick={onHeartClick}>
          🫶
        </button>

        {/* Guestbook */}
        <div className="guestbook-2026">
          <form className="guestbook-form" onSubmit={handleSubmit}>
            <h3 className="guestbook-title">
              {language === 'fr' ? 'Laissez un ptit message' : 'Leave a lil message'}
            </h3>
            <input
              className="guestbook-input"
              type="text"
              placeholder={language === 'fr' ? 'De la part de... ' : 'From...'}
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              maxLength={24}
              required
            />
            <div className="guestbook-input-wrapper">
              <textarea
                className="guestbook-input guestbook-textarea"
                placeholder={language === 'fr' ? 'Votre message...' : 'Your message...'}
                value={text}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_CHARS) setText(e.target.value);
                }}
                maxLength={MAX_CHARS}
                rows={2}
                required
              />
              <span
                className={`guestbook-charcount ${charsLeft <= 20 ? 'warn' : ''} ${charsLeft <= 0 ? 'limit' : ''}`}
              >
                {charsLeft}
              </span>
            </div>
            <button
              className="guestbook-send"
              type="submit"
              disabled={sending || !text.trim() || !author.trim()}
            >
              {sending ? '...' : language === 'fr' ? 'Envoyer' : 'Send'}
            </button>
          </form>
        </div>
      </div>

      {messages.length > 0 && (
        <>
          <div className="guestbook-sort">
            <button
              className={`guestbook-sort-btn ${sort === 'recent' ? 'active' : ''}`}
              onClick={() => setSort('recent')}
            >
              {language === 'fr' ? 'Récents' : 'Recent'}
            </button>
            <span className="guestbook-sort-sep">·</span>
            <button
              className={`guestbook-sort-btn ${sort === 'top' ? 'active' : ''}`}
              onClick={() => setSort('top')}
            >
              Top
            </button>
          </div>
          <div className="guestbook-wall">
            {sortedMessages.map((msg) => {
              const userVote = votes[msg.id];
              const score = msg.upvotes - msg.downvotes;
              return (
                <div className="guestbook-card" key={msg.id}>
                  <p className="guestbook-card-text">"{msg.message}"</p>
                  <div className="guestbook-card-footer">
                    <span className="guestbook-card-author">— {msg.author}</span>
                    <div className="guestbook-votes">
                      <button
                        className={`gv-btn ${userVote === 'up' ? 'gv-active' : ''}`}
                        onClick={() => handleVote(msg.id, 'up')}
                        aria-label="Upvote"
                      >
                        ▲
                      </button>
                      <span
                        className={`gv-score ${score > 0 ? 'positive' : score < 0 ? 'negative' : ''}`}
                      >
                        {score}
                      </span>
                      <button
                        className={`gv-btn ${userVote === 'down' ? 'gv-active' : ''}`}
                        onClick={() => handleVote(msg.id, 'down')}
                        aria-label="Downvote"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <LegalNotice year={year} />
    </section>
  );
};
