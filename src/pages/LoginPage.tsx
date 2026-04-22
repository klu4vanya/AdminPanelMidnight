import React, { useState } from "react";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { setRuntimeToken } from "../App";

export default function LoginPage() {
  const [token, setToken] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!token.trim()) {
      alert("Enter token");
      return;
    }

    setRuntimeToken(token.trim());

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
      <Paper sx={{ p: 4, width: 360, borderRadius: 4 }} elevation={6}>
        <Typography variant="h5" gutterBottom>
          Admin Login
        </Typography>

        <TextField
          fullWidth
          label="Bearer Token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          margin="normal"
          type="password"
        />

        <Button fullWidth variant="contained" onClick={handleLogin} sx={{ mt: 2 }}>
          Login
        </Button>
      </Paper>
    </Box>
  );
}