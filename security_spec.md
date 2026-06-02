# Security Specification: India Village Connect

## Data Invariants
1. `Village` documents are the source of truth and must be read-only for all users (public).
2. `UserFavorites` documents must belong to the user who created them (request.auth.uid == userId).
3. `UserProfiles` must satisfy the PII isolation pillar (Only owner can read/write private info).

## The Dirty Dozen Payloads (Attack Vectors)
1. **Unauthorized Update**: Attempting to update population in a village doc without admin rights.
2. **Identity Spoofing**: Creating a favorite with `userId: "attacker_id"` but `request.auth.uid: "victim_id"`.
3. **Ghost Field Poisoning**: Adding `isAdmin: true` to a user profile.
4. **Path ID Poisoning**: Using a 1MB string as a village ID to cause resource exhaustion.
5. **PII Leak**: Attempting to read another user's profile private info.
6. **Cross-User Delete**: Deleting someone else's favorite village.
7. **Malformed State**: Updating a village status to an invalid value if we had states.
8. **Resource Exhaustion**: Sending a 1MB village name in a comment.
9. **Query Scrape**: Listing all user profiles without a where clause (should be blocked by rule-side enforcement).
10. **Admin Privilege Escalation**: Setting `role: "admin"` on a profile.
11. **Stale Data Write**: Sending a historical `updatedAt` instead of `request.time`.
12. **Orphaned Writes**: Creating a favorite for a village that doesn't exist.

## Test Runner (Conceptual)
All test cases in `firestore.rules.test.ts` must assert `permission_denied` for these payloads.
