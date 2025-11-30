# Turkey Escape

An arcade-style browser game where players control a turkey sprite trying to escape a barnyard while being chased by farmers with axes.

## Game Features

- **Phaser 3** game framework with TypeScript
- **Progressive Difficulty**: 6+ levels with increasing challenge
- **Multiple Enemies**: Up to 4 farmers with chase AI
- **Smart AI**: Farmers can anticipate player movement in higher levels
- **Obstacles**: Hay bales, fences, water troughs, and chicken coops
- **8-bit Audio**: Retro-style sound effects and background music using Web Audio API
- **Particle Effects**: Dust when running, feathers when hit
- **Lives System**: Start with 3 lives, temporary invincibility after hits
- **Score System**: Time-based scoring with high score persistence (localStorage)
- **Responsive Controls**: Arrow keys OR WASD for movement, SPACEBAR to jump

## Controls

- **Movement**: Arrow Keys or WASD
- **Jump**: SPACEBAR
- **Start Game**: SPACE (from menu)
- **Retry**: SPACE (from game over)
- **Return to Menu**: ESC (from game over)

## Level Progression

### Level 1 (Tutorial)
- 1 farmer (slow speed: 80)
- 3 obstacles
- Wide paths to escape

### Levels 2-3 (Intermediate)
- 2 farmers
- Speed increases 15-20% per level
- 5-6 obstacles
- Narrower paths

### Levels 4-5 (Advanced)
- 3 farmers with AI anticipation
- Speed: 100-110
- 10-11 obstacles

### Level 6+ (Expert)
- 4 farmers maximum
- Speed capped at 150
- 14+ obstacles
- Maximum difficulty

## Installation & Running

### Development Mode

```bash
cd turkey-escape
npm install
npm run dev
```

The game will open automatically in your browser at `http://localhost:3000`

### Production Build

```bash
npm run build
```

This creates a `dist/` folder ready for deployment to any web server or VPS.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
turkey-escape/
├── index.html              # Main HTML entry point
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
├── src/
│   ├── main.ts             # Game configuration & entry point
│   ├── scenes/
│   │   ├── BootScene.ts    # Asset loading & sprite generation
│   │   ├── MenuScene.ts    # Start screen
│   │   ├── GameScene.ts    # Main gameplay loop
│   │   └── GameOverScene.ts # End screen with scores
│   ├── sprites/
│   │   ├── Turkey.ts       # Player class with movement & jump
│   │   └── Farmer.ts       # Enemy class with chase AI
│   ├── objects/
│   │   └── Obstacle.ts     # Obstacle base class
│   └── utils/
│       ├── LevelManager.ts # Level progression & scoring
│       └── AudioManager.ts # Web Audio API sound generation
└── dist/                   # Production build (after npm run build)
```

## Technical Implementation

### Graphics
All game sprites are procedurally generated using Phaser's Graphics API:
- Turkey: Brown body with red head and yellow beak
- Farmers: Blue shirts, dark pants, red hats
- Obstacles: Various colored rectangles representing barnyard items
- Escape Zone: Green transparent zone with border

### Audio
8-bit style sounds generated using Web Audio API:
- **Jump**: Rising frequency sweep
- **Gobble**: Turkey sound effect
- **Hit**: Descending distorted tone
- **Level Complete**: Major chord arpeggio
- **Game Over**: Descending melody
- **Background Music**: Simple melodic loop (C-D-E-F-G-F-E-D)

### Physics
- Arcade Physics for collision detection
- Gravity: 800 for realistic jumping
- Jump power: 350 with single-jump limitation
- Player speed: 160 units/second
- Collision detection between:
  - Turkey ↔ Farmers (lose life)
  - Turkey ↔ Obstacles (blocked)
  - Turkey ↔ Escape Zone (level complete)

### Game State Management
- **Lives**: 3 lives per game, 2-second invincibility after hit
- **Score**: Calculated based on level number and time elapsed
- **High Score**: Persisted in browser localStorage
- **Level Progression**: Automatic advancement on escape zone collision

## Deployment

The production build in the `dist/` folder can be deployed to:
- Any static web server (Apache, Nginx)
- VPS (Virtual Private Server)
- CDN services (Netlify, Vercel, GitHub Pages)
- Cloud storage with static hosting (AWS S3, Google Cloud Storage)

Simply copy the contents of `dist/` to your web server's document root.

## Browser Compatibility

Requires modern browsers with support for:
- ES2020 JavaScript
- Web Audio API
- HTML5 Canvas
- LocalStorage

Tested on: Chrome, Firefox, Safari, Edge (latest versions)

## Future Enhancements

Potential improvements:
- [ ] Power-ups (speed boost, extra lives, temporary invincibility)
- [ ] Moving obstacles (tractors, gates)
- [ ] Multiple barnyard layouts
- [ ] Leaderboard with online persistence
- [ ] Mobile touch controls
- [ ] More visual effects and animations
- [ ] Custom sprite artwork replacing procedural graphics

## License

This is a demonstration project created for learning purposes.

## Credits

Built with:
- [Phaser 3](https://phaser.io/) - Game framework
- [TypeScript](https://www.typescriptlang.org/) - Programming language
- [Vite](https://vitejs.dev/) - Build tool
- Web Audio API - Sound generation
