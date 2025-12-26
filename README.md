# Altushka Clicker v2 (Vanilla JS Edition)

Altushka Clicker is a lightweight, entertaining web-based incremental game. This version has been completely refactored from its original React-based architecture into a streamlined implementation using pure **HTML5**, **CSS3**, and **Vanilla JavaScript**. This transition ensures maximum compatibility and performance across all modern web browsers without the need for complex build tools or dependencies.

The core gameplay revolves around the accumulation of **Vibes**, the primary in-game currency. Players can increase their earnings through two main mechanisms: manual clicking and passive investments. As players progress, they unlock new visual content and reach higher loyalty levels, reflecting their status within the game's ecosystem.

## Game Mechanics and Features

The game features a robust progression system designed to keep players engaged through various upgrades and strategic investments. The following table outlines the primary components of the game:

| Feature | Description |
| :--- | :--- |
| **Vibes** | The central currency earned through clicking and passive income. |
| **Upgrades** | Equipment such as mice, RGB mats, and mechanical keyboards that boost vibes per click. |
| **Investments** | Social media platforms like Telegram and Twitch that provide automated income. |
| **Loyalty Levels** | A progression metric that unlocks new character photographs as it increases. |
| **Theme Support** | A toggleable interface allowing users to switch between light and dark modes. |
| **Persistence** | Automatic state management using browser LocalStorage to preserve progress. |
| **Sound Effects** | Web Audio API-based feedback for clicks, purchases, and level ups. |

## Gameplay Overview

### Earning Vibes

Players earn **Vibes** in two primary ways:

1. **Manual Clicking**: Click on the character image to earn vibes instantly. Each click generates a floating number showing the earned amount.
2. **Passive Income**: Purchase investment items (social media channels) to generate vibes automatically every second.

### Upgrades System

Upgrades increase the number of vibes earned per click. Each upgrade can be purchased multiple times, with costs scaling exponentially:

- **Мышка** (Mouse) - +1 vibes/click
- **Коврик RGB** (RGB Mat) - +2 vibes/click
- **Энергетик** (Energy Drink) - +4 vibes/click
- **Наушники** (Headphones) - +7 vibes/click
- **Вебкамера** (Webcam) - +12 vibes/click
- **Геймерский стул** (Gaming Chair) - +20 vibes/click
- **Микрофон** (Microphone) - +35 vibes/click
- **LED лента** (LED Strip) - +55 vibes/click
- **Механика** (Mechanical Keyboard) - +85 vibes/click
- **Второй монитор** (Second Monitor) - +130 vibes/click

### Investments System

Investments generate passive income over time. Each investment can be purchased multiple times, with costs scaling exponentially:

- **Telegram канал** (Telegram Channel) - +0.8 vibes/sec
- **VK паблик** (VK Community) - +2 vibes/sec
- **TikTok аккаунт** (TikTok Account) - +4.5 vibes/sec
- **YouTube канал** (YouTube Channel) - +9 vibes/sec
- **Twitch стрим** (Twitch Stream) - +17 vibes/sec
- **Интернет магазин** (Online Store) - +30 vibes/sec

### Loyalty and Level Progression

Every click and passive income contribution adds to your **Loyalty** meter. When loyalty reaches 1500 points, you level up:

- Your level increases
- The character image rotates to the next photo
- A special level-up sound plays
- The progress bar resets

## Technical Implementation

The project utilizes modern web standards to deliver a responsive and interactive experience:

- **CSS Custom Properties**: Seamless theme switching between light and dark modes
- **Flexbox & Grid Layouts**: Responsive design that adapts to various screen sizes
- **Web Audio API**: Dynamic sound effects for user interactions
- **LocalStorage**: Automatic game state persistence
- **Vanilla JavaScript**: Modular architecture for state management and UI updates

## How to Play

1. Open `index.html` in any modern web browser
2. Click on the character image to earn vibes
3. Purchase upgrades to increase vibes per click
4. Buy investments to generate passive income
5. Watch your vibes grow and level up!
6. Toggle between light and dark themes using the moon/sun button
7. Reset your progress anytime using the refresh button

## Features

✨ **No Dependencies** - Pure HTML, CSS, and JavaScript  
🎨 **Dark Mode Support** - Comfortable viewing in any lighting condition  
💾 **Auto-Save** - Your progress is automatically saved to LocalStorage  
📱 **Responsive Design** - Works perfectly on desktop and mobile devices  
🔊 **Sound Feedback** - Satisfying audio effects for all interactions  
🎯 **Progressive Gameplay** - Continuous progression with no hard cap  
🖼️ **Dynamic Visuals** - Character images change as you level up  

## Browser Compatibility

This game works on all modern browsers that support:
- ES6 JavaScript
- CSS Grid and Flexbox
- Web Audio API
- LocalStorage

## Installation

No installation required! Simply:

```bash
git clone https://github.com/qrrrv/altushka-clicker-v2.git
cd altushka-clicker-v2
# Open index.html in your browser
```

## File Structure

```
altushka-clicker-v2/
├── index.html      # Main HTML structure
├── style.css       # Styling and animations
├── script.js       # Game logic and mechanics
├── assets/         # Character images
│   ├── IMG_20251226_184825_127.jpg
│   ├── IMG_20251226_184834_086.jpg
│   ├── IMG_20251226_184844_799.jpg
│   ├── IMG_20251226_184848_452.jpg
│   ├── IMG_20251226_184850_002.jpg
│   └── IMG_20251226_184854_485.jpg
└── README.md       # This file
```

## Game Balance

The game is carefully balanced to provide a satisfying progression curve:

- **Early Game**: Quick progression with frequent purchases
- **Mid Game**: Strategic decisions between upgrades and investments
- **Late Game**: Passive income becomes dominant as investments scale

Costs scale by 1.15x per level, creating a natural progression ceiling that encourages strategic purchasing.

## Tips for Success

1. **Early Strategy**: Focus on cheap upgrades to build initial momentum
2. **Mid Game**: Start investing in social media channels for passive income
3. **Late Game**: Investments become your primary income source
4. **Optimization**: Balance between click upgrades and passive investments based on your playstyle

## Credits

Created with ❤️ for Altushka fans everywhere!

---

**Enjoy the game and happy clicking!** 🎮✨
