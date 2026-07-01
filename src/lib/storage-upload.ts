import type { SupabaseClient } from "@supabase/supabase-js";

const MAX_FOTO_SIZE_BYTES = 5 * 1024 * 1024;
const STORAGE_BUCKET = "mascotas";

export const ACCEPTED_IMAGE_INPUT = "image/jpeg, image/png, image/webp";

export const UPLOAD_IMAGE_ERROR_MESSAGE =
  "La imagen es muy pesada o el formato no es válido.";

const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function sanitizeFileName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function resolveImageContentType(file: File): string | null {
  const normalized = file.type.trim().toLowerCase();
  if (normalized === "image/jpg") return "image/jpeg";
  if (ALLOWED_CONTENT_TYPES.has(normalized)) return normalized;

  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
  if (extension === "png") return "image/png";
  if (extension === "webp") return "image/webp";

  return null;
}

function buildStorageFileName(originalName: string, contentType: string): string {
  const extensionFromType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };

  const parts = originalName.split(".");
  const extensionFromName =
    parts.length > 1 ? parts.pop()?.toLowerCase() ?? "" : "";
  const extension =
    extensionFromType[contentType] ??
    (["jpg", "jpeg", "png", "webp"].includes(extensionFromName)
      ? extensionFromName === "jpeg"
        ? "jpg"
        : extensionFromName
      : "jpg");
  const baseName = parts.join(".") || "foto";
  const cleanBase = sanitizeFileName(baseName) || "foto";
  return `${Date.now()}-${cleanBase}.${extension}`;
}

export async function uploadImagenStorage(
  supabase: SupabaseClient,
  file: File,
  folder: string,
): Promise<string> {
  try {
    const contentType = resolveImageContentType(file);
    if (!contentType) {
      throw new Error(UPLOAD_IMAGE_ERROR_MESSAGE);
    }

    if (file.size > MAX_FOTO_SIZE_BYTES) {
      throw new Error(UPLOAD_IMAGE_ERROR_MESSAGE);
    }

    const fileName = `${folder}/${buildStorageFileName(file.name, contentType)}`;

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, {
        upsert: false,
        contentType,
      });

    if (error) {
      console.error("[storage-upload] Supabase Storage error:", error.message);
      throw new Error(UPLOAD_IMAGE_ERROR_MESSAGE);
    }

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName);
    return data.publicUrl;
  } catch (error) {
    if (error instanceof Error && error.message === UPLOAD_IMAGE_ERROR_MESSAGE) {
      throw error;
    }
    console.error("[storage-upload] Error inesperado al subir imagen:", error);
    throw new Error(UPLOAD_IMAGE_ERROR_MESSAGE);
  }
}

export async function resolveMascotaFotoFieldUpdate(
  supabase: SupabaseClient,
  formData: FormData,
  fileField: string,
  deleteField: string,
  currentUrl: string | null,
  folder: string,
): Promise<string | null> {
  const file = formData.get(fileField);
  if (file instanceof File && file.size > 0) {
    return uploadImagenStorage(supabase, file, folder);
  }

  if (formData.get(deleteField) === "1") {
    return null;
  }

  return currentUrl;
}

export async function resolveOptionalFotoUrl(
  supabase: SupabaseClient,
  formData: FormData,
  folder: string,
  fieldName = "foto",
): Promise<string | null> {
  const file = formData.get(fieldName);
  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  try {
    return await uploadImagenStorage(supabase, file, folder);
  } catch {
    return null;
  }
}
