const buildRateOptions = (start: number, end: number, step: number) =>
  Array.from(
    { length: Math.floor((end - start) / step) + 1 },
    (_, index) => start + index * step
  );

export const HOURLY_RATE_OPTIONS = buildRateOptions(400, 2000, 100);
export const MONTHLY_RATE_OPTIONS = buildRateOptions(3500, 10000, 100);

export const isAllowedHourlyRate = (value: unknown) =>
  HOURLY_RATE_OPTIONS.includes(Number(value));

export const isAllowedMonthlyRate = (value: unknown) =>
  MONTHLY_RATE_OPTIONS.includes(Number(value));
