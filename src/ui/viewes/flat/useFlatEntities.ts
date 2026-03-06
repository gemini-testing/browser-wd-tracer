import { useMemo, useSyncExternalStore } from 'react';
import { useSnapshot } from 'valtio';

import { commonEntities, type EntityWithId } from '@/ui/observables/commonEntities';
import { flatFilters, SortMode } from '@/ui/stores/flat';
import { extractMessage, getLogLevel, calculateDuration } from '@/lib/entity';

function byDurationDesc(a: EntityWithId, b: EntityWithId): number {
  return calculateDuration(b) - calculateDuration(a);
}

export interface FlatEntities {
  filteredEntities: EntityWithId[];
  availableLevels: string[];
  availableTypes: string[];
}

export function useFlatEntities(): FlatEntities {
  const version = useSyncExternalStore(commonEntities.subscribe, commonEntities.getVersion);
  const snap = useSnapshot(flatFilters);

  return useMemo(() => {
    const entities = commonEntities.getItems();
    const availableLevels = [...new Set(entities.map(getLogLevel))].sort();
    const availableTypes = [...new Set(entities.map((e) => e.type))].sort();

    let result = [...entities];

    if (snap.levels.length > 0) {
      const levels = snap.levels as string[];

      result = result.filter((e) => levels.includes(getLogLevel(e)));
    }

    if (snap.types.length > 0) {
      const types = snap.types as string[];

      result = result.filter((e) => types.includes(e.type));
    }

    if (snap.search.trim()) {
      const query = snap.search.toLowerCase();

      result = result.filter((e) => extractMessage(e).toLowerCase().includes(query));
    }

    if (snap.sortMode === SortMode.Execution) {
      result = result.sort(byDurationDesc);
    }

    return { filteredEntities: result, availableLevels, availableTypes };
  }, [version, snap.levels, snap.types, snap.search, snap.sortMode]);
}
