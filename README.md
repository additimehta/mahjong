# Mahjong

In progress: a shared Mahjong table on a TV or browser, with each player's private
hand and controls in a dedicated multiplatform phone app. The JavaScript backend
will own game rules and expose game state and actions through an API.

## Game design decisions

### Discard response window

- Each discard allows a maximum **15-second** response window, measured by the server.
  If nobody can legally claim, play advances immediately.
- Players submit claims during that window. There is no explicit pass action;
  taking no action means passing when the window expires.
- The server stores valid claims and resolves early when no unsubmitted claim
  could beat the best received claim. Otherwise it waits until the deadline.
- Each player may submit one final claim per discard.
- Claim priority is **ron > pon > chi**. Arrival order does not override this
  priority: a pon received near the end of the window beats an earlier chi.
- If multiple players submit pon claims, the first valid pon received by the
  server wins. Use server receipt order, not timestamps supplied by phones.
- Only the player immediately after the discarder can chi.
- If nobody submits a valid claim, play advances to the next player's draw.
- Claims received after the deadline or for an old discard are rejected.

For example, if a chi arrives after 2 seconds and a pon arrives after 12 seconds,
the pon beats the chi. It can resolve immediately if nobody can ron. A valid ron submitted
within that same window takes priority over both.

Chi/pon collection, early resolution, and the maximum timer are implemented in
`Game.handleResponsePhase()`. Submit a claim with
`game.submitClaim(playerIndex, "chi" | "pon", responseWindowId)`; the window ID
comes from `game.responseWindow.id`. The server must derive the player identity
from the connection. Eligibility is private server state, not a public table payload.

Ron authorization is not implemented yet, so the current window only considers
chi and pon. It must include legal ron eligibility before this flow is used for a
complete game. Kan is also pending. Timers are in memory; persistence/recovery is
outside this implementation.

### Decisions still open

- Ron uses a single winner: the first valid ron received by the server takes
  priority over all other claims. Implementation is pending legal ron checks.
- Kan claim handling and its integration with the response window.
