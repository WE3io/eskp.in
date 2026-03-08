# Context Management

## When to Restart a Session

Long conversations accumulate errors. Restart when:
- More than 20–30 messages without meaningful progress.
- Going in circles (same errors repeating).
- Switching to a fundamentally different subsystem.
- An early assumption turned out to be wrong.
- The model seems confused about the current state.

### Restart Template

Before starting fresh, summarize:

```
Previous session summary:
- Problem: [clear description]
- Tried: [list of approaches]
- Learned: [key insights]
- Root cause: [if known]

Current state: [relevant files, errors, expected behavior]
Next approach: [fresh perspective]
```

## Checkpointing

- Summarize progress every 10–15 messages.
- Verify assumptions early — correct misconceptions immediately.
- Distinguish clearly between established facts and open questions.
- State what is known, what is uncertain, and what still needs investigation.

## File Size

- Keep files under 64KB for reliable AI-assisted editing.
- Files between 32–64KB: monitor size, split if growing.
- Files over 64KB: split before making major changes.
- Track file sizes actively during development.
