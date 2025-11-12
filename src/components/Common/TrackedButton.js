import React from 'react';
import { Button } from '@mui/material';
import { useAnalytics } from '../hooks/useAnalytics';

/**
 * Composant Button avec tracking automatique des interactions utilisateur
 */
const TrackedButton = ({ 
  children, 
  onClick,
  trackingAction,
  trackingElement,
  trackingData = {},
  ...props 
}) => {
  const analytics = useAnalytics();

  const handleClick = (event) => {
    // Track user interaction
    if (trackingAction && trackingElement) {
      analytics.trackUserInteraction(trackingAction, trackingElement, trackingData);
    }

    // Track custom event if provided
    if (trackingData.customEvent) {
      analytics.trackCustomEvent(trackingData.customEvent, trackingData.customParameters || {});
    }

    // Call original onClick if provided
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <Button onClick={handleClick} {...props}>
      {children}
    </Button>
  );
};

export default TrackedButton;