/**
 * Validates a semver version string
 *
 * @param {string} version
 * @returns {boolean}
 */
export const validateVersion = version => {
  // https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
  const regex =
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/gm;

  return regex.test(version);
};
