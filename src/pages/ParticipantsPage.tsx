import React, { useEffect, useState } from "react";
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
import { gamesAdminAPI, participantsAPI, usersAPI } from "../api/adminApi";
import { Snackbar, Alert } from "@mui/material";
import { clocksAPI } from "../api/ClockApi";

export default function ParticipantsPage() {
  const [gameId, setGameId] = useState("");
  const [list, setList] = useState<any[]>([]);
  const [listForTg, setListForTg] = useState(false);
  const [showArrivedOnly, setShowArrivedOnly] = useState(false);
  const [showOutsList, setShowOutsList] = useState(false);
  const [outsOrder, setOutsOrder] = useState<string[]>([]);
  const [currentBigBlind, setCurrentBigBlind] = useState(0);

  const [search, setSearch] = useState("");

  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [points, setPoints] = useState(0);
  const [open, setOpen] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
  });

  const outsStorageKey = gameId ? `outs_order_${gameId}` : "";

  const showSuccess = (message: string) => {
    setSnackbar({ open: true, message });
  };

  // роль пользователя
  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";

  const load = () => {
    if (!gameId) return;
    participantsAPI.getByGame(Number(gameId)).then((res) => {
      const data = res.data || [];
      setList(data);

      // Инициализируем порядок аутов для уже выбывших игроков (если были до открытия страницы)
      const existingOuts = data
        .filter((p: any) => p.is_out)
        .map((p: any) => String(p.id));

      let savedOrder: string[] = [];
      try {
        const raw = outsStorageKey ? localStorage.getItem(outsStorageKey) : null;
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            savedOrder = parsed.map(String);
          }
        }
      } catch (e) {
        console.warn("Failed to parse outs order from localStorage:", e);
      }

      const savedExisting = savedOrder.filter((id) => existingOuts.includes(id));
      const missing = existingOuts.filter((id: string) => !savedExisting.includes(id));
      setOutsOrder([...savedExisting, ...missing]);
    });
  };

  useEffect(() => {
    if (!outsStorageKey) return;
    localStorage.setItem(outsStorageKey, JSON.stringify(outsOrder));
  }, [outsOrder, outsStorageKey]);

  useEffect(() => {
    if (!gameId) return;

    let ws: WebSocket | null = null;

    const loadCurrentBb = async () => {
      try {
        const [gamesRes, tournamentsRes] = await Promise.all([
          gamesAdminAPI.getGames(),
          clocksAPI.getGames(),
        ]);

        const game = (gamesRes.data || []).find(
          (g: any) => Number(g.game_id) === Number(gameId)
        );
        if (!game) return;

        const tournament = (tournamentsRes.data || []).find(
          (t: any) =>
            t.name?.trim().toLowerCase() === game.name?.trim().toLowerCase()
        );
        if (!tournament?.id) return;

        ws = new WebSocket(
          `wss://api.midnight-club-app.ru/clock/tournaments/${tournament.id}/timer/ws`
        );

        ws.onmessage = (event) => {
          try {
            const timer = JSON.parse(event.data);
            setCurrentBigBlind(Number(timer?.big_blind || 0));
          } catch (e) {
            console.error(e);
          }
        };
      } catch (e) {
        console.error(e);
      }
    };

    loadCurrentBb();

    return () => {
      if (ws) ws.close();
    };
  }, [gameId]);

  const filteredList = list
    .filter((p) => {
      const name = p.user_info.nickname || p.user_info.first_name || p.user_info.username || "";

      return name.toLowerCase().includes(search.toLowerCase());
    })
    .filter((p) => {
      if (!showArrivedOnly) return true;
      return p.arrived === true;
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

  const handleAddRebuy = async (p: any) => {
    try {
      await participantsAPI.addRebuy(p.id, 1);

      setList((prev) =>
        prev.map((item) =>
          item.id === p.id ? { ...item, rebuys: item.rebuys + 1 } : item
        )
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveRebuy = async (p: any) => {
    try {
      await participantsAPI.addRebuy(p.id, -1);

      setList((prev) =>
        prev.map((item) =>
          item.id === p.id
            ? { ...item, rebuys: Math.max(0, item.rebuys - 1) }
            : item
        )
      );
    } catch (e) {
      console.error(e);
    }
  };
  const handleArrivedToggle = async (user: any) => {
    try {
      const newValue = !user.arrived;

      await participantsAPI.setArrived(user.id, newValue);

      setList((prev) =>
        prev.map((p) => (p.id === user.id ? { ...p, arrived: newValue } : p))
      );

      showSuccess(newValue ? "Игрок пришёл" : "Игрок ушёл");
    } catch (e) {
      console.error(e);
    }
  };
  const handleOutToggle = async (user: any) => {
    try {
      const newValue = !user.is_out;

      await participantsAPI.setOut(user.id, newValue);

      setList((prev) =>
        prev.map((p) => (p.id === user.id ? { ...p, is_out: newValue } : p))
      );

      setOutsOrder((prev) => {
        const userId = String(user.id);

        if (newValue) {
          if (prev.includes(userId)) return prev;
          return [...prev, userId];
        }

        return prev.filter((id) => id !== userId);
      });

      showSuccess(newValue ? "Игрок выбыл" : "Игрок вернулся");
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddon = async (p: any, multiplier: 30 | 60) => {
    if (!gameId) return;
    if (!currentBigBlind) {
      setSnackbar({
        open: true,
        message: "Текущий BB не получен из часов",
      });
      return;
    }

    try {
      const delta = multiplier * currentBigBlind;
      const newAddons = Number(p.addons || 0) + delta;

      await participantsAPI.update(Number(gameId), {
        user_id: String(p.user),
        addons: newAddons,
      });

      setList((prev) =>
        prev.map((item) =>
          item.id === p.id ? { ...item, addons: newAddons } : item
        )
      );

      showSuccess(`+${delta} фишек (${multiplier}BB)`);
    } catch (e) {
      console.error(e);
    }
  };

  const outsList = outsOrder
    .map((id) => list.find((p) => String(p.id) === id))
    .filter((p): p is any => Boolean(p && p.is_out))
    .map((p) => {
      const name =
        p.user_info.nickname || p.user_info.first_name || p.user_info.username || "";
      return { id: String(p.id), name };
    });

  return (
    <>
      <Box sx={{ maxWidth: 800, mx: "auto" }}>
        <Typography variant="h5" mb={2}>
          Participants
        </Typography>
        <Typography sx={{ mb: 1, opacity: 0.75 }}>
          Текущий BB: {currentBigBlind || "—"}
        </Typography>

        {/* Controls */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} flexWrap="wrap">
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
            <Button
              variant={showArrivedOnly ? "contained" : "outlined"}
              color="success"
              onClick={() => setShowArrivedOnly((prev) => !prev)}
            >
              {showArrivedOnly ? "Все участники" : "Только пришедшие"}
            </Button>
            <Button
              variant={showOutsList ? "contained" : "outlined"}
              color="error"
              onClick={() => setShowOutsList((prev) => !prev)}
            >
              {showOutsList ? "Скрыть ауты" : "Показать ауты"}
            </Button>
          </Stack>
        </Paper>

        {showOutsList && (
          <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
            <Typography variant="h6" mb={1}>
              Список аутов
            </Typography>

            {outsList.length === 0 ? (
              <Typography sx={{ opacity: 0.7 }}>Пока нет аутов</Typography>
            ) : (
              <List>
                {outsList.map((item, index) => (
                  <ListItem key={item.id} divider>
                    <ListItemText primary={`${index + 1}. ${item.name}`} />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        )}

        {/* List */}
        <Paper sx={{ borderRadius: 3 }}>
          <List>
            {filteredList.map((p, index) => {
              const name = p.user_info.nickname || p.user_info.first_name || p.user_info.username || "";

              return (
                <ListItem
                  key={p.id}
                  divider
                  secondaryAction={
                    !listForTg && (
                      <Stack direction="row" spacing={1}>
                        {/* ENTRY */}
                        <Button
                          variant={p.arrived ? "contained" : "outlined"}
                          color={p.arrived ? "success" : "primary"}
                          size="small"
                          onClick={() => handleArrivedToggle(p)}
                        >
                          {p.arrived ? "Пришёл ✓" : "Пришёл"}
                        </Button>
                        <Button
                          variant={p.is_out ? "contained" : "outlined"}
                          color="error"
                          size="small"
                          onClick={() => handleOutToggle(p)}
                        >
                          {p.is_out ? "OUT ✓" : "OUT"}
                        </Button>

                        {/* REBUY */}
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleRemoveRebuy(p)}
                        >
                          −
                        </Button>

                        <Typography sx={{ minWidth: 20, textAlign: "center" }}>
                          {p.rebuys}
                        </Typography>

                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleAddRebuy(p)}
                        >
                          +1
                        </Button>

                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleAddon(p, 30)}
                        >
                          sAddon
                        </Button>

                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleAddon(p, 60)}
                        >
                          bAddon
                        </Button>

                        <Typography sx={{ minWidth: 56, textAlign: "center" }}>
                          {Number(p.addons || 0)}
                        </Typography>

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
                        ? `Entries: ${p.entries} | Rebuys: ${p.rebuys} | Addons: ${Number(p.addons || 0)}`
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
