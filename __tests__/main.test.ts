import * as core from '@actions/core';
import * as github from '@actions/github';

jest.mock('@actions/core');
jest.mock('@actions/github');

const mockGetInput = core.getInput as jest.MockedFunction<typeof core.getInput>;
const mockGetBooleanInput = core.getBooleanInput as jest.MockedFunction<
  typeof core.getBooleanInput
>;
const mockSetFailed = core.setFailed as jest.MockedFunction<
  typeof core.setFailed
>;
const mockSetSecret = core.setSecret as jest.MockedFunction<
  typeof core.setSecret
>;

const mockPullsGet = jest.fn();
const mockRequestReviewers = jest.fn();
const mockListMembersInOrg = jest.fn();

const mockGetOctokit = github.getOctokit as jest.MockedFunction<
  typeof github.getOctokit
>;

function setupMocks(inputs: Record<string, string>) {
  mockGetInput.mockImplementation((name: string) => inputs[name] || '');
  mockGetBooleanInput.mockImplementation(
    (name: string) => inputs[name] === 'true',
  );
  mockGetOctokit.mockReturnValue({
    rest: {
      pulls: {
        get: mockPullsGet,
        requestReviewers: mockRequestReviewers,
      },
      teams: {
        listMembersInOrg: mockListMembersInOrg,
      },
    },
  } as any);

  (github.context as any) = {
    issue: {owner: 'foo', repo: 'bar', number: 10},
  };
}

describe('Team', () => {
  it('requests a review to a team', async () => {
    setupMocks({
      'repo-token': 'token',
      teams: 'hello,team',
      persons: '',
      'pick-one-from-persons-or-team': 'false',
      'include-draft': 'false',
    });

    mockPullsGet.mockResolvedValue({
      data: {draft: false, requested_reviewers: [], user: {login: 'author'}},
    });
    mockRequestReviewers.mockResolvedValue({
      status: 200,
      data: {requested_teams: [{slug: 'team'}]},
    });

    const main = require('../src/main');
    await main.run();

    expect(mockRequestReviewers).toHaveBeenCalledWith({
      owner: 'foo',
      repo: 'bar',
      pull_number: 10,
      team_reviewers: ['hello', 'team'],
    });
  });
});

describe('Reviewer', () => {
  it('requests a review to a person', async () => {
    setupMocks({
      'repo-token': 'token',
      teams: '',
      persons: 'person',
      'pick-one-from-persons-or-team': 'false',
      'include-draft': 'false',
    });

    mockPullsGet.mockResolvedValue({
      data: {draft: false, requested_reviewers: [], user: {login: 'author'}},
    });
    mockRequestReviewers.mockResolvedValue({
      status: 200,
      data: {requested_reviewers: [{login: 'person'}]},
    });

    const main = require('../src/main');
    await main.run();

    expect(mockRequestReviewers).toHaveBeenCalledWith({
      owner: 'foo',
      repo: 'bar',
      pull_number: 10,
      reviewers: ['person'],
    });
  });
});

describe('Draft PR', () => {
  it('skips draft PRs when include-draft is false', async () => {
    setupMocks({
      'repo-token': 'token',
      teams: 'team',
      persons: '',
      'pick-one-from-persons-or-team': 'false',
      'include-draft': 'false',
    });

    mockPullsGet.mockResolvedValue({
      data: {draft: true, requested_reviewers: [], user: {login: 'author'}},
    });

    const main = require('../src/main');
    await main.run();

    expect(mockRequestReviewers).not.toHaveBeenCalled();
  });

  it('assigns reviewers to draft PRs when include-draft is true', async () => {
    setupMocks({
      'repo-token': 'token',
      teams: '',
      persons: 'person',
      'pick-one-from-persons-or-team': 'false',
      'include-draft': 'true',
    });

    mockPullsGet.mockResolvedValue({
      data: {draft: true, requested_reviewers: [], user: {login: 'author'}},
    });
    mockRequestReviewers.mockResolvedValue({
      status: 200,
      data: {requested_reviewers: [{login: 'person'}]},
    });

    const main = require('../src/main');
    await main.run();

    expect(mockRequestReviewers).toHaveBeenCalled();
  });
});

describe('PR author filtering', () => {
  it('filters out PR author from persons list', async () => {
    setupMocks({
      'repo-token': 'token',
      teams: '',
      persons: 'author,other-person',
      'pick-one-from-persons-or-team': 'false',
      'include-draft': 'false',
    });

    mockPullsGet.mockResolvedValue({
      data: {draft: false, requested_reviewers: [], user: {login: 'author'}},
    });
    mockRequestReviewers.mockResolvedValue({
      status: 200,
      data: {requested_reviewers: [{login: 'other-person'}]},
    });

    const main = require('../src/main');
    await main.run();

    expect(mockRequestReviewers).toHaveBeenCalledWith({
      owner: 'foo',
      repo: 'bar',
      pull_number: 10,
      reviewers: ['other-person'],
    });
  });
});

describe('Empty inputs', () => {
  it('fails when both teams and persons are empty', async () => {
    setupMocks({
      'repo-token': 'token',
      teams: '',
      persons: '',
      'pick-one-from-persons-or-team': 'false',
      'include-draft': 'false',
    });

    mockPullsGet.mockResolvedValue({
      data: {draft: false, requested_reviewers: [], user: {login: 'author'}},
    });

    const main = require('../src/main');
    await main.run();

    expect(mockSetFailed).toHaveBeenCalledWith(
      "Please specify 'teams' and/or 'persons'",
    );
    expect(mockRequestReviewers).not.toHaveBeenCalled();
  });
});

describe('Skip with manual reviewers', () => {
  it('skips when enough reviewers are already assigned', async () => {
    setupMocks({
      'repo-token': 'token',
      teams: 'team',
      persons: '',
      'pick-one-from-persons-or-team': 'false',
      'include-draft': 'false',
      'skip-with-manual-reviewers': '1',
    });

    mockPullsGet.mockResolvedValue({
      data: {
        draft: false,
        requested_reviewers: [{login: 'existing-reviewer'}],
        user: {login: 'author'},
      },
    });

    const main = require('../src/main');
    await main.run();

    expect(mockRequestReviewers).not.toHaveBeenCalled();
  });
});
