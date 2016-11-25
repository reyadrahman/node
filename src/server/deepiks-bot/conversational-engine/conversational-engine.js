/* @flow */

import type { DBMessage, ResponseMessage, BotAIData } from '../../../misc/types.js';
import { CONSTANTS, request } from '../../server-utils.js';
import { inspect } from 'util';
import _ from 'lodash';
const reportDebug = require('debug')('deepiks:conversational-engine');
const reportError = require('debug')('deepiks:conversational-engine:error');

type ConverseData_ =
    | { type: 'error' }
    | { type: 'stop' }
    | { type: 'stuck' }
    | { type: 'msg', msg: ResponseMessage }
    | { type: 'action', action: string };

// TODO fix flow type
export type ConverseData = { session: Object } & ConverseData_;

function collectBookmarks(stories: Object) {
    let path = [];
    let bookmarks = {};

    handleStories();

    function handleOpBookmark(op) {
        bookmarks[op.bookmark] = path.slice();
    }

    function handleOpBranches(op) {
        op.branches.forEach((branch, i) => {
            path.push(i);

            path.push(0);
            branch.operations && handleOps(branch.operations);
            path.pop();

            path.push(1);
            branch.turns && handleTurns(branch.turns);
            path.pop();

            path.pop();
        });
    }

    function handleOps(ops) {
        ops.forEach((op, i) => {
            let handler;
            if (op.branches) {
                handler = handleOpBranches;
            } else if (op.bookmark) {
                handler = handleOpBookmark;
            }

            path.push(i);
            handler && handler(op);
            path.pop();
        });
    }

    function handleTurnUser(turn) {
        handleOps(turn.operations);
    }

    function handleTurnBranches(turn) {
        turn.branches.forEach((branch, i) => {
            path.push(i);
            handleTurns(branch);
            path.pop();
        });
    }

    function handleTurns(turns) {
        turns.forEach((turn, i) => {
            const handler = turn.user === undefined ? handleTurnBranches : handleTurnUser;
            path.push(i);
            handler(turn);
            path.pop();
        });

    }

    function handleStories() {
        stories.forEach((x, i) => {
            path.push(i);
            handleTurns(x.turns);
            path.pop();
        });
    }

    reportDebug('collectBookmarks: ', insp(bookmarks));
    return bookmarks;
}


