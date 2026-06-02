import { Outlet, Link, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Stack,
  BottomNavigation,
  BottomNavigationAction,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { setRuntimeToken } from "../App";

const menu = [
  { label: "Пользователи", path: "/users" },
  { label: "Игры", path: "/games" },
  { label: "Участники", path: "/participants" },
  { label: "История", path: "/history" },
  { label: "Часы", path: "/clocks" },
];

export default function Layout() {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box>
      {/* Top bar */}
      <AppBar position="fixed">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
          {/* Menu */}
          <Stack direction="row" spacing={1} width="100%" sx={{ overflowX: "auto" }}>
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
          <Button
            color="inherit"
            onClick={() => {
              setRuntimeToken(null);
              window.location.href = "/login";
            }}
          >
            Выйти
          </Button>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Box
        component="main"
        sx={{
          mt: "64px",
          mb: isMobile ? "64px" : 0,
        }}
      >
        <Outlet />
      </Box>

      {isMobile ? (
        <BottomNavigation
          showLabels
          value={location.pathname}
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1300,
            borderTop: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          {menu.map((item) => (
            <BottomNavigationAction
              key={item.path}
              label={item.label}
              value={item.path}
              component={Link}
              to={item.path}
            />
          ))}
        </BottomNavigation>
      ) : null}
    </Box>
  );
}
