"use client";

import { useEffect } from "react";

function addColumnLabels(root: ParentNode) {
  root.querySelectorAll<HTMLTableElement>("table.responsive-table").forEach((table) => {
    const headings = Array.from(table.querySelectorAll("thead th"));
    table.querySelectorAll("tbody tr").forEach((row) => {
      Array.from(row.querySelectorAll("td")).forEach((cell, index) => {
        if (cell.dataset.label) return;
        const heading = headings[index]?.textContent?.trim();
        cell.dataset.label = heading || (index === row.querySelectorAll("td").length - 1 ? "Aksi" : `Kolom ${index + 1}`);
      });
    });
  });
}

export function ResponsiveTableLabels() {
  useEffect(() => {
    addColumnLabels(document);
    const observer = new MutationObserver(() => addColumnLabels(document));
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
