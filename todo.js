class TodoItem {

    constructor(title, done = false) {
        this.title = title;
        this.done = done;
    }

    get title() { return this._title; }

    set title(newTitle) { this._title = newTitle; }

    toggleStatus() { this.done = !this.done; }

}