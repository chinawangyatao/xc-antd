/**
 * ListTree 浏览器拖拽交互 Hook。
 *
 * 负责拖拽会话、DOM 事件和视觉状态类名；树数据变换由 dragDrop.ts 提供，业务规则
 * 继续通过 ListTreeDragDropConfig 注入。
 */
import type { DragEvent, HTMLAttributes, Key } from 'react';
import { useRef, useState } from 'react';
import {
  getListTreeDropTarget,
  moveListTreeNode,
  resolveListTreeDropPlacement,
  type ListTreeDragDropConfig,
  type ListTreeDropInfo,
  type ListTreeDropPlacement,
  type ListTreeDropStatus,
  type ListTreeDropTarget,
} from './dragDrop';

interface UseListTreeDragDropOptions<TreeDataType extends object> {
  treeData: TreeDataType[];
  keyField: string;
  childrenField: string;
  dragDrop?: ListTreeDragDropConfig<TreeDataType>;
}

interface ActiveDropTarget {
  key: Key;
  placement: ListTreeDropPlacement;
  status: Extract<ListTreeDropStatus, 'allowed' | 'forbidden'>;
}

interface ResolvedDrop<TreeDataType extends object> {
  info: ListTreeDropInfo<TreeDataType> | null;
  status: ListTreeDropStatus;
  target: ListTreeDropTarget<TreeDataType>;
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

function joinClassNames(...classNames: Array<string | undefined>): string {
  return classNames.filter(Boolean).join(' ');
}

/** 表单控件和显式忽略元素不应触发父级节点拖拽。 */
function isDragIgnoredTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest(
    'button, a, input, textarea, select, [contenteditable="true"], [data-list-tree-drag-ignore="true"]',
  ));
}

export function useListTreeDragDrop<TreeDataType extends object>({
  treeData,
  keyField,
  childrenField,
  dragDrop,
}: UseListTreeDragDropOptions<TreeDataType>) {
  const draggingKeyRef = useRef<Key | null>(null);
  const dragSourceRef = useRef<HTMLSpanElement | null>(null);
  const [draggingKey, setDraggingKey] = useState<Key | null>(null);
  const [dropTarget, setDropTarget] = useState<ActiveDropTarget | null>(null);

  /** 同步移除源节点类，确保浏览器拖动预览结束后不会残留高亮。 */
  const clearTreeDrag = () => {
    dragSourceRef.current?.classList.remove('xc-list-tree__drag-node--dragging');
    dragSourceRef.current = null;
    draggingKeyRef.current = null;
    setDraggingKey(null);
    setDropTarget(null);
  };

  const resolveDrop = (
    dragKey: Key,
    dropKey: Key,
    placement: ListTreeDropPlacement,
  ): ResolvedDrop<TreeDataType> | null => {
    const options = { childrenField, keyField };
    const target = getListTreeDropTarget(
      treeData,
      dragKey,
      dropKey,
      placement,
      options,
    );
    if (!target) return null;

    const info = moveListTreeNode(
      treeData,
      dragKey,
      dropKey,
      placement,
      options,
    );
    const status = info
      ? dragDrop?.getDropStatus?.(info) ?? 'allowed'
      : 'invalid';
    return { info, status, target };
  };

  const rejectDrop = (resolved: ResolvedDrop<TreeDataType>) => {
    dragDrop?.onDropRejected?.({
      ...resolved.target,
      status: resolved.status === 'allowed' ? 'invalid' : resolved.status,
    });
  };

  const getDropPlacement = (event: DragEvent<HTMLSpanElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return resolveListTreeDropPlacement(
      event.clientY - bounds.top,
      bounds.height,
      dragDrop?.dropEdgeRatio,
    );
  };

  const getDragNodeProps = (
    node: TreeDataType,
  ): HTMLAttributes<HTMLSpanElement> | null => {
    if (!dragDrop) return null;
    const nodeKey = getNodeKey(node, keyField);
    if (nodeKey === undefined) return null;
    const canDrag = dragDrop.nodeDraggable?.(node) ?? true;
    const activeDrop = dropTarget?.key === nodeKey ? dropTarget : null;

    return {
      className: joinClassNames(
        'xc-list-tree__drag-node',
        draggingKey === nodeKey ? 'xc-list-tree__drag-node--dragging' : undefined,
        activeDrop ? `xc-list-tree__drag-node--drop-${activeDrop.placement}` : undefined,
        activeDrop?.status === 'forbidden'
          ? 'xc-list-tree__drag-node--drop-forbidden'
          : undefined,
      ),
      draggable: canDrag,
      onDragStart: (event) => {
        if (!canDrag || isDragIgnoredTarget(event.target)) {
          event.preventDefault();
          return;
        }
        event.stopPropagation();
        // 浏览器会在 dragstart 后立即截取预览，先同步添加类再更新 React 状态。
        event.currentTarget.classList.add('xc-list-tree__drag-node--dragging');
        dragSourceRef.current = event.currentTarget;
        draggingKeyRef.current = nodeKey;
        setDraggingKey(nodeKey);
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', String(nodeKey));
      },
      onDragOver: (event) => {
        const dragKey = draggingKeyRef.current;
        if (dragKey === null) return;
        event.preventDefault();
        event.stopPropagation();
        const placement = getDropPlacement(event);
        const resolved = resolveDrop(dragKey, nodeKey, placement);
        // 已识别节点统一进入 drop 处理，再由组件按状态决定提交或拒绝。
        event.dataTransfer.dropEffect = resolved ? 'move' : 'none';
        setDropTarget((previous) => {
          if (!resolved || resolved.status === 'invalid') return null;
          if (
            previous?.key === nodeKey
            && previous.placement === placement
            && previous.status === resolved.status
          ) {
            return previous;
          }
          return {
            key: nodeKey,
            placement,
            status: resolved.status,
          };
        });
      },
      onDragLeave: (event) => {
        const relatedTarget = event.relatedTarget;
        if (relatedTarget instanceof Node && event.currentTarget.contains(relatedTarget)) return;
        setDropTarget((previous) => previous?.key === nodeKey ? null : previous);
      },
      onDrop: (event) => {
        event.preventDefault();
        event.stopPropagation();
        const dragKey = draggingKeyRef.current;
        const placement = getDropPlacement(event);
        const resolved = dragKey === null
          ? null
          : resolveDrop(dragKey, nodeKey, placement);
        clearTreeDrag();
        if (!resolved) return;
        if (!resolved.info || resolved.status !== 'allowed') {
          rejectDrop(resolved);
          return;
        }
        void dragDrop.onDrop(resolved.info);
      },
      onDragEnd: clearTreeDrag,
    };
  };

  return { getDragNodeProps };
}
