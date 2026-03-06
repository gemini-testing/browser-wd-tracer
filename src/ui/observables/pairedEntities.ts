import type { Entity } from '@/lib/wdparser/parsers/IParser';
import type { AnyPairedEntity } from '@/lib/entity/types';
import { createPairingContext, processEntitiesIncremental } from '@/lib/entity/pairEntities';
import { createObservableList, type WithId } from './utils/createObservableList';

export type PairedEntityWithId = WithId<AnyPairedEntity>;

export const pairedEntities = createObservableList<Entity, AnyPairedEntity>({
  createTransform: () => {
    const ctx = createPairingContext();

    return (entities) => processEntitiesIncremental(entities, ctx);
  },
});
