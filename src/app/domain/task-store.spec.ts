import { TestBed } from '@angular/core/testing';

import { InMemoryTaskRepository } from '../infrastructure/in-memory-task.repository';
import { Task } from './models/task';
import { TASK_REPOSITORY } from './ports/task-repository.port';
import { TaskStore } from './task-store';

const TASK_A: Task = { id: 'a', title: 'Alpha', expectation: 5, timeEffort: 5, workEffort: 5, createdAt: 1 };
const TASK_C: Task = { id: 'c', title: 'Charlie', expectation: 0, timeEffort: 1, workEffort: 0, createdAt: 3 };

function setup(seed: readonly Task[] = []) {
  const repository = new InMemoryTaskRepository(seed);
  TestBed.configureTestingModule({
    providers: [TaskStore, { provide: TASK_REPOSITORY, useValue: repository }]
  });
  const store = TestBed.inject(TaskStore);
  return { store, repository };
}

describe('TaskStore', () => {
  it('loads the initial tasks from the repository', () => {
    const { store } = setup([TASK_C, TASK_A]);
    expect(store.tasks().length).toBe(2);
    expect(store.sortedTasks().map((task) => task.id)).toEqual(['a', 'c']);
  });

  it('adds a task and persists it', () => {
    const { store, repository } = setup();
    store.add({ title: 'New', expectation: 4, timeEffort: 4, workEffort: 4 });
    expect(store.tasks().length).toBe(1);
    const created = store.tasks()[0];
    expect(created.id).toBeTruthy();
    expect(created.createdAt).toBeTruthy();
    expect(repository.saveCalls.length).toBe(1);
    expect(repository.saveCalls[0].length).toBe(1);
  });

  it('updates a task and persists it', () => {
    const { store, repository } = setup([TASK_C]);
    store.update('c', { expectation: 5, timeEffort: 5, workEffort: 5 });
    const updated = store.tasks()[0];
    expect(updated.expectation + updated.timeEffort + updated.workEffort).toBe(15);
    expect(repository.saveCalls.at(-1)?.[0]).toEqual(updated);
  });

  it('ignores updates for an unknown id', () => {
    const { store, repository } = setup([TASK_C]);
    store.update('does-not-exist', { expectation: 5 });
    expect(store.tasks()).toEqual([TASK_C]);
    expect(repository.saveCalls.length).toBe(0);
  });

  it('removes a task and persists it', () => {
    const { store, repository } = setup([TASK_A, TASK_C]);
    store.remove('a');
    expect(store.tasks().map((task) => task.id)).toEqual(['c']);
    expect(repository.saveCalls.at(-1)?.length).toBe(1);
  });

  it('marks a task as completed and persists it', () => {
    const { store, repository } = setup([TASK_A]);
    store.complete('a');
    expect(store.tasks()[0].completed).toBe(true);
    expect(repository.saveCalls.at(-1)?.[0].completed).toBe(true);
  });

  it('ignores completing an unknown id', () => {
    const { store, repository } = setup([TASK_A]);
    store.complete('does-not-exist');
    expect(store.tasks()).toEqual([TASK_A]);
    expect(repository.saveCalls.length).toBe(0);
  });

  it('clears all tasks and persists it', () => {
    const { store, repository } = setup([TASK_A, TASK_C]);
    store.clear();
    expect(store.tasks()).toEqual([]);
    expect(repository.saveCalls.at(-1)).toEqual([]);
  });

  it('replaces the source task when breaking it down', () => {
    const { store } = setup([TASK_A]);
    store.breakDown('a', [
      { title: 'Sub 1', expectation: 1, timeEffort: 1, workEffort: 1 },
      { title: 'Sub 2', expectation: 2, timeEffort: 2, workEffort: 2 }
    ]);
    const tasks = store.tasks();
    expect(tasks.length).toBe(2);
    expect(tasks.some((task) => task.id === 'a')).toBe(false);
    expect(new Set(tasks.map((task) => task.id)).size).toBe(2);
  });

  it('rejects breaking down with an empty list', () => {
    const { store, repository } = setup([TASK_A]);
    store.breakDown('a', []);
    expect(store.tasks()).toEqual([TASK_A]);
    expect(repository.saveCalls.length).toBe(0);
  });

  it('emits a new array instance on every mutation', () => {
    const { store } = setup([TASK_A]);
    const before = store.tasks();
    store.remove('does-not-exist');
    expect(store.tasks()).not.toBe(before);
  });

  it('recomputes sortedTasks after mutations', () => {
    const { store } = setup();
    store.add({ title: 'Low', expectation: 0, timeEffort: 0, workEffort: 1 });
    store.add({ title: 'High', expectation: 5, timeEffort: 5, workEffort: 5 });
    expect(store.sortedTasks().map((task) => task.title)).toEqual(['High', 'Low']);
  });
});
