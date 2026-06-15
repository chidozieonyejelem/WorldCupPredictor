import { computeGroupTable } from "../engine/groupStandings.js";
import { rankThirdPlacedTeams } from "../engine/thirdPlaceRanking.js";
import { makeInitialState } from "./initialState.js";

function recomputeGroupTable(state, groupLetter) {
  const playedMatches = state.groupMatches.filter((m) => m.played);
  return computeGroupTable(groupLetter, playedMatches, state.teams);
}

export function tournamentReducer(state, action) {
  switch (action.type) {
    case "SET_PHASE":
      return { ...state, phase: action.payload };

    case "SET_SPEED":
      return { ...state, speed: action.payload };

    case "SET_SIM_MODE":
      return { ...state, simMode: action.payload };

    case "SET_MC_PROGRESS":
      return { ...state, monteCarloProgress: action.payload };

    case "SET_MC_RESULTS":
      return { ...state, monteCarloResults: action.payload };

    case "SET_GROUP_TABLES":
      return { ...state, groupTables: action.payload };

    case "SET_THIRD_PLACE_RANKING":
      return { ...state, thirdPlaceRanking: action.payload };

    case "RECORD_GROUP_MATCH": {
      const completed = { ...action.payload, played: true };
      const groupMatches = state.groupMatches.map((m) =>
        m.matchId === completed.matchId ? completed : m
      );
      const nextState = { ...state, groupMatches };
      const newTable = computeGroupTable(
        completed.group,
        groupMatches.filter((m) => m.played),
        state.teams
      );
      return {
        ...nextState,
        groupTables: { ...state.groupTables, [completed.group]: newTable },
      };
    }

    case "FINALIZE_GROUPS": {
      const ranking = rankThirdPlacedTeams(state.groupTables);
      return { ...state, thirdPlaceRanking: ranking };
    }

    case "BUILD_BRACKET": {
      return {
        ...state,
        bracket: { ...state.bracket, ...action.payload },
      };
    }

    case "SET_ROUND_MATCHES": {
      const { round, matches } = action.payload;
      return {
        ...state,
        bracket: { ...state.bracket, [round]: matches },
      };
    }

    case "RECORD_KNOCKOUT_MATCH": {
      const { round, match } = action.payload;
      const updatedRound = state.bracket[round].map((m) =>
        m.matchId === match.matchId ? match : m
      );
      return {
        ...state,
        bracket: { ...state.bracket, [round]: updatedRound },
      };
    }

    case "REVEAL_THIRD_PLACE":
      return { ...state, revealThirdPlace: true };

    case "SET_FINAL_STANDINGS":
      return { ...state, finalStandings: action.payload };

    case "RESET":
      return makeInitialState((state.runId ?? 0) + 1, state.simMode ?? 1);

    default:
      return state;
  }
}
