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
} from '@mui/material';
import { Code as CodeIcon } from '@mui/icons-material';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

/**
 * QuestionCard - Affiche une question avec ses options
 * Supporte les types: multiple-choice, true-false, code-completion, code-debugging
 */
export default function QuestionCard({ question, selectedAnswer, onAnswerSelect, showResult }) {
  const handleChange = (event) => {
    onAnswerSelect(parseInt(event.target.value, 10));
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
                p: 2,
                mb: 3,
                backgroundColor: (theme) =>
                  theme.palette.mode === 'light' ? 'grey.100' : 'grey.900',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CodeIcon fontSize="small" color="primary" />
                <Typography variant="caption" color="text.secondary">
                  Code
                </Typography>
              </Box>
              <Box
                component="pre"
                color="text.secondary"
                sx={{
                  m: 0,
                  p: 0,
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  overflowX: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                <code>{question.code}</code>
              </Box>
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
    </motion.div>
  );
}
