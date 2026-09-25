import { Task } from '../domain/models/task';
import { TaskRepositoryPort } from '../domain/ports/task-repository.port';

// Mock adapter for the TaskRepositoryPort, used in tests instead of LocalStorageTaskRepository.
export class InMemoryTaskRepository implements TaskRepositoryPort {
  #tasks: Task[];
  readonly saveCalls: Task[][] = [];

  constructor(seed: readonly Task[] = []) {
    this.#tasks = [...seed];
  }

  load(): Task[] {
    return [...this.#tasks];
  }

  save(tasks: readonly Task[]): void {
    this.#tasks = [...tasks];
    this.saveCalls.push([...tasks]);
  }
}
