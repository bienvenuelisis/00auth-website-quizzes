import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PracticalWorkCard from '../components/PracticalWorks/PracticalWorkCard';
import {
  getSortedPracticalWorks,
  getPracticalWorksByCourse,
  getBonusPracticalWorks,
  getRequiredPracticalWorks
} from '../data/practicalWorks';
import { getUserPracticalWorkProgress } from '../services/firebase/firestore/practicalWorks';
import { PW_STATUS } from '../models/practicalWork';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

/**
 * Page displaying list of practical works for a course
 */
function PracticalWorksList() {
  const { courseId } = useParams();
  const { user } = useAuth();

  const [tabValue, setTabValue] = useState(0);
  const [filterWeek, setFilterWeek] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [practicalWorks, setPracticalWorks] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load practical works and progress
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load practical works
        const pws = getSortedPracticalWorks(courseId);
        setPracticalWorks(pws);

        // Load user progress
        if (user) {
          const progress = await getUserPracticalWorkProgress(user.uid, courseId);
          const progressMap = {};
          progress.forEach(p => {
            progressMap[p.practicalWorkId] = p;
          });
          setProgressData(progressMap);
        }
      } catch (err) {
        console.error('Error loading practical works:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      loadData();
    }
  }, [courseId, user]);

  // Get filtered practical works
  const getFilteredPracticalWorks = (isBonus = false) => {
    let filtered = practicalWorks.filter(pw => pw.isBonus === isBonus);

    // Filter by week
    if (filterWeek !== 'all') {
      filtered = filtered.filter(pw => pw.weekNumber === parseInt(filterWeek));
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(pw => {
        const progress = progressData[pw.id];
        if (!progress) {
          return filterStatus === PW_STATUS.NOT_STARTED;
        }
        return progress.status === filterStatus;
      });
    }

    return filtered;
  };

  // Get unique weeks
  const weeks = [...new Set(practicalWorks.map(pw => pw.weekNumber))].sort();

  // Calculate statistics
  const stats = {
    total: practicalWorks.length,
    completed: Object.values(progressData).filter(p => p.isPassed).length,
    inProgress: Object.values(progressData).filter(p =>
      p.status === PW_STATUS.IN_PROGRESS || p.status === PW_STATUS.SUBMITTED
    ).length,
    notStarted: practicalWorks.length - Object.keys(progressData).length
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Chargement des travaux pratiques...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Erreur lors du chargement: {error}
        </Alert>
      </Container>
    );
  }

  const requiredPWs = getFilteredPracticalWorks(false);
  const bonusPWs = getFilteredPracticalWorks(true);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Travaux Pratiques
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Mettez en pratique vos connaissances avec des projets concrets
        </Typography>
      </Box>

      {/* Statistics */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h3" color="primary" fontWeight="bold">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                TPs au total
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h3" color="success.main" fontWeight="bold">
                {stats.completed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Réussis
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h3" color="info.main" fontWeight="bold">
                {stats.inProgress}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                En cours
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h3" color="text.secondary" fontWeight="bold">
                {stats.notStarted}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Non commencés
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Filters */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Semaine</InputLabel>
          <Select
            value={filterWeek}
            label="Semaine"
            onChange={(e) => setFilterWeek(e.target.value)}
          >
            <MenuItem value="all">Toutes les semaines</MenuItem>
            {weeks.map(week => (
              <MenuItem key={week} value={week}>
                Semaine {week}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Statut</InputLabel>
          <Select
            value={filterStatus}
            label="Statut"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <MenuItem value="all">Tous les statuts</MenuItem>
            <MenuItem value={PW_STATUS.NOT_STARTED}>Non commencé</MenuItem>
            <MenuItem value={PW_STATUS.IN_PROGRESS}>En cours</MenuItem>
            <MenuItem value={PW_STATUS.SUBMITTED}>Soumis</MenuItem>
            <MenuItem value={PW_STATUS.PASSED}>Réussi</MenuItem>
            <MenuItem value={PW_STATUS.FAILED}>Échoué</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Tabs */}
      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
        <Tab label={`TPs Obligatoires (${requiredPWs.length})`} />
        <Tab label={`TPs Bonus (${bonusPWs.length})`} />
      </Tabs>

      {/* Required Practical Works */}
      <TabPanel value={tabValue} index={0}>
        {requiredPWs.length === 0 ? (
          <Alert severity="info">
            Aucun travail pratique ne correspond aux filtres sélectionnés.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {requiredPWs.map(pw => (
              <Grid item xs={12} sm={6} md={4} key={pw.id}>
                <PracticalWorkCard
                  practicalWork={pw}
                  progress={progressData[pw.id]}
                  courseId={courseId}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Bonus Practical Works */}
      <TabPanel value={tabValue} index={1}>
        {bonusPWs.length === 0 ? (
          <Alert severity="info">
            Aucun travail pratique bonus ne correspond aux filtres sélectionnés.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {bonusPWs.map(pw => (
              <Grid item xs={12} sm={6} md={4} key={pw.id}>
                <PracticalWorkCard
                  practicalWork={pw}
                  progress={progressData[pw.id]}
                  courseId={courseId}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>
    </Container>
  );
}

export default PracticalWorksList;
