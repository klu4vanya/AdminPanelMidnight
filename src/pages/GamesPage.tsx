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
  Alert,
  Autocomplete,
} from "@mui/material";
import { gamesAdminAPI, participantsAPI, usersAPI } from "../api/adminApi";
import { CreateGame, GameType } from "../types";

const emptyGame: CreateGame = {
  name: "",
  date: "",
  time: "",
  description: "",
  buyin: 0,
  location: "",
  base_points: 100,
  start_stack: 33300,
  photo: null,
};

const normalizeTime = (time: string) => {
  if (!time) return time;
  return time.length === 5 ? `${time}:00` : time;
};

type FinishRow = {
  place: number;
  nickname: string;
  ko_count: number;
  base_points?: number;
  total_points?: number;
  status?: "resolved" | "unresolved" | "ambiguous" | "duplicate";
  user_id?: string;
  user?: FinishUser | null;
  candidates?: FinishUser[];
};

type FinishUser = {
  user_id: string;
  username: string;
  nick_name?: string;
  first_name?: string;
  last_name?: string;
};

const parseFinishResults = (text: string): FinishRow[] => {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const match = line.match(/^(\d+)[.)]?\s+(.+)$/);
      const place = match ? Number(match[1]) : index + 1;
      let nickname = match ? match[2].trim() : line;
      let koCount = 0;
      const koMatch = nickname.match(/\s+(\d+)\s*(?:ko|ко)$/i);
      if (koMatch) {
        koCount = Number(koMatch[1]);
        nickname = nickname.slice(0, koMatch.index).trim();
      }
      return { place, nickname, ko_count: koCount };
    });
};

