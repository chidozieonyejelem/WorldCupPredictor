<h1 align="center">World Cup 2026 Simulator</h1>
<p align="center">
  <a href="https://predictwc26.netlify.app/"><strong>🌐 Live Demo</strong></a>
</p>
<img width="2560" height="1440" alt="Screenshot 2026-06-25 at 00 03 53" src="https://github.com/user-attachments/assets/c25df4a2-46ff-4aa0-a799-35763f7b9e66" />

<p align="center">
  <!-- Replace this comment with a screenshot or GIF of the simulator in action -->
</p>

This is a web-based FIFA World Cup 2026 simulator built using React and Vite. It runs the entire tournament, from the 12 group stages through the official Round-of-32 bracket to the final, either as a single animated playthrough or as a Monte Carlo batch of up to 100,000 tournaments, then aggregates every team's odds of winning.

This was an individual project created to practice front-end state management, animation, and building a probabilistic simulation engine from scratch.

## Languages & Technologies Used

- **JavaScript (ES Modules)**: Core language for the simulation engine and UI logic.
- **React 18**: Component-based UI, driven by a reducer + context store.
- **Vite**: Build tool and development server.
- **Tailwind CSS**: Utility-first styling for the responsive interface.
- **Framer Motion**: Animations for match reveals, bracket transitions, and table sorting.
- **Netlify**: Continuous deployment and hosting.

## Features

### Simulation Modes
- **Single (1×)**: Play one full tournament match-by-match with animated score reveals.
- **Monte Carlo batch**: Silently run **100×, 1,000×, 10,000×, or 100,000×** tournaments and aggregate the results.
- **Adjustable speed**: Control how fast the visual match cascade plays out.

### Official FIFA 2026 Format
- **48 teams in 12 groups** of four, each playing a round-robin.
- **FIFA tiebreakers**: points, then goal difference, then goals scored, then head-to-head among teams still level.
- **Qualification**: top two of every group plus the eight best third-placed teams advance.
- **Official Round of 32**: the real FIFA 2026 winner/runner-up pairings, with third-placed teams slotted by FIFA's eligibility table (which prevents same-group rematches), feeding the official Round of 16 → Quarter-finals → Semi-finals → Final and third-place playoff.

### Match Engine
- **Poisson goal model**: expected goals are derived from each side's attack/defense ratings, with a steeper-than-linear curve so quality gaps produce realistic, lopsided scorelines.
- **Modifiers**: team form, host-nation advantage, and knockout-round experience all nudge the result.
- **Knockouts**: drawn knockout matches go to extra time and then a penalty shootout.

### Final Standings & Analytics
- **Full 1–48 placement** with the stage each team reached.
- **Aggregate columns** (batch mode): Titles, Win %, Final %, Semi %, QF %, R16 %, KO %, and average finishing position across every simulation.
- **Sort toggle**: flip the table between the single consensus-bracket *Placement* and the aggregate *Win odds* ranking.

## Application Structure

The project is organised under `src/`:

- **`data/teams.js`**
  - The 48 qualified teams with group, pot, FIFA points, and attack/defense/form/experience ratings.
- **`engine/`** — the framework-agnostic simulation core:
  - `poisson.js`, `strength.js`, `matchSimulator.js` — the probabilistic match model.
  - `groupStandings.js`, `thirdPlaceRanking.js` — group tables and best-third ranking.
  - `bracketBuilder.js` — the official FIFA 2026 Round-of-32 bracket and third-place assignment.
  - `monteCarlo.js`, `headlessTournament.js`, `finalStandings.js`, `tournamentEngine.js` — batch aggregation and full-tournament orchestration.
- **`state/`** — `tournamentReducer.js`, `TournamentContext.jsx`, and `initialState.js` hold all tournament state.
- **`hooks/`** — `useTournament.js` and `useAutoAdvance.js` drive the phase-by-phase cascade.
- **`components/`** — the UI: `Dashboard`, `ControlBar`, `GroupStage`, `ThirdPlaceRanking`, `Knockouts`, `Final`, `FinalStandings`, and `MonteCarlo`.

## How to Run

1. Make sure you have [Node.js](https://nodejs.org/) installed on your system.
2. Clone this repository:

   ```bash
   git clone https://github.com/chidozieonyejelem/WorldCupPredictor.git
   ```

3. Open a terminal in the project directory and install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

   Then open the printed local URL (e.g. `http://localhost:5173`) in your browser.

5. To create an optimised production build:

   ```bash
   npm run build
   npm run preview
   ```
