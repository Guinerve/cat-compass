export function validReminders(value) {
  if (!Array.isArray(value) || value.length > 1000) return false;
  const ids = new Set();
  return value.every(r => {
    if (!r || typeof r !== "object" || Array.isArray(r)) return false;
    if (typeof r.id !== "string" || !r.id || r.id.length > 100 || ids.has(r.id) || ["__proto__", "constructor", "prototype"].includes(r.id)) return false;
    ids.add(r.id);
    return typeof r.catId === "string" && r.catId.length <= 100 && typeof r.title === "string" && r.title.trim().length > 0 && r.title.length <= 200 && typeof r.catName === "string" && r.catName.length <= 200 && typeof r.due === "string" && /^\d{4}-\d{2}-\d{2}T/.test(r.due) && r.due.length <= 40 && Number.isFinite(Date.parse(r.due)) && ["none", "daily", "weekly"].includes(r.repeat) && typeof r.enabled === "boolean";
  });
}
