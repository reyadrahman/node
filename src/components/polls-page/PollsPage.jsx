/* @flow */

import React from 'react';
import * as actions from '../../app-state/actions.js';
import {decomposeKeys} from '../../misc/utils.js';
import {connect} from 'react-redux';
import {withRouter, Link} from 'react-router';

import {Alert} from 'react-bootstrap';
import {Treebeard} from 'react-treebeard';

import _ from 'lodash';

let PollsPage = React.createClass({
    treebeardCss: {
        tree: {
            base: {
                listStyle:       'none',
                backgroundColor: 'none',
                margin:          0,
                padding:         0,
                color:           '#000000',
                fontFamily:      'lucida grande ,tahoma,verdana,arial,sans-serif',
                fontSize:        '14px'
            },
            node: {
                base:       {
                    position: 'relative'
                },
                link:       {
                    cursor:   'pointer',
                    position: 'relative',
                    padding:  '0px 5px',
                    display:  'block'
                },
                activeLink: {
                    background: 'none'
                },
                toggle:     {
                    base:    {
                        position:      'relative',
                        display:       'inline-block',
                        verticalAlign: 'top',
                        marginLeft:    '-5px',
                        height:        '24px',
                        width:         '24px'
                    },
                    wrapper: {
                        position: 'absolute',
                        top:      '50%',
                        left:     '50%',
                        margin:   '-7px 0 0 -7px',
                        height:   '14px'
                    },
                    height:  14,
                    width:   14,
                    arrow:   {
                        fill:        '#9DA5AB',
                        strokeWidth: 0
                    }
                },
                header:     {
                    base:      {
                        display:       'inline-block',
                        verticalAlign: 'top',
                        color:         '#000000'
                    },
                    connector: {
                        width:        '2px',
                        height:       '12px',
                        borderLeft:   'solid 2px black',
                        borderBottom: 'solid 2px black',
                        position:     'absolute',
                        top:          '0px',
                        left:         '-21px'
                    },
                    title:     {
                        lineHeight:    '24px',
                        verticalAlign: 'middle'
                    }
                },
                subtree:    {
                    listStyle:   'none',
                    paddingLeft: '19px'
                },
                loading:    {
                    color: '#E2C089'
                }
            }
        }
    },

    getInitialState() {
        return {
            loading:      true,
            error:        null,
            polls:        [],
            groupedPolls: {},
            treeData:     []
        };
    },

    async fetchPolls(){
        if (this.props.currentUser.selectedBotId) {
            try {
                this.setState(this.getInitialState());
                let polls = await this.props.fetchPolls(this.props.currentUser.selectedBotId);

                let groupedPolls = {};
                polls.forEach(poll => {
                    let [botId, pollId, questionId] = decomposeKeys(poll.botId_pollId_questionId);
                    if (!groupedPolls[pollId]) {
                        groupedPolls[pollId] = [];
                    }

                    poll = {...poll, pollId, questionId};
                    groupedPolls[pollId].push(poll);

                });

                let treeData = [];

                _.forEach(groupedPolls, (questions, pollId) => {
                    treeData.push({
                        name:     `poll "${pollId}"`,
                        children: questions.map(question => {
                            let answers = [];
                            _.forEach(question.aggregates, (votes, option) => {
                                answers.push({name: `${option}: ${votes}`});
                            });

                            return {
                                name:     `question "${question.questionId}"`,
                                children: answers
                            }
                        })
                    });
                });

                this.setState({polls, groupedPolls, treeData});
            } catch (e) {
                this.setState({error: e.message});
            } finally {
                this.setState({loading: false});
            }
        }
    },

    componentDidMount(){
        if (!this.props.currentUser.signedIn) {return false;}

        this.fetchPolls();
    },

    componentDidUpdate(oldProps){
        if (!this.props.currentUser.signedIn) {return false;}

        if (oldProps.currentUser.selectedBotId !== this.props.currentUser.selectedBotId) {
            this.fetchPolls();
        }
    },

    onToggle(node, toggled){
        if (this.state.cursor) {this.state.cursor.active = false;}
        node.active = true;
        if (node.children) { node.toggled = toggled; }
        this.setState({cursor: node});
    },

    render() {
        let content;

        if (this.state.treeData.length) {
            content = (
                <Treebeard
                    data={this.state.treeData}
                    onToggle={this.onToggle}
                    style={this.treebeardCss}
                />
            );
        } else {
            if (this.state.loading) {
                content = <div className="spinner"><i className="icon-spinner animate-spin"/></div>;
            } else if (this.state.error) {
                content = <Alert bsStyle="danger">{this.state.error}</Alert>;
            } else {
                content = 'No polls were found for this bot';
            }
        }

        return (
            <div className={`polls-page-comp ${this.props.className}`}>
                <div className="panel">
                    <div className="panel-heading">
                        <h1>Polls</h1>
                    </div>

                    <div className="panel-body">
                        {content}
                    </div>
                </div>
            </div>
        );
    }
});

PollsPage = connect(
    state => ({
        currentUser: state.currentUser,
    }),
    {
        fetchPolls: actions.fetchPolls,
    }
)(PollsPage);

PollsPage = withRouter(PollsPage);

export default PollsPage;
