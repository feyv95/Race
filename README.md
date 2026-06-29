# 🏎 Forum Racing — Flarum 2 Extension

A car racing game for Flarum 2 forums. Users earn coins, buy cars, and challenge each other to races in the lobby.

## Features

- 🚗 **Garage** — own multiple cars, track their race history
- 🏪 **Shop** — buy cars using forum coins (6 cars: Common → Legendary)
- 🏟 **Lobby** — post open challenges or accept others'
- 💰 **Coins** — earned by posting (+5 per post), starting bonus 50
- 🎲 **Race Engine** — automatic simulation based on Speed, Acceleration, Handling, Luck
- 💸 **Betting** — optional coin bets on races
- 🏆 **Leaderboard** — top racers on the forum

---

## Installation

### 1. Copy the extension

Place the `flarum-racing` folder into your Flarum's `packages/` or `extensions/` directory, or publish it as a Composer package.

### 2. Register in composer.json

In your Flarum root `composer.json`, add to `repositories`:

```json
{
    "type": "path",
    "url": "packages/flarum-racing"
}
```

Then require it:

```bash
composer require yourvendor/flarum-racing:*@dev
```

### 3. Run migrations

```bash
php flarum migrate
```

### 4. Build JS assets

```bash
cd packages/flarum-racing
npm install
npm run build
```

### 5. Enable in Admin

Go to **Admin → Extensions** and enable **Forum Racing**.

---

## Car Stats

| Car | Rarity | Price | Speed | Accel | Handling | Luck |
|---|---|---|---|---|---|---|
| Rusty Hatchback | Common | 100 | 30 | 25 | 35 | 20 |
| City Sedan | Common | 200 | 40 | 35 | 40 | 25 |
| Sport Coupe | Rare | 500 | 60 | 55 | 50 | 30 |
| Muscle Car | Rare | 750 | 70 | 65 | 40 | 35 |
| Supercar X | Epic | 2000 | 85 | 80 | 75 | 50 |
| Golden Rocket | Legendary | 5000 | 95 | 90 | 85 | 70 |

## Race Formula

Each race has **5 segments**. Per segment:
```
score = (speed × 0.4) + (acceleration × 0.3) + (handling × 0.2) + luck_bonus + random(-10..10)
```
The car winning more segments wins the race. On a tie, the luckier car wins.

## Coin Economy

| Action | Coins |
|---|---|
| New user bonus | +50 |
| Post on forum | +5 |
| Win a bet | +bet amount |
| Lose a bet | -bet amount |

---

## Customization

- **Add cars**: Insert rows into `racing_car_catalog` table
- **Change coin rewards**: Edit `GiveCoinsOnPost.php`
- **Adjust race formula**: Edit `RaceEngine.php`

## File Structure

```
flarum-racing/
├── composer.json
├── extend.php
├── migrations/
│   ├── ..._create_racing_tables.php
│   └── ..._seed_cars.php
├── src/
│   ├── Services/
│   │   ├── RaceEngine.php
│   │   └── WalletService.php
│   ├── Api/Controllers/
│   │   ├── GarageController.php
│   │   ├── ShopController.php
│   │   ├── BuyCarController.php
│   │   ├── LobbyController.php
│   │   ├── ChallengeController.php
│   │   ├── AcceptChallengeController.php
│   │   ├── DeclineChallengeController.php
│   │   └── MiscControllers.php
│   └── Listeners/
│       ├── GiveCoinsOnPost.php
│       └── AddUserAttributes.php
├── js/src/
│   ├── forum.js
│   └── components/
│       ├── RacingPage.js
│       ├── GaragePage.js
│       ├── ShopPage.js
│       └── LeaderboardPage.js
├── less/
│   └── forum.less
└── locale/
    └── en.yml
```
