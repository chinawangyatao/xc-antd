# Publishing @zhilv/xc-antd to the private registry

The npm package is published by `.github/workflows/publish.yml`.

## Publish directly from a local machine

GitHub can be skipped when the local npm login has publish permission. First
bump `packages/xc-antd/package.json` to a version that does not exist in the
private registry, then run:

```bash
npm run publish:private
```

This command runs tests, builds the package, and publishes it using the
package's private `publishConfig.registry`.

To inspect the package without publishing:

```bash
npm run pack:private
```

## One-time setup

1. Log in to the Zhilv npm hosted registry with an account that can publish the
   `@zhilv` scope.
2. Create or obtain a private registry token with publish permission for
   `@zhilv/xc-antd`.
3. In GitHub, open `Settings -> Secrets and variables -> Actions` and add a
   repository secret named `NPM_TOKEN`.
4. Push the repository and workflow to GitHub:

   ```bash
   git push -u github feature-dev:main
   ```

## First publish

The current package version is `0.0.1`. After the workflow is present on
GitHub, open `Actions -> Publish npm package -> Run workflow` to publish it.

## Later releases

Every npm version can only be published once. Bump the package version, commit
it, create the matching tag, and push the branch and tag:

```bash
npm version patch --workspace @zhilv/xc-antd --no-git-tag-version
git add packages/xc-antd/package.json bun.lock
git commit -m "chore(release): v0.0.2"
git tag v0.0.2
git push github main
git push github v0.0.2
```

The workflow rejects tags that do not match the version in
`packages/xc-antd/package.json`.

## Registry

The package is published to:

```text
http://repo.zhihuiwenlvyun.com/repository/npm-hosted/
```

Consumers can add this scoped registry to their `.npmrc`:

```ini
@zhilv:registry=http://repo.zhihuiwenlvyun.com/repository/npm-hosted/
```
