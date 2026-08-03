const WHERE_SCOPED_OPERATIONS = new Set([
  'findFirst',
  'findFirstOrThrow',
  'findMany',
  'findUnique',
  'findUniqueOrThrow',
  'count',
  'aggregate',
  'groupBy',
  'update',
  'updateMany',
  'delete',
  'deleteMany',
]);

/**
 * Mutates Prisma query args so every read/write is scoped to `empresaId`.
 * Pure function (no I/O) so it can be unit tested without a database.
 *
 * Only covers top-level args - nested relation writes (e.g. a nested
 * `create` inside another model's `create`) are not scoped and must set
 * `empresaId` explicitly until a documented pattern for those exists.
 */
export function injectEmpresaId(
  operation: string,
  args: Record<string, unknown> | undefined,
  empresaId: string,
): Record<string, unknown> {
  const base = args ?? {};

  if (WHERE_SCOPED_OPERATIONS.has(operation)) {
    return {
      ...base,
      where: { ...(base.where as Record<string, unknown> | undefined), empresaId },
    };
  }

  if (operation === 'create') {
    return {
      ...base,
      data: { ...(base.data as Record<string, unknown> | undefined), empresaId },
    };
  }

  if (operation === 'createMany' || operation === 'createManyAndReturn') {
    const data = base.data;
    const scopedData = Array.isArray(data)
      ? data.map((item) => ({ ...(item as Record<string, unknown>), empresaId }))
      : { ...(data as Record<string, unknown> | undefined), empresaId };
    return { ...base, data: scopedData };
  }

  if (operation === 'upsert') {
    return {
      ...base,
      where: { ...(base.where as Record<string, unknown> | undefined), empresaId },
      create: { ...(base.create as Record<string, unknown> | undefined), empresaId },
    };
  }

  return base;
}
