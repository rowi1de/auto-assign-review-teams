import * as core from '@actions/core';
import * as github from '@actions/github';


export async function run() {
  try {
    const
      repoToken = core.getInput('repo-token', { required: true }),
      issue: { owner: string; repo: string; number: number } = github.context.issue
      core.setSecret(repoToken);

    if (issue == null || issue.number == null) {
      console.log('No pull request context, skipping')
      return
    }

    //See https://octokit.github.io/rest.js/
    const client = new github.GitHub(repoToken)

    const includeDraft : Boolean =  Boolean(core.getInput('include-draft') || false) 
    const pull = await client.pulls.get(
      {
        owner: issue.owner,
        repo: issue.repo,
        pull_number: issue.number
      }
    )

    //Skip DRAFT PRs
    if(pull.data.draft && !includeDraft){
      console.log('Skipped: DRAFT Pull Request, not assigning PR.')
      return
    }

    const skipWithNumberOfReviewers : number =  Number(core.getInput('skip-with-manual-reviewers') || Number.MAX_VALUE) 
    const numberOfReviwers = pull.data.requested_reviewers?.length || 0
    if(numberOfReviwers >= skipWithNumberOfReviewers){
      console.log('Skipped: Already ' + numberOfReviwers + ' assigned reviwers, not assigning PR.')
      return
    }

    const teams = core.getInput('teams').split(',').map(a => a.trim())
    const persons = core.getInput('persons')
      .split(',')
      // filter out PR creator
      .filter(user => user !== issue.owner)
      .map(a => a.trim())
    
    if(teams.length == 0 && persons.length == 0){
      core.setFailed("Please specify 'teams' and/or 'persons'")
      return
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
