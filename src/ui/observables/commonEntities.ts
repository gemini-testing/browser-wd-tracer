import type { Entity } from '@/lib/wdparser/parsers/IParser';
import { createObservableList, type WithId } from './utils/createObservableList';

export type EntityWithId = WithId<Entity>;

export const commonEntities = createObservableList<Entity, Entity>({
  createTransform: () => (entities) => entities,
});
