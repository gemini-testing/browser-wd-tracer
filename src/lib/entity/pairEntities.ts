import type { Entity } from '@/lib/wdparser/parsers/IParser';
import type { AnyPairedEntity } from '@/lib/entity/types';
import { PairedEntityType } from '@/lib/entity/types';
import { WebDriverEntityType } from '@/lib/wdparser/types/EntityType';
import { LogLevel } from '@/lib/wdparser/types/LogLevel';
import { getString } from '@/lib/utils/getString';

const UNKNOWN_COMMAND = 'unknown';

export interface PairingContext {
  pendingCommands: Map<string, Entity>;
  pendingHttpRequests: Entity[];
  paired: AnyPairedEntity[];
}

export function createPairingContext(): PairingContext {
  return { pendingCommands: new Map(), pendingHttpRequests: [], paired: [] };
}

export function processEntitiesIncremental(entities: Entity[], ctx: PairingContext): AnyPairedEntity[] {
  const prevLength = ctx.paired.length;

  for (const entity of entities) {
    entityHandlers[entity.type as WebDriverEntityType]?.(entity, ctx);
  }

  return ctx.paired.slice(prevLength);
}

export function flushPairingContext(ctx: PairingContext): AnyPairedEntity[] {
  const prevLength = ctx.paired.length;

  for (const request of ctx.pendingHttpRequests) {
    ctx.paired.push(makeOrphanedCommand(request));
  }
  ctx.pendingHttpRequests.length = 0;

  for (const command of ctx.pendingCommands.values()) {
    ctx.paired.push(makeOrphanedCommand(command));
  }
  ctx.pendingCommands.clear();

  return ctx.paired.slice(prevLength);
}

function makeKey(entity: Entity): string | null {
  const { metadata: meta } = entity;

  if (!meta) {
    return null;
  }

  const command = getString(meta, 'command');

  if (!command) {
    return null;
  }

  const devtoolsId = getString(meta, 'devtoolsId');

  if (devtoolsId !== undefined) {
    const devtoolsSession = getString(meta, 'devtoolsSession') ?? '';

    return `${devtoolsSession}:${command}:${devtoolsId}`;
  }

  const session = getString(meta, 'session');

  if (!session) {
    return null;
  }

  return `${session}:${command}`;
}

function makePair(command: Entity, response: Entity): AnyPairedEntity {
  const cmdMeta = command.metadata;
  const resMeta = response.metadata;

  return {
    type: PairedEntityType.Pair,
    command: getString(cmdMeta, 'command') ?? UNKNOWN_COMMAND,
    request: { timestamp: command.timestamp, payload: command.payload, metadata: cmdMeta },
    response: {
      timestamp: response.timestamp,
      payload: response.payload,
      metadata: resMeta,
      duration: (response.timestamp - command.timestamp) * 1000,
    },
    metadata: {
      session: getString(cmdMeta, 'session'),
      level: getString(resMeta, 'level') ?? LogLevel.INFO,
    },
  };
}

function makeOrphanedCommand(entity: Entity): AnyPairedEntity {
  const { metadata: meta } = entity;

  return {
    type: PairedEntityType.OrphanedCommand,
    command: getString(meta, 'command') ?? UNKNOWN_COMMAND,
    request: { timestamp: entity.timestamp, payload: entity.payload, metadata: meta },
    metadata: {
      session: getString(meta, 'session'),
      level: getString(meta, 'level') ?? LogLevel.INFO,
    },
  };
}

function makeOrphanedResponse(entity: Entity): AnyPairedEntity {
  const { metadata: meta } = entity;

  return {
    type: PairedEntityType.OrphanedResponse,
    command: getString(meta, 'command') ?? UNKNOWN_COMMAND,
    response: {
      timestamp: entity.timestamp,
      payload: entity.payload,
      metadata: meta,
      duration: 0,
    },
    metadata: {
      session: getString(meta, 'session'),
      level: getString(meta, 'level') ?? LogLevel.INFO,
    },
  };
}

function processCommand(entity: Entity, ctx: PairingContext): void {
  const isHttpRequest = entity.metadata?.url !== undefined;

  if (isHttpRequest) {
    ctx.pendingHttpRequests.push(entity);
    return;
  }

  const key = makeKey(entity);

  if (key) {
    ctx.pendingCommands.set(key, entity);
  }
}

function processResponse(entity: Entity, ctx: PairingContext): void {
  const hasDevToolsId = entity.metadata?.devtoolsId !== undefined;

  if (!hasDevToolsId && ctx.pendingHttpRequests.length > 0) {
    const request = ctx.pendingHttpRequests.shift();

    if (request) {
      ctx.paired.push(makePair(request, entity));
      return;
    }
  }

  const key = makeKey(entity);

  if (!key) {
    ctx.paired.push(makeOrphanedResponse(entity));
    return;
  }

  const command = ctx.pendingCommands.get(key);

  if (!command) {
    ctx.paired.push(makeOrphanedResponse(entity));
    return;
  }

  ctx.paired.push(makePair(command, entity));
  ctx.pendingCommands.delete(key);
}

const entityHandlers: Partial<Record<WebDriverEntityType, (entity: Entity, ctx: PairingContext) => void>> = {
  [WebDriverEntityType.Command]: processCommand,
  [WebDriverEntityType.Response]: processResponse,
};

export function pairEntities(entities: Entity[]): AnyPairedEntity[] {
  const ctx = createPairingContext();

  for (const entity of entities) {
    entityHandlers[entity.type as WebDriverEntityType]?.(entity, ctx);
  }

  for (const request of ctx.pendingHttpRequests) {
    ctx.paired.push(makeOrphanedCommand(request));
  }

  for (const command of ctx.pendingCommands.values()) {
    ctx.paired.push(makeOrphanedCommand(command));
  }

  return ctx.paired;
}

export function getPairDuration(pair: AnyPairedEntity): number {
  return pair.response?.duration ?? 0;
}