const finishUserLabel = (user: FinishUser) => {
  const displayName = user.nick_name || user.username || user.first_name || user.user_id;
  const details = [user.first_name, user.last_name].filter(Boolean).join(" ");
  return details ? `${displayName} (${details}, ${user.user_id})` : `${displayName} (${user.user_id})`;
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
  const [finishText, setFinishText] = useState("");
  const [finishRows, setFinishRows] = useState<FinishRow[]>([]);
  const [finishParticipants, setFinishParticipants] = useState<any[]>([]);
  const [finishUsers, setFinishUsers] = useState<FinishUser[]>([]);
  const [finishError, setFinishError] = useState("");
  const [finishLoading, setFinishLoading] = useState(false);

  const load = () => {
    gamesAdminAPI.getGames().then((res) => setGames(res.data));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    const { name, date, time, description, buyin, location, base_points, start_stack } =
      createGame;

    if (
      !name ||
      !date ||
      !time ||
      !description ||
      !buyin ||
      !location ||
      !base_points ||
      !start_stack
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
    setFinishText("");
    setFinishRows([]);
    setFinishError("");

    try {
      const [participantsRes, usersRes] = await Promise.all([
        participantsAPI.getByGame(game.game_id),
        usersAPI.getAll(),
      ]);
      const participants = participantsRes.data || [];
      setFinishParticipants(participants);
      setFinishUsers(usersRes.data || []);
      setFinishOpen(true);
    } finally {
      setFinishLoading(false);
    }
  };

  const updateFinishRow = (
    idx: number,
    field: "nickname" | "ko_count" | "user_id",
    value: string | number
  ) => {
    setFinishRows((prev) =>
      prev.map((row, i) =>
        i === idx
          ? {
              ...row,
              [field]: field === "ko_count" ? Math.max(0, Number(value || 0)) : value,
            }
          : row
      )
    );
  };

  const applyParsedResults = () => {
    const rows = parseFinishResults(finishText);
    setFinishRows(rows);
    setFinishError(rows.length ? "" : "Вставьте пронумерованный список игроков");
  };

  const finishPayload = () => ({
    participants: finishParticipants.map((p) => ({
      user_id: String(p.user),
      entries: Number(p.entries || 1),
      rebuys: Number(p.rebuys || 0),
      addons: Number(p.addons || 0),
    })),
    results: finishRows.map((row) => ({
      position: row.place,
      nickname: row.nickname,
      ko_count: Number(row.ko_count || 0),
      user_id: row.user_id || row.user?.user_id || "",
    })),
  });

  const applyPreviewRows = (rows: any[]) => {
    setFinishRows(
      rows.map((row) => ({
        place: row.position,
        nickname: row.nickname,
        ko_count: row.ko_count,
        base_points: row.base_points,
        total_points: row.total_points,
        status: row.status,
        user_id: row.user?.user_id || "",
        user: row.user || null,
        candidates: row.candidates || [],
      }))
    );
  };

  const previewFinish = async () => {
    if (!finishGame) return false;
    if (!finishRows.length) {
      setFinishError("Сначала разберите список игроков");
      return false;
    }

    try {
      setFinishLoading(true);
      setFinishError("");
      const res = await gamesAdminAPI.completePreview(finishGame.game_id, finishPayload());
      applyPreviewRows(res.data.results || []);
      if (res.data.unresolved?.length) {
        setFinishError("Есть ники, которые нужно сопоставить с пользователем вручную");
        return false;
      }
      return true;
    } catch (e: any) {
      setFinishError(e?.response?.data?.error || e?.message || "Не удалось проверить итоги");
      return false;
    } finally {
      setFinishLoading(false);
    }
  };

  const submitFinish = async () => {
    if (!finishGame) return;
    if (!finishRows.length) {
      setFinishError("Сначала вставьте и разберите список игроков");
      return;
    }
    const ready = await previewFinish();
    if (!ready) return;
    if (!window.confirm("Завершить турнир и отправить в историю?")) return;

    try {
      setFinishLoading(true);
      await gamesAdminAPI.complete(finishGame.game_id, finishPayload());
    } catch (e: any) {
      const preview = e?.response?.data?.preview;
      if (preview?.results) {
        applyPreviewRows(preview.results);
        setFinishError("Есть ники, которые нужно сопоставить с пользователем вручную");
        return;
      }
      setFinishError(e?.response?.data?.error || e?.message || "Не удалось завершить турнир");
      return;
    } finally {
      setFinishLoading(false);
    }

    setFinishOpen(false);
    setFinishGame(null);
    setFinishText("");
    setFinishRows([]);
    setFinishParticipants([]);
    setFinishError("");
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
      start_stack: game.start_stack || 33300,
      photo: game.photo || null,
    });

    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedGame) return;

    const { name, date, time, description, buyin, location, base_points, start_stack } =
      createGame;

    if (
      !name ||
      !date ||
      !time ||
      !description ||
      !buyin ||
      !location ||
      !base_points ||
      !start_stack
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
              Вставьте полный пронумерованный список игроков. Очки за место и KO посчитает backend.
            </Typography>
            <TextField
              label="Список результатов"
              placeholder={"1. Ник\n2. Ник\n3. Ник"}
              multiline
              minRows={7}
              value={finishText}
              onChange={(e) => setFinishText(e.target.value)}
            />
            <Stack direction="row" spacing={2}>
              <Button variant="outlined" onClick={applyParsedResults}>
                Разобрать список
              </Button>
              <Button variant="outlined" onClick={previewFinish} disabled={finishLoading || !finishRows.length}>
                Проверить начисление
              </Button>
            </Stack>
            {finishError ? <Alert severity="warning">{finishError}</Alert> : null}
            <Divider />

            {finishRows.map((row, idx) => (
              <Stack key={`${row.place}-${idx}`} direction="row" spacing={2} alignItems="center">
                <Typography sx={{ minWidth: 28 }}>{row.place}.</Typography>
                <TextField
                  label="Ник"
                  value={row.nickname}
                  onChange={(e) => updateFinishRow(idx, "nickname", e.target.value)}
                  fullWidth
                />
                <TextField
                  label="KO"
                  type="number"
                  value={row.ko_count}
                  onChange={(e) => updateFinishRow(idx, "ko_count", e.target.value)}
                  sx={{ width: 96 }}
                />
                {row.status && row.status !== "resolved" ? (
                  <Autocomplete
                    options={finishUsers}
                    getOptionLabel={finishUserLabel}
                    value={finishUsers.find((u) => u.user_id === row.user_id) || null}
                    onChange={(_, value) => updateFinishRow(idx, "user_id", value?.user_id || "")}
                    sx={{ minWidth: 280 }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={row.status === "ambiguous" ? "Выберите пользователя" : "Пользователь"}
                      />
                    )}
                  />
                ) : (
                  <TextField
                    label="Пользователь"
                    value={row.user ? finishUserLabel(row.user) : ""}
                    InputProps={{ readOnly: true }}
                    sx={{ minWidth: 260 }}
                  />
                )}
                <TextField
                  label="Очки"
                  value={row.total_points ?? ""}
                  InputProps={{ readOnly: true }}
                  sx={{ width: 120 }}
                />
              </Stack>
            ))}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setFinishOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={submitFinish} disabled={finishLoading}>
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

      <TextField
        label="Стартовый стек"
        type="number"
        value={createGame.start_stack}
        onChange={(e) =>
          setCreateGame({
            ...createGame,
            start_stack: Number(e.target.value),
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
