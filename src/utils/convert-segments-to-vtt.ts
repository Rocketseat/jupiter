interface Segment {
  start: number
  end: number
  text: string
}

function padZero(time: number | string) {
  return String(time).padStart(2, '0')
}

function formatTime(seconds: number) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = (seconds % 60).toFixed(2)

  return `${padZero(hours)}:${padZero(minutes)}:${padZero(remainingSeconds)}`
}

export function convertSegmentsToVTT(segments: Segment[]) {
  let vttString = 'WEBVTT\n\n'

  // Iterate through each subtitle object
  segments.forEach((segment) => {
    const startTime = formatTime(segment.start)
    const endTime = formatTime(segment.end)

    vttString += `${startTime} --> ${endTime}\n`

    vttString += `${segment.text}\n\n`
  })

  return vttString
}
