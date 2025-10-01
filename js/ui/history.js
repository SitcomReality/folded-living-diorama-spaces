export class HistoryManager {
  constructor(limit = 50) { 
    this.limit = limit; 
    this.stack = []; 
    this.index = -1; 
  }
  push(state) {
    this.stack = this.stack.slice(0, this.index + 1);
    this.stack.push(JSON.parse(JSON.stringify(state)));
    if (this.stack.length > this.limit) { 
      this.stack.shift(); 
    } else { 
      this.index++; 
    }
  }
  canUndo() { return this.index > 0; }
  canRedo() { return this.index < this.stack.length - 1; }
  undo() { 
    if (!this.canUndo()) return null; 
    this.index--; 
    return JSON.parse(JSON.stringify(this.stack[this.index])); 
  }
  redo() { 
    if (!this.canRedo()) return null; 
    this.index++; 
    return JSON.parse(JSON.stringify(this.stack[this.index])); 
  }
}