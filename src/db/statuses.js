/**
 * Canonical status values for goals and matches.
 *
 * Single source of truth — matches the CHECK constraints in migrate.js.
 * Import from here instead of using string literals in queries and scripts.
 */

const GOAL_STATUSES = {
  SUBMITTED: 'submitted',
  DECOMPOSING: 'decomposing',
  PENDING_CLARIFICATION: 'pending_clarification',
  MATCHED: 'matched',
  INTRODUCED: 'introduced',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

const MATCH_STATUSES = {
  PROPOSED: 'proposed',
  INTRODUCED: 'introduced',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  COMPLETED: 'completed',
};

const APPLICATION_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

/** All active goal statuses (not terminal) */
const GOAL_ACTIVE = [
  GOAL_STATUSES.SUBMITTED,
  GOAL_STATUSES.DECOMPOSING,
  GOAL_STATUSES.PENDING_CLARIFICATION,
  GOAL_STATUSES.MATCHED,
  GOAL_STATUSES.INTRODUCED,
];

/** Terminal goal statuses */
const GOAL_TERMINAL = [
  GOAL_STATUSES.RESOLVED,
  GOAL_STATUSES.CLOSED,
];

module.exports = {
  GOAL_STATUSES,
  MATCH_STATUSES,
  APPLICATION_STATUSES,
  GOAL_ACTIVE,
  GOAL_TERMINAL,
};
