export interface AuthUser {
  id: string,
  name: string,
  roles: string[],
  /**
   * the email address of the user
   * @maxLength 320
   * @pattern ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$
   * @example "user@example.com"
   */
  email: string //TODO: use Email type
}