import { Task } from '../domain/models/task';
import { LocalStorageTaskRepository } from './local-storage-task.repository';

const STORAGE_KEY = 'decision-maker.tasks';
const TASK_A: Task = { id: 'a', title: 'Alpha', expectation: 5, timeEffort: 5, workEffort: 5, createdAt: 1 };
const TASK_B: Task = { id: 'b', title: 'Bravo', expectation: 2, timeEffort: 2, workEffort: 3, createdAt: 2 };

describe('LocalStorageTaskRepository', () => {
  let repository: LocalStorageTaskRepository;

  beforeEach(() => {
    localStorage.clear();
    repository = new LocalStorageTaskRepository();
  });

  it('saves under the expected key as JSON', () => {
    repository.save([TASK_A]);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify([TASK_A]));
  });

  it('loads a previously saved value', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([TASK_A, TASK_B]));
    expect(repository.load()).toEqual([TASK_A, TASK_B]);
  });

  it('returns an empty array when the entry is missing', () => {
    expect(repository.load()).toEqual([]);
  });

  it('returns an empty array for corrupt JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not-json');
    expect(repository.load()).toEqual([]);
  });

  it('drops records that fail the schema check', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([{ id: 'x' }]));
    expect(repository.load()).toEqual([]);
  });
});
