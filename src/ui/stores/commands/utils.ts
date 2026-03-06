import type { AnyPairedEntity } from '@/lib/entity/types';
import { PairedEntityType } from '@/lib/entity/types';
import { LogLevel } from '@/lib/wdparser/types/LogLevel';
import { getString } from '@/lib/utils/getString';

import { CommandStatus } from './types';

export function getPairStatus(pair: AnyPairedEntity): CommandStatus {
  const isOrphaned = (
    pair.type === PairedEntityType.OrphanedCommand
    || pair.type === PairedEntityType.OrphanedResponse
  );

  if (isOrphaned) {
    return CommandStatus.Orphaned;
  }

  const level = getString(pair.metadata, 'level');
  const isFailed = level === LogLevel.ERROR || level === LogLevel.SEVERE;

  return isFailed
    ? CommandStatus.Failed
    : CommandStatus.Succeed;
}
