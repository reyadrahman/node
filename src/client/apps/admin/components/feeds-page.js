/* @flow */

import Component from '../../../front-end-framework/component.js';
import type { AdminAppContext, AdminAppSubPageProps } from '../types.js';
import isEmpty from 'lodash/isEmpty';
import { leftPad, splitOmitWhitespace } from '../../../../misc/utils.js';
import * as actions from '../actions.js';
import pickBy from 'lodash/pickBy';

import '../less/feeds-page.less';

export default class FeedsPage extends Component<AdminAppContext, AdminAppSubPageProps> {
    newFeedSelectTypeButtonValue: string;
    newFeedErrorMessageTimeout: any;

    constructor(context: AdminAppContext, props: AdminAppSubPageProps) {
        super(context, props);
        this.newFeedSelectTypeButtonValue = 'twitter';
        this.newFeedErrorMessageTimeout = null;
    }

    componentDidMount() {
        super.componentDidMount();
        this.context.eventSystem.subscribe(() => this.rerender(),
            ['fetchedBots', 'selectedBot']);
        const self = this;
        $(document).on('click', '#new-feed-type-input-group a', function() {
            self.newFeedSelectTypeButtonValue = $(this).data('value');
            $('#new-feed-type-input-group').replaceWith(self.renderNewFeedTypeInputGroup());
            // return false;
        });

        $(document).on('click', '#new-feed-save-button', () => {
            this.saveNewFeed();
            return false;
        });
    }

    saveNewFeed() {
        const { selectedBotId } = this.context.stateCursor.get().currentUser;
        const feedName = $('#new-feed-name-input').val().trim();
        const categories = splitOmitWhitespace($('#new-feed-categories-input').val(), ',');
        const type = $('#new-feed-type-input-group button').data('value');
        const sourceInput = $('#new-feed-type-input-group input').val().trim();
        const publishHour = $('#new-feed-publish-hour-select').val();
        const twitterScreenName = type === 'twitter' && sourceInput.match(/@?(.*)/)[1];
        const rssUrl = type === 'rss' && sourceInput;
        const publishTimePattern = `* ${publishHour} * * *`;

        const newFeed = pickBy({
            feedName, categories, type, publishHour,
            twitterScreenName, rssUrl, publishTimePattern,
            feedId: '.', // feedId will be set by the server
        }, Boolean);

        if (feedName && type && sourceInput && publishHour &&
            (type === 'twitter' && twitterScreenName ||
             type === 'rss' && rssUrl))
        {
            console.log('FeedsPage saveNewFeed: ', newFeed);
            this.context.dispatchAction(actions.addBotFeed(selectedBotId, newFeed))
                .then(() => {
                    $('#add-new-feed-modal').modal('hide');
                    return this.context.dispatchAction(actions.fetchBots());
                })
                .catch(error => {
                    console.error('saveNewFeed failed: ', error);
                    this.newFeedShowErrorMessage(error.message);
                });
        } else {
            console.log('saveNewFeed something is missing: ', newFeed);
            this.newFeedShowErrorMessage('Please fill in all the required fields');
        }
    }

    newFeedShowErrorMessage(message: string) {
        const html = `
            <button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>
            ${message}
        `;
        $('#new-feed-error-message').html(html).removeClass('hidden')
        clearTimeout(this.newFeedErrorMessageTimeout);
        this.newFeedErrorMessageTimeout =
            setTimeout(() => $('#new-feed-error-message').addClass('hidden').html(''), 5000);
    }

    rerender() {
        console.log('rerenderFeedsTable');
        $('#feeds-page').replaceWith(this.render());
    }

    renderFeedsTable() {
        console.log('renderFeedsTable');
        const { botsState: { bots }, selectedBotId } = this.context.stateCursor.get().currentUser;
        console.log('renderFeedsTable bots: ', bots, ', selectedBotId: ', selectedBotId);
        const bot = bots.find(x => x.botId === selectedBotId);
        if (isEmpty(bot.feeds)) {
            return `<div class="feeds-table no-feeds-found">NO FEEDS FOUND</div>`;
        }

        const cronRegexp = /\* (\d+) \* \* \*/;
        const rows = bot.feeds.map(x => {
            let source;
            if (x.type === 'twitter') {
                source = `
                    <i class="fa fa-twitter"></i> <a href="https://twitter.com/${x.twitterScreenName}">@${x.twitterScreenName}</a>
                `;
            } else if (x.type === 'rss') {
                source = `<a href="${x.rssUrl}"><i class="fa fa-rss"></i> RSS</>`
            }
            const categories = x.categories ? x.categories.join(', ') : '';
            const at = leftPad(x.publishTimePattern.match(cronRegexp)[1], '0', 2) + ':00';
            return `
                <tr>
                    <td>${ x.feedName }</td>
                    <td>${ source }</td>
                    <td>${ categories }</td>
                    <td>${ at }</td>
                </tr>
            `;
        }).join('\n');
        return `
            <table class="table feeds-table">
                <thead>
                    <tr>
                        <th>Feed Name</th>
                        <th>Source</th>
                        <th>Categories</th>
                        <th>Scheduled every day at</th>
                    </tr>
                </thead>
                <tbody>
                    ${ rows }
                </tbody>
            </table>
        `;
    }

