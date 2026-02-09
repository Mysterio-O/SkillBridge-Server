export function toInt(v: unknown, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

export function toNumber(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}


export function httpError(status: number, message: string) {
  const err: any = new Error(message);
  err.status = status;
  return err;
}