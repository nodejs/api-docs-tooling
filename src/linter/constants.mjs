'use strict';

// Validates a deprecation header from doc/api/deprecation.md and captures the
// code
// For example, `DEP0001: `http.OutgoingMessage.prototype.flush` captures `0001`
export const DEPRECATION_HEADER_REGEX = /DEP(\d{4}): .+?/;
