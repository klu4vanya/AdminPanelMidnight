import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Stack,
  Snackbar,
} from "@mui/material";
import { gamesAdminAPI } from "../api/adminApi";
import { CreateGame, GameType } from "../types";

const emptyGame: CreateGame = {
  name: "",
  date: "",
  time: "",
  description: "",
  buyin: 0,
  location: "",
};

export default function GamesPage() {
  const [games, setGames] = useState<GameType[]>([]);
  const [createGame, setCreateGame] = useState<CreateGame>(emptyGame);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);

  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);

  const load = () => {
    gamesAdminAPI.getGames().then((res) => setGames(res.data));
  };

  useEffect(() => {
    load();
  }, []);

  // ✅ CREATE
  const handleCreate = async () => {
    const { name, date, time, description, buyin, location } = createGame;

    if (!name || !date || !time || !description || !buyin || !location) {
      setErrorOpen(true);
      return;
    }

    await gamesAdminAPI.create(createGame);

    setCreateOpen(false);
    setCreateGame(emptyGame);
    load();
  };

  // ✅ DELETE
  const handleDelete = async (game: GameType) => {
    if (!window.confirm("Удалить турнир?")) return;
    await gamesAdminAPI.delete(game.game_id);
    load();
  };

  // ✅ OPEN EDIT
  const openEdit = (game: GameType) => {
    setSelectedGame(game);

    setCreateGame({
      name: game.name,
      date: game.date,
      time: game.time,
      description: game.description,
      buyin: game.buyin,
      location: game.location,
    });

    setEditOpen(true);
  };

  // ✅ UPDATE
  const handleUpdate = async () => {
    if (!selectedGame) return;

    const { name, date, time, description, buyin, location } = createGame;

    if (!name || !date || !time || !description || !buyin || !location) {
      setErrorOpen(true);
      return;
    }

    await gamesAdminAPI.update(selectedGame.game_id, createGame);

    setEditOpen(false);
    setCreateGame(emptyGame);
    setSelectedGame(null);

    load();
  };

  return (
    <Box sx={{ p: 4, background: "#000", minHeight: "100vh", color: "#fff" }}>
      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" mb={4}>
        <Typography variant="h4">ТУРНИРЫ</Typography>

        <Button onClick={() => setCreateOpen(true)} variant="contained">
          + СОЗДАТЬ
        </Button>
      </Stack>

      {/* CARDS */}
      <Stack spacing={3}>
        {games.map((g) => (
          <Box
            key={g.game_id}
            sx={{
              background: "#2e2e2e",
              borderRadius: 3,
              p: 3,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography variant="h5">{g.name}</Typography>
              <Typography sx={{ opacity: 0.7 }}>
                {g.date} {g.time} | {g.location}
              </Typography>
            </Box>

            <Stack direction="row" spacing={2}>
              <Button
                sx={{ background: "#555", color: "#fff" }}
                onClick={() => openEdit(g)}
              >
                ✏️
              </Button>

              <Button
                sx={{ background: "darkred", color: "#fff" }}
                onClick={() => handleDelete(g)}
              >
                🗑
              </Button>
            </Stack>
          </Box>
        ))}
      </Stack>

      {/* CREATE */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth>
        <DialogTitle>Создать</DialogTitle>
        <DialogContent>
          <Form createGame={createGame} setCreateGame={setCreateGame} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Отмена</Button>
          <Button onClick={handleCreate}>Создать</Button>
        </DialogActions>
      </Dialog>

      {/* EDIT */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth>
        <DialogTitle>Редактировать</DialogTitle>
        <DialogContent>
          <Form createGame={createGame} setCreateGame={setCreateGame} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Отмена</Button>
          <Button onClick={handleUpdate}>Сохранить</Button>
        </DialogActions>
      </Dialog>

      {/* ✅ Snackbar */}
      <Snackbar
        open={errorOpen}
        autoHideDuration={3000}
        onClose={() => setErrorOpen(false)}
        message="Заполните все поля"
      />
    </Box>
  );
}

/* 🔥 ВЫНОСИМ ФОРМУ */
function Form({ createGame, setCreateGame }: any) {
  return (
    <Stack spacing={2} mt={1}>
      <TextField
        label="Название"
        value={createGame.name}
        onChange={(e) =>
          setCreateGame({ ...createGame, name: e.target.value })
        }
      />

      <TextField
        type="date"
        InputLabelProps={{ shrink: true }}
        value={createGame.date}
        onChange={(e) =>
          setCreateGame({ ...createGame, date: e.target.value })
        }
      />

      <TextField
        type="time"
        InputLabelProps={{ shrink: true }}
        value={createGame.time}
        onChange={(e) =>
          setCreateGame({ ...createGame, time: e.target.value })
        }
      />

      <TextField
        label="Описание"
        multiline
        value={createGame.description}
        onChange={(e) =>
          setCreateGame({ ...createGame, description: e.target.value })
        }
      />

      <TextField
        label="Бай-ин"
        type="number"
        value={createGame.buyin}
        onChange={(e) =>
          setCreateGame({
            ...createGame,
            buyin: Number(e.target.value),
          })
        }
      />

      <TextField
        label="Локация"
        value={createGame.location}
        onChange={(e) =>
          setCreateGame({ ...createGame, location: e.target.value })
        }
      />
    </Stack>
  );
}