    renderNewFeedTypeInputGroup() {
        const value = this.newFeedSelectTypeButtonValue;
        let icon, placeholder;
        if (value === 'twitter') {
            icon = '<i class="fa fa-twitter"></i>';
            placeholder = '@ScreenName';
        } else {
            icon = '<i class="fa fa-rss"></i>';
            placeholder = 'https://example.com/rss';
        }
        return `
            <div class="input-group" id="new-feed-type-input-group">
                <div class="input-group-btn">
                    <button type="button" class="btn btn-default dropdown-toggle feed-type-button text-capitalize" data-value="${value}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        ${icon} ${value} <span class="caret"></span>
                    </button>
                    <ul class="dropdown-menu">
                        <li><a href="javascript:void(0)" data-value="twitter"><i class="fa fa-twitter"></i> Twitter</a></li>
                        <li><a href="javascript:void(0)" data-value="rss"><i class="fa fa-rss"></i> RSS</a></li>
                    </ul>
                </div>
                <input type="text" class="form-control" aria-label="..." placeholder="${placeholder}" />
            </div>
        `;
    }

    render() {
        const { className } = this.props;
        // const state = this.props.stateCursor.get();
        const wrap = x => `
            <div id="feeds-page" class="${className} page-wrapper">
                <div class="row">
                    <div class="col-lg-12">
                        <h1 class="page-header">Feeds</h1>
                    </div>
                </div>
                ${x}
            </div>
        `;

        const { botsState } = this.context.stateCursor.get().currentUser;
        if (!botsState.hasFetched) {
            return wrap(`
                <div class="wait">•••</div>
            `);
        }

        if (isEmpty(botsState.bots)) {
            return wrap(`
                <div class="please-add-a-bot">Please add a bot first</div>
            `);
        }

        return wrap(`
            <div class="panel panel-default active-feeds-panel">
                <div class="panel-heading">
                    Active Feeds
                </div>
                <!-- /.panel-heading -->
                <div class="panel-body">
                    <div class="table-responsive">
                        ${ this.renderFeedsTable() }
                    </div>
                </div>
                <!-- /.panel-body -->
            </div>
            <button
                id="add-feed-button" type="button" class="btn btn-outline btn-primary btn-lg"
                data-toggle="modal" data-target="#add-new-feed-modal"
            >
                <i class="fa fa-plus"></i> Create a new feed
            </button>
            <div class="modal fade" id="add-new-feed-modal" tabindex="-1" role="dialog" aria-labelledby="add-new-feed-modal-title">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                            <h4 class="modal-title" id="add-new-feed-modal-title">Create Feed</h4>
                        </div>
                        <div class="modal-body">
                            <form role="form">
                                <div class="form-group">
                                    <label>Feed Name <sup>*</sup></label>
                                    <input class="form-control" id="new-feed-name-input" />
                                </div>
                                <div class="form-group">
                                    <label>Categories</label>
                                    <input class="form-control" id="new-feed-categories-input" />
                                    <p class="help-block">You can enter multiple categories separated by comma</p>
                                </div>
                                <div class="form-group">
                                    <label>Source <sup>*</sup></label>
                                    ${ this.renderNewFeedTypeInputGroup() }
                                </div>

                                <div class="form-group">
                                    <label>Publish every day at:</label>
                                    <div class="publish-time-select">
                                        <select class="form-control" id="new-feed-publish-hour-select">
                                            <option value="0">00:00</option>
                                            <option value="1">01:00</option>
                                            <option value="2">02:00</option>
                                            <option value="3">03:00</option>
                                            <option value="4">04:00</option>
                                            <option value="5">05:00</option>
                                            <option value="6">06:00</option>
                                            <option value="7">07:00</option>
                                            <option value="8">08:00</option>
                                            <option value="9">09:00</option>
                                            <option value="10">10:00</option>
                                            <option value="11">11:00</option>
                                            <option value="12" selected>12:00</option>
                                            <option value="13">13:00</option>
                                            <option value="14">14:00</option>
                                            <option value="15">15:00</option>
                                            <option value="16">16:00</option>
                                            <option value="17">17:00</option>
                                            <option value="18">18:00</option>
                                            <option value="19">19:00</option>
                                            <option value="20">20:00</option>
                                            <option value="21">21:00</option>
                                            <option value="22">22:00</option>
                                            <option value="23">23:00</option>
                                        </select>
                                    </div>
                                </div>
                                <p class="help-block"><sup>*</sup> required fields</p>
                                <div class="alert alert-danger alert-dismissable hidden" id="new-feed-error-message">
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" id="new-feed-save-button">Save changes</button>
                        </div>
                    </div>
                </div>
            </div> 
            <!-- /.panel -->
        `);
    }
}
