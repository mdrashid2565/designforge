import { Design } from '../types.js';
import { HistoryEntry, ICommand } from './types.js';

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export type CommandListener = (design: Design, lastCommand?: ICommand) => void;

export class CommandManager {
  private currentDesign: Design;
  private undoStack: ICommand[] = [];
  private redoStack: ICommand[] = [];
  private historyLog: HistoryEntry[] = [];
  private maxStackSize: number = 100;
  private listeners: Set<CommandListener> = new Set();
  private isExecuting: boolean = false;

  constructor(initialDesign: Design, maxStackSize = 100) {
    this.currentDesign = deepClone(initialDesign);
    this.maxStackSize = maxStackSize;
  }

  public getDesign(): Design {
    return deepClone(this.currentDesign);
  }

  public setDesign(design: Design, resetHistory: boolean = false): void {
    this.currentDesign = deepClone(design);
    if (resetHistory) {
      this.undoStack = [];
      this.redoStack = [];
      this.historyLog = [];
    }
    this.notifyListeners();
  }

  public execute(command: ICommand): Design {
    if (this.isExecuting) {
      throw new Error('Cannot execute command while another command is executing');
    }
    this.isExecuting = true;
    try {
      this.currentDesign = command.execute(this.currentDesign);
      this.undoStack.push(command);
      if (this.undoStack.length > this.maxStackSize) {
        this.undoStack.shift();
      }
      this.redoStack = []; // Clear redo stack on new action

      const entry: HistoryEntry = {
        commandId: command.id,
        name: command.name,
        description: command.description,
        timestamp: command.timestamp,
        author: command.author,
        diff: command.getDiff ? command.getDiff() : undefined,
      };
      this.historyLog.push(entry);

      this.notifyListeners(command);
      return this.getDesign();
    } finally {
      this.isExecuting = false;
    }
  }

  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public undo(): Design | null {
    if (!this.canUndo()) return null;
    const command = this.undoStack.pop()!;
    this.currentDesign = command.undo(this.currentDesign);
    this.redoStack.push(command);

    this.historyLog.push({
      commandId: `undo_${command.id}`,
      name: `undo_${command.name}`,
      description: `Undo: ${command.description}`,
      timestamp: Date.now(),
    });

    this.notifyListeners(command);
    return this.getDesign();
  }

  public redo(): Design | null {
    if (!this.canRedo()) return null;
    const command = this.redoStack.pop()!;
    this.currentDesign = command.execute(this.currentDesign);
    this.undoStack.push(command);

    this.historyLog.push({
      commandId: `redo_${command.id}`,
      name: `redo_${command.name}`,
      description: `Redo: ${command.description}`,
      timestamp: Date.now(),
    });

    this.notifyListeners(command);
    return this.getDesign();
  }

  public revertAuthorSession(authorTag: string): Design {
    // Revert all consecutive commands by authorTag starting from latest
    let revertedCount = 0;
    while (this.undoStack.length > 0) {
      const top = this.undoStack[this.undoStack.length - 1];
      if (top.author === authorTag || authorTag === 'all_ai') {
        this.undo();
        revertedCount++;
      } else {
        break;
      }
    }
    return this.getDesign();
  }

  public getHistory(): HistoryEntry[] {
    return deepClone(this.historyLog);
  }

  public subscribe(listener: CommandListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(lastCommand?: ICommand): void {
    const snapshot = this.getDesign();
    for (const listener of this.listeners) {
      try {
        listener(snapshot, lastCommand);
      } catch (err) {
        console.error('Error in command listener:', err);
      }
    }
  }
}
