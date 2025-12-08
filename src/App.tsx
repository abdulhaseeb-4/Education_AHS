
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { RAW_DATA } from './rawData';
import { parseMCQs, shuffleArray } from './utils';
import { MCQ } from './types';

// --- Components ---

// 1. Header
const Navbar = ({ 
  toggleTheme, 
  isDark, 
  toggleSearch, 
  onHome 
}: { 
  toggleTheme: () => void; 
  isDark: boolean; 
  toggleSearch: () => void;
  onHome: () => void;
}) => (
  <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div className="flex items-center space-x-2 cursor-pointer group" onClick={onHome}>
        <i className="fa-solid fa-graduation-cap text-2xl text-brand transition-transform group-hover:scale-110"></i>
        <span className="font-bold text-xl tracking-tight">Edu<span className="text-brand">MCQ</span> Pro</span>
      </div>
      <div className="flex items-center space-x-4">
        <button onClick={toggleSearch} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-600 dark:text-gray-300">
          <i className="fa-solid fa-magnifying-glass"></i>
        </button>
        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-600 dark:text-gray-300">
          <i className={`fa-solid ${isDark ? 'fa-sun text-yellow-400' : 'fa-moon'}`}></i>
        </button>
      </div>
    </div>
  </nav>
);

// 2. Search Bar
const SearchBar = ({ 
  onSearch, 
  isVisible 
}: { 
  onSearch: (query: string) => void; 
  isVisible: boolean; 
}) => {
  if (!isVisible) return null;
  return (
    <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 animate-fade-in-down">
      <div className="max-w-3xl mx-auto flex space-x-2">
        <input 
          type="text" 
          placeholder="Search within current questions..." 
          onChange={(e) => onSearch(e.target.value)}
          className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand text-gray-800 dark:text-gray-100"
          autoFocus
        />
      </div>
    </div>
  );
};

// 3. Subject Card
const SubjectCard: React.FC<{ subject: string; onClick: () => void }> = ({ subject, onClick }) => (
  <div onClick={onClick} className="cursor-pointer bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1 border border-transparent hover:border-brand">
    <div className="flex items-center justify-between mb-4">
      <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-brand font-bold text-lg">
        {subject.substring(0, 3).toUpperCase()}
      </div>
      <i className="fa-solid fa-chevron-right text-gray-400"></i>
    </div>
    <h3 className="text-xl font-bold text-gray-800 dark:text-white">{subject}</h3>
    <p className="text-sm text-gray-500 mt-1">Midterm & Final Term</p>
  </div>
);

// 4. Term Card
const TermCard = ({ 
  term, 
  icon, 
  colorClass, 
  onClick 
}: { 
  term: string; 
  icon: string; 
  colorClass: string; 
  onClick: () => void;
}) => (
  <div onClick={onClick} className={`cursor-pointer group bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition border-l-8 ${colorClass} w-full sm:w-1/3`}>
    <i className={`fa-solid ${icon} text-5xl mb-4 group-hover:scale-110 transition ${colorClass.replace('border-', 'text-')}`}></i>
    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{term}</h3>
    <p className="text-gray-500 mt-2">Practice Questions (Randomized)</p>
  </div>
);

