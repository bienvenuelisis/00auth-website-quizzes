import React from 'react';
import { Link as MuiLink } from '@mui/material';
import { useAnalytics } from '../hooks/useAnalytics';

/**
 * Composant Link avec tracking automatique pour les liens externes
 */
const TrackedExternalLink = ({ 
  href, 
  children, 
  section = '', 
  trackingData = {},
  onClick,
  ...props 
}) => {
  const analytics = useAnalytics();

  const handleClick = (event) => {
    // Track external link click
    if (href && (href.startsWith('http') || href.startsWith('mailto'))) {
      analytics.trackExternalLink(
        href, 
        typeof children === 'string' ? children : 'External Link',
        section
      );
    }

    // Track custom event if provided
    if (trackingData.eventName) {
      analytics.trackCustomEvent(trackingData.eventName, trackingData.parameters || {});
    }

    // Call original onClick if provided
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <MuiLink
      href={href}
      onClick={handleClick}
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {children}
    </MuiLink>
  );
};

export default TrackedExternalLink;