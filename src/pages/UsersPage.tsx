// pages/UsersPage.tsx
import React, { useEffect, useState } from "react";
import { usersAPI } from "../api/adminApi";
import { Table, TableHead, TableRow, TableCell, TableBody, Button } from "@mui/material";
import { Users } from "../types";

export default function UsersPage() {
  const [users, setUsers] = useState<Users[]>([]);

  useEffect(() => {
    usersAPI.getAll().then((res) => setUsers(res.data));
  }, []);

  return (
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
            <TableCell>{u.nick_name || u.first_name}</TableCell>
            <TableCell>
              <Button onClick={() => usersAPI.ban(Number(u.user_id))}>Ban</Button>
              <Button onClick={() => usersAPI.unban(Number(u.user_id))}>Unban</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}