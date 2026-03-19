function getStorageKeys(prefix: string, identifiers: Array<string | undefined | null>): string[] {
  return [...new Set(identifiers.filter(Boolean))].map((identifier) => `${prefix}_${identifier}`);
}

export function getStoredPlayerId(...identifiers: Array<string | undefined | null>): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  for (const storageKey of getStorageKeys('player', identifiers)) {
    const playerId = window.localStorage.getItem(storageKey);

    if (playerId) {
      return playerId;
    }
  }

  return null;
}

export function getStoredAccessCode(...identifiers: Array<string | undefined | null>): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  for (const storageKey of getStorageKeys('recovery', identifiers)) {
    const accessCode = window.localStorage.getItem(storageKey);

    if (accessCode) {
      return accessCode;
    }
  }

  return null;
}

export function savePlayerSession(
  playerId: string,
  accessCode: string | null | undefined,
  ...identifiers: Array<string | undefined | null>
): void {
  if (typeof window === 'undefined') {
    return;
  }

  for (const storageKey of getStorageKeys('player', identifiers)) {
    window.localStorage.setItem(storageKey, playerId);
  }

  if (!accessCode) {
    return;
  }

  for (const storageKey of getStorageKeys('recovery', identifiers)) {
    window.localStorage.setItem(storageKey, accessCode);
  }
}
