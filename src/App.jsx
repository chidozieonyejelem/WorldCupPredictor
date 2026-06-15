import React from "react";
import { TournamentProvider } from "./state/TournamentContext.jsx";
import Dashboard from "./components/Dashboard.jsx";

export default function App() {
  return (
    <TournamentProvider>
      <Dashboard />
    </TournamentProvider>
  );
}
