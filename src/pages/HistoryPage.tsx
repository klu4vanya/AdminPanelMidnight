// pages/HistoryPage.tsx
import React, { useEffect, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { historyAPI } from "../api/adminApi";

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);

  const load = () => {
    historyAPI.getAll().then((res) => setHistory(res.data));
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Удалить турнир из истории?")) return;
    await historyAPI.delete(id);
    load();
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" mb={3}>
        История турниров
      </Typography>

      {history.map((h) => (
        <Stack
          key={h.id}
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            mb: 2,
            p: 2,
            borderRadius: 2,
            background: "#1f1f1f",
            color: "#fff",
          }}
        >
          <Typography>{h.name}</Typography>

          <Button
            color="error"
            variant="outlined"
            onClick={() => handleDelete(h.id)}
          >
            Удалить
          </Button>
        </Stack>
      ))}
    </Box>
  );
}
