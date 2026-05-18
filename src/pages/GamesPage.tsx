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
  Divider,
} from "@mui/material";
import { gamesAdminAPI, participantsAPI } from "../api/adminApi";
import { CreateGame, GameType } from "../types";

const emptyGame: CreateGame = {
  name: "",
  date: "",
  time: "",
  description: "",
  buyin: 0,
  location: "",
  base_points: 100,
  photo: null,
};

const normalizeTime = (time: string) => {
  if (!time) return time;
  return time.length === 5 ? `${time}:00` : time;
};

type FinishRow = {
  place: number;
  nickname: string;
  knockouts: number;
  ratingPoints: number;
};

const getPlaceWeights = (placesCount: number) => {
  const base = [25, 17, 13, 10, 9, 8, 7, 6, 5];

  if (placesCount <= base.length) {
    return base.slice(0, placesCount);
  }

  const weights = [...base];
  let next = 4;

  while (weights.length < placesCount) {
    weights.push(Math.max(1, next));
    next -= 1;
  }

  return weights;
};

const allocateRatingPoints = (pool: number, placesCount: number) => {
  if (placesCount <= 0 || pool <= 0) return [];

  const weights = getPlaceWeights(placesCount);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  const points = weights.map((w) => Math.floor((pool * w) / totalWeight));
  let remainder = pool - points.reduce((sum, p) => sum + p, 0);

  let i = 0;
  while (remainder > 0) {
    points[i] += 1;
    remainder -= 1;
    i = (i + 1) % points.length;
  }

  return points;
};

