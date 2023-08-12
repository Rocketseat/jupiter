const KB = 1024
const MB = 1048576
const GB = 1073741824

export function formatBytes(bytes: number) {
  if (bytes < KB) {
    return `${bytes} B`
  }

  if (bytes < MB) {
    const kilobytes = (bytes / KB).toFixed(2)
    return `${kilobytes} KB`
  }

  if (bytes < GB) {
    const megabytes = (bytes / MB).toFixed(2)
    return `${megabytes} MB`
  }

  const gigabytes = (bytes / GB).toFixed(2)
  return `${gigabytes} GB`
}
