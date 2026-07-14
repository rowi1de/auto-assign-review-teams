require('./sourcemap-register.js');/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 2613:
/***/ ((module) => {

module.exports = require("assert");

/***/ }),

/***/ 5317:
/***/ ((module) => {

module.exports = require("child_process");

/***/ }),

/***/ 6982:
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ 4434:
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ 9896:
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ 8611:
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ 5692:
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ 9278:
/***/ ((module) => {

module.exports = require("net");

/***/ }),

/***/ 4589:
/***/ ((module) => {

module.exports = require("node:assert");

/***/ }),

/***/ 6698:
/***/ ((module) => {

module.exports = require("node:async_hooks");

/***/ }),

/***/ 4573:
/***/ ((module) => {

module.exports = require("node:buffer");

/***/ }),

/***/ 7540:
/***/ ((module) => {

module.exports = require("node:console");

/***/ }),

/***/ 7598:
/***/ ((module) => {

module.exports = require("node:crypto");

/***/ }),

/***/ 3053:
/***/ ((module) => {

module.exports = require("node:diagnostics_channel");

/***/ }),

/***/ 610:
/***/ ((module) => {

module.exports = require("node:dns");

/***/ }),

/***/ 8474:
/***/ ((module) => {

module.exports = require("node:events");

/***/ }),

/***/ 7067:
/***/ ((module) => {

module.exports = require("node:http");

/***/ }),

/***/ 2467:
/***/ ((module) => {

module.exports = require("node:http2");

/***/ }),

/***/ 7030:
/***/ ((module) => {

module.exports = require("node:net");

/***/ }),

/***/ 643:
/***/ ((module) => {

module.exports = require("node:perf_hooks");

/***/ }),

/***/ 1792:
/***/ ((module) => {

module.exports = require("node:querystring");

/***/ }),

/***/ 7075:
/***/ ((module) => {

module.exports = require("node:stream");

/***/ }),

/***/ 1692:
/***/ ((module) => {

module.exports = require("node:tls");

/***/ }),

/***/ 3136:
/***/ ((module) => {

module.exports = require("node:url");

/***/ }),

/***/ 7975:
/***/ ((module) => {

module.exports = require("node:util");

/***/ }),

/***/ 3429:
/***/ ((module) => {

module.exports = require("node:util/types");

/***/ }),

/***/ 5919:
/***/ ((module) => {

module.exports = require("node:worker_threads");

/***/ }),

/***/ 8522:
/***/ ((module) => {

module.exports = require("node:zlib");

/***/ }),

/***/ 857:
/***/ ((module) => {

module.exports = require("os");

/***/ }),

/***/ 6928:
/***/ ((module) => {

module.exports = require("path");

/***/ }),

/***/ 3193:
/***/ ((module) => {

module.exports = require("string_decoder");

/***/ }),

/***/ 3557:
/***/ ((module) => {

module.exports = require("timers");

/***/ }),

/***/ 4756:
/***/ ((module) => {

module.exports = require("tls");

/***/ }),

