import { CommandStatus } from '@/ui/stores/commands';

export const STATUS_COLOR: Record<CommandStatus, string> = {
  [CommandStatus.Succeed]: 'green',
  [CommandStatus.Failed]: 'red',
  [CommandStatus.Orphaned]: 'orange',
};
