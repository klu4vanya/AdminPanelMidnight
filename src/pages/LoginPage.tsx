import React, { useEffect, useState } from "react";
import { Box, Button, TextField, Typography, Paper, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { api } from "../api/adminApi";
import { getRuntimeToken, hasAdminToken, setRuntimeToken } from "../App";

export default function LoginPage() {
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (getRuntimeToken() && hasAdminToken()) {
      navigate("/users", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async () => {
    if (!nickname.trim() || !password.trim()) {
      setError("Введи ник и пароль.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/auth/login", {
        telegram_username: nickname.trim(),
        password,
      });

      const token = data?.token || "";
      if (!token) {
        throw new Error("missing_token");
      }

      setRuntimeToken(token);
      if (!hasAdminToken()) {
        setRuntimeToken(null);
        setError("Этот аккаунт не имеет админских прав.");
        return;
      }

      navigate("/users", { replace: true });
    } catch (e: any) {
      setRuntimeToken(null);
      const backendError =
        e?.response?.data?.error ||
        e?.message ||
        "Не удалось войти. Проверь ник и пароль.";
      setError(backendError);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleLogin();
    }
  };

  useEffect(() => {
    if (!getRuntimeToken()) {
      return;
    }
    if (!hasAdminToken()) {
      setRuntimeToken(null);
    }
  }, []);

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #6C5CE7, #00CEC9)",
      }}
    >
      <Paper sx={{ p: 3, width: "min(92vw, 420px)", borderRadius: 3 }} elevation={6}>
        <Typography variant="h5" gutterBottom>
          Вход в админку
        </Typography>

        <Typography sx={{ color: "text.secondary", fontSize: 14, mb: 1.5 }}>
          Войди по админскому нику и паролю.
        </Typography>

        {error ? (
          <Typography sx={{ color: "#b3261e", fontSize: 14, mb: 1 }}>
            {error}
          </Typography>
        ) : null}

        <TextField
          fullWidth
          label="Админский ник"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          margin="normal"
          autoComplete="username"
          onKeyDown={handleKeyDown}
        />

        <TextField
          fullWidth
          label="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          type="password"
          autoComplete="current-password"
          onKeyDown={handleKeyDown}
        />

        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button fullWidth variant="contained" onClick={handleLogin} disabled={loading}>
            {loading ? "Входим..." : "Войти"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
