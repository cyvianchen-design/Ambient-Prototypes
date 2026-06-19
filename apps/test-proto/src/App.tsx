import React, { useState } from "react";
import { VersionSwitcher } from "@ds/ui";
import type { ScreenDef } from "@ds/ui";
import R1Baseline   from "./screens/R1-Baseline";
import AdminPage    from "./screens/AdminPage";
import AdminPageV2  from "./screens/AdminPageV2";

// ── Zero-prop wrappers (VersionSwitcher requires no-prop components) ───────────

function AdminProtoV1() {
  const [page, setPage] = useState<"scribes" | "admin">("admin");
  function handleNavClick(id: string) {
    if (id === "admin") setPage("admin");
    else if (id === "scribes" || id === "visits") setPage("scribes");
  }
  if (page === "admin") return <AdminPage onNavClick={handleNavClick} />;
  return <R1Baseline onNavClick={handleNavClick} />;
}

function AdminProtoV2() {
  const [page, setPage] = useState<"scribes" | "admin">("admin");
  function handleNavClick(id: string) {
    if (id === "admin") setPage("admin");
    else if (id === "scribes" || id === "visits") setPage("scribes");
  }
  if (page === "admin") return <AdminPageV2 onNavClick={handleNavClick} />;
  return <R1Baseline onNavClick={handleNavClick} />;
}

function AdminProtoPanelV1() {
  const [page, setPage] = useState<"scribes" | "admin">("admin");
  function handleNavClick(id: string) {
    if (id === "admin") setPage("admin");
    else if (id === "scribes" || id === "visits") setPage("scribes");
  }
  if (page === "admin") return <AdminPageV2 onNavClick={handleNavClick} panelVariant="v1" />;
  return <R1Baseline onNavClick={handleNavClick} />;
}

function AdminProtoPanelV2() {
  const [page, setPage] = useState<"scribes" | "admin">("admin");
  function handleNavClick(id: string) {
    if (id === "admin") setPage("admin");
    else if (id === "scribes" || id === "visits") setPage("scribes");
  }
  if (page === "admin") return <AdminPageV2 onNavClick={handleNavClick} panelVariant="v2" />;
  return <R1Baseline onNavClick={handleNavClick} />;
}

function AdminProtoPanelV3() {
  const [page, setPage] = useState<"scribes" | "admin">("admin");
  function handleNavClick(id: string) {
    if (id === "admin") setPage("admin");
    else if (id === "scribes" || id === "visits") setPage("scribes");
  }
  if (page === "admin") return <AdminPageV2 onNavClick={handleNavClick} panelVariant="v3" />;
  return <R1Baseline onNavClick={handleNavClick} />;
}

// ── Screens — add new directions here, never edit existing ones ───────────────

const screens: ScreenDef[] = [
  { round: "R1", direction: "Side Panel V1", component: AdminProtoPanelV2 },
  { round: "R1", direction: "Side Panel V2", component: AdminProtoPanelV1 },
  { round: "R1", direction: "Side Panel V3", component: AdminProtoPanelV3 },
  { round: "R1", direction: "Modal V1", component: AdminProtoV1 },
  { round: "R1", direction: "Modal V2", component: AdminProtoV2 },
];

export default function App() {
  return <VersionSwitcher screens={screens} />;
}
