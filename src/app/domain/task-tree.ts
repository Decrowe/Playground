import { CriterionValue, Task } from './models/task';
import { calculateRating } from './rating';

export interface TaskNode {
  readonly task: Task;
  // Own rating for leaf tasks, otherwise the average of the children's ratings.
  readonly rating: number;
  // Own criteria for leaf tasks, otherwise each rounded to the average of the children's criteria.
  readonly criteria: { expectation: CriterionValue; timeEffort: CriterionValue; workEffort: CriterionValue };
  readonly children: readonly TaskNode[];
}

function average(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function roundRating(value: number): number {
  return Math.round(value * 10) / 10;
}

function roundToCriterionValue(value: number): CriterionValue {
  return Math.min(5, Math.max(0, Math.round(value))) as CriterionValue;
}

function sortNodes(nodes: TaskNode[]): TaskNode[] {
  return nodes.sort((a, b) => {
    const diff = b.rating - a.rating;
    return diff !== 0 ? diff : a.task.createdAt - b.task.createdAt;
  });
}

// Builds a tree from a flat task list using `parentId`, sorted by rating at every level.
export function buildTaskTree(tasks: readonly Task[]): TaskNode[] {
  const childrenByParentId = new Map<string, Task[]>();
  const roots: Task[] = [];
  for (const task of tasks) {
    if (task.parentId) {
      const siblings = childrenByParentId.get(task.parentId) ?? [];
      siblings.push(task);
      childrenByParentId.set(task.parentId, siblings);
    } else {
      roots.push(task);
    }
  }

  function toNode(task: Task): TaskNode {
    const children = sortNodes((childrenByParentId.get(task.id) ?? []).map(toNode));
    if (children.length === 0) {
      return {
        task,
        rating: calculateRating(task),
        criteria: { expectation: task.expectation, timeEffort: task.timeEffort, workEffort: task.workEffort },
        children
      };
    }
    return {
      task,
      rating: roundRating(average(children.map((child) => child.rating))),
      criteria: {
        expectation: roundToCriterionValue(average(children.map((child) => child.criteria.expectation))),
        timeEffort: roundToCriterionValue(average(children.map((child) => child.criteria.timeEffort))),
        workEffort: roundToCriterionValue(average(children.map((child) => child.criteria.workEffort)))
      },
      children
    };
  }

  return sortNodes(roots.map(toNode));
}

// Recursively keeps only nodes (and descendants) whose task matches the predicate.
export function filterTaskTree(nodes: readonly TaskNode[], predicate: (task: Task) => boolean): TaskNode[] {
  return nodes
    .filter((node) => predicate(node.task))
    .map((node) => ({ ...node, children: filterTaskTree(node.children, predicate) }));
}
