import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Stack,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { participantsAPI, usersAPI } from "../api/adminApi";
import { Snackbar, Alert } from "@mui/material";

export default function ParticipantsPage() {
  const [gameId, setGameId] = useState("");
  const [list, setList] = useState<any[]>([]);
  const [listForTg, setListForTg] = useState(false);

  const [search, setSearch] = useState("");

  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [points, setPoints] = useState(0);
  const [open, setOpen] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
  });

  const showSuccess = (message: string) => {
    setSnackbar({ open: true, message });
  };

  // роль пользователя
  const role = localStorage.getItem("role"); // "admin" | "dealer"
  const isAdmin = role === "admin";

  const load = () => {
    if (!gameId) return;
    participantsAPI.getByGame(Number(gameId)).then((res) => setList(res.data));
  };

  // 🔍 фильтр
  const filteredList = list.filter((p) => {
    const name = p.user_info.nickname || p.user_info.first_name || "";

    return name.toLowerCase().includes(search.toLowerCase());
  });

  // ➕ открыть модалку
  const openAddPoints = (user: any) => {
    setSelectedUser(user);
    setPoints(0);
    setOpen(true);
  };

  // 💰 добавить баллы (только админ)
  const handleAddPoints = async () => {
    if (!selectedUser) return;

    try {
      await usersAPI.addPoints(selectedUser.user, points);
      setOpen(false);
      load();
    } catch (e) {
      console.error(e);
    }
  };

  const handleEntry = async (user: any) => {
    if (!gameId) return;

    try {
      await participantsAPI.addEntry(Number(gameId), user.user);

      setList((prev) =>
        prev.map((p) =>
          p.id === user.id ? { ...p, entries: p.entries + 1 } : p
        )
      );

      showSuccess("Вход добавлен");
    } catch (e) {
      console.error(e);
    }
  };

  const handleRebuy = async (user: any) => {
    if (!gameId) return;

    try {
      await participantsAPI.addRebuy(Number(gameId), user.user);

      setList((prev) =>
        prev.map((p) => (p.id === user.id ? { ...p, rebuys: p.rebuys + 1 } : p))
      );

      showSuccess("Ребай добавлен");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <Box sx={{ maxWidth: 800, mx: "auto" }}>
        <Typography variant="h5" mb={2}>
          Participants
        </Typography>

        {/* Controls */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Game ID"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
              />

              <Button variant="contained" onClick={load}>
                Load
              </Button>
            </Stack>

            {/* 🔍 SEARCH */}
            <TextField
              fullWidth
              label="Поиск по нику"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {/* toggle */}
            <Button onClick={() => setListForTg(!listForTg)}>
              {listForTg ? "Показать всю информацию" : "Показать только ники"}
            </Button>
          </Stack>
        </Paper>

        {/* List */}
        <Paper sx={{ borderRadius: 3 }}>
          <List>
            {filteredList.map((p, index) => {
              const name = p.user_info.nickname || p.user_info.first_name || "";

              return (
                <ListItem
                  key={p.id}
                  divider
                  secondaryAction={
                    !listForTg && (
                      <Stack direction="row" spacing={1}>
                        {/* ENTRY */}
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleEntry(p)}
                        >
                          Вход
                        </Button>

                        {/* REBUY */}
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleRebuy(p)}
                        >
                          Ребай
                        </Button>

                        {/* POINTS (только админ) */}
                        {isAdmin && (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => openAddPoints(p)}
                          >
                            + Баллы
                          </Button>
                        )}
                      </Stack>
                    )
                  }
                >
                  <ListItemText
                    primary={listForTg ? `${index + 1}. ${name}` : name}
                    secondary={
                      !listForTg
                        ? `Entries: ${p.entries} | Rebuys: ${p.rebuys}`
                        : null
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        </Paper>

        {/* 💰 MODAL */}
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>
            Добавить баллы:{" "}
            {selectedUser?.user_info?.nickname ||
              selectedUser?.user_info?.first_name}
          </DialogTitle>

          <DialogContent>
            <TextField
              fullWidth
              type="number"
              label="Баллы"
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              margin="normal"
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setOpen(false)}>Отмена</Button>
            <Button variant="contained" onClick={handleAddPoints}>
              Добавить
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity="success" variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