async function matchUserInput(userInput, botAIData, language, userTurnsAndPaths = []) {
    const { stories, expressions } = botAIData;
    const r = await request({
        // TODO
        uri: 'http://nlp-intent-dev.eu-west-1.elasticbeanstalk.com/',
        // uri: 'http://localhost:5000/',
        method: 'POST',
        json: {
            query: userInput,
            stories: stories,
            expressions: expressions,
            language: language || 'en',
        }
    });
    if (r.statusCode !== 200) {
        throw new Error(`matchUserInput failed with code ${r.statusCode}, msg ` +
            `${r.statusMessage} and body: ${r.body}`);
    }

    const allMatches = r.body;
    reportDebug('matchUserInput got: ', allMatches);

    const LOWER_THRESHOLD = 0.6;

    const findMatchesForUserTurn = (userTurn, pCoefficient = 1) => {
        const matches = [];

        const exprInd = expressions.findIndex(e => e.text === userTurn.user)
        const exactMatch = allMatches.find(x => x[0] === exprInd);
        if (exactMatch) {
            matches.push({
                p: exactMatch[1] * pCoefficient,
                expression: expressions[exprInd],
            });
        }

        const userTurnIntent = (userTurn.entities || [])
            .filter(x => x.entity === 'intent')
            .map(x => x.value)
            [0];

        if (userTurnIntent) {
            for (let m of allMatches) {
                const expression = expressions[m[0]];
                const hasTheIntent = (expression.entities || [])
                    .find(x => x.entity === 'intent' && x.value === userTurnIntent);
                if (hasTheIntent) {
                    matches.push({
                        p: m[1] * pCoefficient,
                        expression,
                    });
                }
            }
        }

        matches.sort((a,b) => b.p - a.p);
        return matches;
    };

    const allTurnMatches = [
        ...userTurnsAndPaths.map(utp => ({
            userTurn: utp.userTurn,
            path: utp.path,
            matches: findMatchesForUserTurn(utp.userTurn, 1.4),
        })),
        ...stories.map((s, i) => ({
            userTurn: s.turns[0],
            path: [i, 0],
            matches: findMatchesForUserTurn(s.turns[0])
        })),
    ];
    reportDebug('matchUserInput allTurnMatches:', insp(allTurnMatches));

    const flatMatches = _.flatMap(allTurnMatches,
        t => t.matches.map(m => ({
            p: m.p,
            expression: m.expression,
            path: t.path,
            userTurn: t.userTurn,
        }))
    );
    flatMatches.sort((a,b) => b.p - a.p);
    reportDebug('matchUserInput flatMatches:', insp(flatMatches));

    if (flatMatches[0].p > LOWER_THRESHOLD) {
        return flatMatches[0];
    }

    return null;


    // const userTurnExprMatches = userTurnsAndPaths
    //     .map((utp, i) => {
    //         const exprInd = expressions.findIndex(x => x.text === utp.userTurn.user)
    //         const m = matches.find(x => x[0] === exprInd);
    //         return [i, exprInd, m ? m[1] : -1];
    //     })
    //     .sort((a, b) => b[2] - a[2]);
    // const storyExprMatches = stories
    //     .map((s, i) => {
    //         const exprInd = expressions.findIndex(x => x.text === s.turns[0].user)
    //         const m = matches.find(x => x[0] === exprInd);
    //         return [i, exprInd, m ? m[1] : -1];
    //     })
    //     .sort((a, b) => b[2] - a[2]);
    // reportDebug('matchUserInput userTurnsMatches: ', userTurnExprMatches);
    // reportDebug('matchUserInput storiesExpInds: ', storyExprMatches);
    //
    // const LOWER_THRESHOLD = 0.5;
    //
    // const s02 = storyExprMatches[0][2];
    // const u02 = userTurnExprMatches.length ? userTurnExprMatches[0][2] : -1;
    // if ((!userTurnExprMatches.length || s02 > u02 * 1.4) && s02 > LOWER_THRESHOLD) {
    //     return {
    //         path: [storyExprMatches[0][0], 0],
    //         userTurn: stories[storyExprMatches[0][0]].turns[0],
    //     };
    // }
    //
    // if (userTurnExprMatches.length && u02 > LOWER_THRESHOLD) {
    //     return userTurnsAndPaths[userTurnExprMatches[0][0]];
    // }
    //
    // return null;
}

