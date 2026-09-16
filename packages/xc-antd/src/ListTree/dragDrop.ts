/**
 * ListTree 通用拖拽模型。
 *
 * 组件负责节点定位、成环保护和不可变树变换；业务层通过落点状态回调补充层级、
 * 排序或权限规则，并决定如何持久化 `nextTreeData`。
 */
import type { Key } from 'react';

export type ListTreeDropPlacement = 'inside' | 'before' | 'after';

/**
 * allowed：显示主色落点并允许提交；forbidden：显示禁止落点；invalid：不显示落点。
 */
export type ListTreeDropStatus = 'allowed' | 'forbidden' | 'invalid';

export interface ListTreeMoveOptions {
  keyField?: string;
  childrenField?: string;
}

export interface ListTreeDropTarget<TreeDataType extends object> {
  dragKey: Key;
  dropKey: Key;
  dragNode: TreeDataType;
  dropNode: TreeDataType;
  dragParentNode: TreeDataType | null;
  /** inside 时为 dropNode，before / after 时为 dropNode 的直接父级。 */
  targetParentNode: TreeDataType | null;
  placement: ListTreeDropPlacement;
}

export interface ListTreeDropInfo<TreeDataType extends object>
  extends ListTreeDropTarget<TreeDataType> {
  /** 按当前落点完成不可变移动后的整棵树。 */
  nextTreeData: TreeDataType[];
}

export interface ListTreeDropRejectedInfo<TreeDataType extends object>
  extends ListTreeDropTarget<TreeDataType> {
  status: Exclude<ListTreeDropStatus, 'allowed'>;
}

export interface ListTreeDragDropConfig<TreeDataType extends object> {
  /** 默认所有节点可拖；返回 false 可保留根节点或只读节点。 */
  nodeDraggable?: (node: TreeDataType) => boolean;
  /** 节点上下边缘作为同级落点的比例，范围 0 到 0.5，默认 0.3。 */
  dropEdgeRatio?: number;
  /**
   * 在通用成环校验通过后执行。返回 forbidden 保留灰色落点反馈，返回 invalid 隐藏落点。
   */
  getDropStatus?: (info: ListTreeDropInfo<TreeDataType>) => ListTreeDropStatus;
  onDrop: (info: ListTreeDropInfo<TreeDataType>) => void | Promise<void>;
  onDropRejected?: (info: ListTreeDropRejectedInfo<TreeDataType>) => void;
}

interface ListTreeNodeContext<TreeDataType extends object> {
  node: TreeDataType;
  parentNode: TreeDataType | null;
}

interface RemoveNodeResult<TreeDataType extends object> {
  node: TreeDataType;
  treeData: TreeDataType[];
}

function getRecord(node: object): Record<string, unknown> {
  return node as Record<string, unknown>;
}

function getNodeKey<TreeDataType extends object>(
  node: TreeDataType,
  keyField: string,
): Key | undefined {
  const key = getRecord(node)[keyField];
  return typeof key === 'string' || typeof key === 'number' ? key : undefined;
}

function getChildren<TreeDataType extends object>(
  node: TreeDataType,
  childrenField: string,
): TreeDataType[] | undefined {
  const children = getRecord(node)[childrenField];
  return Array.isArray(children) ? children as TreeDataType[] : undefined;
}

function withChildren<TreeDataType extends object>(
  node: TreeDataType,
  childrenField: string,
  children: TreeDataType[],
): TreeDataType {
  return { ...node, [childrenField]: children };
}

function findNodeContext<TreeDataType extends object>(
  treeData: TreeDataType[],
  key: Key,
  keyField: string,
  childrenField: string,
  parentNode: TreeDataType | null = null,
): ListTreeNodeContext<TreeDataType> | null {
  for (const node of treeData) {
    if (getNodeKey(node, keyField) === key) return { node, parentNode };
    const children = getChildren(node, childrenField);
    if (!children) continue;
    const result = findNodeContext(children, key, keyField, childrenField, node);
    if (result) return result;
  }
  return null;
}

function containsNodeKey<TreeDataType extends object>(
  node: TreeDataType,
  key: Key,
  keyField: string,
  childrenField: string,
): boolean {
  if (getNodeKey(node, keyField) === key) return true;
  return (getChildren(node, childrenField) ?? []).some((child) =>
    containsNodeKey(child, key, keyField, childrenField));
}

