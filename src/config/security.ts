// Website Security Configuration
export const SECURITY_CONFIG = {
  // Change this password to whatever you want
  WEBSITE_PASSWORD: 'shaukat2024',
  
  // How long to remember the user (in hours)
  SESSION_DURATION_HOURS: 24,
  
  // Maximum login attempts before showing error
  MAX_LOGIN_ATTEMPTS: 3,
  
  // Whether to show password hint
  SHOW_PASSWORD_HINT: false,
  
  // Password hint (only shown if SHOW_PASSWORD_HINT is true)
  PASSWORD_HINT: 'Think of the year and hospital name',
};

// You can also add more security features here
export const ADDITIONAL_SECURITY = {
  // Require re-authentication after inactivity (in minutes)
  INACTIVITY_TIMEOUT_MINUTES: 60,
  
  // Block IP after failed attempts
  BLOCK_IP_AFTER_FAILED_ATTEMPTS: 5,
  
  // Enable two-factor authentication
  ENABLE_2FA: false,
};
