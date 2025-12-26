import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, RotateCcw, Download } from 'lucide-react';

const PHOTOS = [
  '/images/IMG_20251226_184854_485.jpg',
  '/images/IMG_20251226_184850_002.jpg',
  '/images/IMG_20251226_184848_452.jpg',
  '/images/IMG_20251226_184844_799.jpg',
  '/images/IMG_20251226_184834_086.jpg',
  '/images/IMG_20251226_184825_127.jpg',
];

interface GameState {
  vibes: number;
  totalVibes: number;
  vibesPerClick: number;
  vibesPerSecond: number;
  autoClickRate: number;
  loyalty: number;
  level: number;
  clicks: number;
  currentPhotoIndex: number;
  upgrades: Map<number, number>;
  investments: Map<number, number>;
  achievements: Set<string>;
}

interface FloatingNumber {
  id: string;
  value: number;
  x: number;
  y: number;
}

const UPGRADES = [
  { id: 1, name: 'Мышка', icon: '🖱️', baseCost: 20, clickBonus: 1 },
  { id: 2, name: 'Коврик RGB', icon: '🌈', baseCost: 80, clickBonus: 2 },
  { id: 3, name: 'Энергетик', icon: '⚡', baseCost: 150, clickBonus: 4 },
  { id: 4, name: 'Наушники', icon: '🎧', baseCost: 300, clickBonus: 7 },
  { id: 5, name: 'Вебкамера', icon: '📹', baseCost: 500, clickBonus: 12 },
  { id: 6, name: 'Геймерский стул', icon: '🪑', baseCost: 800, clickBonus: 20 },
  { id: 7, name: 'Микрофон', icon: '🎙️', baseCost: 1200, clickBonus: 35 },
  { id: 8, name: 'LED лента', icon: '💡', baseCost: 1800, clickBonus: 55 },
  { id: 9, name: 'Механика', icon: '⌨️', baseCost: 2500, clickBonus: 85 },
  { id: 10, name: 'Второй монитор', icon: '🖥️', baseCost: 3500, clickBonus: 130 },
];

const INVESTMENTS = [
  { id: 1, name: 'Telegram канал', icon: '📱', baseCost: 150, income: 0.8 },
  { id: 2, name: 'VK паблик', icon: '🔵', baseCost: 350, income: 2 },
  { id: 3, name: 'TikTok аккаунт', icon: '🎵', baseCost: 700, income: 4.5 },
  { id: 4, name: 'YouTube канал', icon: '📺', baseCost: 1200, income: 9 },
  { id: 5, name: 'Twitch стрим', icon: '💜', baseCost: 2000, income: 17 },
  { id: 6, name: 'Интернет магазин', icon: '🛒', baseCost: 3500, income: 30 },
];

const LOYALTY_FOR_LEVEL_UP = 1500;
const LOYALTY_PER_CLICK = 8;