/***/ 9023:
/***/ ((module) => {

module.exports = require("util");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__nccwpck_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/create fake namespace object */
/******/ 	(() => {
/******/ 		var getProto = Object.getPrototypeOf ? (obj) => (Object.getPrototypeOf(obj)) : (obj) => (obj.__proto__);
/******/ 		var leafPrototypes;
/******/ 		// create a fake namespace object
/******/ 		// mode & 1: value is a module id, require it
/******/ 		// mode & 2: merge all properties of value into the ns
/******/ 		// mode & 4: return value when already ns object
/******/ 		// mode & 16: return value when it's Promise-like
/******/ 		// mode & 8|1: behave like require
/******/ 		__nccwpck_require__.t = function(value, mode) {
/******/ 			if(mode & 1) value = this(value);
/******/ 			if(mode & 8) return value;
/******/ 			if(typeof value === 'object' && value) {
/******/ 				if((mode & 4) && value.__esModule) return value;
/******/ 				if((mode & 16) && typeof value.then === 'function') return value;
/******/ 			}
/******/ 			var ns = Object.create(null);
/******/ 			__nccwpck_require__.r(ns);
/******/ 			var def = {};
/******/ 			leafPrototypes = leafPrototypes || [null, getProto({}), getProto([]), getProto(getProto)];
/******/ 			for(var current = mode & 2 && value; typeof current == 'object' && !~leafPrototypes.indexOf(current); current = getProto(current)) {
/******/ 				Object.getOwnPropertyNames(current).forEach((key) => (def[key] = () => (value[key])));
/******/ 			}
/******/ 			def['default'] = () => (value);
/******/ 			__nccwpck_require__.d(ns, def);
/******/ 			return ns;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__nccwpck_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__nccwpck_require__.o(definition, key) && !__nccwpck_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		__nccwpck_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__nccwpck_require__.e = (chunkId) => {
/******/ 			return Promise.all(Object.keys(__nccwpck_require__.f).reduce((promises, key) => {
/******/ 				__nccwpck_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks
/******/ 		__nccwpck_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".index.js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__nccwpck_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__nccwpck_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/******/ 	/* webpack/runtime/require chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded chunks
/******/ 		// "1" means "loaded", otherwise not loaded yet
/******/ 		var installedChunks = {
/******/ 			792: 1
/******/ 		};
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		var installChunk = (chunk) => {
/******/ 			var moreModules = chunk.modules, chunkIds = chunk.ids, runtime = chunk.runtime;
/******/ 			for(var moduleId in moreModules) {
/******/ 				if(__nccwpck_require__.o(moreModules, moduleId)) {
/******/ 					__nccwpck_require__.m[moduleId] = moreModules[moduleId];
/******/ 				}
/******/ 			}
/******/ 			if(runtime) runtime(__nccwpck_require__);
/******/ 			for(var i = 0; i < chunkIds.length; i++)
/******/ 				installedChunks[chunkIds[i]] = 1;
/******/ 		
/******/ 		};
/******/ 		
/******/ 		// require() chunk loading for javascript
/******/ 		__nccwpck_require__.f.require = (chunkId, promises) => {
/******/ 			// "1" is the signal for "already loaded"
/******/ 			if(!installedChunks[chunkId]) {
/******/ 				if(true) { // all chunks have JS
/******/ 					installChunk(require("./" + __nccwpck_require__.u(chunkId)));
/******/ 				} else installedChunks[chunkId] = 1;
/******/ 			}
/******/ 		};
/******/ 		
/******/ 		// no external install chunk
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it uses a non-standard name for the exports (exports).
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.run = run;
async function run() {
    const core = await Promise.all(/* import() */[__nccwpck_require__.e(119), __nccwpck_require__.e(421)]).then(__nccwpck_require__.bind(__nccwpck_require__, 6421));
    const github = await Promise.all(/* import() */[__nccwpck_require__.e(119), __nccwpck_require__.e(157)]).then(__nccwpck_require__.bind(__nccwpck_require__, 157));
    try {
        const repoToken = core.getInput('repo-token', { required: true });
        const issue = github.context.issue;
        core.setSecret(repoToken);
        const pickOneFromPersonsOrTeam = core.getBooleanInput('pick-one-from-persons-or-team', { required: false });
        if (issue == null || issue.number == null) {
            console.log('No pull request context, skipping');
            return;
        }
        // See https://octokit.github.io/rest.js/
        const client = github.getOctokit(repoToken);
        const includeDraft = core.getBooleanInput('include-draft', {
            required: false,
        });
        const pull = await client.rest.pulls.get({
            owner: issue.owner,
            repo: issue.repo,
            pull_number: issue.number,
        });
        // Skip DRAFT PRs
        if (pull.data.draft && !includeDraft) {
            console.log('Skipped: DRAFT Pull Request, not assigning PR.');
            return;
        }
        const skipWithNumberOfReviewers = Number(core.getInput('skip-with-manual-reviewers') || Number.MAX_VALUE);
        const numberOfReviewers = pull.data.requested_reviewers?.length || 0;
        if (numberOfReviewers >= skipWithNumberOfReviewers) {
            console.log('Skipped: Already ' +
                numberOfReviewers +
                ' assigned reviewers, not assigning PR.');
            return;
        }
        const prAuthor = pull.data.user?.login;
        const teams = core
            .getInput('teams')
            .split(',')
            .map((a) => a.trim())
            .filter((a) => a.length > 0);
        const persons = core
            .getInput('persons')
            .split(',')
            .map((a) => a.trim())
            .filter((a) => a.length > 0)
            // filter out PR creator
            .filter((user) => user !== prAuthor);
        if (teams.length === 0 && persons.length === 0) {
            console.log('No eligible reviewers: teams and persons are empty ' +
                '(PR author is excluded from persons)');
            return;
        }
        if (persons.length > 0) {
            console.log('Picking from: ' + persons);
            const reviewers = pickOneFromPersonsOrTeam
                ? [persons[Math.floor(Math.random() * persons.length)]]
                : persons;
            console.log('Adding person(s): ' + reviewers);
            const personResponse = await client.rest.pulls.requestReviewers({
                owner: issue.owner,
                repo: issue.repo,
                pull_number: issue.number,
                reviewers: reviewers,
            });
            console.log('Request Status:' +
                personResponse.status +
                ', Persons: ' +
                personResponse?.data?.requested_reviewers
                    ?.map((r) => r.login)
                    .join(','));
        }
        // Making sure that org is provided
        // if user turns on pick-one-from-persons-or-team
        // option and to use teams
        const org = core.getInput('org').trim();
        if (pickOneFromPersonsOrTeam && teams.length > 0 && !org) {
            core.setFailed("Please specify 'org' if you want to " +
                'pick one from persons or teams and use Teams');
            return;
        }
        if (teams.length > 0) {
            if (pickOneFromPersonsOrTeam) {
                // Picking out 1 person from first team listed
                console.log('Selecting from first team provided: ' + teams[0]);
                const members = await client.rest.teams.listMembersInOrg({
                    org: org,
                    team_slug: teams[0],
                });
                console.log('Request Status for getting team members:' + members.status);
                // filter out PR author
                const eligibleMembers = members.data
                    .filter((user) => user.login !== prAuthor)
                    .map((a) => a.login);
                console.log('Picking reviewer from eligible members:', eligibleMembers);
                if (eligibleMembers.length === 0) {
                    console.log('No eligible team members to assign');
                    return;
                }
                const person = [
                    eligibleMembers[Math.floor(Math.random() * eligibleMembers.length)],
                ];
                const personResponse = await client.rest.pulls.requestReviewers({
                    owner: issue.owner,
                    repo: issue.repo,
                    pull_number: issue.number,
                    reviewers: person,
                });
                console.log('Request Status:' +
                    personResponse.status +
                    ', Person from First Team: ' +
                    personResponse?.data?.requested_reviewers
                        ?.map((r) => r.login)
                        .join(','));
            }
            else {
                console.log('Adding teams: ' + teams);
                const teamResponse = await client.rest.pulls.requestReviewers({
                    owner: issue.owner,
                    repo: issue.repo,
                    pull_number: issue.number,
                    team_reviewers: teams,
                });
                console.log('Request Status:' +
                    teamResponse.status +
                    ', Teams: ' +
                    teamResponse?.data?.requested_teams?.map((t) => t.slug).join(','));
            }
        }
    }
    catch (error) {
        console.error(error);
        core.setFailed('Unknown error' + error);
        throw error;
    }
}
run();

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=index.js.map