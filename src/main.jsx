import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App.jsx';
import { ThemeProvider, useThemeMode } from './contexts/ThemeContext.jsx';
import './index.css';

/**
 * Point d'entrée principal de l'application Quiz
 * Configure les providers globaux:
 * - ThemeProvider pour la gestion du thème James Bond (light/dark)
 * - BrowserRouter pour le routing
 * - MuiThemeProvider pour Material-UI
 */

// Wrapper pour accéder au thème dans le contexte
function AppWithTheme() {
  const { theme } = useThemeMode();

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MuiThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AppWithTheme />
    </ThemeProvider>
  </React.StrictMode>
);