export async function converse(
    userInput: ?string, session: Object, context: Object,
    botAIData: BotAIData, language: string
) : ConverseData {

    const { stories, actions } = botAIData;
    const bookmarks = collectBookmarks(stories);
    let initPath = (session.path || []).slice();
    let initLeafIsExpectingUserInput = session.leafIsExpectingUserInput;
    let leafIsExpectingUserInput = false;
    let ret: ConverseData_ = { type: 'stop' };
    let path = [];

    await handleStories();

    async function handleOpAction(op, initializing) {
        if (initializing) {
            return false;
        }
        const actionDesc = actions.find(x => x.id === op.action);
        reportDebug('converse handleOpAction op: ', op);
        reportDebug('converse handleOpAction actionDesc: ', actionDesc);
        if (!actionDesc) {
            throw new Error('converse handleOpAction did not find op in actions.json');
        }
        if (actionDesc.type === 'template') {
            ret = {
                type: 'msg',
                msg: {
                    text: actionDesc.template,
                }
            };
            if (actionDesc && actionDesc.quickreplies) {
                ret.msg.actions = actionDesc.quickreplies.map(x => ({
                    text: x,
                    fallback: x,
                }));
            }
        } else if (actionDesc.type === 'function') {
            ret = {
                type: 'action',
                action: actionDesc.name,
            };
        } else {
            throw new Error('converse handleOpAction unknown action type');
        }
        return true;
    }

    async function handleOpBranches(op) {
        reportDebug('handleOpBranches branches', insp(op));
        reportDebug('handleOpBranches stack', insp(path));
        reportDebug('handleOpBranches initPath', insp(initPath));
        let branchIndex = initPath.shift();
        if (branchIndex === undefined) {
            const branchesPs = op.branches.map(b => b.predicates);
            branchIndex = branchesPs.findIndex(
                ps => ps.every(p => context[p.name] || p.negative)
            );

            if (branchIndex === -1) {
                reportError('handleOpBranches: no branch matched. ',
                    'branch predicates: ', branchesPs, ', context: ', context);
                ret = {
                    type: 'error',
                    errorMsg: 'context did not match any branch',
                };
                return true;
            }
        }
        const branch = op.branches[branchIndex];

        let i = initPath.shift() || 0;
        const handlers = [handleOps, handleTurns];
        const keys = ['operations', 'turns'];
        path.push(branchIndex);
        for (;i<2; i++) {
            const key = keys[i];
            path.push(i);
            if (branch[key] && await handlers[i](branch[key])) return true;
            path.pop();
        }
        path.pop();
        return false;
    }

    async function handleOpJump(op) {
        const bookmarkPath = bookmarks[op.jump];
        if (!bookmarkPath) {
            ret = {
                type: 'error',
                errorMsg: `Unknown bookmark ${op.jump}`,
            };
            return true;
        }
        initLeafIsExpectingUserInput = false;
        leafIsExpectingUserInput = false;
        initPath = bookmarkPath;
        path = [];
        userInput = null;
        await handleStories();
        return true;
    }

    async function handleOps(ops) {
        reportDebug('handleOps ops', insp(ops));
        reportDebug('handleOps path', insp(path));
        reportDebug('handleOps initPath', insp(initPath));
        let opIndex = initPath.shift();
        let initializing = opIndex !== undefined;
        if (opIndex === undefined) {
            opIndex = 0;
        }
        for (; opIndex<ops.length; opIndex++) {
            reportDebug('opIndex ', opIndex);
            const op = ops[opIndex];
            let handler;
            if (op.action) {
                handler = handleOpAction;
            } else if (op.branches) {
                handler = handleOpBranches;
            } else if (op.jump) {
                handler = handleOpJump;
            } else if (op.bookmark) {
                // do nothing
            } else {
                reportError('handleOps unknown operation: ', op);
            }

            path.push(opIndex);
            if (handler && await handler(ops[opIndex], initializing)) return true;
            path.pop();
            initializing = false;
        }
        reportDebug('handleOps returning false');
        return false;
    }

    async function handleTurnUser(turn) {
        reportDebug('handleTurnUser turn:', insp(turn));
        reportDebug('handleTurnUser path:', insp(path));
        reportDebug('handleTurnUser initPath:', insp(initPath));
        if (!initPath.length) {
            if (userInput) {
                const x = await matchUserInput(userInput, botAIData, language, [
                    { userTurn: turn, path }
                ]);
                userInput = null;
                if (!x) {
                    ret = {
                        type: 'stuck',
                    };
                    leafIsExpectingUserInput = true;
                    return true;
                }
                path = x.path;
                return await handleOps(x.userTurn.operations);
            }
            leafIsExpectingUserInput = true;
            reportDebug('handleTurnUser returning true');
            return true;
        }
        return await handleOps(turn.operations);
    }

    async function handleTurnBranches(turn) {
        reportDebug('handleTurnBranches turn:', insp(turn));
        reportDebug('handleTurnBranches path:', insp(path));
        reportDebug('handleTurnBranches initPath:', insp(initPath));
        let branchIndex = initPath.shift();
        if (branchIndex === undefined) {
            if (userInput) {
                const x = await matchUserInput(userInput, botAIData, language, turn.branches.map(
                    (y, i) => ({ userTurn: y[0], path: [...path, i, 0] })
                ));
                userInput = null;
                if (!x) {
                    ret = {
                        type: 'stuck',
                    };
                    leafIsExpectingUserInput = true;
                    return true;
                }
                path = x.path;
                return await handleOps(x.userTurn.operations);
            }
            leafIsExpectingUserInput = true;
            ret = { type: 'stop' };
            return true;
        }
        path.push(branchIndex);
        if (await handleTurns(turn.branches[branchIndex])) return true;
        path.pop();
    }

    async function handleTurns(turns) {
        reportDebug('handleTurns turns', insp(turns));
        reportDebug('handleTurns path', insp(path));
        reportDebug('handleTurns initPath:', insp(initPath));
        let turnIndex = initPath.shift() || 0;
        for (; turnIndex<turns.length; turnIndex++) {
            const turn = turns[turnIndex];
            const handler = turn.user === undefined ? handleTurnBranches : handleTurnUser;
            path.push(turnIndex);
            if (await handler(turn)) return true;
            path.pop();
        }
        reportDebug('handleTurns returning false');
        return false;
    }

    async function handleStories() {
        reportDebug('handleStories');
        reportDebug('handleStories initPath:', insp(initPath));
        if (userInput && (initPath.length === 0 || !initLeafIsExpectingUserInput)) {
            // cold start
            const userTurnAndPath = await matchUserInput(userInput, botAIData, language);
            if (!userTurnAndPath) {
                ret = {
                    type: 'stuck',
                };
                leafIsExpectingUserInput = initLeafIsExpectingUserInput;
                return true;
            }

            initPath = [];
            path = userTurnAndPath.path;
            userInput = null;
            return await handleOps(userTurnAndPath.userTurn.operations);
        }
        if (initPath.length === 0) {
            // nothing to do
            return false;
        }

        const storyIndex: number = initPath.shift();
        path = [storyIndex];
        if (await handleTurns(stories[storyIndex].turns)) return true;
        path.pop();
        reportDebug('handleStories returning false');
        return false;
    }

    const returnValue: ConverseData = {
        ...ret,
        session: {
            path,
            leafIsExpectingUserInput,
        },
    };
    reportDebug('converse returning ', insp(returnValue));

    return returnValue;
}

