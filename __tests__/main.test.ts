const nock = require('nock')
const path = require('path')

describe('Team', () => {
  it('It requests a review to a team', async () => {
    const teams = 'hello,team'
    const repoToken = 'token'
    process.env['INPUT_TEAMS'] = teams
    process.env['INPUT_REPO-TOKEN'] = repoToken

    process.env['GITHUB_REPOSITORY'] = 'foo/bar'
    process.env['GITHUB_EVENT_PATH'] = path.join(__dirname, 'payload.json')

    nock('https://api.github.com')
    .persist()
    .get('/repos/foo/bar/pulls/10')
    .reply(200)

    nock('https://api.github.com')
      .persist()
      .post('/repos/foo/bar/pulls/10/requested_reviewers')
      .reply(200,  { requested_teams: [{'slug':'team'}] })
      
    const main = require('../src/main')

    await main.run()
  })
})

describe('Reviewer', () => {
  it('It requests a review to a person', async () => {
    const reviewer = 'person'
    const repoToken = 'token'
    process.env['INPUT_PERSONS'] = reviewer
    process.env['INPUT_REPO-TOKEN'] = repoToken

    process.env['GITHUB_REPOSITORY'] = 'foo/bar'
    process.env['GITHUB_EVENT_PATH'] = path.join(__dirname, 'payload.json')

    nock('https://api.github.com')
    .persist()
    .get('/repos/foo/bar/pulls/10')
    .reply(200)

    nock('https://api.github.com')
      .persist()
      .post('/repos/foo/bar/pulls/10/requested_reviewers')
      .reply(200,  { requested_reviewers: [{'login':'person'}] })

    const main = require('../src/main')

    await main.run()
  })
})