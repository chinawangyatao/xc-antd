import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  PermissionGuard,
  PermissionProvider,
  checkPermission,
  usePermission,
} from '../src/Permission';

describe('Permission checks', () => {
  test('checks one, all and any permission requirements', () => {
    const granted = ['user:view', 'user:create'];
    expect(checkPermission(granted, 'user:view')).toBe(true);
    expect(checkPermission(granted, 'user:delete')).toBe(false);
    expect(checkPermission(granted, ['user:view', 'user:create'])).toBe(true);
    expect(checkPermission(granted, ['user:create', 'user:delete'])).toBe(false);
    expect(checkPermission(
      granted,
      ['user:create', 'user:delete'],
      { mode: 'any' },
    )).toBe(true);
  });

  test('denies empty requirements and fails closed when a matcher throws', () => {
    const errors: unknown[] = [];
    expect(checkPermission(['user:view'], '')).toBe(false);
    expect(checkPermission(['user:view'], [])).toBe(false);
    expect(checkPermission(['user:view'], 'user:view', {
      matcher: () => {
        throw new Error('matcher failed');
      },
      onMatcherError: (error) => errors.push(error),
    })).toBe(false);
    expect(errors).toHaveLength(1);
  });

  test('passes resource data to a custom matcher', () => {
    expect(checkPermission([], 'article:update', {
      resource: { ownerId: 'current-user' },
      matcher: ({ required, resource }) => (
        required.includes('article:update')
        && resource.ownerId === 'current-user'
      ),
    })).toBe(true);
  });
});

describe('Permission React API', () => {
  test('renders allowed children and denied fallbacks without a wrapper element', () => {
    const html = renderToStaticMarkup(
      <PermissionProvider permissions={['user:create']}>
        <PermissionGuard permission="user:create">
          <button type="button">Create</button>
        </PermissionGuard>
        <PermissionGuard permission="user:delete" fallback={<span>Denied</span>}>
          <button type="button">Delete</button>
        </PermissionGuard>
      </PermissionProvider>,
    );
    expect(html).toBe('<button type="button">Create</button><span>Denied</span>');
  });

  test('denies outside a provider and uses loading fallback while loading', () => {
    expect(renderToStaticMarkup(
      <PermissionGuard permission="user:view" fallback={<span>Denied</span>}>
        Allowed
      </PermissionGuard>,
    )).toBe('<span>Denied</span>');

    expect(renderToStaticMarkup(
      <PermissionProvider permissions={['user:view']} loading>
        <PermissionGuard
          permission="user:view"
          loadingFallback={<span>Loading</span>}
        >
          Allowed
        </PermissionGuard>
      </PermissionProvider>,
    )).toBe('<span>Loading</span>');
  });

  test('exposes the same permission decision through usePermission', () => {
    function Probe() {
      const { can, loading, permissions } = usePermission();
      return (
        <span>
          {String(can('user:view'))}:{String(loading)}:{permissions.length}
        </span>
      );
    }

    const html = renderToStaticMarkup(
      <PermissionProvider permissions={['user:view']}>
        <Probe />
      </PermissionProvider>,
    );
    expect(html).toBe('<span>true:false:1</span>');
  });
});
