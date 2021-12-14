# Helm upgrade action

This action runs a helm upgrade command to deploy charts using the kubernetes context defined in the environment

## Inputs

### `local-chart`

If `True`, `chart-name` must be a local path, if `False` chart will be installed from a remote chart repository.

See [`chart-repository-url`](###chart-repository-url)

See [`chart-repository-name`](###chart-repository-name)

### `chart-repository-url`

The URL of the chart repository.
**Required** if `local-chart` is `False`

### `chart-repository-name`

The name of the chart repository. The `chart-name`should then be prefixed with this repository name.
**Required** if `local-chart` is `False`

### `chart-name`

**Required** The name of the chart with repository.

### `release-name`

**Required** The name of the release to deploy.

### `release-namespace`

**Required** The name of the namespace to deploy the release in.

### `create-namespace`

`False` to fail if the namespace does not exist.
_Default_: `True`

### `values-file-path`

A path to an existing values.yaml file to pass to helm upgrade.

### `wait`

If `True` wait for resources to be ready.
_Default_: `False`

### `debug`

If `True` display debug output.
_Default_: `False`

### `dry-run`

If `True`it does not create resources.
_Default_: `False`

### `release-set-values`

Values to set on the fly.

```yaml
# Example
release-set-values: |
  image:
    repository: nginx
    tag: 1.1.0
```

## Example usage

Example for a local chart:

```yaml
- name: Install myChart
  uses: airnity/helm-upgrade-action@master
  with:
    local-chart: "True"
    chart: ./charts/myChart #Required
    release-name: myRelease #Required
    release-namespace: myNamespace #Required
    create-namespace: "True"
    values-file-path: ./.ci/customValues.yaml
    wait: "True"
    debug: "False"
    dry-run: "False"
    release-set-values: |
      image:
        repository: myContainerRegistry/myContainerImage
        tags: 1.1.0
```

Example for a remote chart:

```yaml
- name: Install external-dns
  uses: airnity/helm-upgrade-action@master
  with:
    local-chart: "False"
    chart-repository-url: https://kubernetes-sigs.github.io/external-dns/ #Required as local-chart is False
    chart-repository-name: external-dns #Required as local-chart is False
    chart: external-dns/external-dns #Required
    release-name: myRelease #Required
    release-namespace: myNamespace #Required
    create-namespace: "True"
    values-file-path: ./.ci/customValues.yaml
    wait: "True"
    debug: "False"
    dry-run: "False"
    release-set-values: |
      serviceAccount:
        create: false
        name: myServiceAccount
```
