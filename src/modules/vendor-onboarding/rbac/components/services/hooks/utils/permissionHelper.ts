/**
 * Checks whether a permission exists
 */
export function hasPermission(
    permissions: string[],
    permission: string
  ) {
    return permissions.includes(permission);
  }