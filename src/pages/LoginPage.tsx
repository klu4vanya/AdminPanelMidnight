import React, { useEffect, useState } from "react";
import { Box, Button, TextField, Typography, Paper, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getRuntimeToken, hasAdminToken, setRuntimeToken } from "../App";

export default function LoginPage() {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (getRuntimeToken() && hasAdminToken()) {
      navigate("/users", { replace: true });
    }
  }, [navigate]);

  const handleLogin = () => {
    if (!token.trim()) {
      alert("Enter token");
      return;
    }
    const normalized = token.trim().replace(/^Bearer\s+/i, "");
    const payload = (() => {
      try {
        const base64 = normalized.split(".")[1];
        if (!base64) return null;
        return JSON.parse(window.atob(base64.replace(/-/g, "+").replace(/_/g, "/")));
      } catch {
        return null;
      }
    })();

    if (!payload?.adm) {
      setError("Этот токен не админский. Нужен JWT с `adm: true`.");
      setRuntimeToken(null);
      return;
    }

    setRuntimeToken(normalized);
    setError("");

    navigate("/users", { replace: true });
  };

  const useSaved = () => {
    const saved = getRuntimeToken();
    if (!saved) return;
    if (!hasAdminToken()) {
      setError("Сохранённый токен не админский. Вставь новый токен с `adm: true`.");
      setRuntimeToken(null);
      return;
    }
    setRuntimeToken(saved);
    setError("");
    navigate("/users", { replace: true });
  };

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
          Admin Login
        </Typography>

        {error ? (
          <Typography sx={{ color: "#b3261e", fontSize: 14, mb: 1 }}>
            {error}
          </Typography>
        ) : null}

        <TextField
          fullWidth
          label="Bearer Token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          margin="normal"
          type="password"
        />

        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button fullWidth variant="contained" onClick={handleLogin}>
            Login
          </Button>
          <Button fullWidth variant="outlined" onClick={useSaved}>
            Saved
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
