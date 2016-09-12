/* @flow */

import ice from 'icepick';


/**
 * Atom holds a reference to a value. The reference can change,
 * but the value itself is assumed to be immutable.
 */
export class Atom<T> {
    value: T;

    constructor(value: T) {
        this.value = value;
    }
}

type PathElem = string | number;
type Path = Array<PathElem>;

/**
 * holds a path inside an atom along with some convenient functions
 */
export class Cursor<T> {
    atom: Atom<T>;
    path: Path

    constructor(value: Cursor<T> | Atom<T> | T, path: ?Path) {
        if (value instanceof Cursor) {
            this.atom = value.atom;
            this.path = (value.path || []).concat(path || []);
        } else if (value instanceof Atom) {
            this.atom = value;
            this.path = path || [];
        } else {
            this.atom = new Atom(value);
            this.path = path || [];
        }
    }

    get() {
        return ice.getIn(this.atom.value, this.path);
    }

    getIn(path: Path | PathElem, defaultValue?: any) {
        // const totalPath = path ? this.path.concat(path) : this.path;
        const res = ice.getIn(this.atom.value, this.path.concat(path));
        return res === undefined ? defaultValue : res;
    }

    $assoc(value: any) {
        this.atom.value = ice.assocIn(this.atom.value, this.path, value);
    }

    $assocIn(path: Path | PathElem, value: any) {
        this.atom.value = ice.assocIn(this.atom.value, this.path.concat(path), value);
    }

    $update(fn: Function) {
        ice.updateIn(this.atom.value, this.path, fn);
    }

    $updateIn(path: Path | PathElem, fn: Function) {
        ice.updateIn(this.atom.value, this.path.concat(path), fn);
    }

    $dissoc(key: PathElem) {
        this.$update(obj => ice.dissoc(obj, key));
    }

    $dissocIn(path: Path | PathElem, key: PathElem) {
        this.$updateIn(path, obj => ice.dissoc(obj, key));
    }
}

export default Atom;