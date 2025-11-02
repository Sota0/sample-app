# sample-app

## Roulette App (ルーレットアプリ)

A Japanese roulette application with participant selection and penalty assignment modes.

## Features

- **Single Mode**: Select a random participant
- **Pairing Mode**: Pair a random participant with a random penalty
- **Dark Mode**: Toggle between light and dark themes
- **History**: Track all spin results with undo capability
- **No-Repeat Mode**: Remove participants/penalties after selection

## Stealth Rig (Host only)

The app includes a hidden admin panel for hosts to secretly set the next spin winner. This feature is designed for entertainment purposes and event hosting.

### How to Open the Admin Panel

There are two ways to access the admin panel:

1. **Konami Code**: Type the key sequence: ↑↑↓↓←→←→BA (arrow keys, then B and A)
2. **Long-press Title**: Press and hold the title "🎰 ルーレットアプリ" for 2 seconds

### Passcode

When the admin panel opens, you'll be prompted for a 4-digit passcode. The default passcode is `1029`.

You can change this by modifying the `ADMIN_PASSCODE` constant in `app.js`.

### Admin Panel Controls

Once authenticated, you can configure:

- **Next Winner**: Enter the name of the participant who should win (supports partial/fuzzy matching)
- **Apply Count**: Number of spins to rig (default: 1, decrements after each rigged spin)
- **Animation Style**: 
  - **Wheel**: Standard spinning wheel animation (rigged to land on target)
  - **TV Scroll**: Vertical scrolling slot machine style animation
- **Decoy Odds Display**: Show fake probability display for appearance (doesn't affect rigged result)

### Buttons

- **Set**: Apply the rig configuration
- **Clear**: Remove the rig and return to fair mode
- **Close**: Close the admin panel

### How Rigging Works

1. When you set a winner, the next spin(s) will ALWAYS result in that participant being selected
2. The system uses fuzzy matching, so partial names work (e.g., "田" will match "田中")
3. If the exact name isn't found, the closest match is selected
4. After each rigged spin, the apply count decrements by 1
5. When the count reaches 0, the rig is automatically cleared
6. The rig configuration is stored in localStorage under `__rig_config_v1` (never exposed in public UI)

### Quick Clear

To quickly clear the rig without opening the admin panel:

- **Long-press the Spin button** for 1.5 seconds

### TV Scroll Animation

The TV Scroll mode creates a slot machine-style vertical scrolling animation:

- Participants are repeated 10-20 times in a scrolling list
- The animation accelerates, then smoothly decelerates
- Lands with the rigged winner centered in the highlight window
- Shows full-screen result with confetti and sound effects

### Fair Mode

When no rig is configured (`applyCount = 0` or no `nextWinner` set), the app behaves exactly as before with fair random selection.

### Privacy & Security

- All rig settings are hidden from the audience-facing UI
- The rig configuration is stored separately from normal app state
- No visual indicators show when a spin is rigged
- Mobile-first design with one-hand operation
- Full dark mode support (対応)

## Usage

Open `index.html` in a web browser. No build step or server required.
