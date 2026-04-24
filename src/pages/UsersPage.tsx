import React, { useEffect, useState } from "react";
import { usersAPI, gamesAdminAPI, participantsAPI } from "../api/adminApi";
import Autocomplete from "@mui/material/Autocomplete";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
} from "@mui/material";
import { Users } from "../types";

export default function UsersPage() {
  const [users, setUsers] = useState<Users[]>([]);

  // CREATE USER STATE
  const [openCreate, setOpenCreate] = useState(false);
  const [newUser, setNewUser] = useState({
    user_id: "",
    username: "",
  });

  // REGISTER TO GAME STATE
  const [openGameModal, setOpenGameModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [games, setGames] = useState<any[]>([]);
  const [selectedGame, setSelectedGame] = useState<any | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    usersAPI.getAll().then((res) => setUsers(res.data));
  };

  // ================= CREATE USER =================
  const handleCreateUser = async () => {
    await usersAPI.create(newUser);
    setOpenCreate(false);
    setNewUser({ user_id: "", username: "" });
    loadUsers();
  };

  // ================= REGISTER TO GAME =================
  const openRegisterModal = async (userId: number) => {
    setSelectedUser(userId);
    const res = await gamesAdminAPI.getGames();
    setGames(res.data);
    setOpenGameModal(true);
  };

  const handleRegister = async () => {
    console.log("selectedGame:", selectedGame);

    if (!selectedUser || !selectedGame?.game_id) {
      console.error("INVALID STATE", selectedGame);
      return;
    }

    await participantsAPI.add(selectedGame.game_id, {
      user_id: `${selectedUser}`,
    });

    setOpenGameModal(false);
    setSelectedGame(null);
  };
  return (
    <>
      {/* CREATE BUTTON */}
      <Button
        variant="contained"
        onClick={() => setOpenCreate(true)}
        style={{ marginBottom: 16 }}
      >
        Создать пользователя
      </Button>

      {/* USERS TABLE */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {users.map((u) => (
            <TableRow key={u.user_id}>
              <TableCell>{u.user_id}</TableCell>
              <TableCell>{u.nick_name || u.first_name || u.username}</TableCell>

              <TableCell>
                <Button onClick={() => usersAPI.ban(Number(u.user_id))}>
                  Ban
                </Button>

                <Button onClick={() => usersAPI.unban(Number(u.user_id))}>
                  Unban
                </Button>

                {/* REGISTER BUTTON */}
                <Button onClick={() => openRegisterModal(Number(u.user_id))}>
                  Зарегистрировать на игру
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* ================= CREATE USER MODAL ================= */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)}>
        <DialogTitle>Создать пользователя</DialogTitle>

        <DialogContent>
          <TextField
            label="User ID"
            fullWidth
            margin="dense"
            value={newUser.user_id}
            onChange={(e) =>
              setNewUser({ ...newUser, user_id: e.target.value })
            }
          />

          <TextField
            label="Username"
            fullWidth
            margin="dense"
            value={newUser.username}
            onChange={(e) =>
              setNewUser({ ...newUser, username: e.target.value })
            }
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Отмена</Button>
          <Button onClick={handleCreateUser}>Создать</Button>
        </DialogActions>
      </Dialog>

      {/* ================= REGISTER TO GAME MODAL ================= */}
      <Dialog open={openGameModal} onClose={() => setOpenGameModal(false)}>
        <DialogTitle>Выбрать игру</DialogTitle>

        <DialogContent>
          <Autocomplete
            options={games}
            value={selectedGame}
            onChange={(event, newValue) => setSelectedGame(newValue)}
            getOptionLabel={(option) => option?.name || `Game ${option.id}`}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField {...params} label="Выберите игру" fullWidth />
            )}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenGameModal(false)}>Отмена</Button>
          <Button onClick={handleRegister}>Зарегистрировать</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
