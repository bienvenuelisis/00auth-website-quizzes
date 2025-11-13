import { createContext, useContext, useState, useEffect } from 'react';
import { handleAuthStateChanged } from '../services/firebase/auth';
import { getProfile, createProfile, updateLastConnexion } from '../services/firebase/firestore/profile';
import { getProgress, initializeProgress, syncProgress } from '../services/firebase/firestore/progress';
import { useQuizStore } from '../stores/quizStore';

const AuthContext = createContext(null);

/**
 * Provider pour gérer l'authentification et le profil utilisateur
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Accès au store Zustand
  const { userProgress, resetProgress } = useQuizStore();

  useEffect(() => {
    // Écouter les changements d'état d'authentification
    const unsubscribe = handleAuthStateChanged(async (authUser) => {
      setLoading(true);
      setError(null);

      try {
        if (authUser) {
          // Utilisateur connecté
          setUser(authUser);

          // Récupérer le profil
          try {
            const userProfile = await getProfile(authUser.uid);
            setProfile(userProfile);

            // Mettre à jour la dernière connexion
            await updateLastConnexion(authUser.uid);

            // Synchroniser la progression
            try {
              const firestoreProgress = await getProgress(authUser.uid);

              // Fusionner avec la progression locale si elle existe
              if (userProgress.userId && userProgress.userId !== authUser.uid) {
                // C'est un autre utilisateur, synchroniser
                await syncProgress(authUser.uid, userProgress);
              }
            } catch (progressError) {
              // Pas de progression Firestore, initialiser
              if (progressError.message.includes('not exist')) {
                await initializeProgress(authUser.uid);

                // Si progression locale, la synchroniser
                if (userProgress.userId) {
                  await syncProgress(authUser.uid, userProgress);
                }
              }
            }
          } catch (profileError) {
            console.error('Error loading profile:', profileError);
            setError('Failed to load user profile');
          }
        } else {
          // Utilisateur déconnecté
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    // Cleanup
    return () => unsubscribe();
  }, []);

  /**
   * Rafraîchir le profil utilisateur
   */
  const refreshProfile = async () => {
    if (!user) return;

    try {
      const userProfile = await getProfile(user.uid);
      setProfile(userProfile);
    } catch (err) {
      console.error('Error refreshing profile:', err);
      setError(err.message);
    }
  };

  /**
   * Déconnexion
   */
  const logout = () => {
    setUser(null);
    setProfile(null);
  };

  const value = {
    user,
    profile,
    loading,
    error,
    isAuthenticated: !!user,
    refreshProfile,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook pour utiliser le contexte d'authentification
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
