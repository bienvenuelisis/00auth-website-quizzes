import React from 'react';
import { Chip } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Assignment as AssignmentIcon,
  RateReview as RateReviewIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { PW_STATUS, PW_STATUS_LABELS, PW_STATUS_COLORS } from '../../models/practicalWork';

const STATUS_ICONS = {
  [PW_STATUS.NOT_STARTED]: AssignmentIcon,
  [PW_STATUS.IN_PROGRESS]: EditIcon,
  [PW_STATUS.SUBMITTED]: HourglassEmptyIcon,
  [PW_STATUS.UNDER_REVIEW]: RateReviewIcon,
  [PW_STATUS.EVALUATED]: RateReviewIcon,
  [PW_STATUS.PASSED]: CheckCircleIcon,
  [PW_STATUS.FAILED]: CancelIcon,
  [PW_STATUS.REVISION_REQUESTED]: EditIcon
};

/**
 * Badge displaying practical work status
 * @param {Object} props
 * @param {string} props.status - Status key
 * @param {string} props.size - Chip size ('small' | 'medium')
 * @param {boolean} props.showIcon - Whether to show icon
 */
function StatusBadge({ status, size = 'small', showIcon = true }) {
  const label = PW_STATUS_LABELS[status] || status;
  const color = PW_STATUS_COLORS[status] || 'default';
  const Icon = STATUS_ICONS[status];

  return (
    <Chip
      label={label}
      color={color}
      size={size}
      icon={showIcon && Icon ? <Icon /> : undefined}
      sx={{
        fontWeight: 'medium',
        textTransform: 'capitalize'
      }}
    />
  );
}

export default StatusBadge;