export default function Home() {
  const [gameState, setGameState] = useState<GameState>({
    vibes: 0,
    totalVibes: 0,
    vibesPerClick: 1,
    vibesPerSecond: 0,
    autoClickRate: 0,
    loyalty: 0,
    level: 1,
    clicks: 0,
    currentPhotoIndex: 0,
    upgrades: new Map(),
    investments: new Map(),
    achievements: new Set(),
  });

  const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumber[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

  // Load game state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('altushkaGameState');
    if (saved) {
      const parsed = JSON.parse(saved);
      setGameState({
        ...parsed,
        upgrades: new Map(parsed.upgrades),
        investments: new Map(parsed.investments),
        achievements: new Set(parsed.achievements),
      });
    }
    const savedTheme = localStorage.getItem('altushkaTheme') as 'light' | 'dark' | null;
    if (savedTheme) setTheme(savedTheme);
  }, []);

  // Save game state to localStorage
  useEffect(() => {
    const toSave = {
      ...gameState,
      upgrades: Array.from(gameState.upgrades.entries()),
      investments: Array.from(gameState.investments.entries()),
      achievements: Array.from(gameState.achievements),
    };
    localStorage.setItem('altushkaGameState', JSON.stringify(toSave));
  }, [gameState]);

  // Auto-click loop
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => {
        const newVibes = prev.vibes + prev.vibesPerSecond;
        const newLoyalty = prev.loyalty + (prev.vibesPerSecond * LOYALTY_PER_CLICK) / 10;
        let newLevel = prev.level;

        if (newLoyalty >= LOYALTY_FOR_LEVEL_UP) {
          newLevel = prev.level + 1;
        }

        return {
          ...prev,
          vibes: newVibes,
          totalVibes: prev.totalVibes + prev.vibesPerSecond,
          loyalty: newLoyalty % LOYALTY_FOR_LEVEL_UP,
          level: newLevel,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Calculate stats
  useEffect(() => {
    let totalClickBonus = 1;
    gameState.upgrades.forEach((level) => {
      totalClickBonus += level * 1; // Simplified bonus calculation
    });

    let totalAutoClick = 0;
    gameState.investments.forEach((level) => {
      const inv = INVESTMENTS.find(i => i.id === Array.from(gameState.investments.keys())[Array.from(gameState.investments.values()).indexOf(level)]);
      if (inv) totalAutoClick += level * inv.income;
    });

    setGameState(prev => ({
      ...prev,
      vibesPerClick: totalClickBonus,
      vibesPerSecond: totalAutoClick,
      autoClickRate: totalAutoClick,
    }));
  }, [gameState.upgrades, gameState.investments]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.floor(num).toString();
  };

  const playSound = (type: 'click' | 'buy' | 'levelup') => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);

    if (type === 'click') {
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newFloatingId = Math.random().toString();
    setFloatingNumbers(prev => [...prev, {
      id: newFloatingId,
      value: gameState.vibesPerClick,
      x,
      y,
    }]);

    setTimeout(() => {
      setFloatingNumbers(prev => prev.filter(fn => fn.id !== newFloatingId));
    }, 1000);

    setGameState(prev => {
      const newLoyalty = prev.loyalty + LOYALTY_PER_CLICK;
      let newLevel = prev.level;

      if (newLoyalty >= LOYALTY_FOR_LEVEL_UP) {
        newLevel = prev.level + 1;
        playSound('levelup');
      } else {
        playSound('click');
      }

      return {
        ...prev,
        vibes: prev.vibes + prev.vibesPerClick,
        totalVibes: prev.totalVibes + prev.vibesPerClick,
        loyalty: newLoyalty % LOYALTY_FOR_LEVEL_UP,
        level: newLevel,
        clicks: prev.clicks + 1,
      };
    });
  };

  const buyUpgrade = (upgradeId: number) => {
    const upgrade = UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return;

    const currentLevel = gameState.upgrades.get(upgradeId) || 0;
    const cost = upgrade.baseCost * Math.pow(1.15, currentLevel);

    if (gameState.vibes >= cost) {
      playSound('buy');
      setGameState(prev => {
        const newUpgrades = new Map(prev.upgrades);
        newUpgrades.set(upgradeId, currentLevel + 1);
        return {
          ...prev,
          vibes: prev.vibes - cost,
          upgrades: newUpgrades,
        };
      });
    }
  };

  const buyInvestment = (investmentId: number) => {
    const investment = INVESTMENTS.find(i => i.id === investmentId);
    if (!investment) return;

    const currentLevel = gameState.investments.get(investmentId) || 0;
    const cost = investment.baseCost * Math.pow(1.15, currentLevel);

    if (gameState.vibes >= cost) {
      playSound('buy');
      setGameState(prev => {
        const newInvestments = new Map(prev.investments);
        newInvestments.set(investmentId, currentLevel + 1);
        return {
          ...prev,
          vibes: prev.vibes - cost,
          investments: newInvestments,
        };
      });
    }
  };

  const resetGame = () => {
    if (confirm('Вы уверены? Это удалит все прогрессы!')) {
      setGameState({
        vibes: 0,
        totalVibes: 0,
        vibesPerClick: 1,
        vibesPerSecond: 0,
        autoClickRate: 0,
        loyalty: 0,
        level: 1,
        clicks: 0,
        currentPhotoIndex: 0,
        upgrades: new Map(),
        investments: new Map(),
        achievements: new Set(),
      });
      localStorage.removeItem('altushkaGameState');
    }
  };

  const loyaltyPercent = Math.min((gameState.loyalty / LOYALTY_FOR_LEVEL_UP) * 100, 100);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-slate-950' : 'bg-gradient-to-br from-pink-50 to-blue-50'}`}>
      {/* Header */}
      <header className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-pink-100'} border-b sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-4xl">💖</div>
            <div>
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-pink-600'}`}>
                Altushka Clicker
              </h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                Кликай и зарабатывай!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-lg p-3 border ${theme === 'dark' ? 'border-slate-700' : 'border-pink-100'}`}>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-500">{formatNumber(gameState.vibes)}</div>
                <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Vibes</div>
              </div>
            </div>

            <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-lg p-3 border ${theme === 'dark' ? 'border-slate-700' : 'border-pink-100'}`}>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{formatNumber(gameState.vibesPerSecond)}</div>
                <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Per Sec</div>
              </div>
            </div>

            <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-lg p-3 border ${theme === 'dark' ? 'border-slate-700' : 'border-pink-100'}`}>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">{gameState.level}</div>
                <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Level</div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              className={theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : ''}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="clicker" className="w-full">
          <TabsList className={`grid w-full grid-cols-4 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
            <TabsTrigger value="clicker">💖 Кликер</TabsTrigger>
            <TabsTrigger value="upgrades">⚡ Улучшения</TabsTrigger>
            <TabsTrigger value="business">💼 Бизнес</TabsTrigger>
            <TabsTrigger value="stats">📊 Статы</TabsTrigger>
          </TabsList>

          {/* Clicker Tab */}
          <TabsContent value="clicker" className="space-y-6">
            <Card className={theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-pink-100'}>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-8">
                  {/* Loyalty Bar */}
                  <div className="w-full max-w-md">
                    <div className="flex justify-between mb-2">
                      <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                        💕 Лояльность
                      </span>
                      <span className="text-sm font-bold text-pink-500">{Math.floor(loyaltyPercent)}%</span>
                    </div>
                    <div className={`h-4 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-200'}`}>
                      <div
                        className="h-full bg-gradient-to-r from-pink-400 to-pink-600 transition-all duration-300"
                        style={{ width: `${loyaltyPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Click Button */}
                  <div className="relative">
                    <button
                      onClick={handleClick}
                      className={`relative w-64 h-64 rounded-full overflow-hidden shadow-2xl transform hover:scale-105 active:scale-95 transition-transform duration-100 border-4 ${theme === 'dark' ? 'border-slate-700' : 'border-pink-200'}`}
                    >
                      <img
                        src={PHOTOS[gameState.currentPhotoIndex % PHOTOS.length]}
                        alt="Click me"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                    </button>

                    {/* Floating Numbers */}
                    {floatingNumbers.map(fn => (
                      <div
                        key={fn.id}
                        className="absolute text-2xl font-bold text-pink-500 pointer-events-none animate-bounce"
                        style={{
                          left: `${fn.x}px`,
                          top: `${fn.y}px`,
                          animation: 'float-up 1s ease-out forwards',
                        }}
                      >
                        +{formatNumber(fn.value)}
                      </div>
                    ))}
                  </div>

                  {/* Click Info */}
                  <div className="text-center space-y-2">
                    <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                      👆 Клик = <span className="text-pink-500">{formatNumber(gameState.vibesPerClick)}</span> Vibes!
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                      Автоклик: <span className="text-blue-500 font-semibold">{formatNumber(gameState.autoClickRate)}</span>/сек
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Upgrades Tab */}
          <TabsContent value="upgrades" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {UPGRADES.map(upgrade => {
                const level = gameState.upgrades.get(upgrade.id) || 0;
                const cost = upgrade.baseCost * Math.pow(1.15, level);
                const canBuy = gameState.vibes >= cost;

                return (
                  <Card
                    key={upgrade.id}
                    className={`cursor-pointer transition-all ${theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-pink-100 hover:border-pink-300'} ${canBuy ? 'hover:shadow-lg' : 'opacity-60'}`}
                    onClick={() => buyUpgrade(upgrade.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-3xl mb-2">{upgrade.icon}</div>
                          <CardTitle className={`text-lg ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'}`}>
                            {upgrade.name}
                          </CardTitle>
                        </div>
                        <div className={`text-xl font-bold px-3 py-1 rounded-full ${theme === 'dark' ? 'bg-slate-800 text-yellow-400' : 'bg-yellow-100 text-yellow-700'}`}>
                          {level}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                        +{upgrade.clickBonus} per click
                      </p>
                      <p className={`text-lg font-bold ${canBuy ? 'text-pink-500' : theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
                        {formatNumber(cost)} 💎
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Business Tab */}
          <TabsContent value="business" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {INVESTMENTS.map(investment => {
                const level = gameState.investments.get(investment.id) || 0;
                const cost = investment.baseCost * Math.pow(1.15, level);
                const canBuy = gameState.vibes >= cost;

                return (
                  <Card
                    key={investment.id}
                    className={`cursor-pointer transition-all ${theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-blue-100 hover:border-blue-300'} ${canBuy ? 'hover:shadow-lg' : 'opacity-60'}`}
                    onClick={() => buyInvestment(investment.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-3xl mb-2">{investment.icon}</div>
                          <CardTitle className={`text-lg ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'}`}>
                            {investment.name}
                          </CardTitle>
                        </div>
                        <div className={`text-xl font-bold px-3 py-1 rounded-full ${theme === 'dark' ? 'bg-slate-800 text-green-400' : 'bg-green-100 text-green-700'}`}>
                          {level}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                        +{investment.income}/sec
                      </p>
                      <p className={`text-lg font-bold ${canBuy ? 'text-blue-500' : theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
                        {formatNumber(cost)} 💎
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-4">
            <Card className={theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-pink-100'}>
              <CardHeader>
                <CardTitle>📊 Статистика</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>Всего заработано</p>
                    <p className="text-2xl font-bold text-pink-500">{formatNumber(gameState.totalVibes)}</p>
                  </div>
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>Кликов сделано</p>
                    <p className="text-2xl font-bold text-blue-500">{formatNumber(gameState.clicks)}</p>
                  </div>
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>Уровень</p>
                    <p className="text-2xl font-bold text-yellow-500">{gameState.level}</p>
                  </div>
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>Куплено улучшений</p>
                    <p className="text-2xl font-bold text-purple-500">{gameState.upgrades.size}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className={`w-full max-w-md ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>⚙️ Настройки</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(false)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                  🎨 Тема
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    onClick={() => {
                      setTheme('light');
                      localStorage.setItem('altushkaTheme', 'light');
                    }}
                  >
                    ☀️ Светлая
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    onClick={() => {
                      setTheme('dark');
                      localStorage.setItem('altushkaTheme', 'dark');
                    }}
                  >
                    🌙 Тёмная
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const data = {
                      gameState: {
                        ...gameState,
                        upgrades: Array.from(gameState.upgrades.entries()),
                        investments: Array.from(gameState.investments.entries()),
                        achievements: Array.from(gameState.achievements),
                      },
                    };
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'altushka-save.json';
                    a.click();
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  📥 Экспортировать
                </Button>

                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={resetGame}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  🗑️ Сбросить
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <style>{`
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-60px);
          }
        }
      `}</style>
    </div>
  );
}
