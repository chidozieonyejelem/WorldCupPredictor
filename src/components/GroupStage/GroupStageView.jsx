import React from "react";
import { GROUPS } from "../../data/teams.js";
import GroupCard from "./GroupCard.jsx";

export default function GroupStageView() {
  return (
    <section>
      <div className="mb-6 flex items-end justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Group Stage</h2>
          <p className="text-sm text-slate-400">48 teams · 12 groups · 72 matches</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {GROUPS.map((letter) => (
          <GroupCard key={letter} letter={letter} />
        ))}
      </div>
    </section>
  );
}