// 5. Quiz Player
const QuizPlayer = ({
  mcq,
  index,
  total,
  score,
  userAnswer,
  onAnswer,
  onNext,
  onPrev,
  onBack,
  isBookmarked,
  onToggleBookmark,
  autoPlay,
  toggleAutoPlay,
  isReading,
  toggleReading,
  isTimeout
}: {
  mcq: MCQ;
  index: number;
  total: number;
  score: { correct: number; wrong: number };
  userAnswer: string | null;
  onAnswer: (option: string | null) => void;
  onNext: () => void;
  onPrev: () => void;
  onBack: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  autoPlay: boolean;
  toggleAutoPlay: () => void;
  isReading: boolean;
  toggleReading: () => void;
  isTimeout: boolean;
}) => {
  // Using a fresh state on mount ensures the timer starts at 30s every time the component is remounted (via key prop).
  const [timeLeft, setTimeLeft] = useState(30);
  const progress = ((index + 1) / total) * 100;

  // The Ticking Clock
  useEffect(() => {
    if (userAnswer !== null) return; // Stop ticking if answered (string or 'TIMEOUT')

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [userAnswer]); // Re-run if answer status changes

  // The Alarm (Timeout Trigger)
  useEffect(() => {
    // Only trigger if time is 0 and we haven't answered yet
    if (timeLeft === 0 && userAnswer === null) {
      onAnswer(null); // Null implies timeout
    }
  }, [timeLeft, userAnswer, onAnswer]);

  // Determine timer color
  const getTimerColor = () => {
      if (timeLeft > 10) return 'text-brand';
      if (timeLeft > 5) return 'text-yellow-500';
      return 'text-red-600 animate-pulse';
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Controls */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <button onClick={onBack} className="text-sm px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition text-gray-800 dark:text-gray-200">
          <i className="fa-solid fa-arrow-left mr-2"></i> Back
        </button>
        
        <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
            <span className="font-bold text-brand">{index + 1} / {total}</span>
            <span className="text-gray-300">|</span>
            <div className="flex items-center space-x-2 text-sm">
                <span className="text-green-500"><i className="fa-solid fa-check"></i> {score.correct}</span>
                <span className="text-red-500"><i className="fa-solid fa-xmark"></i> {score.wrong}</span>
            </div>
            </div>

            {/* Timer Display */}
            <div className={`flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm font-bold font-mono ${getTimerColor()}`}>
                <i className="fa-regular fa-clock"></i>
                <span>{timeLeft}s</span>
            </div>
        </div>

        <div className="flex items-center space-x-2">
          <button onClick={onToggleBookmark} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
            <i className={`fa-${isBookmarked ? 'solid text-brand' : 'regular text-gray-400'} fa-bookmark text-xl`}></i>
          </button>
          <button 
            onClick={toggleAutoPlay} 
            className={`flex items-center space-x-1 px-3 py-1 rounded-full border text-xs font-bold uppercase transition ${autoPlay ? 'bg-brand text-white border-brand' : 'border-gray-300 dark:border-gray-600 text-gray-500'}`}
          >
            <i className={`fa-solid fa-rotate ${autoPlay ? 'fa-spin' : ''}`}></i> <span>Auto: {autoPlay ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden relative border border-gray-100 dark:border-gray-700">
        <div className="h-1 w-full bg-gray-200 dark:bg-gray-700">
          <div className="h-full bg-brand transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="p-6 md:p-10">
          <h3 className="text-xl md:text-2xl font-semibold mb-6 leading-relaxed text-gray-800 dark:text-gray-100">
            {mcq.question}
          </h3>

          <div className="flex items-center space-x-4 mb-8 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg w-fit">
            <button onClick={toggleReading} className={`${isReading ? 'text-brand' : 'text-gray-500'} hover:text-brand transition`}>
              <i className={`fa-solid ${isReading ? 'fa-volume-high' : 'fa-volume-xmark'} text-lg`}></i>
            </button>
            <span className="text-xs text-gray-400 font-mono">TTS Control</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {Object.entries(mcq.options).map(([key, value]) => {
              let btnClass = "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700";
              let badgeClass = "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200";

              if (userAnswer) {
                 if (key === mcq.answer) {
                   btnClass = "bg-green-100 dark:bg-green-900/30 border-green-500";
                   badgeClass = "bg-green-500 text-white";
                 } else if (key === userAnswer && userAnswer !== mcq.answer) {
                   btnClass = "bg-red-100 dark:bg-red-900/30 border-red-500";
                   badgeClass = "bg-red-500 text-white";
                 } else if (isTimeout && key === mcq.answer) {
                     // If timeout, highlight the correct answer
                     btnClass = "bg-green-100 dark:bg-green-900/30 border-green-500";
                     badgeClass = "bg-green-500 text-white";
                 } else {
                    btnClass = "opacity-50 border-gray-200 dark:border-gray-700";
                 }
              }

              return (
                <button 
                  key={key} 
                  onClick={() => !userAnswer && onAnswer(key)}
                  disabled={!!userAnswer}
                  className={`w-full text-left p-4 rounded-lg border-2 transition flex items-center group ${btnClass}`}
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 transition ${badgeClass}`}>
                    {key}
                  </span>
                  <span className="text-lg text-gray-800 dark:text-gray-200">{value}</span>
                </button>
              );
            })}
          </div>

          {userAnswer && (
            <div className={`mt-6 p-4 border-l-4 rounded-r-lg animate-fade-in ${isTimeout ? 'bg-red-50 dark:bg-red-900/20 border-red-500' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'}`}>
              <h4 className={`font-bold mb-1 ${isTimeout ? 'text-red-700 dark:text-red-300' : 'text-blue-700 dark:text-blue-300'}`}>
                <i className={`fa-solid ${isTimeout ? 'fa-clock' : 'fa-circle-info'} mr-2`}></i> 
                {isTimeout ? "Time's Up!" : "Explanation"}
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{mcq.explanation}</p>
            </div>
          )}
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 flex justify-between items-center">
          <button 
            onClick={onPrev} 
            disabled={index === 0}
            className="px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition font-medium text-gray-600 dark:text-gray-300 disabled:opacity-50"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i> Prev
          </button>
          <button 
            onClick={onNext}
            disabled={index === total - 1}
            className="px-6 py-2 bg-brand text-white rounded-lg hover:bg-brandDark shadow-lg shadow-brand/30 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next <i className="fa-solid fa-arrow-right ml-1"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main App Logic ---

export default function App() {
  // State
  const [allParsedMCQs, setAllParsedMCQs] = useState<MCQ[]>([]);
  const [activeMCQs, setActiveMCQs] = useState<MCQ[]>([]);
  
  const [view, setView] = useState<'subjects' | 'terms' | 'quiz'>('subjects');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [timedOutQuestions, setTimedOutQuestions] = useState<Record<number, boolean>>({});
  
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    const saved = localStorage.getItem('bookmarks');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [autoPlay, setAutoPlay] = useState(false);
  const [isReading, setIsReading] = useState(false);
  
  // Refs
  const synth = useRef<SpeechSynthesis>(window.speechSynthesis);
  const autoPlayTimer = useRef<number | null>(null);

  // Initialize Data
  useEffect(() => {
    const parsed = parseMCQs(RAW_DATA);
    setAllParsedMCQs(parsed);
  }, []);

  // Theme Effect
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Derived Data
  const subjects = useMemo(() => {
    return Array.from(new Set(allParsedMCQs.map(m => m.subject))).sort();
  }, [allParsedMCQs]);

  // Handlers
  const handleSelectSubject = (sub: string) => {
    setSelectedSubject(sub);
    setView('terms');
    setSearchQuery('');
  };

  const handleSelectTerm = (termType: 'Midterm' | 'Final') => {
    const filtered = allParsedMCQs.filter(
        m => m.subject === selectedSubject && m.term === termType
    );
    // Shuffle MCQs here for randomness
    const shuffled = shuffleArray(filtered);
    
    setActiveMCQs(shuffled);
    setCurrentIndex(0);
    setScore({ correct: 0, wrong: 0 });
    setUserAnswers({});
    setTimedOutQuestions({});
    setView('quiz');
    setSearchQuery('');
  };

  const handleAnswer = (optionKey: string | null) => {
    if (userAnswers[currentIndex]) return; // Already answered

    const currentMCQ = activeMCQs[currentIndex];
    const isTimeout = optionKey === null;
    
    // Store answer (use 'TIMEOUT' string if null to mark it answered in state)
    setUserAnswers(prev => ({ ...prev, [currentIndex]: optionKey || 'TIMEOUT' }));
    
    if (isTimeout) {
        setTimedOutQuestions(prev => ({ ...prev, [currentIndex]: true }));
        setScore(prev => ({ ...prev, wrong: prev.wrong + 1 }));
        
        speak(`Time is up. The correct answer is ${currentMCQ.answer}. ${currentMCQ.explanation}`, () => {
             if (autoPlay) {
                autoPlayTimer.current = window.setTimeout(() => handleNext(), 2000);
            }
        });
        return;
    }

    const isCorrect = optionKey === currentMCQ.answer;
    
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      wrong: prev.wrong + (isCorrect ? 0 : 1)
    }));

    // Speak result
    const feedback = isCorrect 
        ? "Correct!" 
        : `Incorrect. The answer is ${currentMCQ.answer}.`;
    
    speak(feedback + " " + currentMCQ.explanation, () => {
        if (autoPlay) {
            autoPlayTimer.current = window.setTimeout(() => {
                handleNext();
            }, 2000);
        }
    });
  };

  const handleNext = () => {
    stopAudio();
    if (currentIndex < activeMCQs.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    stopAudio();
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleBookmark = () => {
    const mcqId = activeMCQs[currentIndex].id;
    let newBookmarks;
    if (bookmarks.includes(mcqId)) {
        newBookmarks = bookmarks.filter(id => id !== mcqId);
    } else {
        newBookmarks = [...bookmarks, mcqId];
    }
    setBookmarks(newBookmarks);
    localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
  };

  // TTS Helpers
  const speak = (text: string, onEnd?: () => void) => {
    if (!isReading && !autoPlay) return; // Only speak if reading enabled or autoplay enabled
    
    // Stop any current speech
    synth.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    if (onEnd) utterance.onend = onEnd;
    synth.current.speak(utterance);
  };

  const stopAudio = () => {
    synth.current.cancel();
    if (autoPlayTimer.current) clearTimeout(autoPlayTimer.current);
  };

  const toggleReading = () => {
      if (isReading) {
          stopAudio();
          setIsReading(false);
      } else {
          setIsReading(true);
          // Read current question
          const q = activeMCQs[currentIndex];
          const optionsText = Object.entries(q.options).map(([k, v]) => `${k}, ${v}`).join('. ');
          speak(`${q.question}. Options: ${optionsText}`);
      }
  };

  // Watch for index change to read question if auto/reading is on
  useEffect(() => {
    if (view === 'quiz' && activeMCQs.length > 0 && !userAnswers[currentIndex]) {
        if (autoPlay || isReading) {
            const q = activeMCQs[currentIndex];
            const optionsText = Object.entries(q.options).map(([k, v]) => `${k}, ${v}`).join('. ');
            speak(`Question ${currentIndex + 1}: ${q.question}. ${optionsText}`);
        }
    }
  }, [currentIndex, view, activeMCQs, autoPlay, isReading]);


  const visibleSubjects = subjects.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300 font-sans">
      <Navbar 
        toggleTheme={() => setIsDark(!isDark)} 
        isDark={isDark} 
        toggleSearch={() => setShowSearch(!showSearch)}
        onHome={() => { setView('subjects'); setSearchQuery(''); stopAudio(); }}
      />
      
      <SearchBar isVisible={showSearch} onSearch={setSearchQuery} />

      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
        
        {/* VIEW: SUBJECTS */}
        {view === 'subjects' && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">Select Your Subject</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {visibleSubjects.length > 0 ? visibleSubjects.map(sub => (
                <SubjectCard key={sub} subject={sub} onClick={() => handleSelectSubject(sub)} />
              )) : (
                 <div className="col-span-full text-center text-gray-500">No subjects found matching "{searchQuery}"</div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: TERMS */}
        {view === 'terms' && selectedSubject && (
          <div className="animate-fade-in text-center">
            <button onClick={() => setView('subjects')} className="mb-6 text-gray-500 hover:text-brand flex items-center justify-center mx-auto transition">
              <i className="fa-solid fa-arrow-left mr-2"></i> Back to Subjects
            </button>
            <h2 className="text-4xl font-bold mb-12 text-brand">{selectedSubject}</h2>
            <div className="flex flex-col sm:flex-row justify-center gap-8 px-4">
              <TermCard 
                term="Midterm" 
                icon="fa-book-open" 
                colorClass="border-blue-500 text-blue-500" 
                onClick={() => handleSelectTerm('Midterm')} 
              />
              <TermCard 
                term="Final" 
                icon="fa-graduation-cap" 
                colorClass="border-green-500 text-green-500" 
                onClick={() => handleSelectTerm('Final')} 
              />
            </div>
          </div>
        )}

        {/* VIEW: QUIZ */}
        {view === 'quiz' && activeMCQs.length > 0 && (
          <QuizPlayer 
            key={currentIndex} 
            mcq={activeMCQs[currentIndex]}
            index={currentIndex}
            total={activeMCQs.length}
            score={score}
            userAnswer={userAnswers[currentIndex] || null}
            onAnswer={handleAnswer}
            onNext={handleNext}
            onPrev={handlePrev}
            onBack={() => { stopAudio(); setView('terms'); }}
            isBookmarked={bookmarks.includes(activeMCQs[currentIndex].id)}
            onToggleBookmark={handleBookmark}
            autoPlay={autoPlay}
            toggleAutoPlay={() => { setAutoPlay(!autoPlay); stopAudio(); }}
            isReading={isReading}
            toggleReading={toggleReading}
            isTimeout={!!timedOutQuestions[currentIndex]}
          />
        )}
        
        {view === 'quiz' && activeMCQs.length === 0 && (
           <div className="text-center mt-20">
               <h3 className="text-xl text-gray-600 dark:text-gray-400">No questions found for this selection.</h3>
               <button onClick={() => setView('terms')} className="mt-4 px-4 py-2 bg-brand text-white rounded">Go Back</button>
           </div>
        )}

      </main>
      
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto py-6 transition-colors">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm mb-4">© 2025 EduMCQ Pro. Designed for Excellence.</p>
          <div className="flex justify-center space-x-6">
            <a href="#" className="text-gray-400 hover:text-brand transition"><i className="fa-brands fa-facebook text-xl"></i></a>
            <a href="#" className="text-gray-400 hover:text-brand transition"><i className="fa-brands fa-twitter text-xl"></i></a>
            <a href="#" className="text-gray-400 hover:text-brand transition"><i className="fa-brands fa-whatsapp text-xl"></i></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
