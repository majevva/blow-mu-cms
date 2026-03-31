const parseBooleanEnv = (value?: string) => {
  if (!value) {
    return false;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
};

export const isBetaModeEnabled = () => {
  return parseBooleanEnv(import.meta.env.VITE_BETA_TEST_MODE);
};
