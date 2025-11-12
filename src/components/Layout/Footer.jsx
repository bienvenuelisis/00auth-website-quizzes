import { Box, Container, Typography, Link, Divider } from '@mui/material';
import { GitHub, LinkedIn, Language } from '@mui/icons-material';

/**
 * Footer - Pied de page de l'application
 * Affiche les informations copyright et liens vers les réseaux sociaux
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[100]
            : theme.palette.grey[900],
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          {/* Copyright */}
          <Typography variant="body2" color="text.secondary" align="center">
            © {currentYear} 00auth.dev - Formation Développeur Mobile Avancé avec Flutter
          </Typography>

          {/* Liens */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'center',
            }}
          >
            <Link
              href="https://00auth.dev"
              target="_blank"
              rel="noopener noreferrer"
              color="inherit"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                '&:hover': {
                  color: 'secondary.main',
                },
              }}
            >
              <Language fontSize="small" />
              <Typography variant="body2">Site Web</Typography>
            </Link>

            <Divider orientation="vertical" flexItem />

            <Link
              href="https://github.com/giak"
              target="_blank"
              rel="noopener noreferrer"
              color="inherit"
              sx={{
                display: 'flex',
                alignItems: 'center',
                '&:hover': {
                  color: 'secondary.main',
                },
              }}
            >
              <GitHub fontSize="small" />
            </Link>

            <Link
              href="https://www.linkedin.com/in/danielkouame/"
              target="_blank"
              rel="noopener noreferrer"
              color="inherit"
              sx={{
                display: 'flex',
                alignItems: 'center',
                '&:hover': {
                  color: 'secondary.main',
                },
              }}
            >
              <LinkedIn fontSize="small" />
            </Link>
          </Box>
        </Box>

        {/* Version */}
        <Typography
          variant="caption"
          color="text.secondary"
          align="center"
          sx={{ display: 'block', mt: 1 }}
        >
          Version 1.0.0 - Powered by Firebase AI Logic & Gemini
        </Typography>
      </Container>
    </Box>
  );
}
