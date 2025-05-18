
/**
 * Utility functions for QR code validations
 */

/**
 * Validates a URL string, ensuring it has a protocol
 * @param url The URL to validate
 * @returns An object with validation result and formatted URL
 */
export function validateUrl(url: string): { isValid: boolean; formattedUrl: string; errorMessage?: string } {
  if (!url.trim()) {
    return { isValid: false, formattedUrl: url, errorMessage: "URL is required" };
  }
  
  // Add https:// if no protocol is specified
  const formattedUrl = url.match(/^https?:\/\//i) ? url : `https://${url}`;
  
  try {
    new URL(formattedUrl);
    return { isValid: true, formattedUrl };
  } catch (error) {
    return { 
      isValid: false, 
      formattedUrl: url,
      errorMessage: "Please enter a valid URL" 
    };
  }
}

/**
 * Validates a QR code expiration date
 * @param date The date to validate
 * @returns An object with validation result
 */
export function validateExpirationDate(date: Date | null): { isValid: boolean; errorMessage?: string } {
  if (!date) return { isValid: true }; // No date is valid (optional field)
  
  const now = new Date();
  // Setting time to midnight to compare just the dates
  now.setHours(0, 0, 0, 0);
  
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  
  if (compareDate < now) {
    return { 
      isValid: false,
      errorMessage: "Expiration date cannot be in the past" 
    };
  }
  
  return { isValid: true };
}

/**
 * Validates a short code string
 * @param shortCode The short code to validate
 * @returns An object with validation result
 */
export function validateShortCode(shortCode: string): { isValid: boolean; errorMessage?: string } {
  if (!shortCode.trim()) {
    return { isValid: false, errorMessage: "Short code is required" };
  }
  
  if (shortCode.length < 3) {
    return { isValid: false, errorMessage: "Short code must be at least 3 characters" };
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(shortCode)) {
    return { 
      isValid: false,
      errorMessage: "Short code can only contain letters, numbers, underscores and hyphens" 
    };
  }
  
  return { isValid: true };
}

/**
 * Validates a QR code name
 * @param name The name to validate
 * @returns An object with validation result
 */
export function validateQrName(name: string): { isValid: boolean; errorMessage?: string } {
  if (!name.trim()) {
    return { isValid: false, errorMessage: "Name is required" };
  }
  
  if (name.length > 50) {
    return { isValid: false, errorMessage: "Name must be 50 characters or less" };
  }
  
  return { isValid: true };
}
