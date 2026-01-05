# Pomodoro MMORPG (Fantasy, 2D Mobile) — Game Design Document (v0.2)

> **Quick Summary:** The Pomodoro cycle (Work → Short Break → … → Long Break) is transformed into an **idle-focused fantasy RPG** flow.
> During **Work**, the game is **fully locked** (no input allowed) and only the visual scene + live event logs are displayed. During **Breaks**, the player manages and plays short/medium-duration content. The game is designed as **single-player**; online options may come later.

---

## 1) High Concept

- **WORK (not playable / no input):** Character performs a long task like "raid/expedition/craft/sleep". Player only sees the **2D scene**; watches live logs and status indicators.
- **SHORT BREAK (playable):** Quick management + short active content (1–5 min). E.g.: chest opening, inventory management, quick duel.
- **LONG BREAK (15 min, playable):** More satisfying content (mini dungeon run, boss fight, town upgrade + run bundle).

**Goal:** Create **loot dopamine** and **streak pride** through the "preparation → automatic progress → reward management" loop without sabotaging work time.

---

## 2) Design Pillars

1. **Focus is Sacred:** **No input allowed** during Work state.
2. **Break = Control:** All choices during break; when time's up, system automatically transitions to Work.
3. **Living World:** During Work, the world moves through "live events" (ambush, thief, injury, lucky loot).
4. **Preparation → Outcome:** Preparation during break; automatic resolution during Work; report/rewards in next break.
5. **Moderate Decision Penalty:** Mistakes cause "missed rewards + small debuff/cost" but don't lock the game.

---

## 3) Target Platform

- **Mobile:** 2D visual style + notification/summary screens + long break content.

---

## 4) Pomodoro Engine (Timer Built-in)

### 4.1 Default Settings
- Work: **25 min**
- Short Break: **5 min**
- Long Break: **15 min** (e.g., 1 long per 4 work sessions)
- User can customize durations.

### 4.2 State Machine
- Cycle flows automatically: `WORK → SHORT → WORK → SHORT → ... → LONG`
- Work screen is **fully locked** (no touch/commands).
- During break, user interacts as much as desired; when time's up, **automatically transitions to Work**.

> Optional: If pause exists, "Focus Blessing" reward may drop (not a penalty, but reward reduction).

---

## 5) Core Loop

1) **Break (Preparation + short/medium content)**
2) **Work Start (Task begins, locked)**
3) **Work (automatic progress + live events + log)**
4) **Work End (summary + rewards / fail results)**
5) **Break (result management + new plan)**

---

## 6) Game Feel (North Star)

The core emotion that works best in this concept:

### ✅ Loot Dopamine + Streak Pride
- **Loot:** Chest opening, item selection, build strengthening (during break).
- **Streak:** "Focus Blessing" bonuses as you regularly complete pomodoros.

Story is **light**: Atmosphere through Work logs and short quest texts.

---

## 7) Core Systems

### 7.1 Character & Stats (Simple but Systemic)
- **Power** (overall strength)
- **Defense** (damage reduction)
- **Focus** (success/crit chance)
- **Luck** (loot quality)
- **Health** (injury status)

### 7.2 Classes (1 class in MVP, more unlock later)
- **Vanguard:** stable and safe
- **Arcanist:** high variance, high reward
- **Rogue:** advantage in short break content / utility

### 7.3 Task Types

**WORK tasks (no input, automatic):**
- **Expedition:** materials and small loot
- **Raid:** high loot, risky
- **Craft Batch:** item production, stable
- **Hunt:** consumables/coins

**SHORT content (1–5 min):**
- Chest opening, item comparison, equip
- Inventory management
- Vendor/upgrade selection
- **Quick Duel:** 1–2 min mini combat

**LONG content (15 min):**
- **Mini Dungeon Run:** 3 encounters + boss
- Town upgrade + run bundle
- Boss fight (2–3 mechanics)

---

## 8) Risk / Reward and Task Preparation (Choices During Break)

Before entering a Work task (during break):
1) **Task selection**
2) **Risk mode:** Safe / Standard / Risky
3) **Loadout:** gear + consumables (+ optional companion/pet)

Success at Work end is calculated based on preparation quality.

---

## 9) Fail, Injury and Hospital Bill (Moderate Decision Penalty)

### 9.1 Outcome Categories
- **Success:** normal loot + XP
- **Partial Success:** low loot / extra fatigue
- **Fail:** no loot + injury chance + small cost

### 9.2 Fail Example (the feel you wanted)
- Didn't manage inventory/loadout during break → raid started with wrong equipment → **Fail**
  - No reward
  - "Injured" chance
  - "Hospital Bill" may be created

### 9.3 Injury
- While injured, success chance in next tasks is **slightly reduced**.
- Removed during break through "heal" (potion/hospital).

### 9.4 Hospital Bill (Debt)
- If you pay, debuff is removed.
- If you don't pay: success chance is **slightly reduced** (doesn't lock the game).
- Debt **doesn't compound / grow** (don't overwhelm the player).

---

## 10) WORK State Live Events + Notification System

