export function getNameInitials(fullName: string) {
  const names = fullName.split(' ')
  let initials = ''

  for (let i = 0; i < names.length && initials.length < 2; i++) {
    initials += names[i][0].toUpperCase()
  }

  return initials
}
