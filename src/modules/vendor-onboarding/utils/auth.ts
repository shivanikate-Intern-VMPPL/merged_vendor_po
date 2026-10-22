/**
 * Get the logged-in user from localStorage
 */
export function getLoggedInUser() {
  const user = localStorage.getItem("loggedInUser");

  if (!user) {
    return null;
  }

  return JSON.parse(user);
}

/**
 * Check if the logged-in user has a specific role
 */
export function hasRole(role: string): boolean {
    const user = getLoggedInUser();
  
    if (!user) {
      return false;
    }
  
    return user.role === role;
  }

  /**
 * Check if the logged-in user has a specific permission
 */
export function hasPermission(permission: string): boolean {
    const user = getLoggedInUser();
  
    if (!user) {
      return false;
    }
  
    return user.permissions.includes(permission);
  }