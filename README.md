# ideas

- intercept route to videos / analytics most watched videos / no watched videos

# MVP

Upload videos, upload to panda and R2, embed om player

- [ ] Video edit (ongoing)
- [ ] Skylab integration (ongoing)

- [ ] Sync subtitles with Panda
- [ ] Finish tags input
- [ ] Remove "Delete video" option

# Thoughts

- Datadog / Sentry
- DeadLetter queue (manual retry)
  - store number of retries and if its the last maybe notice somewhere and display a button for manual retry
- Find possibly typos in transcription based on commit diff
- Tests please?!
- refactor upload table (selectors - too many renders)