### 10.1 Purpose
Give the feeling that "the world is alive" even when there's no input during Work; small surprises and atmosphere.

### 10.2 Event Levels
1. **Flavor:** atmosphere, no/minimal effect
2. **Info:** small effect (e.g., +1 mat, -1 durability)
3. **Warning:** medium effect (e.g., -10 HP, success chance -3% temporary)
4. **Critical:** rare; brings closer to fail but doesn't end the game (e.g., thief, severe injury)

### 10.3 Example Events
- "Thief broke into home! (Gold -15)" → With Security upgrade "Gold -5"
- "Took damage during raid (-10 HP)"
- "Armor cracked (Defense -1, until task end)"
- "Lucky chest found (+1 Chest)"

### 10.4 Notification Policy (Don't Break Focus)
- During Work **rate-limit**: e.g., 1 event toast/log per 2 minutes.
- Events can be **batched**: "3 events in the last 10 minutes…"
- Settings:
  - **Silent:** only Work end summary
  - **Important:** show Warning+
  - **Full stream:** everything including Flavor

> Push notifications during Work recommended off by default; in-app log is sufficient.

---

## 11) Progression

### 11.1 Focus Blessing (Streak)
- Completed Works → XP + mat + "Focus" points
- Daily/weekly streak → small bonuses:
  - +% loot quality (small)
  - +% success chance (very small)
  - cosmetics / town decoration

If streak breaks, no penalty; only bonus drops.

### 11.2 Meta Progression
- **Town/Base:** Construction progresses during Work; you choose upgrades during break.
- **Professions:** systems like crafting/alchemy/cooking (post-MVP).
- **Collections:** pets/cosmetics (loot dopamine).

---

## 12) UI/UX

### 12.1 Screens
- **Home:** large timer + character scene + basic stats
- **Work:** scene + progress + live event feed (max 3 lines)
- **Break Hub:** Chest / Inventory / Adventure / Town / Hospital
- **Work Summary:** results, event summary, loot/XP

---

## 13) Art Style (2D Mobile Focused)

### 13.1 Main Style Recommendation
**"Cozy Fantasy 2D + Modern UI"**
- Readability prioritized on mobile.
- Fantasy iconography for MMORPG feel (runes, chests, dungeon gates, crests).
- No input during Work → visuals should be **satisfying but low distraction**.

### 13.2 Character & World
**Chibi / Super-deformed characters + 2D soft painted backgrounds**
- Character: big head, clear silhouette, minimal but readable detail
- Equipment: readable like icons; distinct silhouette differences (sword, staff, armor)
- Background: soft painted, lightly animated

**Why it works:**
- Clearly readable on small screens.
- Collection feel strengthened by loot/skin variety.
- Balanced production cost (not as disciplined/long as pixel art).

### 13.3 Work Scene (Diorama Approach)
Work screen is "single scene + small loop animation":
- Walking to raid
- Dungeon corridor
- Sleeping at camp
- Crafting in workshop
- Resting in hospital

Animation policy:
- 2–4 frame loop, smooth
- Critical events only get small emphasis (sparkle/icon)

### 13.4 Break Visuals
- UI-heavy: inventory grid, chest opening, upgrade cards
- Long break dungeon: 2D top-down or side-view rooms (3 encounters + boss)
- Telegraphs: rune glow / simple icons (easy on the eyes)

### 13.5 Color and Readability
- Backgrounds soft/desaturated; UI and icons more vibrant
- Rarity colors clear but in non-straining tones
- Contrast testing under sunlight

### 13.6 MVP Asset List
- 1 character: idle/walk/sleep/hit
- 3 armor sets + 3 weapon sets (large silhouette difference)
- 10–15 item icons
- 5 backgrounds: home, town, forest, dungeon corridor, boss room
- 20 UI icons: chest, sword, shield, potion, coin, hospital, quest

---

## 14) Content Bundles (Examples)

### 14.1 Short Break Bundle (5 min)
1) Open chest (10 sec)
2) Compare/equip 1 item (30 sec)
3) Quick Duel (1–2 min)
4) Next Work: select task + risk (20 sec)

### 14.2 Long Break Bundle (15 min)
- 2 min: town/craft preparation
- 10 min: mini dungeon (3 encounters)
- 3 min: boss + loot + build organization

---

## 15) MVP (v0.1) — First Playable Version

**Goal:** Timer + core loop + 1 long content.

- Timer state machine (Work locked, break open)
- 1 character, 5 stats (simple)
- Work tasks: Expedition + Raid
- Short: chest opening + equip + risk selection
- Long (15 min): 1 mini dungeon + boss (simple mechanics)
- Fail + injury + hospital bill (soft)
- Focus Blessing (streak bonus)

---

## 16) Roadmap (Post-MVP)

- More classes + skill/perk system
- Town/base building expansion
- Professional crafting (alchemy/cooking)
- Collections (pets/cosmetics)
- Seasonal events (monthly content)
- (Future) online/async social options

---

## 17) Open Design Notes
- Most of the "enjoyment" when there's no input during Work: **visual scene + live event texts**.
  That's why the event text bank and scene variety are the soul of the game.
