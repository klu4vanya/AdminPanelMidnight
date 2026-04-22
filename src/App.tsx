// App.tsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Layout from "./components/Layout";
import UsersPage from "./pages/UsersPage";
import GamesPage from "./pages/GamesPage";
import ParticipantsPage from "./pages/ParticipantsPage";
import HistoryPage from "./pages/HistoryPage";
import LoginPage from "./pages/LoginPage";
import ClocksPage from "./components/Clocks/AdminClock/ClocksPage";
import MainPage from "./components/Clocks/ClockPage";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#6C5CE7" },
    secondary: { main: "#00CEC9" },
  },
  shape: { borderRadius: 12 },
});

let runtimeToken: string | null =
  localStorage.getItem("token");

  export const setRuntimeToken = (t: string | null) => {
    if (t) {
      localStorage.setItem("auth_token", t);
    } else {
      localStorage.removeItem("auth_token");
    }
  };
  
  export const getRuntimeToken = () => localStorage.getItem("auth_token");
  
  const isAuth = () => !!getRuntimeToken();

const PrivateRoute = ({ children }: any) => {
  return isAuth() ? children : <Navigate to="/login" />;
};
export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route path="/users" element={<UsersPage />} />
            <Route path="/games" element={<GamesPage />} />
            <Route path="/participants" element={<ParticipantsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/clocks" element={<ClocksPage />} />
            <Route path="/clock/:id" element={<MainPage />} />
            <Route path="*" element={<Navigate to="/users" />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}