import { Design } from '../types.js';
import { CommandDiff, ICommand } from './types.js';

export class BatchCommand implements ICommand {
  id: string;
  name = 'batch_operations';
  description: string;
  timestamp: number;
  author?: string;
  commands: ICommand[];
  private executedCommands: ICommand[] = [];

  constructor(
    commands: ICommand[],
    options?: { id?: string; author?: string; description?: string }
  ) {
    this.id = options?.id || `cmd_batch_${Date.now()}`;
    this.commands = commands;
    this.author = options?.author;
    this.description = options?.description || `Batch execution of ${commands.length} operations`;
    this.timestamp = Date.now();
  }

  execute(design: Design): Design {
    let current = design;
    this.executedCommands = [];

    try {
      for (const cmd of this.commands) {
        current = cmd.execute(current);
        this.executedCommands.push(cmd);
      }
      return current;
    } catch (err) {
      // Revert any partially executed commands
      for (let i = this.executedCommands.length - 1; i >= 0; i--) {
        try {
          current = this.executedCommands[i].undo(current);
        } catch (_) {}
      }
      throw new Error(`Batch execution failed at command ${this.executedCommands.length}: ${(err as Error).message}`);
    }
  }

  undo(design: Design): Design {
    let current = design;
    for (let i = this.executedCommands.length - 1; i >= 0; i--) {
      current = this.executedCommands[i].undo(current);
    }
    return current;
  }

  getDiff(): CommandDiff {
    return {
      type: 'batch_operations',
      targetId: 'batch',
      summary: `Batch executed ${this.commands.length} operations: [${this.commands.map((c) => c.name).join(', ')}]`,
    };
  }
}
