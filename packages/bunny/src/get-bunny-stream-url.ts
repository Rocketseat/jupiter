export function getBunnyStreamUrl({
  libraryId,
  videoId,
}: {
  libraryId: string
  videoId: string
}) {
  return `https://iframe.mediadelivery.net/play/${libraryId}/${videoId}`
}
