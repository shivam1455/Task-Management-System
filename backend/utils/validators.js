const VALID_ROLES = ["admin", "user"];
const VALID_TASK_STATUSES = ["pending", "in_progress", "completed"];
const VALID_TASK_PRIORITIES = ["low", "medium", "high"];

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : value;
}

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : email;
}

function isValidEmail(email) {
  if (typeof email !== "string") {
    return false;
  }

  const normalized = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
}

function isValidRole(role) {
  return VALID_ROLES.includes(role);
}

function isValidTaskStatus(status) {
  return VALID_TASK_STATUSES.includes(status);
}

function isValidTaskPriority(priority) {
  return VALID_TASK_PRIORITIES.includes(priority);
}

function isValidPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

module.exports = {
  VALID_ROLES,
  VALID_TASK_STATUSES,
  VALID_TASK_PRIORITIES,
  isNonEmptyString,
  normalizeString,
  normalizeEmail,
  isValidEmail,
  isValidRole,
  isValidTaskStatus,
  isValidTaskPriority,
  isValidPositiveInteger,
};
