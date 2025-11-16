import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Button,
  Avatar,
  IconButton,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Card,
  CardContent,
  Grid,
  LinearProgress
} from '@mui/material';
import {
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import StatusBadge from '../components/PracticalWorks/StatusBadge';
import { getSortedPracticalWorks } from '../data/practicalWorks';
import {
  getPendingSubmissions,
  getEvaluatedSubmissions,
  getAllPracticalWorkProgress,
  getPracticalWorkStats
} from '../services/firebase/firestore/practicalWorks';
import { getProfile } from '../services/firebase/firestore/profile';
import { PW_STATUS } from '../models/practicalWork';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

/**
 * Admin page for managing practical works
 */
function AdminPracticalWorks() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tabValue, setTabValue] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState('flutter-advanced');
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [evaluatedSubmissions, setEvaluatedSubmissions] = useState([]);
  const [statsPerTP, setStatsPerTP] = useState({});
  const [studentProfiles, setStudentProfiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load pending submissions
        const pending = await getPendingSubmissions(selectedCourse);
        setPendingSubmissions(pending);

        // Load evaluated submissions
        const evaluated = await getEvaluatedSubmissions(selectedCourse, 50);
        setEvaluatedSubmissions(evaluated);

        // Load stats per TP
        const practicalWorks = getSortedPracticalWorks(selectedCourse);
        const stats = {};
        for (const pw of practicalWorks) {
          const pwStats = await getPracticalWorkStats(pw.id);
          stats[pw.id] = pwStats;
        }
        setStatsPerTP(stats);

        // Load student profiles
        const allSubmissions = [...pending, ...evaluated];
        const userIds = [...new Set(allSubmissions.map(s => s.userId))];
        const profiles = {};
        for (const userId of userIds) {
          try {
            const profile = await getProfile(userId);
            profiles[userId] = profile;
          } catch (error) {
            console.warn(`Profil non trouvé pour l'utilisateur ${userId}:`, error);
            // Créer un profil par défaut pour afficher au moins l'ID
            profiles[userId] = {
              id: userId,
              fullName: 'Utilisateur inconnu',
              displayName: userId,
              email: 'Email non disponible',
              photoURL: null
            };
          }
        }
        setStudentProfiles(profiles);

      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedCourse]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleReview = (practicalWorkId, userId, attemptNumber) => {
    navigate(`/admin/practical-work/${practicalWorkId}/review/${userId}/${attemptNumber}`);
  };

  const handleViewStudent = (userId) => {
    navigate(`/admin/progress?student=${userId}`);
  };

  // Calculate overall stats
  const overallStats = {
    totalSubmissions: pendingSubmissions.length + evaluatedSubmissions.length,
    pendingReview: pendingSubmissions.length,
    evaluated: evaluatedSubmissions.length,
    averageScore: evaluatedSubmissions.length > 0
      ? evaluatedSubmissions.reduce((sum, s) => sum + (s.bestScore || 0), 0) / evaluatedSubmissions.length
      : 0
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

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Gestion des Travaux Pratiques
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Suivez, évaluez et validez les travaux pratiques des étudiants
        </Typography>
      </Box>

      {/* Course selector */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <FormControl sx={{ minWidth: 300 }}>
            <InputLabel>Formation</InputLabel>
            <Select
              value={selectedCourse}
              label="Formation"
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <MenuItem value="flutter-advanced">Flutter Avancé</MenuItem>
            </Select>
          </FormControl>

          {/* Overall Stats */}
          <Grid container spacing={2} sx={{ flexGrow: 1 }}>
            <Grid item xs={6} sm={3}>
              <Card variant="outlined" sx={{ bgcolor: 'background.paper' }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    {overallStats.totalSubmissions}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total soumissions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card variant="outlined" sx={{ bgcolor: 'background.paper' }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="warning.main" fontWeight="bold">
                    {overallStats.pendingReview}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    En attente
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card variant="outlined" sx={{ bgcolor: 'background.paper' }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="success.main" fontWeight="bold">
                    {overallStats.evaluated}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Évalués
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card variant="outlined" sx={{ bgcolor: 'background.paper' }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="info.main" fontWeight="bold">
                    {overallStats.averageScore.toFixed(1)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Moyenne générale
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Stack>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ bgcolor: 'background.paper', borderRadius: 1, mb: 2 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label={`En attente d'évaluation (${pendingSubmissions.length})`} />
          <Tab label={`Évalués récemment (${evaluatedSubmissions.length})`} />
          <Tab label="Statistiques par TP" />
        </Tabs>
      </Paper>

      {/* Tab 1: Pending Submissions */}
      <TabPanel value={tabValue} index={0}>
        {pendingSubmissions.length === 0 ? (
          <Alert severity="info">
            Aucune soumission en attente d'évaluation.
          </Alert>
        ) : (
          <TableContainer component={Paper} sx={{ bgcolor: 'background.paper' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50' }}>
                  <TableCell>Étudiant</TableCell>
                  <TableCell>Travail Pratique</TableCell>
                  <TableCell>Tentative</TableCell>
                  <TableCell>Date de soumission</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingSubmissions
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((submission) => {
                    const profile = studentProfiles[submission.userId];
                    const latestAttempt = submission.attempts[submission.attempts.length - 1];
                    const pw = getSortedPracticalWorks(selectedCourse).find(
                      p => p.id === submission.practicalWorkId
                    );

                    return (
                      <TableRow key={`${submission.userId}_${submission.practicalWorkId}`}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar src={profile?.photoURL} sx={{ width: 32, height: 32 }}>
                              <PersonIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {profile?.fullName || profile?.displayName || 'Inconnu'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {profile?.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{pw?.title}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {pw?.week}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`Tentative ${latestAttempt?.attemptNumber || 1}`}
                            size="small"
                            variant="outlined"
                          />
                          {latestAttempt?.isLate && (
                            <Chip
                              label={`En retard`}
                              size="small"
                              color="error"
                              icon={<WarningIcon />}
                              sx={{ ml: 1 }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {latestAttempt?.submittedAt
                              ? new Date(latestAttempt.submittedAt).toLocaleDateString('fr-FR')
                              : 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {latestAttempt?.submittedAt
                              ? new Date(latestAttempt.submittedAt).toLocaleTimeString('fr-FR')
                              : ''}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={submission.status} />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<ViewIcon />}
                            onClick={() => handleReview(
                              submission.practicalWorkId,
                              submission.userId,
                              latestAttempt?.attemptNumber
                            )}
                          >
                            Évaluer
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={pendingSubmissions.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Lignes par page"
            />
          </TableContainer>
        )}
      </TabPanel>

      {/* Tab 2: Evaluated Submissions */}
      <TabPanel value={tabValue} index={1}>
        {evaluatedSubmissions.length === 0 ? (
          <Alert severity="info">
            Aucune soumission évaluée récemment.
          </Alert>
        ) : (
          <TableContainer component={Paper} sx={{ bgcolor: 'background.paper' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50' }}>
                  <TableCell>Étudiant</TableCell>
                  <TableCell>Travail Pratique</TableCell>
                  <TableCell>Note</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Date évaluation</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {evaluatedSubmissions
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((submission) => {
                    const profile = studentProfiles[submission.userId];
                    const latestAttempt = submission.attempts[submission.attempts.length - 1];
                    const pw = getSortedPracticalWorks(selectedCourse).find(
                      p => p.id === submission.practicalWorkId
                    );

                    return (
                      <TableRow key={`${submission.userId}_${submission.practicalWorkId}`}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar src={profile?.photoURL} sx={{ width: 32, height: 32 }}>
                              <PersonIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {profile?.fullName || profile?.displayName || 'Inconnu'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {profile?.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{pw?.title}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="h6"
                            color={submission.bestScore >= 70 ? 'success.main' : 'error.main'}
                          >
                            {submission.bestScore}/100
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={submission.status} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {latestAttempt?.evaluation?.evaluatedAt
                              ? new Date(latestAttempt.evaluation.evaluatedAt).toLocaleDateString('fr-FR')
                              : 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<ViewIcon />}
                            onClick={() => handleReview(
                              submission.practicalWorkId,
                              submission.userId,
                              latestAttempt?.attemptNumber
                            )}
                          >
                            Voir
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={evaluatedSubmissions.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Lignes par page"
            />
          </TableContainer>
        )}
      </TabPanel>

      {/* Tab 3: Stats per TP */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          {getSortedPracticalWorks(selectedCourse).map((pw) => {
            const stats = statsPerTP[pw.id] || {};
            const completionRate = stats.totalStudents > 0
              ? ((stats.passed / stats.totalStudents) * 100).toFixed(1)
              : 0;

            return (
              <Grid item xs={12} md={6} key={pw.id}>
                <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {pw.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {pw.week} • {pw.isBonus ? 'Bonus' : 'Obligatoire'}
                    </Typography>
                  </Box>

                  <Stack spacing={2}>
                    <Box>
                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="body2">Taux de réussite</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {completionRate}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={parseFloat(completionRate)}
                        color={completionRate >= 70 ? 'success' : 'warning'}
                      />
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Soumis
                        </Typography>
                        <Typography variant="h6">
                          {stats.submitted || 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Réussis
                        </Typography>
                        <Typography variant="h6" color="success.main">
                          {stats.passed || 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Moyenne
                        </Typography>
                        <Typography variant="h6">
                          {stats.averageScore?.toFixed(1) || 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          En retard
                        </Typography>
                        <Typography variant="h6" color="warning.main">
                          {stats.lateSubmissions || 0}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Stack>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </TabPanel>
    </Container>
  );
}

export default AdminPracticalWorks;
