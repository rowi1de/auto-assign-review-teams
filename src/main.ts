import * as core from '@actions/core';
import * as github from '@actions/github';

const TEAM_ID = 3920492
const TEAM_SLUG = 'timtamteam'

export async function run() {
  try {
    // get current repo context
    const
      repoToken = core.getInput('repo-token', { required: true }),
      issue = github.context.issue
    core.setSecret(repoToken);

    if (issue == null || issue.number == null) {
      console.log('No pull request context, skipping')
      return
    }

    //See https://octokit.github.io/rest.js/
    const client = new github.GitHub(repoToken)

    // get current pull request
    const includeDraft: Boolean = Boolean(core.getInput('include-draft') || false)
    const pull = await client.pulls.get(
      {
        owner: issue.owner,
        repo: issue.repo,
        pull_number: issue.number
      }
    )

    //Skip DRAFT PRs
    if (pull.data.draft && !includeDraft) {
      console.log('Skipped: DRAFT Pull Request, not assigning PR.')
      return
    }

    // check if exists current reviewers
    const skipWithNumberOfReviewers: number = Number(core.getInput('skip-with-manual-reviewers') || Number.MAX_VALUE)
    const numberOfReviewers = pull.data.requested_reviewers?.length || 0
    if (numberOfReviewers >= skipWithNumberOfReviewers) {
      console.log('Skipped: Already ' + numberOfReviewers + ' assigned reviewers, not assigning PR.')
      return
    }

    // check if the owner is in timtamteam
    try {
      const membership = client.teams.getMembership({ team_id: TEAM_ID, username: issue.owner })
    } catch {
      console.log('Owner is not part of TimTamTeam')
      return
    }

    // confirmed owner is part of timtamteam, assign team to it
    console.log("Adding TimTamTeam")
    const teamResponse = await client.pulls.createReviewRequest(
      {
        owner: issue.owner,
        repo: issue.repo,
        pull_number: issue.number,
        team_reviewers: [TEAM_SLUG]
      }
    )

    console.log("Request Status:" + teamResponse.status + ", Teams: " + teamResponse?.data?.requested_teams?.map(t => t.slug).join(','))
  } catch (error) {
    core.setFailed(error.message)
    throw error
  }
}

run()
