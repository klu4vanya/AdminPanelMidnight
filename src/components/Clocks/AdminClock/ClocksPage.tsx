import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  TextField,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { clocksAPI } from "../../../api/ClockApi";

export default function ClocksPage() {
  const [games, setGames] = useState<any[]>([]);
  const [name, setName] = useState("");

  const [open, setOpen] = useState(false);
  const [levels, setLevels] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [deleted, setDeleted] = useState<boolean>();
  const [originalLevels, setOriginalLevels] = useState<any[]>([]);

  const getTournaments = async () => {
    try {
      const res = await clocksAPI.getGames();
      setGames(res.data);
    } catch (e) {
      console.log(e);
    }
  };
  const deletetournament = async (id: string) => {
    try {
      const res = await clocksAPI.deleteTournament(id);
      if (res.status === 204) {
        setDeleted(true);
      }
    } catch (e) {
      console.log(e);
      setDeleted(false);
    }
  };

  useEffect(() => {
    getTournaments();
  }, [deleted]);

  const createTournament = async () => {
    if (!name.trim()) return;

    await clocksAPI.createTournament(name);
    setName("");
    getTournaments();
  };

  const normalizeLevels = (levels: any[]) => {
    return levels.map((lvl, index) => {
      const isBreak = lvl.small_blind === 0 && lvl.big_blind === 0;
  
      return {
        ...lvl,
        type: isBreak ? "break" : "level",
        name: lvl.name ?? (isBreak ? `Break ${index + 1}` : `Level ${index + 1}`),
      };
    });
  };
  
  const openEdit = async (g: any) => {
    setSelected(g);
  
    const res = await clocksAPI.getLevels(g.id);
  
    const normalized = normalizeLevels(res.data);
  
    setLevels(JSON.parse(JSON.stringify(normalized)));       // глубокая копия
    setOriginalLevels(JSON.parse(JSON.stringify(normalized)));
  
    setOpen(true);
  
    console.log("LEVELS FROM API:", res.data);
    console.log("NORMALIZED:", normalized);
  };

  const updateLevel = (i: number, field: string, value: any) => {
    const copy = [...levels];
  
    if (field === "name") {
      copy[i][field] = value;
    } else {
      copy[i][field] = value === "" ? 0 : Number(value);
    }
  
    setLevels(copy);
  };

  const addLevel = () => {
    setLevels([
      ...levels,
      {
        type: "level",
        name: `Level ${levels.length + 1}`,
        small_blind: 0,
        big_blind: 0,
        duration_minutes: 10,
      },
    ]);
  };
  const addBreak = () => {
    setLevels([
      ...levels,
      {
        type: "break",
        name: `Break ${levels.length + 1}`,
        duration_minutes: 10,
      },
    ]);
  };

  const removeLevel = (i: number) => {
    setLevels(levels.filter((_, idx) => idx !== i));
  };

  const saveLevels = async () => {
    try {
      for (const lvl of originalLevels) {
        if (lvl.id) {
          await clocksAPI.deleteLevel(selected.id, lvl.id);
        }
      }

      for (let i = 0; i < levels.length; i++) {
        const lvl = levels[i];
      
        if (lvl.type === "level") {
          await clocksAPI.createLevel(selected.id, {
            type: "level",
            name: lvl.name,
            small_blind: Number(lvl.small_blind),
            big_blind: Number(lvl.big_blind),
            duration_minutes: Number(lvl.duration_minutes),
          });
        } else {
          await clocksAPI.createLevel(selected.id, {
            type: "break",
            name: lvl.name,
            duration_minutes: Number(lvl.duration_minutes),
          });
        }
      }

      setOpen(false);
    } catch (e) {
      console.log(e);
    }
  };
  
  const openClock = (id: string) => {
    window.open(`/clock/${id}`, "_blank");
  };


  return (
    <Box sx={{ p: 4, background: "#000", minHeight: "100vh", color: "#fff" }}>
      <Typography variant="h4" mb={4}>
        TOURNAMENTS
      </Typography>

      <Paper sx={{ p: 3, mb: 4, background: "#1f1f1f", color: "#fff" }}>
        <Stack spacing={2}>
          <TextField
            label="Название турнира"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button onClick={createTournament} variant="contained">
            Создать
          </Button>
        </Stack>
      </Paper>

      <Stack spacing={3}>
        {games.map((g) => (
          <Box
            key={g.id}
            sx={{
              p: 3,
              background: "#2e2e2e",
              borderRadius: 3,
            }}
          >
            <Typography>{g.name}</Typography>

            <Stack direction="row" spacing={1} mt={2}>
              <Button onClick={() => clocksAPI.start(g.id)}>Старт</Button>
              <Button onClick={() => clocksAPI.pause(g.id)}>Пауза</Button>
              <Button onClick={() => clocksAPI.resume(g.id)}>
                Возобновить
              </Button>
              <Button onClick={() => openEdit(g)}>Редактировать</Button>
              <Button onClick={() => openClock(g.id)}>Открыть часы</Button>
              <Button onClick={() => deletetournament(g.id)}>
                Удалить турнир
              </Button>
            </Stack>
          </Box>
        ))}
      </Stack>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>Уровни</DialogTitle>

        <DialogContent>
          {levels.map((lvl, i) => (
            <Stack direction="row" spacing={2} key={i} mt={2}>
              <TextField
                label="Название"
                value={lvl.name}
                onChange={(e) => {
                  const copy = [...levels];
                  copy[i].name = e.target.value;
                  setLevels(copy);
                }}
              />

              {lvl.type === "level" && (
                <>
                  <TextField
                    label="SB"
                    value={lvl.small_blind}
                    onChange={(e) =>
                      updateLevel(i, "small_blind", e.target.value)
                    }
                  />
                  <TextField
                    label="BB"
                    value={lvl.big_blind}
                    onChange={(e) =>
                      updateLevel(i, "big_blind", e.target.value)
                    }
                  />
                </>
              )}

              <TextField
                label="Мин"
                value={lvl.duration_minutes}
                onChange={(e) =>
                  updateLevel(i, "duration_minutes", e.target.value)
                }
              />

              <Button onClick={() => removeLevel(i)}>-</Button>
            </Stack>
          ))}

          <Button onClick={addLevel} sx={{ mt: 2 }}>
            + уровень
          </Button>
          <Button onClick={addBreak} sx={{ mt: 2 }}>
            + перерыв
          </Button>
        </DialogContent>

        <DialogActions>
          <Button onClick={saveLevels}>Сохранить</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
