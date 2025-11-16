/**
 * Page de leaderboard - Classement des étudiants
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
  Avatar,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
  Tabs,
  Tab,
  Tooltip,
  Button
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingIcon,
  Speed as SpeedIcon,
  Star as StarIcon,
  ArrowBack as BackIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { InstructorRoute } from '../components/Auth/ProtectedRoute';
import { getPublishedCourses } from '../data/courses';
import { getModulesByCourse } from '../data/modules';
import { getCourseProgressions, getAllUsersWithProgress } from '../services/firebase/firestore/admin';

/**
 * Carte de statistiques du leaderboard
 */
function LeaderboardStatsCard({ title, value, subtitle, icon, color }) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ color }}>
            {icon}
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography color="text.secondary" variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

/**
 * Médaille pour le top 3
 */
function RankMedal({ rank }) {
  const medals = {
    1: { icon: '🥇', color: '#FFD700' },
    2: { icon: '🥈', color: '#C0C0C0' },
    3: { icon: '🥉', color: '#CD7F32' }
  };

  const medal = medals[rank];
  if (!medal) return <Typography variant="h6">#{rank}</Typography>;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="h4">{medal.icon}</Typography>
      <Typography variant="h6" sx={{ color: medal.color, fontWeight: 'bold' }}>
        #{rank}
      </Typography>
    </Box>
  );
}

/**
 * Ligne du leaderboard
 */
