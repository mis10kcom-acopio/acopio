export function filterMascotasBySearch<
  T extends {
    nombre_mascota?: string | null;
    ubicacion_zona: string;
    caracteristicas: string;
  },
>(items: T[], searchQuery: string): T[] {
  const query = searchQuery.trim().toLowerCase();
  if (!query) return items;

  return items.filter((item) => {
    const searchableFields = [
      item.nombre_mascota,
      item.ubicacion_zona,
      item.caracteristicas,
    ];

    return searchableFields.some((field) =>
      field?.toLowerCase().includes(query),
    );
  });
}
