import * as core from '@actions/core';
import { context, GitHub } from '@actions/github'


export async function run() {
  try {
    const
      repoToken = core.getInput('repo-token', { required: true }),
      issue: { owner: string; repo: string; number: number } = context.issue

    if (issue == null || issue.number == null) {
      console.log('No pull request context, skipping')
      return
    }

    const client = new GitHub(repoToken)
    const teams = core.getInput('teams').split(',').map(a => a.trim())
    const persons = core.getInput('persons').split(',').map(a => a.trim())
    
    if(teams.length == 0 && persons.length == 0){
      console.error("Please specify 'teams' and/or 'persons'")
    }
    else{
      console.log("Adding teams: " + teams + ", persons: " + persons)
    }

    await client.pulls.createReviewRequest(
      {
        owner: issue.owner,
        repo: issue.repo,
        pull_number: issue.number,
        reviewers: persons,
        team_reviewers: teams
      }
    )
  } catch (error) {
    core.setFailed(error.message)
    throw error
  }
}

run()