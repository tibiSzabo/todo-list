export class TodoItem {

    constructor(title) {
        this.title = title;
        this.done = false;
    }

    get title() { return this.title; }

    set title(newTitle) { this.title = newTitle; }

    toggleStatus() { this.done = !this.done; }

}