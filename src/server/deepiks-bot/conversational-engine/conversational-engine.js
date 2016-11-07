/* @flow */

import * as aws from '../../../aws/aws.js';
import { CONSTANTS } from '../../server-utils.js';
import type { DBMessage, BotParams, UserPrefs,
              Conversation, ResponseMessage } from '../../../misc/types.js';
import { inspect } from 'util';
import unzip from 'unzip';
import streamifier from 'streamifier';
const reportDebug = require('debug')('deepiks:conversational-engine');
const reportError = require('debug')('deepiks:conversational-engine:error');

export async function converse(
    text: ?string, userPrefs: UserPrefs, session: Object,
    context: Object, botParams: BotParams
) {
    const stories = await getStoriesFromS3(botParams);
    reportDebug('converse stories: ', stories);
    if (!stories) {
        throw new Error('no stories found');
    }

    const bookmarks = collectBookmarks(stories);
    return converseHelper(text, session, context, stories, bookmarks);
}

// TODO cache stories
async function getStoriesFromS3(botParams) {
    const { publisherId, botId } = botParams;
    const res = await aws.s3GetObject({
        Bucket: CONSTANTS.S3_BUCKET_NAME,
        Key: `${publisherId}/${botId}/bot.zip`,
    });
    if (!res) return null;

    const stories = await getStoriesFromZipBuffer(res.Body);
    reportDebug('getStoriesFromS3 stories: ', stories);
    return stories.data;
}

function getStoriesFromZipBuffer(buffer: Buffer): Promise<any> {
    return new Promise((resolve, reject) => {
        let content = '';
        const readStream = streamifier.createReadStream(buffer);
        readStream.pipe(unzip.Parse())
            .on('entry', entry => {
                reportDebug('entry.path: ', entry.path);
                if (entry.path === 'stories.json') {
                    reportDebug('got stories.json entry');
                    entry
                        .on('data', buf => {
                            reportDebug('entry on data');
                            content += buf.toString();
                        })
                        .on('end', () => {
                            reportDebug('entry on end');
                            let parsed;
                            try {
                                parsed = JSON.parse(content);
                            } catch(error) {
                                return reject(new Error('error while parsing stories', error));
                            }
                            resolve(parsed);
                        })
                        .on('error', error => {
                            reportDebug('entry on error ', error);
                            reject(error);
                        });
                } else {
                    entry.autodrain();
                }
            })
            .on('end', () => {
                if (content) return;
                reject(new Error(`coudn't read and extract stories.json from zip file`));
            })
            .on('error', error => {
                reportDebug('readStream on error ', error);
                reject(error);
            });

    });
}

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
            const handler = turn.user ? handleTurnUser : handleTurnBranches;
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


function matchUserInput(userInput, stories, userTurnsAndPaths) {
    userInput = userInput.trim().toLowerCase();
    if (userTurnsAndPaths) {
        const userTurnIndex = userTurnsAndPaths.findIndex(
            x => userInput === x.userTurn.user.trim().toLowerCase()
        );
        if (userTurnIndex >= 0) {
            return userTurnsAndPaths[userTurnIndex];
        }
    }
    const storyIndex: number = stories.findIndex(
        x => userInput === x.turns[0].user.trim().toLowerCase()
    );

    if (storyIndex >= 0) {
        return {
            path: [storyIndex, 0],
            userTurn: stories[storyIndex].turns[0],
        };
    }

    return userTurnsAndPaths && userTurnsAndPaths[0];
}

