import { Outlet, Link, useLocation } from "react-router-dom";
import { AppBar, Toolbar, Typography, Box, Button, Stack } from "@mui/material";

const menu = [
  { label: "Users", path: "/users" },
  { label: "Games", path: "/games" },
  { label: "Participants", path: "/participants" },
  { label: "History", path: "/history" },
  { label: "Clock", path: "/clocks" },
];

export default function Layout() {
  const location = useLocation();

  return (
    <Box>
      {/* Top bar */}
      <AppBar position="fixed">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* Logo / Title */}
          <Typography variant="h6">Admin Panel</Typography>

          {/* Menu */}
          <Stack direction="row" spacing={2}>
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
