import { MASCOTAS_PER_PAGE } from "@/components/MascotasPagination";

const MASCOTA_LIST_SCROLL_STATE_KEY = "huellas:mascota-list-scroll-state";
const MD_MIN_WIDTH = 768;

type MascotaListScrollState = {
  y: number;
  visibleCount: number;
};

function parseScrollState(raw: string | null): MascotaListScrollState | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<MascotaListScrollState>;
    const y = Number(parsed.y);
    const visibleCount = Number(parsed.visibleCount);

    if (!Number.isFinite(y) || y < 0) return null;
    if (!Number.isFinite(visibleCount) || visibleCount < MASCOTAS_PER_PAGE) {
      return { y, visibleCount: MASCOTAS_PER_PAGE };
    }

    const blocks = Math.max(1, Math.floor(visibleCount / MASCOTAS_PER_PAGE));
    return { y, visibleCount: blocks * MASCOTAS_PER_PAGE };
  } catch {
    return null;
  }
}

export function saveMascotaListScrollForMobile(visibleCount: number) {
  if (typeof window === "undefined") return;
  if (window.innerWidth >= MD_MIN_WIDTH) return;

  const state: MascotaListScrollState = {
    y: window.scrollY,
    visibleCount: Math.max(MASCOTAS_PER_PAGE, visibleCount),
  };

  sessionStorage.setItem(MASCOTA_LIST_SCROLL_STATE_KEY, JSON.stringify(state));
}

export function consumeMascotaListScrollState(): MascotaListScrollState | null {
  if (typeof window === "undefined") return null;

  const state = parseScrollState(
    sessionStorage.getItem(MASCOTA_LIST_SCROLL_STATE_KEY),
  );
  if (!state) return null;

  sessionStorage.removeItem(MASCOTA_LIST_SCROLL_STATE_KEY);
  return state;
}

export function restoreMascotaListScroll(y: number) {
  if (typeof window === "undefined") return;
  if (!Number.isFinite(y) || y < 0) return;

  const applyScroll = () => {
    window.scrollTo({ top: y, left: 0, behavior: "instant" });
  };

  requestAnimationFrame(() => {
    requestAnimationFrame(applyScroll);
  });
}
