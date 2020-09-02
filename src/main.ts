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
    const numberOfReviewers = pull.data.requested_reviewers?.length || 0
    if(numberOfReviewers >= skipWithNumberOfReviewers){
      console.log('Skipped: Already ' + numberOfReviewers + ' assigned reviewers, not assigning PR.')
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

    if(persons.length > 0) {
    
      // Picking out 1 person from list of persons
      console.log("Picking from: " + persons)
      const person = persons[Math.floor(Math.random() * persons.length)];
      console.log("Adding person: " + person)
    
      const personResponse = await client.pulls.createReviewRequest(
          {
            owner: issue.owner,
            repo: issue.repo,
            pull_number: issue.number,
            reviewers: person
          }
      )
      console.log("Request Status:" + personResponse.status + ", Persons: " + personResponse?.data?.requested_reviewers?.map(r => r.login).join(','))
    }
                  
    // Making sure that org is provided if user wishes to use teams                  
    const org : string =  core.getInput('org')
    if (teams.length > 0 && org == null) {
      core.setFailed("Please specify 'org' if you want to use Teams")
      return
    }

    if(teams.length > 0) {
      // Picking out 1 person from first team listed
      console.log("Selecting from first team provided: " + teams[0])
      const members = await client.teams.listMembersInOrg({org,teams[0]})
      console.log("Request Status for getting team members:" + members.status)
      
      const person = members[Math.floor(Math.random() * members.length)].data.login
      const personResponse = await client.pulls.createReviewRequest(
          {
            owner: issue.owner,
            repo: issue.repo,
            pull_number: issue.number,
            reviewers: person
          }
      )
      console.log("Request Status:" + personResponse.status + ", Person from First Team: " + personResponse?.data?.requested_reviewers?.map(t => t.slug).join(','))
    }
  } catch (error) {
    core.setFailed(error.message)
    throw error
  }
}

run()
