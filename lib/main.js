"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
function run() {
    var _a, _b, _c, _d, _e, _f, _g;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const repoToken = core.getInput("repo-token", { required: true }), issue = github.context.issue;
            core.setSecret(repoToken);
            const pickOneFromPersonsOrTeam = Boolean(core.getInput("pick-one-from-persons-or-team") || false);
            if (issue == null || issue.number == null) {
                console.log("No pull request context, skipping");
                return;
            }
            //See https://octokit.github.io/rest.js/
            const client = github.getOctokit(repoToken);
            const includeDraft = Boolean(core.getInput("include-draft") || false);
            const pull = yield client.rest.pulls.get({
                owner: issue.owner,
                repo: issue.repo,
                pull_number: issue.number,
            });
            //Skip DRAFT PRs
            if (pull.data.draft && !includeDraft) {
                console.log("Skipped: DRAFT Pull Request, not assigning PR.");
                return;
            }
            const skipWithNumberOfReviewers = Number(core.getInput("skip-with-manual-reviewers") || Number.MAX_VALUE);
            const numberOfReviewers = ((_a = pull.data.requested_reviewers) === null || _a === void 0 ? void 0 : _a.length) || 0;
            if (numberOfReviewers >= skipWithNumberOfReviewers) {
                console.log("Skipped: Already " +
                    numberOfReviewers +
                    " assigned reviewers, not assigning PR.");
                return;
            }
            const teams = core
                .getInput("teams")
                .split(",")
                .map((a) => a.trim());
            const persons = core
                .getInput("persons")
                .split(",")
                // filter out PR creator
                .filter((user) => user !== issue.owner)
                .map((a) => a.trim());
            if (teams.length == 0 && persons.length == 0) {
                core.setFailed("Please specify 'teams' and/or 'persons'");
                return;
            }
            if (persons.length > 0) {
                console.log("Picking from: " + persons);
                const reviewers = pickOneFromPersonsOrTeam
                    ? [persons[Math.floor(Math.random() * persons.length)]]
                    : persons;
                console.log("Adding person(s): " + reviewers);
                const personResponse = yield client.rest.pulls.requestReviewers({
                    owner: issue.owner,
                    repo: issue.repo,
                    pull_number: issue.number,
                    reviewers: reviewers,
                });
                console.log("Request Status:" +
                    personResponse.status +
                    ", Persons: " +
                    ((_c = (_b = personResponse === null || personResponse === void 0 ? void 0 : personResponse.data) === null || _b === void 0 ? void 0 : _b.requested_reviewers) === null || _c === void 0 ? void 0 : _c.map((r) => r.login).join(",")));
            }
            // Making sure that org is provided if user turns on pick-one-from-persons-or-team option and to use teams
            const org = core.getInput("org");
            if (pickOneFromPersonsOrTeam && teams.length > 0 && org == null) {
                core.setFailed("Please specify 'org' if you want to pick one from persons or teams and use Teams");
                return;
            }
            if (teams.length > 0) {
                if (pickOneFromPersonsOrTeam) {
                    // Picking out 1 person from first team listed
                    console.log("Selecting from first team provided: " + teams[0]);
                    const members = yield client.rest.teams.listMembersInOrg({
                        org: org,
                        team_slug: teams[0],
                    });
                    console.log("Request Status for getting team members:" + members.status);
                    // filter out PR author
                    const eligibleMembers = members.data
                        .filter((user) => { var _a; return user.login !== ((_a = pull.data.user) === null || _a === void 0 ? void 0 : _a.login); })
                        .map((a) => a.login);
                    console.log("Picking reviewer from eligible members:", eligibleMembers);
                    const person = [
                        eligibleMembers[Math.floor(Math.random() * eligibleMembers.length)],
                    ];
                    const personResponse = yield client.rest.pulls.requestReviewers({
                        owner: issue.owner,
                        repo: issue.repo,
                        pull_number: issue.number,
                        reviewers: person,
                    });
                    console.log("Request Status:" +
                        personResponse.status +
                        ", Person from First Team: " +
                        ((_e = (_d = personResponse === null || personResponse === void 0 ? void 0 : personResponse.data) === null || _d === void 0 ? void 0 : _d.requested_reviewers) === null || _e === void 0 ? void 0 : _e.map((r) => r.login).join(",")));
                }
                else {
                    console.log("Adding teams: " + teams);
                    const teamResponse = yield client.rest.pulls.requestReviewers({
                        owner: issue.owner,
                        repo: issue.repo,
                        pull_number: issue.number,
                        team_reviewers: teams,
                    });
                    console.log("Request Status:" +
                        teamResponse.status +
                        ", Teams: " +
                        ((_g = (_f = teamResponse === null || teamResponse === void 0 ? void 0 : teamResponse.data) === null || _f === void 0 ? void 0 : _f.requested_teams) === null || _g === void 0 ? void 0 : _g.map((t) => t.slug).join(",")));
                }
            }
        }
        catch (error) {
            console.error(error);
            core.setFailed("Unknown error" + error);
            throw error;
        }
    });
}
exports.run = run;
run();
