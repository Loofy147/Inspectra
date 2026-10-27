import { createDemoState } from "./seed.js";

const STORAGE_KEY = "inspectra.operational-assurance.demo.v1";

function validWorkspace(value) {
  return Boolean(value && value.data && Array.isArray(value.data.inspections) &&
    Array.isArray(value.data.findings) && Array.isArray(value.data.actions) &&
    Array.isArray(value.data.sites) && Array.isArray(value.data.activity));
}

export function migrateWorkspaceData(data) {
  return {
    ...data,
    evidence: Array.isArray(data?.evidence) ? data.evidence : [],
    // Do not infer past transitions from mutable current review fields.
    evidenceReviewEvents: Array.isArray(data?.evidenceReviewEvents) ? data.evidenceReviewEvents : []
  };
}

export function loadWorkspace() {
  try {
    const stored = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!stored) return { data: createDemoState(), persistence: "browser-local", mode: "demo" };
    const parsed = JSON.parse(stored);
    if (!validWorkspace(parsed)) return { data: createDemoState(), persistence: "browser-local", mode: "demo" };
    // Keep snapshots compatible without fabricating evidence review history that was never stored.
    const migratedData = migrateWorkspaceData(parsed.data);
    return { ...parsed, data: migratedData, persistence: "browser-local", mode: "demo" };
  } catch {
    return { data: createDemoState(), persistence: "browser-local", mode: "demo" };
  }
}

export function saveWorkspace(workspace) {
  try {
    const storage = globalThis.localStorage;
    if (!storage || typeof storage.setItem !== "function") return false;
    storage.setItem(STORAGE_KEY, JSON.stringify(workspace));
    return true;
  } catch {
    return false;
  }
}

export function resetWorkspace() {
  try {
    globalThis.localStorage?.removeItem(STORAGE_KEY);
  } catch {
    // Storage might be blocked; the caller can still reset in-memory demo state.
  }
  return { data: createDemoState(), persistence: "browser-local", mode: "demo" };
}
