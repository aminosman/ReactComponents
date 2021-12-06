const safeNumber = (n: any, d: any = 0, p: number = 2) =>
  typeof n === "number" ? n.toFixed(p) : d;

export default {
  safeNumber,
};