export function learnFromHumanTransfer(
    responseText: string, originalMessage: DBMessage, session: Object,
    botAIData: BotAIData, expectsReply: boolean
) {
    reportDebug('learnFromHumanTransfer');
    let initPath = (session.path || []).slice();
    let leafIsExpectingUserInput = false;
    let path = [];
    // TODO instead of cloneDeep use icepick for manipulating immutable data structures
    const { stories, actions, expressions } = _.cloneDeep(botAIData);

    const createPlaceholderTurn = () => ({
        user: '',
        placeholder: true,
        entities: [],
        operations: [],
    });

    const learnedTurn = {
        user: originalMessage.text,
        entities: [],
        operations: [
            {
                action: `template-${responseText}`,
            }
        ],
    };

    const learnedAction = {
        id : `template-${responseText}`,
        type : 'template',
        template : responseText,
    };
    if (!actions.find(x => x.id === learnedAction.id)) {
        actions.push(learnedAction);
    }

    const learnedExpression = {
        text: originalMessage.text,
    };
    if (!expressions.find(x => x.text === learnedExpression.text)) {
        expressions.push(learnedExpression);
    }

    if (initPath.length > 0 && !session.leafIsExpectingUserInput) {
        throw new Error('learnFromHumanTransfer requires session.leafIsExpectingUserInput');
    }

    handleStories();

    function handleOpBranches(op) {
        reportDebug('handleOpBranches branches', insp(op));
        reportDebug('handleOpBranches stack', insp(path));
        reportDebug('handleOpBranches initPath', insp(initPath));
        let branchIndex = initPath.shift();
        const branch = op.branches[branchIndex];
        let i = initPath.shift();
        const handlers = [handleOps, handleTurns];
        const key = ['operations', 'turns'][i];
        path.push(branchIndex);
        path.push(i);
        handlers[i](branch[key]);
    }

    function handleOps(ops) {
        reportDebug('handleOps ops', insp(ops));
        reportDebug('handleOps path', insp(path));
        reportDebug('handleOps initPath', insp(initPath));
        let opIndex = initPath.shift();
        const op = ops[initPath.shift()];
        if (!op.branches) {
            throw new Error('learnFromHumanTransfer handleOps requires op.branches');
        }
        path.push(opIndex);
        handleOpBranches(ops[opIndex]);
    }

    function handleTurnUser(turn, turnIndex, turns) {
        reportDebug('handleTurnUser turn:', insp(turn));
        reportDebug('handleTurnUser path:', insp(path));
        reportDebug('handleTurnUser initPath:', insp(initPath));
        if (initPath.length) {
            return handleOps(turn.operations);
        }

        if (turn.placeholder) {
            turns[turnIndex] = learnedTurn;

            if (expectsReply) {
                turns.push(createPlaceholderTurn());
                path.splice(path.length-1, 1, turns.length-1);
                leafIsExpectingUserInput = true;
            } else {
                path = [];
            }

            return;
        }

        const restTurns = turns.splice(turnIndex);

        const newBranch = [
            learnedTurn
        ];

        if (expectsReply) {
            newBranch.push(createPlaceholderTurn());
            path.push(1);
            path.push(1);
            leafIsExpectingUserInput = true;

        } else {
            path = [];
        }

        turns.push({
            branches: [
                restTurns,
                newBranch,
            ],
        });

    }

    function handleTurnBranches(turn) {
        reportDebug('handleTurnBranches turn:', insp(turn));
        reportDebug('handleTurnBranches path:', insp(path));
        reportDebug('handleTurnBranches initPath:', insp(initPath));
        let branchIndex = initPath.shift();
        if (branchIndex !== undefined) {
            path.push(branchIndex);
            return handleTurns(turn.branches[branchIndex]);
        }

        const newBranch = [];
        turn.branches.push(newBranch);

        newBranch.push(learnedTurn);

        if (expectsReply) {
            newBranch.push(createPlaceholderTurn());
            path.push(turn.branches.length-1);
            path.push(1);
            leafIsExpectingUserInput = true;
        } else {
            path = [];
        }
    }

    function handleTurns(turns) {
        reportDebug('handleTurns turns', insp(turns));
        reportDebug('handleTurns path', insp(path));
        reportDebug('handleTurns initPath:', insp(initPath));
        let turnIndex = initPath.shift();
        const turn = turns[turnIndex];
        const handler = turn.user === undefined ? handleTurnBranches : handleTurnUser;
        path.push(turnIndex);
        handler(turn, turnIndex, turns);
    }

    function handleStories() {
        reportDebug('handleStories');
        reportDebug('handleStories initPath:', insp(initPath));
        if (initPath.length) {
            const storyIndex: number = initPath.shift();
            path = [storyIndex];
            return handleTurns(stories[storyIndex].turns);
        }

        const newTurns = [
            learnedTurn,
        ];
        if (expectsReply) {
            newTurns.push(createPlaceholderTurn());
            path = [stories.length, 1];
            leafIsExpectingUserInput = true;
        } else {
            path = [];
        }

        stories.push({
            name: '', // TODO pick an appropriate name
            turns: newTurns
        });
    }

    return {
        stories,
        actions,
        expressions,
        session: {
            path,
            leafIsExpectingUserInput
        }
    };
}

function insp(x) {
    return inspect(x, { depth: null });
}

// for testing
export {
    converse as _converse,
    collectBookmarks as _collectBookmarks,
    learnFromHumanTransfer as _learnFromHumanTransfer,
};


