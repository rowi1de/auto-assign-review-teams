"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const repoToken = core.getInput('repo-token', { required: true }), issue = github.context.issue;
            core.setSecret(repoToken);
            if (issue == null || issue.number == null) {
                console.log('No pull request context, skipping');
                return;
            }
            //See https://octokit.github.io/rest.js/
            const client = new github.GitHub(repoToken);
            const includeDraft = Boolean(core.getInput('include-draft') || false);
            const pull = yield client.pulls.get({
                owner: issue.owner,
                repo: issue.repo,
                pull_number: issue.number
            });
            //Skip DRAFT PRs
            if (pull.data.draft == false || includeDraft) {
                console.log('DRAFT Pull Request, not assigning PRs.');
                return;
            }
            const teams = core.getInput('teams').split(',').map(a => a.trim());
            const persons = core.getInput('persons').split(',').map(a => a.trim());
            if (teams.length == 0 && persons.length == 0) {
                core.setFailed("Please specify 'teams' and/or 'persons'");
                return;
            }
            else {
                console.log("Adding teams: " + teams + ", persons: " + persons);
            }
            yield client.pulls.createReviewRequest({
                owner: issue.owner,
                repo: issue.repo,
                pull_number: issue.number,
                reviewers: persons,
                team_reviewers: teams
            });
        }
        catch (error) {
            core.setFailed(error.message);
            throw error;
        }
    });
}
exports.run = run;
run();
