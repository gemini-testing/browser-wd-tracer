import { useMemo, useSyncExternalStore } from 'react';
import { useSnapshot } from 'valtio';

import { commonEntities, type EntityWithId } from '@/ui/observables/commonEntities';
import { consoleFilters } from '@/ui/stores/console';
import { isConsolePayload, extractConsoleMessage } from '@/lib/console';

const CONSOLE_API_EVENT = 'Runtime.consoleAPICalled';

function isConsoleEntity(e: EntityWithId): boolean {
  return e.metadata?.event === CONSOLE_API_EVENT && isConsolePayload(e.payload);
}

function getConsoleLevel(e: EntityWithId): string {
  return isConsolePayload(e.payload) ? e.payload.type : '';
}

export interface ConsoleEntities {
  filteredEntities: EntityWithId[];
  availableLevels: string[];
}

export function useConsoleEntities(): ConsoleEntities {
  useSyncExternalStore(commonEntities.subscribe, commonEntities.getVersion);
  const snap = useSnapshot(consoleFilters);

  return useMemo(() => {
    const allConsole = commonEntities.getItems().filter(isConsoleEntity);
    const availableLevels = [...new Set(allConsole.map(getConsoleLevel))].sort();

    let result = allConsole;

    if (snap.levels.length > 0) {
      const levels = snap.levels as string[];
      result = result.filter((e) => levels.includes(getConsoleLevel(e)));
    }

    if (snap.search.trim()) {
      const query = snap.search.toLowerCase();
      result = result.filter((e) => {
        if (!isConsolePayload(e.payload)) {
          return false;
        }

        return extractConsoleMessage(e.payload.args).toLowerCase().includes(query);
      });
    }

    return { filteredEntities: result, availableLevels };
  }, [commonEntities.getVersion(), snap.levels, snap.search]);
}
