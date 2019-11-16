import * as core from '@actions/core';
import { context, GitHub } from '@actions/github'


export async function run() {
  try {
    const
      repoToken = core.getInput('repo-token', { required: true }),
      issue: { owner: string; repo: string; number: number } = context.issue

    const client = new GitHub(repoToken)
    const reviewers = core.getInput('reviewers').split(',').map(a => a.trim())
    const teamReviewers = core.getInput('team-reviewers').split(',').map(a => a.trim())

    await client.pulls.createReviewRequest(
      {
        owner: issue.owner,
        repo: issue.repo,
        pull_number: issue.number,
        reviewers: reviewers,
        team_reviewers: teamReviewers
      }
    )

  } catch (error) {
    core.setFailed(error.message)
    throw error
  }
}

run()