export function getNameInitials(fullName: string) {
  const names = fullName.split(' ').filter(Boolean)

  const initials = names
    .map((name) => name[0].toUpperCase())
    .join('')
    .slice(0, 2)

  return initials
}
