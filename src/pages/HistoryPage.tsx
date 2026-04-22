// pages/HistoryPage.tsx
import React, { useEffect, useState } from "react";
import { historyAPI } from "../api/adminApi";

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    historyAPI.getAll().then((res) => setHistory(res.data));
  }, []);

  return (
    <div>
      {history.map((h) => (
        <div key={h.id}>{h.name}</div>
      ))}
    </div>
  );
}
