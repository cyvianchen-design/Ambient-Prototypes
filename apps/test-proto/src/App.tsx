import React, { useState } from "react";
import R1Baseline from "./screens/R1-Baseline";
import AdminPage from "./screens/AdminPage";

type Page = "scribes" | "admin";

export default function App() {
  const [page, setPage] = useState<Page>("scribes");

  function handleNavClick(id: string) {
    if (id === "admin") setPage("admin");
    else if (id === "scribes" || id === "visits") setPage("scribes");
  }

  if (page === "admin") {
    return <AdminPage onNavClick={handleNavClick} />;
  }

  return <R1Baseline onNavClick={handleNavClick} />;
}
