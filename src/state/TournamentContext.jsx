import React, { createContext, useReducer, useRef } from "react";
import { tournamentReducer } from "./tournamentReducer.js";
import { initialState } from "./initialState.js";

export const TournamentContext = createContext(null);

export function TournamentProvider({ children }) {
  const [state, dispatch] = useReducer(tournamentReducer, initialState);
  // Generation counter — bumped on Reset so any in-flight async cascade can detect
  // that the simulation it was running has been superseded and exit cleanly.
  const generationRef = useRef({ value: 0 });
  const speedRef = useRef(state.speed);
  speedRef.current = state.speed;

  return (
    <TournamentContext.Provider value={{ state, dispatch, generationRef, speedRef }}>
      {children}
    </TournamentContext.Provider>
  );
}
