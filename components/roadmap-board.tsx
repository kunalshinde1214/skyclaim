"use client";
import { useState } from "react";
import { roadmap } from "../lib/roadmap";
export function RoadmapBoard() {
  const [filter, setFilter] = useState("All");
  const items = roadmap.filter((r) => filter === "All" || r.category === filter);
  return <><div className="roadmap-controls" role="group" aria-label="Filter planned features">{["All", "Trust", "Coverage", "Workflow"].map((value) => <button type="button" key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value}</button>)}</div><p className="roadmap-count" role="status">{items.length} planned {items.length === 1 ? "feature" : "features"} · priorities, not delivery promises</p><div className="roadmap-grid">{items.map((item, index) => <article className="roadmap-card" key={item.title}><div><span className={`roadmap-status ${item.horizon === "Next" ? "next" : ""}`}>{item.horizon}</span><span className="mono">{item.category} · {String(index + 1).padStart(2, "0")}</span></div><h2>{item.title}</h2><p>{item.outcome}</p><footer><span>What it needs</span><p>{item.dependency}</p></footer></article>)}</div></>;
}
