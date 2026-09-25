import { Task } from './models/task';
import { buildTaskTree, filterTaskTree } from './task-tree';

const PARENT: Task = { id: 'p', title: 'Parent', expectation: 5, timeEffort: 5, workEffort: 5, createdAt: 1 };
const CHILD_LOW: Task = {
  id: 'c1',
  title: 'Child Low',
  expectation: 0,
  timeEffort: 0,
  workEffort: 0,
  createdAt: 2,
  parentId: 'p'
};
const CHILD_HIGH: Task = {
  id: 'c2',
  title: 'Child High',
  expectation: 5,
  timeEffort: 5,
  workEffort: 5,
  createdAt: 3,
  parentId: 'p'
};
const STANDALONE: Task = { id: 's', title: 'Standalone', expectation: 2, timeEffort: 2, workEffort: 3, createdAt: 4 };

describe('buildTaskTree', () => {
  it('puts tasks without a parentId at the top level', () => {
    const tree = buildTaskTree([STANDALONE]);
    expect(tree.map((node) => node.task.id)).toEqual(['s']);
    expect(tree[0].rating).toBe(7);
    expect(tree[0].criteria).toEqual({ expectation: 2, timeEffort: 2, workEffort: 3 });
    expect(tree[0].children).toEqual([]);
  });

  it('nests tasks under their parent and keeps the parent in the tree', () => {
    const tree = buildTaskTree([PARENT, CHILD_LOW, CHILD_HIGH]);
    expect(tree.map((node) => node.task.id)).toEqual(['p']);
    expect(tree[0].children.map((child) => child.task.id)).toEqual(['c2', 'c1']);
  });

  it('replaces a parent rating with the average of its children ratings', () => {
    const tree = buildTaskTree([PARENT, CHILD_LOW, CHILD_HIGH]);
    // CHILD_LOW rating 0, CHILD_HIGH rating 15 -> average 7.5
    expect(tree[0].rating).toBe(7.5);
  });

  it('replaces each parent criterion with the rounded average of its children criteria', () => {
    const tree = buildTaskTree([PARENT, CHILD_LOW, CHILD_HIGH]);
    // CHILD_LOW is all 0s, CHILD_HIGH is all 5s -> average 2.5, rounded to 3
    expect(tree[0].criteria).toEqual({ expectation: 3, timeEffort: 3, workEffort: 3 });
  });

  it('sorts top-level nodes by rating, highest first', () => {
    const tree = buildTaskTree([STANDALONE, PARENT, CHILD_LOW, CHILD_HIGH]);
    expect(tree.map((node) => node.task.id)).toEqual(['p', 's']);
  });

  it('handles an empty task list', () => {
    expect(buildTaskTree([])).toEqual([]);
  });
});

describe('filterTaskTree', () => {
  it('removes nodes that fail the predicate at every level', () => {
    const tree = buildTaskTree([PARENT, CHILD_LOW, CHILD_HIGH]);
    const filtered = filterTaskTree(tree, (task) => task.id !== 'c1');
    expect(filtered[0].children.map((child) => child.task.id)).toEqual(['c2']);
  });

  it('keeps the original rating even if a child is filtered out of the display', () => {
    const tree = buildTaskTree([PARENT, CHILD_LOW, CHILD_HIGH]);
    const filtered = filterTaskTree(tree, (task) => task.id !== 'c1');
    expect(filtered[0].rating).toBe(7.5);
  });
});
