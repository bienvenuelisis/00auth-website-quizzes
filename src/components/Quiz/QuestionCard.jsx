import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Box,
  Chip,
  Paper,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Code as CodeIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  vscDarkPlus,
  vs,
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '@mui/material/styles';

/**
 * QuestionCard - Affiche une question avec ses options
 * Supporte les types: multiple-choice, true-false, code-completion, code-debugging
 */
export default function QuestionCard({ question, selectedAnswer, onAnswerSelect, showResult }) {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);

  const handleChange = (event) => {
    onAnswerSelect(parseInt(event.target.value, 10));
  };

  const handleCopyCode = () => {
    if (question.code) {
      navigator.clipboard.writeText(question.code);
      setCopied(true);
    }
  };

  const handleCloseSnackbar = () => {
    setCopied(false);
  };

  // Déterminer la couleur de la réponse si showResult
  const getOptionColor = (index) => {
    if (!showResult) return undefined;

    if (index === question.correctAnswer) {
      return 'success.light';
    }
    if (index === selectedAnswer && selectedAnswer !== question.correctAnswer) {
      return 'error.light';
    }
    return undefined;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card elevation={3}>
        <CardContent sx={{ p: 3 }}>
          {/* Type et difficulté */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip
              label={question.type.replace('-', ' ')}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ textTransform: 'capitalize' }}
            />
            <Chip
              label={question.difficulty}
              size="small"
              color={
                question.difficulty === 'easy'
                  ? 'success'
                  : question.difficulty === 'medium'
                  ? 'warning'
                  : 'error'
              }
              variant="outlined"
              sx={{ textTransform: 'capitalize' }}
            />
            <Chip label={`${question.points} points`} size="small" variant="outlined" />
          </Box>

          {/* Question */}
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            {question.question}
          </Typography>

          {/* Code snippet si présent */}
          {question.code && (
            <Paper
              elevation={0}
              sx={{
                mb: 3,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                overflow: 'hidden',
              }}
            >
              {/* Header avec bouton copier */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 2,
                  py: 1,
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'light' ? 'grey.100' : 'grey.900',
                  borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CodeIcon fontSize="small" color="primary" />
                  <Typography variant="caption" color="text.secondary" fontWeight="medium">
                    Code Dart
                  </Typography>
                </Box>
                <Tooltip title={copied ? 'Copié !' : 'Copier le code'}>
                  <IconButton
                    size="small"
                    onClick={handleCopyCode}
                    sx={{
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: 'primary.light',
                        color: 'primary.contrastText',
                      },
                    }}
                  >
                    {copied ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Code avec coloration syntaxique */}
              <SyntaxHighlighter
                language="dart"
                style={theme.palette.mode === 'dark' ? vscDarkPlus : vs}
                customStyle={{
                  margin: 0,
                  borderRadius: 0,
                  fontSize: '0.875rem',
                  backgroundColor: 'transparent',
                }}
                showLineNumbers={true}
                wrapLines={true}
                lineNumberStyle={{
                  minWidth: '2.5em',
                  paddingRight: '1em',
                  color: theme.palette.text.disabled,
                  userSelect: 'none',
                }}
              >
                {question.code}
              </SyntaxHighlighter>
            </Paper>
          )}

          {/* Options de réponse */}
          <FormControl component="fieldset" fullWidth disabled={showResult}>
            <RadioGroup value={selectedAnswer?.toString() || ''} onChange={handleChange}>
              {question.options.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={index.toString()}
                  control={<Radio />}
                  label={option}
                  sx={{
                    mb: 1,
                    p: 1.5,
                    borderRadius: 1,
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    backgroundColor: getOptionColor(index),
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: showResult
                        ? getOptionColor(index)
                        : (theme) =>
                            theme.palette.mode === 'light'
                              ? 'grey.50'
                              : 'grey.800',
                    },
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>

          {/* Explication si résultat affiché */}
          {showResult && question.explanation && (
            <Box
              sx={{
                mt: 3,
                p: 2,
                borderRadius: 1,
                backgroundColor: (theme) =>
                  theme.palette.mode === 'light' ? 'info.light' : 'info.dark',
                border: (theme) => `1px solid ${theme.palette.info.main}`,
              }}
            >
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Explication
              </Typography>
              <Typography variant="body2">{question.explanation}</Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Snackbar de confirmation de copie */}
      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Code copié dans le presse-papiers !
        </Alert>
      </Snackbar>
    </motion.div>
  );
}
