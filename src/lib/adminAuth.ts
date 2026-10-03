export const ADMIN_EMAILS = [
  'ashrafashraf04@gmail.com',
  'ashirafashes04@gmail.com',
  'ashruffashes04@gmail.com',
  'ashruffashes24@gmail.com',
  'ashirafashes24@gmail.com',
];

export const ADMIN_PASSWORD = 'popular-24';

/**
 * Checks if a given email is the designated SuperAdmin email
 */
export function isAuthorizedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  
  // Explicitly disallow any non-admin accounts like ashraf.bh600v@gmail.com or devtech
  if (normalized.includes('bh600v') || normalized.includes('devtech')) {
    return false;
  }

  return ADMIN_EMAILS.some((adm) => adm.toLowerCase() === normalized);
}

/**
 * Checks if a user profile is the logged-in SuperAdmin
 */
export function isAuthorizedAdmin(user?: { isLoggedIn?: boolean; email?: string } | null): boolean {
  if (!user || !user.isLoggedIn || !user.email) return false;
  return isAuthorizedAdminEmail(user.email);
}
