export function getNameInitials(firstName: string, lastName: string) {
  const firstInitial = firstName.charAt(0).toUpperCase()
  const lastInitial = lastName.charAt(0).toUpperCase()

  return firstInitial + lastInitial
}
