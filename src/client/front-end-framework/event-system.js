/* @flow */

import uniq from 'lodash/uniq';
import flatMap from 'lodash/flatMap';


/*
    TODO
    Allow components to subscribe to their stateAtom's path
*/

export default class EventSystem {
    _subs: {[key: string]: { fn: Function, events: string[]}};
    _event2SubIds: {[key: string]: Set<string>};
    _idCounter: number;

    constructor() {
        this._idCounter = 1;
        this._subs = {};
        this._event2SubIds = {};
    }

    /**
     * Pass '*' as events to subscribe to all events.
     * If events is omitted, it will default to '*'
     */
    subscribe(fn: Function, eventOrEvents?: string | string[] = '*'): string {
        const events = Array.isArray(eventOrEvents) ? eventOrEvents : [eventOrEvents];

        const id = String(this._idCounter++);
        this._subs[id] = { fn, events };
        events.forEach(x => {
            const set = this._event2SubIds[x] || (this._event2SubIds[x] = new Set());
            set.add(id);
        });
        return id;
    }

    unsubscribe(id: string) {
        const sub = this._subs[id];
        if (!sub) return;

        delete this._subs[id];
        sub.events.forEach(e => {
            this._event2SubIds[e].delete(id);
        });
    }

    publish(eventOrEvents: string | string[], eventData: any) {
        console.log('EventSystem publish: eventData: ', eventData, ', eventOrEvents: ', eventOrEvents);
        const events = Array.isArray(eventOrEvents) ? eventOrEvents : [eventOrEvents];

        const idsDup = flatMap(events,
            e => [ ...(this._event2SubIds[e] || []) ]
        ) || [];
        const wildCardSubIds = this._event2SubIds['*'] || [];
        const ids = uniq([ ...idsDup, ...wildCardSubIds ]);

        console.log('EventSystem publish: unique ids: ', ids);
        console.log('EventSystem publish: _subs: ', this._subs);
        ids.forEach(id => {
            this._subs[id].fn(eventData, events);
        });
    }
}

