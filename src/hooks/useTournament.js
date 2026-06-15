import { useContext } from "react";
import { TournamentContext } from "../state/TournamentContext.jsx";

export function useTournament() {
  const ctx = useContext(TournamentContext);
  if (!ctx) throw new Error("useTournament must be used inside <TournamentProvider>");
  return ctx;
}
