/**
 * Page de suivi des progressions des étudiants
 * Accessible aux admins et instructeurs
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Tabs,
  Tab,
  Avatar,
  LinearProgress,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Collapse,
  Button
} from '@mui/material';
import {
  ExpandMore as ExpandIcon,
  CheckCircle as CompletedIcon,
  PlayArrow as InProgressIcon,
  Lock as LockedIcon,
  Star as PerfectIcon,
  EmojiEvents as LeaderboardIcon
} from '@mui/icons-material';
import { InstructorRoute } from '../components/Auth/ProtectedRoute';
import { getPublishedCourses } from '../data/courses';
import { getModulesByCourse } from '../data/modules';
import { getCourseProgressions, getAllUsersWithProgress } from '../services/firebase/firestore/admin';

/**
 * Carte de statistiques globales
 */
function StatsCard({ title, value, subtitle, color }) {
  return (
    <Card>
      <CardContent>
        <Typography color="text.secondary" variant="body2">
          {title}
        </Typography>
        <Typography variant="h3" fontWeight="bold" sx={{ color, my: 1 }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Ligne de progression d'un étudiant (extensible)
 */
function StudentProgressRow({ student, modules }) {
  const [expanded, setExpanded] = useState(false);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'perfect':
        return <CompletedIcon color="success" fontSize="small" />;
      case 'in_progress':
        return <InProgressIcon color="warning" fontSize="small" />;
      case 'locked':
        return <LockedIcon color="disabled" fontSize="small" />;
      default:
        return <InProgressIcon color="action" fontSize="small" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'perfect':
        return 'secondary';
      case 'in_progress':
        return 'warning';
      case 'locked':
        return 'default';
      default:
        return 'info';
    }
  };

  return (
    <>
      <TableRow hover onClick={() => setExpanded(!expanded)} sx={{ cursor: 'pointer' }}>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton size="small">
              <ExpandIcon
                sx={{
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: '0.3s'
                }}
              />
            </IconButton>
            <Avatar src={student.photoURL} alt={student.fullName}>
              {student.fullName.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="body1" fontWeight="medium">
                {student.fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {student.email}
              </Typography>
            </Box>
          </Box>
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinearProgress
              variant="determinate"
              value={student.courseProgress?.stats?.progress || 0}
              sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
            />
            <Typography variant="body2" fontWeight="medium">
              {student.courseProgress?.stats?.progress || 0}%
            </Typography>
          </Box>
        </TableCell>
        <TableCell>
          {student.courseProgress?.stats?.totalQuizzesTaken || 0}
        </TableCell>
        <TableCell>
          <Chip
            label={`${student.courseProgress?.stats?.averageScore || 0}%`}
            color={
              (student.courseProgress?.stats?.averageScore || 0) >= 70
                ? 'success'
                : 'warning'
            }
            size="small"
          />
        </TableCell>
        <TableCell>
          {student.courseProgress?.stats?.totalModulesCompleted || 0}
        </TableCell>
        <TableCell>
          {student.courseProgress?.lastActivityAt
            ? new Date(student.courseProgress.lastActivityAt).toLocaleDateString('fr-FR')
            : 'Jamais'}
        </TableCell>
      </TableRow>

      {/* Détails des modules */}
      <TableRow>
        <TableCell colSpan={6} sx={{ py: 0 }}>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ py: 2, px: 4 }}>
              <Typography variant="h6" gutterBottom>
                Détails par Module
              </Typography>
              <Grid container spacing={2}>
                {modules.map((module) => {
                  const moduleProgress = student.courseProgress?.modules?.[module.id];
                  return (
                    <Grid item xs={12} sm={6} md={4} key={module.id}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          {getStatusIcon(moduleProgress?.status || 'locked')}
                          <Typography variant="body2" fontWeight="medium" sx={{ flexGrow: 1 }}>
                            {module.title}
                          </Typography>
                          {moduleProgress?.status === 'perfect' && (
                            <PerfectIcon color="secondary" fontSize="small" />
                          )}
                        </Box>
                        {moduleProgress && (
                          <>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                Meilleur score
                              </Typography>
                              <Typography variant="caption" fontWeight="bold">
                                {moduleProgress.bestScore}%
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="caption" color="text.secondary">
                                Tentatives
                              </Typography>
                              <Typography variant="caption">
                                {moduleProgress.attempts?.length || 0}
                              </Typography>
                            </Box>
                          </>
                        )}
                        {!moduleProgress && (
                          <Typography variant="caption" color="text.secondary">
                            Non commencé
                          </Typography>
                        )}
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

/**
 * Composant principal
 */
function StudentProgressTrackerContent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadStudents();
    }
  }, [selectedCourse]);

  const loadCourses = async () => {
    try {
      const publishedCourses = getPublishedCourses();
      setCourses(publishedCourses);
      if (publishedCourses.length > 0) {
        setSelectedCourse(publishedCourses[0].id);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des formations:', error);
    }
  };

  const loadStudents = async () => {
    setLoading(true);
    try {
      if (selectedCourse === 'all') {
        const allUsers = await getAllUsersWithProgress();
        setStudents(
          allUsers
            .filter(u => u.progress)
            .map(u => ({
              userId: u.uid,
              fullName: u.fullName,
              email: u.email,
              photoURL: u.photoURL,
              globalStats: u.progress.globalStats
            }))
        );
      } else {
        const courseProgress = await getCourseProgressions(selectedCourse);
        setStudents(courseProgress);

        // Calculer les stats
        const totalStudents = courseProgress.length;
        const avgProgress = courseProgress.reduce((sum, s) => sum + (s.courseProgress?.stats?.progress || 0), 0) / totalStudents || 0;
        const avgScore = courseProgress.reduce((sum, s) => sum + (s.courseProgress?.stats?.averageScore || 0), 0) / totalStudents || 0;
        const completedStudents = courseProgress.filter(s => (s.courseProgress?.stats?.progress || 0) === 100).length;

        setStats({
          totalStudents,
          avgProgress: Math.round(avgProgress),
          avgScore: Math.round(avgScore),
          completedStudents
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des progressions:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedCourseData = courses.find(c => c.id === selectedCourse);
  const modules = selectedCourseData ? getModulesByCourse(selectedCourse) : [];

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Chargement des progressions...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* En-tête */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Suivi des Progressions
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Suivez la progression de vos étudiants dans les formations
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<LeaderboardIcon />}
          onClick={() => navigate('/admin/leaderboard')}
        >
          Voir le Leaderboard
        </Button>
      </Box>

      {/* Sélection de la formation */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Formation</InputLabel>
          <Select
            value={selectedCourse}
            label="Formation"
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            {courses.map((course) => (
              <MenuItem key={course.id} value={course.id}>
                {course.icon} {course.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {/* Statistiques de la formation */}
      {stats && selectedCourse !== 'all' && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Étudiants Inscrits"
              value={stats.totalStudents}
              color="#1976d2"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Progression Moyenne"
              value={`${stats.avgProgress}%`}
              color="#2e7d32"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Score Moyen"
              value={`${stats.avgScore}%`}
              color="#ed6c02"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Ont Terminé"
              value={stats.completedStudents}
              subtitle={`${Math.round((stats.completedStudents / stats.totalStudents) * 100)}% des étudiants`}
              color="#9c27b0"
            />
          </Grid>
        </Grid>
      )}

      {/* Liste des étudiants */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Étudiant</TableCell>
              <TableCell>Progression</TableCell>
              <TableCell>Quiz Passés</TableCell>
              <TableCell>Score Moyen</TableCell>
              <TableCell>Modules Validés</TableCell>
              <TableCell>Dernière Activité</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary" sx={{ py: 3 }}>
                    Aucun étudiant inscrit à cette formation
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <StudentProgressRow
                  key={student.userId}
                  student={student}
                  modules={modules}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

/**
 * Page protégée (admins et instructeurs)
 */
export default function StudentProgressTracker() {
  return (
    <InstructorRoute>
      <StudentProgressTrackerContent />
    </InstructorRoute>
  );
}