export default function GamesPage() {
  const [games, setGames] = useState<GameType[]>([]);
  const [createGame, setCreateGame] = useState<CreateGame>(emptyGame);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);

  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  const [finishOpen, setFinishOpen] = useState(false);
  const [finishGame, setFinishGame] = useState<GameType | null>(null);
  const [finishRows, setFinishRows] = useState<FinishRow[]>([]);
  const [finishParticipants, setFinishParticipants] = useState<any[]>([]);
  const [finishLoading, setFinishLoading] = useState(false);
  const [totalRatingPool, setTotalRatingPool] = useState(0);
  const [paidPlaces, setPaidPlaces] = useState(0);

  const load = () => {
    gamesAdminAPI.getGames().then((res) => setGames(res.data));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    const { name, date, time, description, buyin, location, base_points } =
      createGame;

    if (
      !name ||
      !date ||
      !time ||
      !description ||
      !buyin ||
      !location ||
      !base_points
    ) {
      setErrorOpen(true);
      return;
    }

    await gamesAdminAPI.create({
      ...createGame,
      time: normalizeTime(time),
    });

    setCreateOpen(false);
    setCreateGame(emptyGame);
    load();
  };

  const handleDelete = async (game: GameType) => {
    if (!window.confirm("Удалить турнир?")) return;
    await gamesAdminAPI.delete(game.game_id);
    load();
  };

  const handleOpenComplete = async (game: GameType) => {
    setFinishGame(game);
    setFinishLoading(true);

    try {
      const participantsRes = await participantsAPI.getByGame(game.game_id);
      const participants = participantsRes.data || [];
      setFinishParticipants(participants);
      const participantsCount = participants.length;
      const topPlaces = Math.max(1, Math.ceil(participantsCount * 0.3));

      const totalEntries = participants.reduce(
        (sum: number, p: any) =>
          sum + Number(p.entries || 0) + Number(p.rebuys || 0),
        0
      );

      const fromEntries = totalEntries * 100;
      const guarantee = Number(game.base_points || 100);
      const pool = Math.max(fromEntries, guarantee);

      const ratingByPlace = allocateRatingPoints(pool, topPlaces);

      const rows: FinishRow[] = Array.from({ length: topPlaces }, (_, i) => ({
        place: i + 1,
        nickname: "",
        knockouts: 0,
        ratingPoints: ratingByPlace[i] || 0,
      }));

      setFinishRows(rows);
      setTotalRatingPool(pool);
      setPaidPlaces(topPlaces);
      setFinishOpen(true);
    } finally {
      setFinishLoading(false);
    }
  };

  const updateFinishRow = (
    idx: number,
    field: "nickname" | "knockouts",
    value: string
  ) => {
    setFinishRows((prev) =>
      prev.map((row, i) =>
        i === idx
          ? {
              ...row,
              [field]: field === "knockouts" ? Math.max(0, Number(value || 0)) : value,
            }
          : row
      )
    );
  };

  const submitFinish = async () => {
    if (!finishGame) return;
    if (!window.confirm("Завершить турнир и отправить в историю?")) return;

    const payload = {
      participants: finishParticipants.map((p) => ({
        user_id: String(p.user),
        entries: Number(p.entries || 1),
        rebuys: Number(p.rebuys || 0),
        addons: Number(p.addons || 0),
      })),
    };

    await gamesAdminAPI.complete(finishGame.game_id, payload);

    setFinishOpen(false);
    setFinishGame(null);
    setFinishRows([]);
    setFinishParticipants([]);
    load();
  };

  const openEdit = (game: GameType) => {
    setSelectedGame(game);

    setCreateGame({
      name: game.name,
      date: game.date,
      time: game.time,
      description: game.description,
      buyin: game.buyin,
      location: game.location,
      base_points: game.base_points || 100,
      photo: game.photo || null,
    });

    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedGame) return;

    const { name, date, time, description, buyin, location, base_points } =
      createGame;

    if (
      !name ||
      !date ||
      !time ||
      !description ||
      !buyin ||
      !location ||
      !base_points
    ) {
      setErrorOpen(true);
      return;
    }

    await gamesAdminAPI.update(selectedGame.game_id, {
      ...createGame,
      time: normalizeTime(time),
    });

    setEditOpen(false);
    setCreateGame(emptyGame);
    setSelectedGame(null);

    load();
  };

  const handleUploadPhoto = async (file: File | null) => {
    if (!file) return;

    setPhotoUploading(true);
    try {
      const photoUrl = await gamesAdminAPI.uploadPhoto(file);
      setCreateGame((prev) => ({ ...prev, photo: photoUrl }));
    } catch (e) {
      console.error(e);
      setErrorOpen(true);
    } finally {
      setPhotoUploading(false);
    }
  };

  return (
    <Box sx={{ p: 4, background: "#000", minHeight: "100vh", color: "#fff" }}>
      <Stack direction="row" justifyContent="space-between" mb={4}>
        <Typography variant="h4">ТУРНИРЫ</Typography>

        <Button onClick={() => setCreateOpen(true)} variant="contained">
          + СОЗДАТЬ
        </Button>
      </Stack>

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
                sx={{ background: "#1e7a35", color: "#fff" }}
                onClick={() => handleOpenComplete(g)}
                disabled={finishLoading}
              >
                Завершить
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

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth>
        <DialogTitle>Создать</DialogTitle>
        <DialogContent>
          <Form
            createGame={createGame}
            setCreateGame={setCreateGame}
            onUploadPhoto={handleUploadPhoto}
            photoUploading={photoUploading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Отмена</Button>
          <Button onClick={handleCreate}>Создать</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth>
        <DialogTitle>Редактировать</DialogTitle>
        <DialogContent>
          <Form
            createGame={createGame}
            setCreateGame={setCreateGame}
            onUploadPhoto={handleUploadPhoto}
            photoUploading={photoUploading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Отмена</Button>
          <Button onClick={handleUpdate}>Сохранить</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={finishOpen}
        onClose={() => setFinishOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Итоги турнира {finishGame?.name ? `— ${finishGame.name}` : ""}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
            <Typography>
              Пул очков: {totalRatingPool} | Призовые места (ТОП 30%): {paidPlaces}
            </Typography>
            <Divider />

            {finishRows.map((row, idx) => (
              <Stack key={row.place} direction="row" spacing={2} alignItems="center">
                <Typography sx={{ minWidth: 28 }}>{row.place}.</Typography>
                <TextField
                  label="Ник"
                  value={row.nickname}
                  onChange={(e) => updateFinishRow(idx, "nickname", e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Нокауты"
                  type="number"
                  value={row.knockouts}
                  onChange={(e) => updateFinishRow(idx, "knockouts", e.target.value)}
                  sx={{ width: 140 }}
                />
                <TextField
                  label="Очки рейтинга"
                  value={row.ratingPoints}
                  InputProps={{ readOnly: true }}
                  sx={{ width: 170 }}
                />
              </Stack>
            ))}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setFinishOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={submitFinish}>
            Завершить и в историю
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={errorOpen}
        autoHideDuration={3000}
        onClose={() => setErrorOpen(false)}
        message="Заполните все поля"
      />
    </Box>
  );
}

function Form({ createGame, setCreateGame, onUploadPhoto, photoUploading }: any) {
  return (
    <Stack spacing={2} mt={1}>
      <TextField
        label="Название"
        value={createGame.name}
        onChange={(e) => setCreateGame({ ...createGame, name: e.target.value })}
      />

      <TextField
        type="date"
        InputLabelProps={{ shrink: true }}
        value={createGame.date}
        onChange={(e) => setCreateGame({ ...createGame, date: e.target.value })}
      />

      <TextField
        type="time"
        InputLabelProps={{ shrink: true }}
        value={createGame.time}
        onChange={(e) => setCreateGame({ ...createGame, time: e.target.value })}
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

      <TextField
        label="Гарантия очков (base_points)"
        type="number"
        value={createGame.base_points}
        onChange={(e) =>
          setCreateGame({
            ...createGame,
            base_points: Number(e.target.value),
          })
        }
      />

      <Stack direction="row" spacing={2} alignItems="center">
        <Button variant="outlined" component="label" disabled={photoUploading}>
          {photoUploading ? "Загрузка..." : "Загрузить фото"}
          <input
            hidden
            type="file"
            accept="image/*"
            onChange={(e) => onUploadPhoto(e.target.files?.[0] ?? null)}
          />
        </Button>

        {createGame.photo ? (
          <Button
            color="warning"
            variant="text"
            onClick={() => setCreateGame({ ...createGame, photo: null })}
          >
            Удалить фото
          </Button>
        ) : null}
      </Stack>

      {createGame.photo ? (
        <Box
          component="img"
          src={createGame.photo}
          alt="Турнир"
          sx={{
            width: "100%",
            maxHeight: 220,
            objectFit: "cover",
            borderRadius: 2,
            border: "1px solid #ddd",
          }}
        />
      ) : null}
    </Stack>
  );
}
