# Auto Assign Review Teams

- Assign individual persons or member of [GitHub Teams](https://help.github.com/en/github/setting-up-and-managing-organizations-and-teams/organizing-members-into-teams)
- Team Assignment Works best, if [code review assignment](https://help.github.com/en/github/setting-up-and-managing-organizations-and-teams/managing-code-review-assignment-for-your-team) for the team is enabled
- Assign individual person from list of persons or first Github Team in the list if `pick-one-from-persons-or-team` flag is true

## Example Usage

```yaml
name: "Assign Reviewers"
on:
  pull_request:
    types: [opened, ready_for_review]

jobs:
  assign-reviewers:
    runs-on: ubuntu-latest
    steps:
      - name: "Assign Team and Persons"
        uses: rowi1de/auto-assign-review-teams@v1.2.0
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          teams: "github-org-team" # only works for GitHub Organisation/Teams
          persons: "rowi1de" # add individual persons here
          include-draft: false # Draft PRs will be skipped (default: false)
          skip-with-manual-reviewers: 0 # Skip this action, if the number of reviewers was already assigned (default: 0)
          pick-one-from-persons-or-team: false # Will pick out one reviewer from persons and/or the first GitHub team and "org" set (default: false)
          org: "github-org" # only needed for pick-one-from-persons-or-team=true
```

## Permissions for Team Assignment

When using the `teams` input, the default `GITHUB_TOKEN` may not have sufficient permissions to resolve team slugs. If you get a `"Could not resolve to a node"` validation error, you need to use a **Personal Access Token (PAT)** or a **GitHub App token** instead:

- **PAT**: Create a token with `repo` scope and store it as a repository secret
- **GitHub App**: Grant read-only access to **Organization Members**

```yaml
repo-token: ${{ secrets.PAT_TOKEN }}  # use PAT instead of GITHUB_TOKEN
teams: "my-team"
```

Use the team slug (e.g. `my-team`) without the org prefix. The org prefix is only needed in the `org` input when using `pick-one-from-persons-or-team`.

## Build
```shell
npm run build && npm run package
```
