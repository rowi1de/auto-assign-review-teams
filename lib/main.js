"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
const github_1 = require("@actions/github");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const repoToken = core.getInput('repo-token', { required: true }), issue = github_1.context.issue;
            if (github_1.context.payload.action !== 'opened') {
                console.log('No pull request was opened, skipping');
                return;
            }
            const client = new github_1.GitHub(repoToken);
            const reviewers = core.getInput('reviewers').split(',').map(a => a.trim());
            const teamReviewers = core.getInput('team-reviewers').split(',').map(a => a.trim());
            yield client.pulls.createReviewRequest({
                owner: issue.owner,
                repo: issue.repo,
                pull_number: issue.number,
                reviewers: reviewers,
                team_reviewers: teamReviewers
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
