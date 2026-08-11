import { RoleCode, User } from '@/types';

/**
 * Determines the target redirect URL after authentication based on the user's role
 * returned by the backend API.
 *
 * Rules:
 * - CUSTOMER -> Home Page ('/'), or valid customer routes like '/checkout', '/orders', '/profile'
 * - ADMIN -> Admin Dashboard ('/dashboard'), or specific dashboard route requested
 * - SUPER_ADMIN -> Super Admin Dashboard ('/dashboard'), or specific dashboard route requested
 * - MANAGER -> Management Dashboard ('/dashboard'), or specific dashboard route requested
 */
export function getRoleDefaultRedirect(
  user?: User | null,
  requestedRedirect?: string | null,
): string {
  if (!user?.role?.code) {
    return '/';
  }

  const roleCode = (user.role.code as string).toUpperCase() as RoleCode;
  const isManagement = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(roleCode);

  if (isManagement) {
    // If requestedRedirect is a management dashboard route, honor it
    if (requestedRedirect && requestedRedirect.startsWith('/dashboard')) {
      return requestedRedirect;
    }
    // Default management destination
    return '/dashboard';
  }

  // Customer role
  // If requestedRedirect is a customer page (and not dashboard/login/register), honor it
  if (
    requestedRedirect &&
    !requestedRedirect.startsWith('/dashboard') &&
    !requestedRedirect.startsWith('/login') &&
    !requestedRedirect.startsWith('/register')
  ) {
    return requestedRedirect;
  }

  // Default customer home page
  return '/';
}
