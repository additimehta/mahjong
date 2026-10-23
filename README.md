# Mahjong

In progress: a shared Mahjong table on a TV or browser, with each player's private
hand and controls in a dedicated multiplatform phone app. The JavaScript backend
will own game rules and expose game state and actions through an API.

## Game design decisions

### Discard response window

- Each discard opens a fixed **15-second** response window, measured by the server.
- Players submit claims during that window. There is no explicit pass action;
  taking no action means passing when the window expires.
- The server stores valid claims and resolves them only when the full window
  expires. Receiving a claim does not immediately change the table or end the
  window early.
- Claim priority is **ron > pon > chi**. Arrival order does not override this
  priority: a pon received near the end of the window beats an earlier chi.
- If multiple players submit pon claims, the first valid pon received by the
  server wins. Use server receipt order, not timestamps supplied by phones.
- Only the player immediately after the discarder can chi.
- If nobody submits a valid claim, play advances to the next player's draw.
- Claims received after the deadline or for an old discard are rejected.

For example, if a chi arrives after 2 seconds and a pon arrives after 12 seconds,
the server awards the pon when the 15-second window closes. A valid ron submitted
within that same window takes priority over both.

These are intended API/game-engine rules; the current chi and pon methods still
apply calls immediately, so response collection and timed resolution remain to
be implemented.

### Decisions still open

- How to resolve multiple ron claims on the same discard.
- Kan claim handling and its integration with the response window.