function converseHelper(
    userInput: ?string, session: Object, context: Object,
    stories: Object, bookmarks: Object
) {
    let initPath = (session.path || []).slice();
    let initLeafIsExpectingUserInput = session.leafIsExpectingUserInput;
    let leafIsExpectingUserInput = false;
    let ret = { type: 'stop' };
    let path = [];

    handleStories();

    function handleOpTemplate(op, initializing) {
        if (initializing) {
            return false;
        }
        ret = {
            type: 'msg',
            msg: {
                text: op.action.substr('template-'.length),
            }
        };
        return true;
    }

    function handleOpFunction(op, initializing) {
        if (initializing) {
            return false;
        }
        ret = {
            type: 'action',
            action: op.action.substr('function-'.length),
        };
        return true;
    }

    function handleOpBranches(op) {
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
            if (branch[key] && handlers[i](branch[key])) return true;
            path.pop();
        }
        path.pop();
        return false;
    }

    function handleOpJump(op) {
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
        handleStories();
        return true;
    }

    function handleOps(ops) {
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
            if (op.action && op.action.startsWith('template-')) {
                handler = handleOpTemplate;
            } else if (op.action && op.action.startsWith('function-')) {
                handler = handleOpFunction;
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
            if (handler && handler(ops[opIndex], initializing)) return true;
            path.pop();
            initializing = false;
        }
        reportDebug('handleOps returning false');
        return false;
    }

    function handleTurnUser(turn) {
        reportDebug('handleTurnUser turn:', insp(turn));
        reportDebug('handleTurnUser path:', insp(path));
        reportDebug('handleTurnUser initPath:', insp(initPath));
        if (!initPath.length) {
            if (userInput) {
                const x = matchUserInput(userInput, stories, [
                    { userTurn: turn, path }
                ]);
                userInput = null;
                if (!x) {
                    ret = {
                        type: 'error',
                        errorMsg: `handleTurnUser: user input didn't match`,
                    };
                    return true;
                }
                path = x.path;
                return handleOps(x.userTurn.operations);
            }
            leafIsExpectingUserInput = true;
            reportDebug('handleTurnUser returning true');
            return true;
        }
        return handleOps(turn.operations);
    }

    function handleTurnBranches(turn) {
        reportDebug('handleTurnBranches turn:', insp(turn));
        reportDebug('handleTurnBranches path:', insp(path));
        reportDebug('handleTurnBranches initPath:', insp(initPath));
        let branchIndex = initPath.shift();
        if (branchIndex === undefined) {
            if (userInput) {
                const x = matchUserInput(userInput, stories, turn.branches.map(
                    (y, i) => ({ userTurn: y[0], path: [...path, i, 0] })
                ));
                userInput = null;
                if (!x) {
                    ret = {
                        type: 'error',
                        errorMsg: `handleTurnBranches: user input didn't match any branch`,
                    };
                    return true;
                }
                path = x.path;
                return handleOps(x.userTurn.operations);
            }
            leafIsExpectingUserInput = true;
            ret = { type: 'stop' };
            return true;
        }
        path.push(branchIndex);
        if (handleTurns(turn.branches[branchIndex])) return true;
        path.pop();
    }

    function handleTurns(turns) {
        reportDebug('handleTurns turns', insp(turns));
        reportDebug('handleTurns path', insp(path));
        reportDebug('handleTurns initPath:', insp(initPath));
        let turnIndex = initPath.shift() || 0;
        for (; turnIndex<turns.length; turnIndex++) {
            const turn = turns[turnIndex];
            const handler = turn.user ? handleTurnUser : handleTurnBranches;
            path.push(turnIndex);
            if (handler(turn)) return true;
            path.pop();
        }
        reportDebug('handleTurns returning false');
        return false;
    }

    function handleStories() {
        reportDebug('handleStories');
        reportDebug('handleStories initPath:', insp(initPath));
        if (userInput && (initPath.length === 0 || !initLeafIsExpectingUserInput)) {
            // cold start
            const userTurnAndPath = matchUserInput(userInput, stories);
            if (!userTurnAndPath) {
                ret = {
                    type: 'error',
                    errorMsg: `didn't understand user`,
                };
                return true;
            }

            initPath = [];
            path = userTurnAndPath.path;
            userInput = null;
            return handleOps(userTurnAndPath.userTurn.operations);
        }
        if (initPath.length === 0) {
            // nothing to do
            return false;
        }

        const storyIndex: number = initPath.shift();
        path = [storyIndex];
        if (handleTurns(stories[storyIndex].turns)) return true;
        path.pop();
        reportDebug('handleStories returning false');
        return false;
    }

    const returnValue = {
        ...ret,
        session: {
            path,
            leafIsExpectingUserInput,
        },
    };
    reportDebug('converseHelper returning ', insp(returnValue));

    return returnValue;
}

function insp(x) {
    return inspect(x, { depth: null });
}

// for testing
export {
    converseHelper as _converseHelper,
    collectBookmarks as _collectBookmarks,
    getStoriesFromZipBuffer as _getStoriesFromZipBuffer
};


