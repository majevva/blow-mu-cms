import i18n from './i18n';

type Params = Record<string, string | number>;

type Pattern = {
  test: RegExp;
  key: string;
  params?: (match: RegExpMatchArray) => Params;
};

const patterns: Pattern[] = [
  {
    test: /^Account (.+) not found\.$/,
    key: 'apiErrors.accountNotFound',
    params: (match) => ({ loginName: match[1] }),
  },
  {
    test: /^Author name invalid\.$/,
    key: 'apiErrors.authorNameInvalid',
  },
  {
    test: /^Server id invalid\.$/,
    key: 'apiErrors.serverIdInvalid',
  },
  {
    test: /^Character class (.+) is invalid\.$/,
    key: 'apiErrors.characterClassInvalid',
    params: (match) => ({ characterClass: match[1] }),
  },
  {
    test: /^Login name already exists$/,
    key: 'apiErrors.uniqueLoginName',
  },
  {
    test: /^Email already exists$/,
    key: 'apiErrors.uniqueEmail',
  },
  {
    test: /^invalid email$/i,
    key: 'apiErrors.invalidEmail',
  },
  {
    test: /^Disconnect from the game before do this$/,
    key: 'apiErrors.disconnectFromGame',
  },
  {
    test: /^Not enough points available:\s*(\d+)$/,
    key: 'apiErrors.notEnoughPointsAvailable',
    params: (match) => ({ pointsAvailable: match[1] }),
  },
  {
    test: /^You don't have enough money for reset:?\s*(\d+)$/,
    key: 'apiErrors.notEnoughMoneyForReset',
    params: (match) => ({ requiredZen: match[1] }),
  },
  {
    test: /^Maximum resets of\s*(\d+)\s*reached\.?$/,
    key: 'apiErrors.maximumResetsReached',
    params: (match) => ({ resetsLimit: match[1] }),
  },
  {
    test: /^Current password is wrong\.?$/,
    key: 'apiErrors.currentPasswordWrong',
  },
];

export const getApiErrorMessage = (rawMessage: string) => {
  const normalizedMessage = rawMessage.trim().replace(/^"|"$/g, '');

  for (const pattern of patterns) {
    const match = normalizedMessage.match(pattern.test);
    if (match) {
      return i18n.t(pattern.key, pattern.params?.(match));
    }
  }

  return normalizedMessage;
};
