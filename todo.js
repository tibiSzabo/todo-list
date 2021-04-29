class TodoItem {

    constructor(title, done = false, order = null) {
        this.title = title;
        this.done = done;
        this.order = order;
    }

    get title() { return this._title; }

    set title(newTitle) { this._title = newTitle; }

    get order() { return this._order; }

    set order(newORder) { this._order = newORder; }

    toggleStatus() { this.done = !this.done; }

}