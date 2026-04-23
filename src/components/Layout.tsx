import { Outlet, Link, useLocation } from "react-router-dom";
import { AppBar, Toolbar, Typography, Box, Button, Stack } from "@mui/material";

const menu = [
  { label: "Пользователи", path: "/users" },
  { label: "Игры", path: "/games" },
  { label: "Участники", path: "/participants" },
  { label: "История", path: "/history" },
  { label: "Часы", path: "/clocks" },
];

export default function Layout() {
  const location = useLocation();

  return (
    <Box>
      {/* Top bar */}
      <AppBar position="fixed">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* Menu */}
          <Stack direction="row" spacing={2}  width='100%'>
            {menu.map((item) => (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                sx={{
                  color: "#fff",
                  borderBottom:
                    location.pathname === item.path
                      ? "2px solid white"
                      : "none",
                }}
              >
                {item.label}
              </Button>
            ))}
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Box
        component="main"
        sx={{
          mt: "64px", // отступ под AppBar
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