function removeNode<TreeDataType extends object>(
  treeData: TreeDataType[],
  key: Key,
  keyField: string,
  childrenField: string,
): RemoveNodeResult<TreeDataType> | null {
  for (let index = 0; index < treeData.length; index += 1) {
    const node = treeData[index];
    if (getNodeKey(node, keyField) === key) {
      return {
        node,
        treeData: [...treeData.slice(0, index), ...treeData.slice(index + 1)],
      };
    }

    const children = getChildren(node, childrenField);
    if (!children) continue;
    const childResult = removeNode(children, key, keyField, childrenField);
    if (!childResult) continue;

    const nextTreeData = [...treeData];
    nextTreeData[index] = withChildren(node, childrenField, childResult.treeData);
    return { node: childResult.node, treeData: nextTreeData };
  }
  return null;
}

function insertNode<TreeDataType extends object>(
  treeData: TreeDataType[],
  node: TreeDataType,
  dropKey: Key,
  placement: ListTreeDropPlacement,
  keyField: string,
  childrenField: string,
): TreeDataType[] | null {
  for (let index = 0; index < treeData.length; index += 1) {
    const current = treeData[index];
    if (getNodeKey(current, keyField) === dropKey) {
      if (placement === 'inside') {
        const nextTreeData = [...treeData];
        nextTreeData[index] = withChildren(current, childrenField, [
          ...(getChildren(current, childrenField) ?? []),
          node,
        ]);
        return nextTreeData;
      }

      const insertIndex = index + (placement === 'after' ? 1 : 0);
      const nextTreeData = [...treeData];
      nextTreeData.splice(insertIndex, 0, node);
      return nextTreeData;
    }

    const children = getChildren(current, childrenField);
    if (!children) continue;
    const nextChildren = insertNode(
      children,
      node,
      dropKey,
      placement,
      keyField,
      childrenField,
    );
    if (!nextChildren) continue;

    const nextTreeData = [...treeData];
    nextTreeData[index] = withChildren(current, childrenField, nextChildren);
    return nextTreeData;
  }
  return null;
}

/** 按节点高度的上 30%、中间 40%、下 30% 区分前方、子级和后方落点。 */
export function resolveListTreeDropPlacement(
  offsetY: number,
  height: number,
  edgeRatio = 0.3,
): ListTreeDropPlacement {
  if (height <= 0) return 'inside';
  const resolvedEdgeRatio = Math.min(0.5, Math.max(0, edgeRatio));
  if (offsetY < height * resolvedEdgeRatio) return 'before';
  if (offsetY > height * (1 - resolvedEdgeRatio)) return 'after';
  return 'inside';
}

export function getListTreeDropTarget<TreeDataType extends object>(
  treeData: TreeDataType[],
  dragKey: Key,
  dropKey: Key,
  placement: ListTreeDropPlacement,
  options: ListTreeMoveOptions = {},
): ListTreeDropTarget<TreeDataType> | null {
  const keyField = options.keyField ?? 'key';
  const childrenField = options.childrenField ?? 'children';
  const dragContext = findNodeContext(treeData, dragKey, keyField, childrenField);
  const dropContext = findNodeContext(treeData, dropKey, keyField, childrenField);
  if (!dragContext || !dropContext) return null;

  return {
    dragKey,
    dropKey,
    dragNode: dragContext.node,
    dropNode: dropContext.node,
    dragParentNode: dragContext.parentNode,
    targetParentNode: placement === 'inside' ? dropContext.node : dropContext.parentNode,
    placement,
  };
}

/**
 * 根据落点生成下一棵树。拖到自身或自身后代会返回 null，调用方无需重复做成环校验。
 */
export function moveListTreeNode<TreeDataType extends object>(
  treeData: TreeDataType[],
  dragKey: Key,
  dropKey: Key,
  placement: ListTreeDropPlacement,
  options: ListTreeMoveOptions = {},
): ListTreeDropInfo<TreeDataType> | null {
  const keyField = options.keyField ?? 'key';
  const childrenField = options.childrenField ?? 'children';
  const target = getListTreeDropTarget(treeData, dragKey, dropKey, placement, options);
  if (!target || containsNodeKey(target.dragNode, dropKey, keyField, childrenField)) {
    return null;
  }

  const removeResult = removeNode(treeData, dragKey, keyField, childrenField);
  if (!removeResult) return null;
  const nextTreeData = insertNode(
    removeResult.treeData,
    removeResult.node,
    dropKey,
    placement,
    keyField,
    childrenField,
  );
  if (!nextTreeData) return null;

  return { ...target, nextTreeData };
}
