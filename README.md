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
        uses: rowi1de/auto-assign-review-teams@v1.0.1
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          org: "github-org"
          teams: "gitub-org-team" # only works for GitHub Organisation/Teams
          persons: "rowi1de" # add individual persons here
          include-draft: false # Draft PRs will be skipped (default: false)
          skip-with-manual-reviewers: 0 # Skip this action, if the number of reviwers was already assigned (default: 0)
          pick-one-from-persons-or-team: true # Will pick out one reviewer from persons and/or the first Github team (default: false)
```

## Build
```shell
npm run package
git add lib
git commit -a -m "prod dependencies"
```