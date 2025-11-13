import { Link as RouterLink } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Container,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from "@mui/material";
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  AdminPanelSettings as AdminIcon,
  School as ProgressIcon
} from "@mui/icons-material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useThemeMode } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";
import { signOutCurrentUser } from "../../services/firebase/auth";

/**
 * Navbar - Barre de navigation principale
 * Affiche le logo, le titre et le toggle du thème
 */
export default function Navbar() {
  const { mode, toggleTheme } = useThemeMode();
  const { user, profile, isAuthenticated } = useAuth();
  const { isAdmin, canManageUsers, canViewAnalytics } = usePermissions();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate("/profile");
  };

  const handleLogout = async () => {
    handleMenuClose();
    try {
      await signOutCurrentUser();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleLogin = () => {
    navigate("/auth");
  };

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
              mr: 1,
            }}
          >
            {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          {/* Profil utilisateur ou Login */}
          {isAuthenticated ? (
            <>
              <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
                <Avatar
                  src={profile?.photoURL}
                  alt={profile?.fullName}
                  sx={{ width: 40, height: 40 }}
                >
                  {!profile?.photoURL && <PersonIcon />}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <MenuItem disabled>
                  <ListItemText
                    primary={profile?.fullName}
                    secondary={profile?.email}
                    primaryTypographyProps={{
                      variant: "subtitle2",
                      fontWeight: 600,
                    }}
                    secondaryTypographyProps={{
                      variant: "caption",
                    }}
                  />
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleProfile}>
                  <ListItemIcon>
                    <AccountCircleIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Mon profil</ListItemText>
                </MenuItem>

                {/* Menu Administration */}
                {(isAdmin || canManageUsers) && (
                  <>
                    <Divider />
                    <MenuItem onClick={() => { handleMenuClose(); navigate('/admin'); }}>
                      <ListItemIcon>
                        <AdminIcon fontSize="small" color="error" />
                      </ListItemIcon>
                      <ListItemText>Administration</ListItemText>
                    </MenuItem>
                  </>
                )}

                {/* Menu Progressions */}
                {canViewAnalytics && (
                  <MenuItem onClick={() => { handleMenuClose(); navigate('/admin/progress'); }}>
                    <ListItemIcon>
                      <ProgressIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText>Suivi des Progressions</ListItemText>
                  </MenuItem>
                )}

                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Déconnexion</ListItemText>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              variant="outlined"
              startIcon={<LoginIcon />}
              onClick={handleLogin}
              sx={{ ml: 1 }}
            >
              Connexion
            </Button>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
