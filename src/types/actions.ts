export interface ActionState {
  error: string | null;
  success: string | null;
  editUrl?: string | null;
  telefono?: string | null;
}

export const initialActionState: ActionState = {
  error: null,
  success: null,
};
