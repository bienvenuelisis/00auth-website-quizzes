import { Link as RouterLink } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Container,
} from "@mui/material";
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import { useThemeMode } from "../../contexts/ThemeContext";

/**
 * Navbar - Barre de navigation principale
 * Affiche le logo, le titre et le toggle du thème
 */
export default function Navbar() {
  const { mode, toggleTheme } = useThemeMode();

  return (
    <AppBar
      position="sticky"
      elevation={2}
      sx={{
        backgroundColor: (theme) => theme.palette.background.paper,
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          {/* Logo et Titre */}
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              color: "inherit",
              flexGrow: 1,
            }}
          >
            <HomeIcon
              sx={{
                fontSize: 32,
                mr: 1,
                color: "secondary.main",
              }}
            />
            <Box>
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 700,
                  color: "text.primary",
                  lineHeight: 1.2,
                }}
              >
                De nouvelles compétences numériques, au quotidien
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  display: { xs: "none", sm: "block" },
                }}
              >
                Le développeur authentique
              </Typography>
            </Box>
          </Box>

          {/* Bouton Dashboard */}
          <Button
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              color: "text.secondary",
              display: {
                xs: "none",
                md: "inline-flex",
              },
            }}
          >
            Tableau de bord
          </Button>

          {/* Toggle Theme */}
          <IconButton
            onClick={toggleTheme}
            color="inherit"
            aria-label={`Activer le mode ${
              mode === "light" ? "sombre" : "clair"
            }`}
            sx={{
              color: "secondary.main",
            }}
          >
            {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
