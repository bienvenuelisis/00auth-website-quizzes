import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme } from '@mui/material/styles';
import analyticsService from '../services/analyticsService';

const ThemeContext = createContext();

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return context;
};

// Configuration des thèmes clair et sombre
const getTheme = (mode) => createTheme({
  palette: {
    mode: mode,
    primary: {
      main: "#1a1a1a",
      light: "#333333",
      dark: "#000000",
    },
    secondary: {
      main: "#c9b037", // Or James Bond
      light: "#ddc76b",
      dark: "#9d8627",
    },
    success: {
      main: "#2ecc71", // Vert pour bonnes réponses
      light: "#a8e6cf",
      dark: "#27ae60",
    },
    error: {
      main: "#e74c3c", // Rouge pour mauvaises réponses
      light: "#ffb3b3",
      dark: "#c0392b",
    },
    background: {
      default: mode === 'light' ? "#fafafa" : "#121212",
      paper: mode === 'light' ? "#ffffff" : "#1e1e1e",
    },
    text: {
      primary: mode === 'light' ? "#1a1a1a" : "#ffffff",
      secondary: mode === 'light' ? "#666666" : "#b0b0b0",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: "3.5rem",
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: "2.5rem",
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: "2rem",
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 500,
      fontSize: "1.5rem",
      lineHeight: 1.4,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
          fontWeight: 500,
          padding: "10px 24px",
        },
        outlined: {
          borderColor: mode === 'light' ? "#1a1a1a" : "#ffffff",
          color: mode === 'light' ? "#1a1a1a" : "#ffffff",
          "&:hover": {
            borderColor: mode === 'light' ? "#c9b037" : "#c9b037",
            color: mode === 'light' ? "#c9b037" : "#c9b037",
            backgroundColor: mode === 'light'
              ? "rgba(201, 176, 55, 0.04)"
              : "rgba(201, 176, 55, 0.08)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: mode === 'light'
            ? "0 4px 20px rgba(0,0,0,0.1)"
            : "0 4px 20px rgba(255,255,255,0.05)",
          transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: mode === 'light'
              ? "0 8px 30px rgba(0,0,0,0.15)"
              : "0 8px 30px rgba(255,255,255,0.1)",
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'light' ? "#ffffff" : "#1e1e1e",
          color: mode === 'light' ? "#1a1a1a" : "#ffffff",
          boxShadow: mode === 'light'
            ? "0 2px 8px rgba(0,0,0,0.1)"
            : "0 2px 8px rgba(0,0,0,0.3)",
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 8,
        },
        bar: {
          borderRadius: 4,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          "&.MuiChip-outlined": {
            borderColor: mode === 'light' ? "rgba(0, 0, 0, 0.23)" : "rgba(255, 255, 255, 0.23)",
            color: mode === 'light' ? "rgba(0, 0, 0, 0.87)" : "rgba(255, 255, 255, 0.87)",
          },
          "&.MuiChip-outlinedPrimary": {
            borderColor: mode === 'light' ? "#1a1a1a" : "#ffffff",
            color: mode === 'light' ? "#1a1a1a" : "#ffffff",
            "&:hover": {
              backgroundColor: mode === 'light' ? "rgba(26, 26, 26, 0.08)" : "rgba(255, 255, 255, 0.08)",
            },
          },
          "&.MuiChip-outlinedSecondary": {
            borderColor: "#c9b037",
            color: "#c9b037",
            "&:hover": {
              backgroundColor: "rgba(201, 176, 55, 0.08)",
            },
          },
        },
      },
    },
  },
});

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    // Récupérer la préférence sauvegardée ou utiliser la préférence système
    const savedMode = localStorage.getItem('quizThemeMode');
    if (savedMode) {
      return savedMode;
    }

    // Détecter la préférence système
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  });

  const theme = getTheme(mode);

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('quizThemeMode', newMode);

    // Tracker le changement de thème
    analyticsService.logThemeChange(newMode);
  };

  // Écouter les changements de préférence système
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Ne changer automatiquement que si aucune préférence n'est sauvegardée
      if (!localStorage.getItem('quizThemeMode')) {
        setMode(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const value = {
    mode,
    theme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
