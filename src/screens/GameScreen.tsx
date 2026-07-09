import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gamepad2, Award, RefreshCw, Star, Heart, Volume2, 
  HelpCircle, CheckCircle, XCircle, Trophy, Sparkles,
  ArrowLeft, Grid, Compass, Zap
} from 'lucide-react';

interface GameScreenProps {
  onNavigate: (path: string) => void;
  onNavigateToMoveDetail?: (slug: string) => void;
}

// -----------------------------------------------------
// GAME 1 DATA: Memory Match Game
// -----------------------------------------------------
const MEMORY_ITEMS = [
  { id: 'dune', name: 'Dune: Cát II', image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400' },
  { id: 'wednesday', name: 'Wednesday', image: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=400' },
  { id: 'oppenheimer', name: 'Oppenheimer', image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400' },
  { id: 'avatar', name: 'Avatar', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400' },
  { id: 'spiderman', name: 'Spider-Man', image: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400' },
  { id: 'titanic', name: 'Titanic', image: 'https://images.unsplash.com/photo-1500077423678-25eead48513a?w=400' },
];

// -----------------------------------------------------
// GAME 2 DATA: Trivia Quiz Game
// -----------------------------------------------------
interface TriviaQuestion {
  id: number;
  question: string;
  options: string[];
  answer: string;
  fact: string;
}

const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  {
    id: 1,
    question: "Bộ phim nào đạt doanh thu cao nhất mọi thời đại?",
    options: ["Avengers: Endgame", "Avatar (2009)", "Titanic", "Avatar: The Way of Water"],
    answer: "Avatar (2009)",
    fact: "Avatar (2009) của đạo diễn James Cameron hiện nắm giữ ngôi vương với gần 2.92 tỷ USD."
  },
  {
    id: 2,
    question: "Tập phim 'Dune: Hành tinh cát - Phần 2' được chuyển thể từ tác phẩm của ai?",
    options: ["J.R.R. Tolkien", "Frank Herbert", "George R.R. Martin", "Isaac Asimov"],
    answer: "Frank Herbert",
    fact: "Tác phẩm khoa học viễn tưởng vĩ đại Dune được nhà văn Frank Herbert xuất bản lần đầu năm 1965."
  },
  {
    id: 3,
    question: "Nam diễn viên chính thủ vai Robert Oppenheimer trong phim Oppenheimer là ai?",
    options: ["Cillian Murphy", "Robert Downey Jr.", "Matt Damon", "Rami Malek"],
    answer: "Cillian Murphy",
    fact: "Cillian Murphy đã xuất sắc đoạt tượng vàng Oscar danh giá cho Nam chính xuất sắc nhất nhờ vai diễn này."
  },
  {
    id: 4,
    question: "Trong thế giới hoạt hình Studio Ghibli, 'Vùng đất linh hồn' có tên tiếng Anh là gì?",
    options: ["My Neighbor Totoro", "Howl's Moving Castle", "Spirited Away", "Princess Mononoke"],
    answer: "Spirited Away",
    fact: "Spirited Away đạt giải Oscar cho phim Hoạt hình xuất sắc năm 2003, là báu vật của hoạt hình Nhật Bản."
  },
  {
    id: 5,
    question: "Bộ phim kinh điển 'The Godfather' (Bố Già) được đạo diễn bởi ai?",
    options: ["Martin Scorsese", "Steven Spielberg", "Francis Ford Coppola", "Quentin Tarantino"],
    answer: "Francis Ford Coppola",
    fact: "Francis Ford Coppola đã tạo nên một kiệt tác điện ảnh thay đổi hoàn toàn thể loại phim tâm lý tội phạm."
  },
  {
    id: 6,
    question: "Đạo diễn nào đứng sau loạt phim siêu phẩm 'Inception', 'Interstellar' và 'The Dark Knight'?",
    options: ["Steven Spielberg", "Christopher Nolan", "James Cameron", "Ridley Scott"],
    answer: "Christopher Nolan",
    fact: "Christopher Nolan nổi tiếng với phong cách làm phim sử dụng kỹ xảo thực tế và cốt truyện du hành thời gian, không gian phức tạp."
  },
  {
    id: 7,
    question: "Bộ phim điện ảnh Việt Nam nào đạt doanh thu cao nhất lịch sử phòng vé tính đến đầu năm 2024?",
    options: ["Nhà Bà Nữ", "Bố Già", "Mai", "Lật Mặt 6"],
    answer: "Mai",
    fact: "Phim điện ảnh 'Mai' của đạo diễn Trấn Thành phát hành dịp Tết 2024 đã xuất sắc vượt mốc 520 tỷ đồng doanh thu nội địa."
  },
  {
    id: 8,
    question: "Bộ phim nào thắng giải 'Phim hay nhất' tại lễ trao giải Oscar lần thứ 96 năm 2024?",
    options: ["Oppenheimer", "Barbie", "Poor Things", "The Zone of Interest"],
    answer: "Oppenheimer",
    fact: "Oppenheimer thống trị Oscar 2024 với 7 giải thưởng lớn, bao gồm Phim hay nhất và Đạo diễn xuất sắc nhất."
  },
  {
    id: 9,
    question: "Nhân vật Iron Man (Tony Stark) hy sinh trong phần phim nào của vũ trụ điện ảnh Marvel?",
    options: ["Avengers: Infinity War", "Avengers: Endgame", "Captain America: Civil War", "Iron Man 3"],
    answer: "Avengers: Endgame",
    fact: "Sự ra đi của Tony Stark với câu thoại kinh điển 'I am Iron Man' đã khép lại kỷ nguyên Infinity Saga đầy cảm xúc."
  },
  {
    id: 10,
    question: "Loạt phim giả tưởng huyền thoại 'Chúa tể những chiếc nhẫn' (The Lord of the Rings) gồm bao nhiêu phần phim chính?",
    options: ["2 phần", "3 phần", "4 phần", "5 phần"],
    answer: "3 phần",
    fact: "Bộ ba phim gồm: The Fellowship of the Ring (2001), The Two Towers (2002) và The Return of the King (2003)."
  },
  {
    id: 11,
    question: "Chú mèo máy Doraemon đến từ thế kỷ nào trong tương lai?",
    options: ["Thế kỷ 20", "Thế kỷ 21", "Thế kỷ 22", "Thế kỷ 23"],
    answer: "Thế kỷ 22",
    fact: "Doraemon được chế tạo vào ngày 3 tháng 9 năm 2112, thuộc thế kỷ 22."
  },
  {
    id: 12,
    question: "Phim hoạt hình nào của Disney lấy cảm hứng từ lễ hội Ngày của người chết (Día de Muertos) của Mexico?",
    options: ["Moana", "Coco", "Encanto", "Frozen"],
    answer: "Coco",
    fact: "Coco (2017) đã chạm đến trái tim hàng triệu khán giả toàn cầu nhờ câu chuyện sâu sắc về tình cảm gia đình và âm nhạc tuyệt vời."
  },
  {
    id: 13,
    question: "Bộ phim nào của đạo diễn Bong Joon Ho là tác phẩm đầu tiên không nói tiếng Anh đoạt giải Oscar cho Phim hay nhất?",
    options: ["Oldboy", "Parasite (Ký Sinh Trùng)", "The Host", "Snowpiercer"],
    answer: "Parasite (Ký Sinh Trùng)",
    fact: "Parasite đi vào lịch sử điện ảnh thế giới tại Oscar lần thứ 92 với 4 giải thưởng quan trọng nhất."
  },
  {
    id: 14,
    question: "Trong loạt phim Harry Potter, con vật đại diện cho nhà Gryffindor là gì?",
    options: ["Con rắn", "Con sư tử", "Con đại bàng", "Con lửng"],
    answer: "Con sư tử",
    fact: "Nhà Gryffindor coi trọng lòng dũng cảm, tinh thần hiệp sĩ và sự táo bạo, biểu tượng là con sư tử kiêu hãnh."
  },
  {
    id: 15,
    question: "Tác phẩm điện ảnh 'Titanic' (1997) dựa trên sự kiện lịch sử xảy ra vào năm nào?",
    options: ["1912", "1905", "1920", "1933"],
    answer: "1912",
    fact: "Thảm kịch chìm tàu RMS Titanic xảy ra vào đêm 14 rạng sáng ngày 15 tháng 4 năm 1912 tại Bắc Đại Tây Dương."
  },
  {
    id: 16,
    question: "Ai là diễn viên lồng tiếng cho nhân vật khỉ đuôi dài võ sư Master Shifu trong loạt phim 'Kung Fu Panda'?",
    options: ["Dustin Hoffman", "Jack Black", "Jackie Chan", "James Hong"],
    answer: "Dustin Hoffman",
    fact: "Nam diễn viên gạo cội Dustin Hoffman đã thổi hồn vào nhân vật người thầy Shifu nghiêm khắc nhưng đầy bao dung."
  },
  {
    id: 17,
    question: "Diễn viên nào thủ vai ác nhân Joker trong bộ phim 'The Dark Knight' (Hiệp Sĩ Bóng Đêm - 2008)?",
    options: ["Joaquin Phoenix", "Heath Ledger", "Jared Leto", "Jack Nicholson"],
    answer: "Heath Ledger",
    fact: "Vai diễn huyền thoại của Heath Ledger đã mang về cho anh giải Oscar phụ tùng sau khi qua đời."
  },
  {
    id: 18,
    question: "Trong phim 'Interstellar' (Hố Đen Tử Thần), hành tinh đầu tiên nhóm phi hành gia đáp xuống có đặc điểm gì?",
    options: ["Toàn là băng tuyết", "Toàn là nước với những con sóng khổng lồ", "Toàn sa mạc cát bụi", "Đầy rẫy nham thạch phun trào"],
    answer: "Toàn là nước với những con sóng khổng lồ",
    fact: "Đó là hành tinh của Miller, nơi một giờ trôi qua tương đương với 7 năm ở Trái Đất do lực hấp dẫn cực lớn từ hố đen Gargantua."
  },
  {
    id: 19,
    question: "Bộ phim nào kể về cuộc đời của thiên tài toán học Alan Turing và hành trình giải mật mã Enigma?",
    options: ["The Theory of Everything", "A Beautiful Mind", "The Imitation Game", "Social Network"],
    answer: "The Imitation Game",
    fact: "Benedict Cumberbatch đã thủ vai Alan Turing xuất sắc trong tác phẩm giành giải Oscar cho Kịch bản chuyển thể xuất sắc nhất."
  },
  {
    id: 20,
    question: "Phim hoạt hình ngắn đầu tiên có âm thanh đồng bộ của Walt Disney giới thiệu nhân vật Chuột Mickey tên là gì?",
    options: ["Plane Crazy", "Steamboat Willie", "The Gallopin' Gaucho", "Fantasia"],
    answer: "Steamboat Willie",
    fact: "Steamboat Willie phát hành năm 1928 được coi là cột mốc khai sinh ra đế chế hoạt hình Disney hiện đại."
  }
];

// -----------------------------------------------------
// GAME 3 DATA: Emoji Guessing Game
// -----------------------------------------------------
interface EmojiQuestion {
  id: number;
  emojis: string;
  options: string[];
  answer: string;
  hint: string;
}

const EMOJI_QUESTIONS: EmojiQuestion[] = [
  {
    id: 1,
    emojis: "🚢❄️💔🎻",
    options: ["Pirates of the Caribbean", "Titanic", "La La Land", "The Deep Blue Sea"],
    answer: "Titanic",
    hint: "Một chuyến tàu huyền thoại, tảng băng trôi và tiếng vĩ cầm tiễn biệt."
  },
  {
    id: 2,
    emojis: "🕷️🕸️❤️🏙️",
    options: ["Batman", "The Avengers", "Spider-Man", "Tarzan"],
    answer: "Spider-Man",
    hint: "Anh hùng tuổi teen trừ gian diệt bạo tại thành phố New York nhộn nhịp."
  },
  {
    id: 3,
    emojis: "🦁👑🐗🦊🏔️",
    options: ["Madagascar", "Tarzan", "The Lion King", "The Jungle Book"],
    answer: "The Lion King",
    hint: "Hành trình trưởng thành của vị vua thảo nguyên kiêu hãnh."
  },
  {
    id: 4,
    emojis: "🎈🏠👴👦🐕",
    options: ["Toy Story", "Inside Out", "Up (Vút Bay)", "Coco"],
    answer: "Up (Vút Bay)",
    hint: "Chuyến bay bằng bong bóng của ngôi nhà gỗ nhỏ và hai ông cháu."
  },
  {
    id: 5,
    emojis: "🦖🦕🎒🧗‍♂️🌋",
    options: ["Jurassic Park", "King Kong", "Avatar", "Godzilla"],
    answer: "Jurassic Park",
    hint: "Công viên giải trí kỷ Phấn trắng hồi sinh những quái thú cổ đại."
  },
  {
    id: 6,
    emojis: "🤡🎈🩸🌧️🚲",
    options: ["It (Chú Hề Ma Quái)", "Conjuring", "Insidious", "Annabelle"],
    answer: "It (Chú Hề Ma Quái)",
    hint: "Chú hề ma quái Pennywise trỗi dậy gieo rắc kinh hoàng cho thị trấn Derry mỗi 27 năm."
  },
  {
    id: 7,
    emojis: "🕶️💊🔵🔴💻",
    options: ["Inception", "The Matrix (Ma Trận)", "Interstellar", "Tenet"],
    answer: "The Matrix (Ma Trận)",
    hint: "Lựa chọn giữa viên thuốc màu xanh để tiếp tục sống ảo hay viên thuốc màu đỏ để thức tỉnh thế giới thực."
  },
  {
    id: 8,
    emojis: "⚡👓🧹🦉🏰",
    options: ["The Chronicles of Narnia", "Percy Jackson", "Harry Potter", "The Lord of the Rings"],
    answer: "Harry Potter",
    hint: "Chú bé phù thủy mang vết sẹo hình tia chớp trên trán nhập học tại ngôi trường phép thuật Hogwarts."
  },
  {
    id: 9,
    emojis: "🧸🤠🚀🦖🐷",
    options: ["Toy Story", "Monsters Inc.", "A Bug's Life", "Cars"],
    answer: "Toy Story",
    hint: "Thế giới đồ chơi sống động khi con người đi vắng với chàng cao bồi Woody và cảnh sát vũ trụ Buzz Lightyear."
  },
  {
    id: 10,
    emojis: "🐼🎋🥋🐯🐭",
    options: ["Mulan", "Kung Fu Panda", "The Karate Kid", "Zootopia"],
    answer: "Kung Fu Panda",
    hint: "Chú gấu trúc ham ăn béo ú bất ngờ được chọn làm Thần Long Đại Hiệp bảo vệ Thung Lũng Bình Yên."
  },
  {
    id: 11,
    emojis: "🍫🏭🎩🍭🐿️",
    options: ["Charlie and the Chocolate Factory", "Alice in Wonderland", "Paddington", "Peter Pan"],
    answer: "Charlie and the Chocolate Factory",
    hint: "Nhà máy sản xuất kẹo ngọt bí ẩn, phép thuật của quý ngài Willy Wonka lập dị."
  },
  {
    id: 12,
    emojis: "🏎️💨😡🔧🏢",
    options: ["Need for Speed", "Fast & Furious", "Transformers", "Mad Max"],
    answer: "Fast & Furious",
    hint: "Gia đình đua xe đường phố bất khả chiến bại đứng đầu bởi thủ lĩnh Dominic Toretto."
  },
  {
    id: 13,
    emojis: "🦈🌊🩸⛵🏝️",
    options: ["Jaws (Hàm Cá Mập)", "The Meg", "Life of Pi", "Cast Away"],
    answer: "Jaws (Hàm Cá Mập)",
    hint: "Quái vật đại dương rình rập ngoài khơi xa bờ biển nghỉ mát."
  },
  {
    id: 14,
    emojis: "👑💎✨👠🕛🎃",
    options: ["Cinderella (Lọ Lem)", "Snow White", "Beauty and the Beast", "Aladdin"],
    answer: "Cinderella (Lọ Lem)",
    hint: "Chuyến xe bí ngô, chiếc giày thủy tinh lấp lánh và khoảnh khắc phép thuật biến mất vào nửa đêm."
  },
  {
    id: 15,
    emojis: "🏹🍎🎯👧🌲🔥",
    options: ["The Hunger Games", "Brave", "Robin Hood", "Avatar"],
    answer: "The Hunger Games",
    hint: "Nữ anh hùng Katniss Everdeen tình nguyện tham gia đấu trường sinh tử tàn khốc để bảo vệ em gái."
  }
];

export default function GameScreen({ onNavigate, onNavigateToMoveDetail }: GameScreenProps) {
  const [activeTab, setActiveTab] = useState<'hub' | 'memory' | 'trivia' | 'emoji'>('hub');
  const [highScore, setHighScore] = useState<number>(() => {
    return Number(localStorage.getItem('cinematic_games_highscore') || '0');
  });

  // Score management helper
  const updateGlobalScore = (points: number) => {
    const newScore = score + points;
    setScore(newScore);
    if (newScore > highScore) {
      setHighScore(newScore);
      localStorage.setItem('cinematic_games_highscore', String(newScore));
    }
  };

  const [score, setScore] = useState(0);

  // -----------------------------------------------------
  // STATE & LOGIC: Memory Game
  // -----------------------------------------------------
  const [cards, setCards] = useState<Array<{ uniqueId: number; id: string; name: string; image: string; isFlipped: boolean; isMatched: boolean }>>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [memoryCompleted, setMemoryCompleted] = useState(false);

  const initMemoryGame = () => {
    const duplicated = [...MEMORY_ITEMS, ...MEMORY_ITEMS].map((item, idx) => ({
      ...item,
      uniqueId: idx,
      isFlipped: false,
      isMatched: false,
    }));
    // Shuffle cards
    const shuffled = duplicated.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setSelectedCards([]);
    setMemoryMoves(0);
    setMemoryCompleted(false);
  };

  const handleCardClick = (uniqueId: number) => {
    if (selectedCards.length >= 2) return;
    const clickedCard = cards.find(c => c.uniqueId === uniqueId);
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;

    // Flip card
    setCards(prev => prev.map(c => c.uniqueId === uniqueId ? { ...c, isFlipped: true } : c));
    const nextSelected = [...selectedCards, uniqueId];
    setSelectedCards(nextSelected);

    if (nextSelected.length === 2) {
      setMemoryMoves(m => m + 1);
      const [firstId, secondId] = nextSelected;
      const firstCard = cards.find(c => c.uniqueId === firstId);
      const secondCard = cards.find(c => c.uniqueId === secondId);

      if (firstCard && secondCard && firstCard.id === secondCard.id) {
        // MATCH FOUND
        setTimeout(() => {
          setCards(prev => prev.map(c => (c.uniqueId === firstId || c.uniqueId === secondId) ? { ...c, isMatched: true } : c));
          setSelectedCards([]);
          updateGlobalScore(50); // Add points

          // Check win
          setCards(currentCards => {
            const allMatched = currentCards.every(c => c.isMatched || c.uniqueId === firstId || c.uniqueId === secondId);
            if (allMatched) {
              setMemoryCompleted(true);
              updateGlobalScore(200); // Winner bonus
            }
            return currentCards;
          });
        }, 500);
      } else {
        // NO MATCH
        setTimeout(() => {
          setCards(prev => prev.map(c => (c.uniqueId === firstId || c.uniqueId === secondId) ? { ...c, isFlipped: false } : c));
          setSelectedCards([]);
        }, 1000);
      }
    }
  };

  // -----------------------------------------------------
  // STATE & LOGIC: Trivia Quiz Game
  // -----------------------------------------------------
  const [activeTriviaQuestions, setActiveTriviaQuestions] = useState<TriviaQuestion[]>(() => {
    return [...TRIVIA_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5);
  });
  const [triviaIdx, setTriviaIdx] = useState(0);
  const [triviaSelected, setTriviaSelected] = useState<string | null>(null);
  const [triviaFinished, setTriviaFinished] = useState(false);
  const [triviaCorrectCount, setTriviaCorrectCount] = useState(0);
  const [triviaShowFact, setTriviaShowFact] = useState(false);

  const initTriviaGame = () => {
    const shuffled = [...TRIVIA_QUESTIONS].sort(() => Math.random() - 0.5);
    setActiveTriviaQuestions(shuffled.slice(0, 5));
    setTriviaIdx(0);
    setTriviaSelected(null);
    setTriviaFinished(false);
    setTriviaCorrectCount(0);
    setTriviaShowFact(false);
  };

  const handleTriviaAnswer = (option: string) => {
    if (triviaSelected) return;
    setTriviaSelected(option);
    setTriviaShowFact(true);
    const currentQ = activeTriviaQuestions[triviaIdx];
    if (!currentQ) return;
    const isCorrect = option === currentQ.answer;
    if (isCorrect) {
      setTriviaCorrectCount(c => c + 1);
      updateGlobalScore(100);
    }
  };

  const handleTriviaNext = () => {
    setTriviaSelected(null);
    setTriviaShowFact(false);
    if (triviaIdx < activeTriviaQuestions.length - 1) {
      setTriviaIdx(idx => idx + 1);
    } else {
      setTriviaFinished(true);
      updateGlobalScore(200); // Complete quiz bonus
    }
  };

  // -----------------------------------------------------
  // STATE & LOGIC: Emoji Guessing Game
  // -----------------------------------------------------
  const [activeEmojiQuestions, setActiveEmojiQuestions] = useState<EmojiQuestion[]>(() => {
    return [...EMOJI_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5);
  });
  const [emojiIdx, setEmojiIdx] = useState(0);
  const [emojiSelected, setEmojiSelected] = useState<string | null>(null);
  const [emojiFinished, setEmojiFinished] = useState(false);
  const [emojiCorrectCount, setEmojiCorrectCount] = useState(0);
  const [emojiShowHint, setEmojiShowHint] = useState(false);

  const initEmojiGame = () => {
    const shuffled = [...EMOJI_QUESTIONS].sort(() => Math.random() - 0.5);
    setActiveEmojiQuestions(shuffled.slice(0, 5));
    setEmojiIdx(0);
    setEmojiSelected(null);
    setEmojiFinished(false);
    setEmojiCorrectCount(0);
    setEmojiShowHint(false);
  };

  const handleEmojiAnswer = (option: string) => {
    if (emojiSelected) return;
    setEmojiSelected(option);
    const currentQ = activeEmojiQuestions[emojiIdx];
    if (!currentQ) return;
    const isCorrect = option === currentQ.answer;
    if (isCorrect) {
      setEmojiCorrectCount(c => c + 1);
      updateGlobalScore(80);
    }
  };

  const handleEmojiNext = () => {
    setEmojiSelected(null);
    setEmojiShowHint(false);
    if (emojiIdx < activeEmojiQuestions.length - 1) {
      setEmojiIdx(idx => idx + 1);
    } else {
      setEmojiFinished(true);
      updateGlobalScore(150); // Winner bonus
    }
  };

  // Init games on active tab changes
  useEffect(() => {
    if (activeTab === 'memory') initMemoryGame();
    if (activeTab === 'trivia') initTriviaGame();
    if (activeTab === 'emoji') initEmojiGame();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col pb-16 relative">
      {/* Background Starfield effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/60 via-black to-black opacity-90 pointer-events-none z-0" />

      {/* Main Header inside game hub */}
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-6 relative z-10 flex flex-col gap-6 text-left">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
          <button 
            onClick={() => {
              if (activeTab === 'hub') {
                onNavigate('home');
              } else {
                setActiveTab('hub');
              }
            }}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-all text-xs font-bold cursor-pointer bg-zinc-900/50 hover:bg-zinc-900 px-3.5 py-2 rounded-xl border border-zinc-900"
          >
            <ArrowLeft size={14} />
            <span>{activeTab === 'hub' ? 'Quay lại Trang Chủ' : 'Quay lại Trung Tâm Trò Chơi'}</span>
          </button>

          <div className="flex items-center gap-4 bg-zinc-950 px-4 py-2 rounded-2xl border border-zinc-900">
            <div className="flex items-center gap-1.5">
              <Zap size={14} className="text-amber-500 fill-amber-500/20" />
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Điểm tích lũy:</span>
              <span className="text-xs font-black text-amber-500">{score}</span>
            </div>
            <div className="w-px h-3 bg-zinc-800" />
            <div className="flex items-center gap-1.5">
              <Trophy size={14} className="text-yellow-400 fill-yellow-400/10 animate-pulse" />
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Kỷ lục:</span>
              <span className="text-xs font-black text-yellow-400">{highScore}</span>
            </div>
          </div>
        </div>

        {/* -----------------------------------------------------
            HUB TAB: Cinematic Games Dashboard
            ----------------------------------------------------- */}
        {activeTab === 'hub' && (
          <div className="flex flex-col gap-8 py-4">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-zinc-950 to-zinc-900 border border-zinc-900/60 rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#E63946]/10 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-teal-500/5 rounded-full blur-[80px] pointer-events-none" />

              <div className="max-w-xl">
                <div className="inline-flex items-center gap-1.5 bg-[#E63946]/10 border border-[#E63946]/20 px-3 py-1 rounded-full text-[10px] text-[var(--color-brand)] font-black uppercase tracking-wider mb-3">
                  <Gamepad2 size={12} />
                  <span>Cinematic Entertainment Center</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase">
                  Trung Tâm Trò Chơi Mọt Phim
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
                  Trải nghiệm giải trí đỉnh cao hoàn toàn mới dành riêng cho các tín đồ điện ảnh! Thách thức trí nhớ điện ảnh, kiểm tra kiến thức trivia và giải mã những chuỗi emoji vui nhộn để leo rank cao thủ mọt phim.
                </p>
              </div>

              <div className="flex flex-col items-center justify-center p-4 bg-zinc-950/60 rounded-2xl border border-zinc-900 text-center min-w-[160px]">
                <Trophy size={32} className="text-yellow-400 animate-bounce mb-2" />
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Danh hiệu cao nhất</span>
                <span className="text-sm font-black text-white mt-1">
                  {highScore >= 1000 ? '👑 Chúa Tể Điện Ảnh' : highScore >= 500 ? '🌟 Siêu Cấp Mọt Phim' : highScore >= 200 ? '🍿 Khán Giả Thân Thiết' : '🎬 Tân Binh Tập Sự'}
                </span>
              </div>
            </div>

            {/* List of interactive games */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Game Card 1: Memory Match */}
              <div className="bg-zinc-950 border border-zinc-900/80 hover:border-zinc-800 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 hover:translate-y-[-4px] shadow-lg group">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-4 group-hover:scale-110 transition-transform">
                    <Grid size={24} />
                  </div>
                  <h3 className="text-base font-black text-white uppercase tracking-tight">Lật Thẻ Nhớ Phim</h3>
                  <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                    Ghép đôi các poster phim bom tấn hot nhất thế giới. Kiểm tra tốc độ ghi nhớ hình ảnh siêu đẳng của bạn.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="text-[9px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 font-bold border border-zinc-900">Trí Nhớ</span>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 font-bold border border-zinc-900">Dễ chơi</span>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-zinc-900 text-amber-500 font-black border border-zinc-900">+250 điểm</span>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab('memory')}
                  className="w-full mt-6 py-2.5 bg-zinc-900 hover:bg-[#E63946] text-white text-xs font-black uppercase rounded-xl cursor-pointer transition-colors"
                >
                  Chơi ngay
                </button>
              </div>

              {/* Game Card 2: Trivia Quiz */}
              <div className="bg-zinc-950 border border-zinc-900/80 hover:border-zinc-800 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 hover:translate-y-[-4px] shadow-lg group">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#E63946]/10 border border-[#E63946]/20 flex items-center justify-center text-[#E63946] mb-4 group-hover:scale-110 transition-transform">
                    <HelpCircle size={24} />
                  </div>
                  <h3 className="text-base font-black text-white uppercase tracking-tight">Đố Vui Điện Ảnh</h3>
                  <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                    Bạn có tự tin hiểu rõ về vũ trụ điện ảnh, dàn diễn viên đoạt giải Oscar hay những kỷ lục vô tiền khoáng hậu?
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="text-[9px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 font-bold border border-zinc-900">Kiến Thức</span>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 font-bold border border-zinc-900">Hấp Dẫn</span>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-zinc-900 text-amber-500 font-black border border-zinc-900">+700 điểm</span>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab('trivia')}
                  className="w-full mt-6 py-2.5 bg-zinc-900 hover:bg-[#E63946] text-white text-xs font-black uppercase rounded-xl cursor-pointer transition-colors"
                >
                  Chơi ngay
                </button>
              </div>

              {/* Game Card 3: Emoji Guessing */}
              <div className="bg-zinc-950 border border-zinc-900/80 hover:border-zinc-800 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 hover:translate-y-[-4px] shadow-lg group">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-4 group-hover:scale-110 transition-transform">
                    <Compass size={24} />
                  </div>
                  <h3 className="text-base font-black text-white uppercase tracking-tight">Giải Mã Emoji Phim</h3>
                  <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                    Đoán tên phim thông qua chuỗi ký tự emoji sáng tạo. Xem bạn có thể bóc tách ẩn ý đằng sau các biểu tượng này không!
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="text-[9px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 font-bold border border-zinc-900">Giải Mã</span>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 font-bold border border-zinc-900">Vui Nhộn</span>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-zinc-900 text-amber-500 font-black border border-zinc-900">+550 điểm</span>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab('emoji')}
                  className="w-full mt-6 py-2.5 bg-zinc-900 hover:bg-[#E63946] text-white text-xs font-black uppercase rounded-xl cursor-pointer transition-colors"
                >
                  Chơi ngay
                </button>
              </div>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------
            GAME 1 SCREEN: Memory Match Card Game
            ----------------------------------------------------- */}
        {activeTab === 'memory' && (
          <div className="flex flex-col gap-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Grid className="text-amber-500" /> Lật Thẻ Nhớ Phim
                </h2>
                <p className="text-xs text-zinc-500 mt-1">Lật và khớp các cặp thẻ có cùng hình ảnh trong thời gian nhanh nhất.</p>
              </div>
              <button 
                onClick={initMemoryGame}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                <RefreshCw size={12} />
                <span>Làm Mới</span>
              </button>
            </div>

            {memoryCompleted ? (
              <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-10 flex flex-col items-center text-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-amber-500" />
                <Trophy size={64} className="text-yellow-400 animate-bounce" />
                <h3 className="text-lg sm:text-xl font-black text-white uppercase">Chúc Mừng Bạn Đã Hoàn Thành!</h3>
                <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
                  Bạn đã khớp thành công tất cả các thẻ trong <strong className="text-amber-400">{memoryMoves} lượt lật</strong>. Nhận ngay điểm thưởng danh dự!
                </p>
                <div className="text-amber-500 font-mono font-black text-sm flex items-center gap-1">
                  <Star size={16} className="fill-amber-500" />
                  <span>+200 Điểm Thưởng Chiến Thắng</span>
                </div>
                <div className="flex gap-3 mt-4">
                  <button 
                    onClick={initMemoryGame}
                    className="px-6 py-2.5 bg-[#E63946] hover:bg-red-600 text-xs font-black uppercase text-white rounded-xl transition-all cursor-pointer"
                  >
                    Chơi Lại Vòng Khác
                  </button>
                  <button 
                    onClick={() => setActiveTab('hub')}
                    className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-xs font-black uppercase text-zinc-300 rounded-xl transition-all cursor-pointer border border-zinc-800"
                  >
                    Quay Lại Hub
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4 text-xs font-semibold text-zinc-400 bg-zinc-950/60 p-3 rounded-xl border border-zinc-900/60 w-fit">
                  <span>Lượt chơi: <strong className="text-white">{memoryMoves}</strong></span>
                  <div className="w-px h-3 bg-zinc-800" />
                  <span>Cặp đã khớp: <strong className="text-emerald-500">{cards.filter(c => c.isMatched).length / 2} / 6</strong></span>
                </div>

                {/* Grid 4x3 memory cards */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto w-full select-none">
                  {cards.map((card) => {
                    const isFlipped = card.isFlipped || card.isMatched;
                    return (
                      <div
                        key={card.uniqueId}
                        onClick={() => handleCardClick(card.uniqueId)}
                        className="aspect-[3/4] rounded-2xl cursor-pointer relative"
                        style={{ perspective: 1000 }}
                      >
                        <motion.div
                          animate={{ rotateY: isFlipped ? 180 : 0 }}
                          transition={{ duration: 0.4, ease: 'easeInOut' }}
                          className="w-full h-full relative"
                          style={{ transformStyle: 'preserve-3d' }}
                        >
                          {/* CARD BACK - Show when not flipped */}
                          <div 
                            className="absolute inset-0 bg-zinc-950 border-2 border-zinc-900 hover:border-[#E63946]/50 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-md"
                            style={{ 
                              backfaceVisibility: 'hidden',
                              WebkitBackfaceVisibility: 'hidden'
                            }}
                          >
                            <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-600">
                              <Star size={16} className="fill-current" />
                            </div>
                            <span className="text-[9px] text-zinc-500 font-extrabold tracking-widest uppercase">FILMFLOW</span>
                          </div>

                          {/* CARD FRONT - Show when flipped */}
                          <div 
                            className="absolute inset-0 bg-zinc-900 border-2 border-zinc-800 rounded-2xl overflow-hidden flex flex-col shadow-lg"
                            style={{ 
                              backfaceVisibility: 'hidden',
                              WebkitBackfaceVisibility: 'hidden',
                              transform: 'rotateY(180deg)'
                            }}
                          >
                            <img 
                              src={card.image} 
                              alt={card.name} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            {card.isMatched && (
                              <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-xs flex items-center justify-center">
                                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                                  <CheckCircle size={18} />
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* -----------------------------------------------------
            GAME 2 SCREEN: Trivia Quiz Game
            ----------------------------------------------------- */}
        {activeTab === 'trivia' && (
          <div className="flex flex-col gap-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <HelpCircle className="text-[#E63946]" /> Đố Vui Điện Ảnh
                </h2>
                <p className="text-xs text-zinc-500 mt-1">Học hỏi thông tin thú vị và thử sức với những câu đố đỉnh cao điện ảnh.</p>
              </div>
            </div>

            {triviaFinished ? (
              <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-10 flex flex-col items-center text-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-rose-600" />
                <Trophy size={64} className="text-amber-500 animate-bounce" />
                <h3 className="text-lg sm:text-xl font-black text-white uppercase">Vòng Đố Điện Ảnh Hoàn Tất!</h3>
                <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
                  Bạn trả lời đúng <strong className="text-[#E63946]">{triviaCorrectCount} / {activeTriviaQuestions.length}</strong> câu hỏi. Nhận ngay phần thưởng điểm tích lũy!
                </p>
                <div className="text-amber-400 font-mono font-black text-sm flex items-center gap-1">
                  <Star size={16} className="fill-amber-400" />
                  <span>+{triviaCorrectCount * 100} Điểm Tích Lũy</span>
                </div>
                <div className="flex gap-3 mt-4">
                  <button 
                    onClick={initTriviaGame}
                    className="px-6 py-2.5 bg-[#E63946] hover:bg-red-600 text-xs font-black uppercase text-white rounded-xl transition-all cursor-pointer"
                  >
                    Thử Lại Trắc Nghiệm
                  </button>
                  <button 
                    onClick={() => setActiveTab('hub')}
                    className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-xs font-black uppercase text-zinc-300 rounded-xl transition-all cursor-pointer border border-zinc-800"
                  >
                    Quay Lại Hub
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
                {/* Progress Indicators */}
                <div className="flex items-center justify-between text-xs text-zinc-400 font-bold">
                  <span>Câu hỏi {triviaIdx + 1} / {activeTriviaQuestions.length}</span>
                  <span className="text-emerald-500">Đúng: {triviaCorrectCount}</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#E63946] transition-all duration-300"
                    style={{ width: `${activeTriviaQuestions.length > 0 ? ((triviaIdx + 1) / activeTriviaQuestions.length) * 100 : 0}%` }}
                  />
                </div>

                {/* Main Question Box */}
                {activeTriviaQuestions[triviaIdx] && (
                  <div className="bg-zinc-950 border border-zinc-900 p-6 sm:p-8 rounded-3xl flex flex-col gap-6 text-left relative overflow-hidden">
                    <span className="absolute top-3 right-4 text-[10px] font-mono text-zinc-600 font-black">QUESTION ID #{activeTriviaQuestions[triviaIdx].id}</span>
                    <h4 className="text-sm sm:text-base font-black text-white leading-relaxed">
                      {activeTriviaQuestions[triviaIdx].question}
                    </h4>

                    <div className="flex flex-col gap-2.5 mt-2">
                      {activeTriviaQuestions[triviaIdx].options.map((option, index) => {
                        const isSelected = triviaSelected === option;
                        const isCorrect = option === activeTriviaQuestions[triviaIdx].answer;
                        
                        let btnStyle = "bg-zinc-900/60 hover:bg-zinc-900 hover:border-zinc-800 border-zinc-900";
                        if (triviaSelected) {
                          if (isCorrect) {
                            btnStyle = "bg-emerald-950/40 border-emerald-500/50 text-emerald-400 font-bold";
                          } else if (isSelected) {
                            btnStyle = "bg-red-950/40 border-red-500/50 text-red-400 font-bold";
                          } else {
                            btnStyle = "opacity-40 border-zinc-900/40 bg-zinc-950 pointer-events-none";
                          }
                        }

                        return (
                          <button
                            key={index}
                            onClick={() => handleTriviaAnswer(option)}
                            className={`w-full p-4 border rounded-2xl text-xs sm:text-sm text-left transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                            disabled={!!triviaSelected}
                          >
                            <span>{option}</span>
                            {triviaSelected && isCorrect && <CheckCircle size={14} className="text-emerald-500" />}
                            {triviaSelected && isSelected && !isCorrect && <XCircle size={14} className="text-red-500" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Fact box on selection */}
                    <AnimatePresence>
                      {triviaShowFact && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="bg-[#E63946]/5 border border-[#E63946]/10 p-4 rounded-2xl mt-4 text-left"
                        >
                          <span className="text-[9px] bg-[#E63946]/10 border border-[#E63946]/20 px-2 py-0.5 rounded text-[var(--color-brand)] font-black uppercase tracking-wider">Thông tin hậu trường</span>
                          <p className="text-xs text-zinc-400 leading-relaxed mt-2 italic font-medium">
                            "{activeTriviaQuestions[triviaIdx].fact}"
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Next Step controls */}
                    {triviaSelected && (
                      <button
                        onClick={handleTriviaNext}
                        className="w-full mt-2 py-3 bg-gradient-to-r from-[#E63946] to-red-600 hover:brightness-110 text-white text-xs font-black uppercase rounded-2xl transition-all cursor-pointer shadow-lg shadow-[#E63946]/20 flex items-center justify-center gap-2"
                      >
                        <span>{triviaIdx < activeTriviaQuestions.length - 1 ? "Tiếp Tục Câu Hỏi" : "Hoàn Thành & Nhận Quà"}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* -----------------------------------------------------
            GAME 3 SCREEN: Emoji Guessing Game
            ----------------------------------------------------- */}
        {activeTab === 'emoji' && (
          <div className="flex flex-col gap-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Compass className="text-emerald-500" /> Giải Mã Emoji Phim
                </h2>
                <p className="text-xs text-zinc-500 mt-1">Đoán tên phim qua các chuỗi biểu tượng cảm xúc độc đáo.</p>
              </div>
            </div>

            {emojiFinished ? (
              <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-10 flex flex-col items-center text-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                <Trophy size={64} className="text-emerald-400 animate-bounce" />
                <h3 className="text-lg sm:text-xl font-black text-white uppercase">Giải Mã Emoji Hoàn Tất!</h3>
                <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
                  Bạn giải mã đúng <strong className="text-emerald-500">{emojiCorrectCount} / {activeEmojiQuestions.length}</strong> tựa phim. Nhận điểm thưởng mọt phim thông thái!
                </p>
                <div className="text-amber-400 font-mono font-black text-sm flex items-center gap-1">
                  <Star size={16} className="fill-amber-400" />
                  <span>+{emojiCorrectCount * 80} Điểm Tích Lũy</span>
                </div>
                <div className="flex gap-3 mt-4">
                  <button 
                    onClick={initEmojiGame}
                    className="px-6 py-2.5 bg-[#E63946] hover:bg-red-600 text-xs font-black uppercase text-white rounded-xl transition-all cursor-pointer"
                  >
                    Giải Mã Tiếp
                  </button>
                  <button 
                    onClick={() => setActiveTab('hub')}
                    className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-xs font-black uppercase text-zinc-300 rounded-xl transition-all cursor-pointer border border-zinc-800"
                  >
                    Quay Lại Hub
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
                {/* Progress Indicators */}
                <div className="flex items-center justify-between text-xs text-zinc-400 font-bold">
                  <span>Câu hỏi {emojiIdx + 1} / {activeEmojiQuestions.length}</span>
                  <span className="text-emerald-500">Đúng: {emojiCorrectCount}</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${activeEmojiQuestions.length > 0 ? ((emojiIdx + 1) / activeEmojiQuestions.length) * 100 : 0}%` }}
                  />
                </div>

                {/* Main Emoji Board */}
                {activeEmojiQuestions[emojiIdx] && (
                  <div className="bg-zinc-950 border border-zinc-900 p-6 sm:p-8 rounded-3xl flex flex-col gap-6 text-center relative overflow-hidden">
                    <span className="absolute top-3 right-4 text-[10px] font-mono text-zinc-600 font-black">EMOJI BOX #{activeEmojiQuestions[emojiIdx].id}</span>
                    
                    {/* Big emojis display */}
                    <div className="py-6 bg-zinc-900/40 rounded-2xl border border-zinc-900/60 text-4xl sm:text-5xl tracking-widest animate-pulse select-none">
                      {activeEmojiQuestions[emojiIdx].emojis}
                    </div>

                    {/* Options List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                      {activeEmojiQuestions[emojiIdx].options.map((option, index) => {
                        const isSelected = emojiSelected === option;
                        const isCorrect = option === activeEmojiQuestions[emojiIdx].answer;

                        let btnStyle = "bg-zinc-900/60 hover:bg-zinc-900 hover:border-zinc-800 border-zinc-900";
                        if (emojiSelected) {
                          if (isCorrect) {
                            btnStyle = "bg-emerald-950/40 border-emerald-500/50 text-emerald-400 font-bold";
                          } else if (isSelected) {
                            btnStyle = "bg-red-950/40 border-red-500/50 text-red-400 font-bold";
                          } else {
                            btnStyle = "opacity-40 border-zinc-900/40 bg-zinc-950 pointer-events-none";
                          }
                        }

                        return (
                          <button
                            key={index}
                            onClick={() => handleEmojiAnswer(option)}
                            className={`w-full p-4 border rounded-2xl text-xs sm:text-sm text-left transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                            disabled={!!emojiSelected}
                          >
                            <span>{option}</span>
                            {emojiSelected && isCorrect && <CheckCircle size={14} className="text-emerald-500" />}
                            {emojiSelected && isSelected && !isCorrect && <XCircle size={14} className="text-red-500" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Hint helper */}
                    <div className="text-left">
                      {!emojiShowHint ? (
                        <button 
                          onClick={() => setEmojiShowHint(true)}
                          className="text-amber-500 hover:text-amber-400 text-xs font-bold underline cursor-pointer"
                        >
                          Gợi ý phim này là gì?
                        </button>
                      ) : (
                        <div className="bg-amber-500/5 border border-amber-500/10 p-3.5 rounded-xl text-xs text-zinc-400 italic">
                          <strong className="text-amber-500 not-italic font-bold block mb-1">Gợi ý dành cho bạn:</strong>
                          "{activeEmojiQuestions[emojiIdx].hint}"
                        </div>
                      )}
                    </div>

                    {/* Next controls */}
                    {emojiSelected && (
                      <button
                        onClick={handleEmojiNext}
                        className="w-full mt-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white text-xs font-black uppercase rounded-2xl transition-all cursor-pointer shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2"
                      >
                        <span>{emojiIdx < activeEmojiQuestions.length - 1 ? "Tiếp Tục Câu Hỏi" : "Hoàn Thành & Nhận Quà"}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
