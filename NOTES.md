1. What exactly does whitelist: true strip away, and why does an attacker care about it?

2. Why did the 404 in step 2c prove anything at all?

### 5b - Login timing hardening

When a username does not exist, AuthService still runs bcrypt.compare()
against a fixed dummy hash before returning the error. This makes the
unknown-user path perform similar password-hashing work as the wrong-password
path, reducing the timing difference that could reveal whether a username exists.

## Academic Event Append-Only Design

Academic events are append-only by policy in the current phase.

The system intentionally provides no update route, delete route, or
mutation method for academic events. Once an event is recorded, the
application treats the event as immutable.

This is currently a policy-level guarantee, not yet a cryptographic proof
of immutability.

After Phase 4, the append-only property becomes anchored/proven. Event
digests will be committed to the ledger. Any later modification to an
anchored event would change its digest and therefore break the already
committed digest chain.

Therefore:

- **Current phase:** append-only by application policy.
- **After Phase 4:** append-only is cryptographically anchored/proven
  against the committed ledger state.

The distinction is important: preventing edits in the application is
different from being able to prove that an anchored record has not been
modified.
