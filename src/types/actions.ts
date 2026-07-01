import type { Avistamiento } from "@/types/database";

export interface ActionState {
  error: string | null;
  success: string | null;
  editUrl?: string | null;
  telefono?: string | null;
}

export interface AvistamientoActionState {
  error: string | null;
  success: string | null;
  avistamiento: Avistamiento | null;
}

export const initialAvistamientoActionState: AvistamientoActionState = {
  error: null,
  success: null,
  avistamiento: null,
};

export const initialActionState: ActionState = {
  error: null,
  success: null,
};
