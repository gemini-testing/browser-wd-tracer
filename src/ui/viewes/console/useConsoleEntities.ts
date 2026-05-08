import { useMemo, useSyncExternalStore } from 'react';
import { useSnapshot } from 'valtio';

import { commonEntities, type EntityWithId } from '@/ui/observables/commonEntities';
import { consoleFilters } from '@/ui/stores/console';
import {
  isConsolePayload,
  isExceptionPayload,
  exceptionToConsolePayload,
  extractConsoleMessage,
  type ConsolePayload,
} from '@/lib/console';

const CONSOLE_API_EVENT = 'Runtime.consoleAPICalled';
const EXCEPTION_THROWN_EVENT = 'Runtime.exceptionThrown';

function isConsoleApiEntity(e: EntityWithId): boolean {
  return e.metadata?.event === CONSOLE_API_EVENT && isConsolePayload(e.payload);
}

function isExceptionEntity(e: EntityWithId): boolean {
  return e.metadata?.event === EXCEPTION_THROWN_EVENT && isExceptionPayload(e.payload);
}

function getNormalizedPayload(e: EntityWithId): ConsolePayload | null {
  if (isConsolePayload(e.payload)) {
    return e.payload;
  }

  if (isExceptionPayload(e.payload)) {
    return exceptionToConsolePayload(e.payload);
  }

  return null;
}

export interface NormalizedConsoleEntity {
  entity: EntityWithId;
  payload: ConsolePayload;
}

function toNormalized(e: EntityWithId): NormalizedConsoleEntity | null {
  const payload = getNormalizedPayload(e);

  if (!payload) {
    return null;
  }

  return { entity: e, payload };
}

export interface ConsoleEntities {
  filteredEntities: NormalizedConsoleEntity[];
  availableLevels: string[];
}

export function useConsoleEntities(): ConsoleEntities {
  useSyncExternalStore(commonEntities.subscribe, commonEntities.getVersion);
  const snap = useSnapshot(consoleFilters);

  return useMemo(() => {
    const allItems = commonEntities.getItems();
    const allConsole = allItems
      .filter((e) => isConsoleApiEntity(e) || isExceptionEntity(e))
      .flatMap((e) => {
        const normalized = toNormalized(e);

        return normalized ? [normalized] : [];
      })
      .sort((a, b) => a.payload.timestamp - b.payload.timestamp);

    const availableLevels = [...new Set(allConsole.map((n) => n.payload.type))].sort();

    let result = allConsole;

    if (snap.levels.length > 0) {
      const levels = snap.levels as string[];
      result = result.filter((n) => levels.includes(n.payload.type));
    }

    if (snap.search.trim()) {
      const query = snap.search.toLowerCase();
      result = result.filter((n) =>
        extractConsoleMessage(n.payload.args).toLowerCase().includes(query),
      );
    }

    return { filteredEntities: result, availableLevels };
  }, [commonEntities.getVersion(), snap.levels, snap.search]);
}
