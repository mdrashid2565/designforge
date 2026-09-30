import { Design } from '../types.js';

export interface CommandDiff {
  type: string;
  targetId: string;
  field?: string;
  before?: any;
  after?: any;
  summary: string;
}

export interface ICommand {
  id: string;
  name: string;
  description: string;
  timestamp: number;
  author?: string;
  execute(design: Design): Design;
  undo(design: Design): Design;
  getDiff?(): CommandDiff;
}

export interface HistoryEntry {
  commandId: string;
  name: string;
  description: string;
  timestamp: number;
  author?: string;
  diff?: CommandDiff;
}
