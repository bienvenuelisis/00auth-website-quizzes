import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Paper, Tab, Tabs } from '@mui/material';
import SignUpForm from '../components/Auth/SignUpForm';
import LoginForm from '../components/Auth/LoginForm';

/**
 * Page d'authentification (Login / Sign Up)
 */
export default function AuthPage() {
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAuthSuccess = ({ user, profile }) => {
    console.log('Authentication successful:', user, profile);
    // Rediriger vers le dashboard
    navigate('/');
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Connexion" />
          <Tab label="Inscription" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 ? (
            <LoginForm
              onSuccess={handleAuthSuccess}
              onSwitchToSignUp={() => setActiveTab(1)}
            />
          ) : (
            <SignUpForm
              onSuccess={handleAuthSuccess}
              onSwitchToLogin={() => setActiveTab(0)}
            />
          )}
        </Box>
      </Paper>
    </Container>
  );
}
