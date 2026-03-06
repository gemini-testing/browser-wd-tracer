import type { Entity } from '@/lib/wdparser/parsers/IParser';
import { WebDriverEntityType } from '@/lib/wdparser/types/EntityType';
import { getString } from '@/lib/utils/getString';
import { truncate, withId } from '@/lib/formatters';
import { isString } from '@/lib/guards';

const UNKNOWN_MESSAGE = 'unknown';

const extractByType: Partial<Record<WebDriverEntityType, (entity: Entity) => string>> = {
  [WebDriverEntityType.Command]: (entity) => {
    const { metadata: meta } = entity;
    const command = getString(meta, 'command')
      ?? getString(meta, 'url')
      ?? UNKNOWN_MESSAGE;

    return withId(command, meta?.devtoolsId);
  },

  [WebDriverEntityType.Response]: (entity) => {
    const { metadata: meta } = entity;
    const command = getString(meta, 'command');

    if (command) {
      return withId(command, meta?.devtoolsId);
    }

    const payloadFallback = entity.payload
      ? truncate(JSON.stringify(entity.payload))
      : UNKNOWN_MESSAGE;

    return withId(payloadFallback, meta?.devtoolsId);
  },

  [WebDriverEntityType.Event]: (entity) => {
    const { metadata: meta } = entity;
    const event = getString(meta, 'event');

    if (event !== undefined) {
      return withId(event, meta?.devtoolsId);
    }

    return entity.type;
  },
};

export function extractMessage(entity: Entity): string {
  const handler = extractByType[entity.type as WebDriverEntityType];

  if (handler) {
    return handler(entity);
  }

  const message = getString(entity.metadata, 'message');

  if (message) {
    return truncate(message);
  }

  if (isString(entity.raw)) {
    return truncate(entity.raw);
  }

  return entity.type;
}
