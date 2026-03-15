// GitHub Actions per-minute rates (private repos)
export const GITHUB_ACTIONS_RATES: Record<string, number> = {
  Linux: 0.008,
  Windows: 0.016,
  macOS: 0.08,
};

// Larger runner multipliers
export const RUNNER_MULTIPLIERS: Record<string, number> = {
  "ubuntu-latest": 1,
  "ubuntu-22.04": 1,
  "ubuntu-24.04": 1,
  "windows-latest": 1,
  "windows-2022": 1,
  "macos-latest": 1,
  "macos-14": 1,
  // Larger runners
  "4-core": 4,
  "8-core": 8,
  "16-core": 16,
  "32-core": 32,
  "64-core": 64,
};

export function getRate(os: string | null): number {
  if (!os) return GITHUB_ACTIONS_RATES.Linux;
  for (const [key, rate] of Object.entries(GITHUB_ACTIONS_RATES)) {
    if (os.toLowerCase().includes(key.toLowerCase())) return rate;
  }
  return GITHUB_ACTIONS_RATES.Linux;
}

export function calculateCost(
  durationSeconds: number,
  os: string | null
): { minutes: number; rate: number; cost: number } {
  const minutes = Math.ceil(durationSeconds / 60);
  const rate = getRate(os);
  const cost = minutes * rate;
  return { minutes, rate, cost };
}