declare module 'node-webvtt' {
  interface Opts {
    meta?: boolean
    strict?: boolean
  }

  export interface Cue {
    identifier: string
    start: number
    end: number
    text: string
    styles: string
  }

  export interface VTT {
    valid: boolean
    strict: boolean
    cues: Cue[]
    errors: unknown[]
    meta?: Partial<Record<string, string>>
  }

  export interface Segment {
    duration: number
    cues: ReadonlyArray<Cue>
  }

  export function parse(input: string, options?: Opts): VTT

  export function compile(input: VTT): string

  export namespace hls {
    export function hlsSegment(
      input: string,
      segmentLength?: number,
      startOffset?: number,
    ): ReadonlyArray<Segment>

    export function hlsSegmentPlaylist(
      input: string,
      segmentLength?: number,
    ): ReadonlyArray<Segment>
  }
}
