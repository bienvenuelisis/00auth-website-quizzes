/**
 * AdminModules - Interface admin pour gérer l'activation des modules
 */

import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import {
  CheckCircle as ActiveIcon,
  Block as InactiveIcon,
  Schedule as ScheduleIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useAllModuleActivations } from "../hooks/useModuleActivation";
import {
  activateModule,
  deactivateModule,
  updateModuleActivation,
  scheduleModuleActivation,
} from "../services/firebase/firestore/moduleActivation";
import { MODULES_DATA } from "../data/modules";
import { getCourseById } from "../data/courses";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { AdminRoute } from "../components/Auth/ProtectedRoute";

// Configurer dayjs pour utiliser la locale française
dayjs.locale("fr");

export default function AdminModules() {
  const { isAuthenticated, profile } = useAuth();
  const { activations, loading, error, refresh } = useAllModuleActivations();

  const [selectedModule, setSelectedModule] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(null);
  const [reason, setReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);

  // Combiner modules du code avec activations Firestore
  const modulesWithActivation = MODULES_DATA.map((module) => {
    const activation = activations.find((a) => a.moduleId === module.id);
    const course = getCourseById(module.courseId);

    return {
      ...module,
      activation: activation || {
        isActive: false,
        scheduledActivation: null,
        reason: "Non initialisé",
      },
      courseName: course?.shortTitle || "N/A",
    };
  });

  // Filtrer par onglet
  const filteredModules = modulesWithActivation.filter((module) => {
    if (selectedTab === 0) return true; // Tous
    if (selectedTab === 1) return module.activation.isActive; // Actifs
    if (selectedTab === 2) return !module.activation.isActive; // Inactifs
    if (selectedTab === 3) return module.activation.scheduledActivation; // Programmés
    return true;
  });

  const handleToggleActivation = async (module) => {
    try {
      setProcessing(true);

      if (module.activation.isActive) {
        await deactivateModule(
          module.id,
          profile.email,
          "Désactivé depuis l'interface admin"
        );
        setSuccessMessage(`Module "${module.title}" désactivé`);
      } else {
        await activateModule(
          module.id,
          profile.email,
          "Activé depuis l'interface admin"
        );
        setSuccessMessage(`Module "${module.title}" activé`);
      }

      await refresh();
    } catch (err) {
      console.error("Erreur lors du toggle:", err);
      alert("Erreur lors de la modification");
    } finally {
      setProcessing(false);
    }
  };

  const handleOpenScheduleDialog = (module) => {
    setSelectedModule(module);
    setScheduledDate(
      module.activation.scheduledActivation
        ? dayjs(module.activation.scheduledActivation)
        : dayjs()
    );
    setReason(module.activation.reason || "");
    setDialogOpen(true);
  };

  const handleScheduleActivation = async () => {
    if (!selectedModule || !scheduledDate) return;

    try {
      setProcessing(true);

      await updateModuleActivation(selectedModule.id, {
        scheduledActivation: scheduledDate.toDate(), // Convertir dayjs en Date pour Firestore
        activatedBy: profile.email,
        reason,
      });

      setSuccessMessage(`Activation programmée pour "${selectedModule.title}"`);
      setDialogOpen(false);
      await refresh();
    } catch (err) {
      console.error("Erreur lors de la programmation:", err);
      alert("Erreur lors de la programmation");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <AdminRoute>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h4" component="h1" fontWeight="700">
              Gestion des Modules
            </Typography>
            <Button
              startIcon={<RefreshIcon />}
              onClick={refresh}
              disabled={loading}
            >
              Actualiser
            </Button>
          </Box>

          {successMessage && (
            <Alert
              severity="success"
              onClose={() => setSuccessMessage(null)}
              sx={{ mb: 3 }}
            >
              {successMessage}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              Erreur: {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Onglets de filtrage */}
              <Paper sx={{ mb: 2 }}>
                <Tabs
                  value={selectedTab}
                  onChange={(e, newValue) => setSelectedTab(newValue)}
                >
                  <Tab label={`Tous (${modulesWithActivation.length})`} />
                  <Tab
                    label={`Actifs (${
                      modulesWithActivation.filter((m) => m.activation.isActive)
                        .length
                    })`}
                  />
                  <Tab
                    label={`Inactifs (${
                      modulesWithActivation.filter(
                        (m) => !m.activation.isActive
                      ).length
                    })`}
                  />
                  <Tab
                    label={`Programmés (${
                      modulesWithActivation.filter(
                        (m) => m.activation.scheduledActivation
                      ).length
                    })`}
                  />
                </Tabs>
              </Paper>

              {/* Tableau des modules */}
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <strong>Formation</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Module</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Statut</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Activation Programmée</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Raison</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Actions</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredModules.map((module) => (
                      <TableRow key={module.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="500">
                            {module.courseName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="500">
                            {module.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {module.id}
                          </Typography>
                          {module.isFirst && (
                            <Chip
                              label="Premier"
                              size="small"
                              color="primary"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <FormControlLabel
                            control={
                              <Switch
                                checked={module.activation.isActive}
                                onChange={() => handleToggleActivation(module)}
                                disabled={processing}
                                color="success"
                              />
                            }
                            label={
                              <Chip
                                icon={
                                  module.activation.isActive ? (
                                    <ActiveIcon />
                                  ) : (
                                    <InactiveIcon />
                                  )
                                }
                                label={
                                  module.activation.isActive
                                    ? "Actif"
                                    : "Inactif"
                                }
                                color={
                                  module.activation.isActive
                                    ? "success"
                                    : "default"
                                }
                                size="small"
                              />
                            }
                          />
                        </TableCell>
                        <TableCell align="center">
                          {module.activation.scheduledActivation ? (
                            <Chip
                              icon={<ScheduleIcon />}
                              label={new Date(
                                module.activation.scheduledActivation
                              ).toLocaleString("fr-FR")}
                              color="info"
                              size="small"
                            />
                          ) : (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Aucune
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ maxWidth: 200 }}
                          >
                            {module.activation.reason || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => handleOpenScheduleDialog(module)}
                            disabled={processing}
                          >
                            Programmer
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {filteredModules.length === 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Aucun module dans cette catégorie
                </Alert>
              )}
            </>
          )}

          {/* Dialog de programmation */}
          <Dialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              Programmer l'activation
              {selectedModule && (
                <Typography variant="body2" color="text.secondary">
                  {selectedModule.title}
                </Typography>
              )}
            </DialogTitle>
            <DialogContent>
              <Box
                sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 3 }}
              >
                <DateTimePicker
                  label="Date et heure d'activation"
                  value={scheduledDate}
                  onChange={setScheduledDate}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                  minDate={dayjs()}
                />

                <TextField
                  label="Raison / Note"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  multiline
                  rows={3}
                  fullWidth
                  placeholder="Ex: Activation après la session de formation du 15 janvier"
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setDialogOpen(false)}
                disabled={processing}
              >
                Annuler
              </Button>
              <Button
                onClick={handleScheduleActivation}
                variant="contained"
                disabled={processing || !scheduledDate}
              >
                {processing ? <CircularProgress size={20} /> : "Programmer"}
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </LocalizationProvider>
    </AdminRoute>
  );
}