function LeaderboardRow({ student, rank, sortBy }) {
  const getHighlightedMetric = () => {
    switch (sortBy) {
      case 'score':
        return (
          <Chip
            label={`${student.stats.averageScore}%`}
            color="primary"
            size="small"
            icon={<StarIcon />}
          />
        );
      case 'attempts':
        return (
          <Chip
            label={`${student.stats.totalQuizzesTaken} quiz`}
            color="secondary"
            size="small"
          />
        );
      case 'modules':
        return (
          <Chip
            label={`${student.stats.totalModulesCompleted} modules`}
            color="success"
            size="small"
          />
        );
      case 'progress':
        return (
          <Chip
            label={`${student.stats.progress}%`}
            color="info"
            size="small"
          />
        );
      default:
        return null;
    }
  };

  return (
    <TableRow
      hover
      sx={{
        backgroundColor: rank <= 3 ? 'action.hover' : 'inherit',
        '&:hover': {
          backgroundColor: 'action.selected'
        }
      }}
    >
      {/* Rang */}
      <TableCell width={100}>
        <RankMedal rank={rank} />
      </TableCell>

      {/* Étudiant */}
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar src={student.photoURL} alt={student.fullName} sx={{ width: 48, height: 48 }}>
            {student.fullName.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body1" fontWeight="bold">
              {student.fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {student.email}
            </Typography>
          </Box>
        </Box>
      </TableCell>

      {/* Score moyen */}
      <TableCell align="center">
        <Box>
          <Typography variant="h6" fontWeight="bold" color="primary">
            {student.stats.averageScore}%
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Score moyen
          </Typography>
        </Box>
      </TableCell>

      {/* Quiz passés */}
      <TableCell align="center">
        <Box>
          <Typography variant="h6" fontWeight="bold">
            {student.stats.totalQuizzesTaken}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Quiz passés
          </Typography>
        </Box>
      </TableCell>

      {/* Modules complétés */}
      <TableCell align="center">
        <Box>
          <Typography variant="h6" fontWeight="bold" color="success.main">
            {student.stats.totalModulesCompleted}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Modules validés
          </Typography>
        </Box>
      </TableCell>

      {/* Progression */}
      <TableCell align="center">
        <Box>
          <Typography variant="h6" fontWeight="bold" color="info.main">
            {student.stats.progress}%
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Progression
          </Typography>
        </Box>
      </TableCell>

      {/* Métrique mise en avant */}
      <TableCell align="center">
        {getHighlightedMetric()}
      </TableCell>
    </TableRow>
  );
}

/**
 * Leaderboard par module
 */
function ModuleLeaderboard({ students, moduleId, modules }) {
  const module = modules.find(m => m.id === moduleId);

  const studentsWithModule = students
    .map(student => {
      const moduleProgress = student.courseProgress?.modules?.[moduleId];
      if (!moduleProgress) return null;

      return {
        ...student,
        moduleStats: {
          bestScore: moduleProgress.bestScore || 0,
          attempts: moduleProgress.attempts?.length || 0,
          status: moduleProgress.status,
          lastAttemptDate: moduleProgress.lastAttemptDate
        }
      };
    })
    .filter(s => s !== null && s.moduleStats.bestScore > 0)
    .sort((a, b) => {
      // Trier par meilleur score, puis par nombre de tentatives (moins = mieux)
      if (b.moduleStats.bestScore !== a.moduleStats.bestScore) {
        return b.moduleStats.bestScore - a.moduleStats.bestScore;
      }
      return a.moduleStats.attempts - b.moduleStats.attempts;
    });

  if (studentsWithModule.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Aucun étudiant n'a encore complété ce module
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {module?.icon} {module?.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Classement basé sur le meilleur score, puis le nombre de tentatives
        </Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rang</TableCell>
              <TableCell>Étudiant</TableCell>
              <TableCell align="center">Meilleur Score</TableCell>
              <TableCell align="center">Tentatives</TableCell>
              <TableCell align="center">Statut</TableCell>
              <TableCell align="center">Dernière Tentative</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {studentsWithModule.map((student, index) => (
              <TableRow
                key={student.userId}
                sx={{
                  backgroundColor: index < 3 ? 'action.hover' : 'inherit'
                }}
              >
                <TableCell>
                  <RankMedal rank={index + 1} />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                <TableCell align="center">
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    {student.moduleStats.bestScore}%
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body1">
                    {student.moduleStats.attempts}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={
                      student.moduleStats.status === 'perfect' ? 'Parfait' :
                      student.moduleStats.status === 'completed' ? 'Validé' :
                      'En cours'
                    }
                    color={
                      student.moduleStats.status === 'perfect' ? 'secondary' :
                      student.moduleStats.status === 'completed' ? 'success' :
                      'warning'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">
                    {student.moduleStats.lastAttemptDate
                      ? new Date(student.moduleStats.lastAttemptDate).toLocaleDateString('fr-FR')
                      : '-'}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

/**
 * Composant principal du leaderboard
 */
function AdminLeaderboardContent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [sortBy, setSortBy] = useState('score'); // score, attempts, modules, progress
  const [viewMode, setViewMode] = useState('global'); // global, module
  const [selectedModule, setSelectedModule] = useState('');
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [tabValue, setTabValue] = useState(0);

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
      const courseProgress = await getCourseProgressions(selectedCourse);
      setStudents(courseProgress);
    } catch (error) {
      console.error('Erreur lors du chargement des progressions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculer le classement selon le critère sélectionné
  const getSortedStudents = () => {
    const studentsWithStats = students.map(student => ({
      ...student,
      stats: {
        averageScore: student.courseProgress?.stats?.averageScore || 0,
        totalQuizzesTaken: student.courseProgress?.stats?.totalQuizzesTaken || 0,
        totalModulesCompleted: student.courseProgress?.stats?.totalModulesCompleted || 0,
        progress: student.courseProgress?.stats?.progress || 0
      }
    }));

    return studentsWithStats.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          // Score moyen décroissant, puis nombre de quiz (pour départager)
          if (b.stats.averageScore !== a.stats.averageScore) {
            return b.stats.averageScore - a.stats.averageScore;
          }
          return b.stats.totalQuizzesTaken - a.stats.totalQuizzesTaken;

        case 'attempts':
          // Nombre de quiz décroissant
          return b.stats.totalQuizzesTaken - a.stats.totalQuizzesTaken;

        case 'modules':
          // Modules complétés décroissant, puis score moyen
          if (b.stats.totalModulesCompleted !== a.stats.totalModulesCompleted) {
            return b.stats.totalModulesCompleted - a.stats.totalModulesCompleted;
          }
          return b.stats.averageScore - a.stats.averageScore;

        case 'progress':
          // Progression décroissante
          return b.stats.progress - a.stats.progress;

        default:
          return 0;
      }
    });
  };

  const sortedStudents = getSortedStudents();

  // Calculer les stats du podium
  const topThree = sortedStudents.slice(0, 3);
  const averageScore = sortedStudents.length > 0
    ? Math.round(sortedStudents.reduce((sum, s) => sum + s.stats.averageScore, 0) / sortedStudents.length)
    : 0;

  const selectedCourseData = courses.find(c => c.id === selectedCourse);
  const modules = selectedCourseData ? getModulesByCourse(selectedCourse) : [];

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Chargement du leaderboard...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* En-tête */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <TrophyIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" fontWeight="bold">
              Leaderboard des Étudiants
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Classement et performances des étudiants
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate('/admin/progress')}
        >
          Retour au suivi
        </Button>
      </Box>

      {/* Sélection de la formation */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
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
          </Grid>
          <Grid item xs={12} md={6}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, value) => value && setViewMode(value)}
              fullWidth
            >
              <ToggleButton value="global">
                <TrendingIcon sx={{ mr: 1 }} />
                Vue Globale
              </ToggleButton>
              <ToggleButton value="module">
                <FilterIcon sx={{ mr: 1 }} />
                Par Module
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      </Paper>

      {/* Vue globale */}
      {viewMode === 'global' && (
        <>
          {/* Statistiques du leaderboard */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <LeaderboardStatsCard
                title="Étudiants Actifs"
                value={sortedStudents.length}
                icon={<TrophyIcon sx={{ fontSize: 40 }} />}
                color="#1976d2"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <LeaderboardStatsCard
                title="Top Score"
                value={topThree.length > 0 ? `${topThree[0].stats.averageScore}%` : '-'}
                subtitle={topThree[0]?.fullName}
                icon={<StarIcon sx={{ fontSize: 40 }} />}
                color="#FFD700"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <LeaderboardStatsCard
                title="Score Moyen"
                value={`${averageScore}%`}
                subtitle="Tous étudiants"
                icon={<TrendingIcon sx={{ fontSize: 40 }} />}
                color="#2e7d32"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <LeaderboardStatsCard
                title="Plus Actif"
                value={topThree.length > 0 ? topThree[0].stats.totalQuizzesTaken : 0}
                subtitle="Quiz passés"
                icon={<SpeedIcon sx={{ fontSize: 40 }} />}
                color="#ed6c02"
              />
            </Grid>
          </Grid>

          {/* Critères de classement */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body1" fontWeight="medium">
                Classer par :
              </Typography>
              <ToggleButtonGroup
                value={sortBy}
                exclusive
                onChange={(e, value) => value && setSortBy(value)}
                size="small"
              >
                <ToggleButton value="score">
                  <Tooltip title="Score moyen le plus élevé">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <StarIcon fontSize="small" />
                      Score Moyen
                    </Box>
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="attempts">
                  <Tooltip title="Nombre de quiz passés">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <SpeedIcon fontSize="small" />
                      Quiz Passés
                    </Box>
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="modules">
                  <Tooltip title="Nombre de modules validés">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TrophyIcon fontSize="small" />
                      Modules Validés
                    </Box>
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="progress">
                  <Tooltip title="Pourcentage de progression">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TrendingIcon fontSize="small" />
                      Progression
                    </Box>
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Paper>

          {/* Tableau du leaderboard */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Rang</TableCell>
                  <TableCell>Étudiant</TableCell>
                  <TableCell align="center">Score Moyen</TableCell>
                  <TableCell align="center">Quiz Passés</TableCell>
                  <TableCell align="center">Modules Validés</TableCell>
                  <TableCell align="center">Progression</TableCell>
                  <TableCell align="center">Focus</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary" sx={{ py: 3 }}>
                        Aucun étudiant inscrit à cette formation
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedStudents.map((student, index) => (
                    <LeaderboardRow
                      key={student.userId}
                      student={student}
                      rank={index + 1}
                      sortBy={sortBy}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Vue par module */}
      {viewMode === 'module' && (
        <>
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={selectedModule || modules[0]?.id}
              onChange={(e, v) => setSelectedModule(v)}
              variant="scrollable"
              scrollButtons="auto"
            >
              {modules.map((module) => (
                <Tab
                  key={module.id}
                  value={module.id}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {module.icon}
                      {module.title}
                    </Box>
                  }
                />
              ))}
            </Tabs>
          </Paper>

          <ModuleLeaderboard
            students={students}
            moduleId={selectedModule || modules[0]?.id}
            modules={modules}
          />
        </>
      )}
    </Container>
  );
}

/**
 * Page protégée (admins et instructeurs)
 */
export default function AdminLeaderboard() {
  return (
    <InstructorRoute>
      <AdminLeaderboardContent />
    </InstructorRoute>
  );
}
