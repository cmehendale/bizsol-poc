export const comboSum = (source:any, key: string): number => {
  const parts = key.split(".");
  if (parts.length > 1) {
    const p_keys = parts[0];
    const p_path = parts[1];
    const p_keys_parts = p_keys.split(",");
    return p_keys_parts.reduce((sum: number, p_key) => {
      sum += (source[p_key] || {})[p_path] || 0;
      return sum;
    }, 0);
  }
  return 0
}
