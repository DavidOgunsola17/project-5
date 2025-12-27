# Icebreakr

A pure front-end interactive demo of Icebreakr - a social experience platform for groups.

## Features

This is a UI-only prototype demonstrating a complete social gaming flow:

### Game Modes
- **Pop Quiz Rally** - Fast-paced team trivia with countdown timers
- **Secret Phrase** - Rotating clues game where players guess hidden phrases
- **Sync** - Opinion-based questions with team alignment scoring

### Social Activation
- **Team Formation & Naming** - Players physically group together and create custom team names
- **Group Pulse Questions** - Pre-game social assessment to gauge group dynamics
- **Sound Design** - Subtle, satisfying audio feedback for all interactions (with mute toggle)

### Design System
- Editorial, card-based layout inspired by premium daily games
- Modern, polished aesthetic with intentional spacing and visual hierarchy
- Calm, confident design focused on clarity and approachability

## Technical Implementation

- Pure front-end with React
- Local state management only
- Simulated multiplayer behavior using timers and arrays
- Smooth animations with Framer Motion
- Responsive design with Tailwind CSS
- Web Audio API for sound effects
- No backend, no database, no real-time syncing

## Getting Started

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Game Flow

1. **Landing** - Choose to host or join a game
2. **Topic Selection** (Host) - Pick a theme from suggestions or enter custom topic
3. **Content Generation** (Host) - AI-themed loading animation
4. **Game Mode Selection** (Host) - Choose from 3 game types
5. **Lobby Configuration** (Host) - Set number of teams and winning score
6. **Team Formation** - Find teammates and create team names (with random name generator)
7. **Group Pulse** - Answer 3 social questions to assess group dynamics
8. **Gameplay** - Play selected game mode with custom team names
9. **Results** - View final scores with winning team celebration

All state resets on page refresh.

## Content Packs

Pre-built content packs include:
- General knowledge
- Pop culture
- School/campus life
- Dorm life
- Sports
- Food
