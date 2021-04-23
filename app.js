let todoList = [];
const todoInputContainer = document.querySelector('.todo-input');
const todoInput = document.querySelector('#addTodoInput');
const addTodoButton = document.querySelector('#addTodo');
const todoExistsError = document.querySelector('#todoExistsError');
const todoInvalidError = document.querySelector('#todoInvalidError');
const todoContainer = document.querySelector('.sub-container.todo .todo-list');
const todoDoneContainer = document.querySelector('.sub-container.done .todo-list');

const todoInputVisible = visible => {
    if (visible) {
        todoInputContainer.classList.remove('hidden');
        todoInput.focus();
    } else {
        todoInputContainer.classList.add('hidden');
        todoInput.value = '';
    }
}

const saveTodo = title => {
    const newTodo = new TodoItem(title.trim());
    todoList.push(newTodo);
    todoInputVisible(false);
    displayTodo(newTodo);
    saveToLocalStorage();
}

const displayTodo = todoItem => {
    const container = todoItem.done ? todoDoneContainer : todoContainer;
    container.append(todoItem.done ? getTodoDoneMarkup(todoItem.title) : getTodoMarkup(todoItem.title));
}

const getTodoMarkup = title => {
    const div = document.createElement('div');
    div.classList.add('todo-item');
    div.innerHTML =
    `<div class="todo-item-title">${title}</div>
    <div class=" todo-item-icons">
        <i class="fas fa-pen" id="editTodo"></i>
        <i class="fas fa-trash-alt" id="deleteTodo"></i>
        <i class="fas fa-check-square done-icon" id="doneTodo"></i>
    </div>`
    addTodoItemEventListener(div);
    return div;
};

const getTodoDoneMarkup = title => {
    const div = document.createElement('div');
    div.classList.add('todo-item');
    div.innerHTML =
    `<div class="todo-item-title">${title}</div>
    <div class=" todo-item-icons">
        <i class="fas fa-trash-alt" id="deleteTodo"></i>
        <i class="fas fa-clipboard" id="undoneTodo"></i>
    </div>`
    return div;
}

const todoTitleValid = title => title.trim().length >= 2

const todoExists = title =>
    todoList.filter(todo => todo.title.toLowerCase() === title.toLowerCase()).length > 0

const validateTodo = title => {
    hideErrors();
    if (todoTitleValid(title)) {
        if (todoExists(title)) {
            todoExistsErrorVisible(true);
        } else {
            saveTodo(title);
        }
    } else {
        todoInvalidErrorVisible(true);
    }
}

const todoExistsErrorVisible = visible => {
    if (visible) {
        todoExistsError.classList.remove('hidden');
    } else {
        todoExistsError.classList.add('hidden');
    }
}

const todoInvalidErrorVisible = visible => {
    if (visible) {
        todoInvalidError.classList.remove('hidden');
    } else {
        todoInvalidError.classList.add('hidden');
    }
}

const hideErrors = () => {
    todoExistsErrorVisible(false);
    todoInvalidErrorVisible(false);
}

const saveToLocalStorage = () => window.localStorage.setItem('todoList', JSON.stringify(todoList));

const initFromStorage = () => {
    const storedData = window.localStorage.getItem('todoList');
    if (storedData) {
        todoList = JSON.parse(storedData).map(item => new TodoItem(item._title, item.done));
        todoList.forEach(todoItem => displayTodo(todoItem));
    }
}

const deleteTodo = title => {
    todoList = todoList.filter(item => item.title !== title);
    saveToLocalStorage();
}

const doneTodo = title => {
    const todo = todoList.find(item => item.title === title);
    todo.toggleStatus();
    displayTodo(todo);
    saveToLocalStorage();
}

function addTodoItemEventListener(todoItemElement) {
    const todoItemTitle = todoItemElement.childNodes[0].innerHTML;
    todoItemElement.addEventListener('click', function(event) {
        if (event.target.id === 'editTodo') {
            // TODO
        } else if (event.target.id === 'deleteTodo') {
            this.remove();
            deleteTodo(todoItemTitle);
        } else if (event.target.id === 'doneTodo') {
            this.remove();
            doneTodo(todoItemTitle);
        }
    })
}

document.addEventListener('DOMContentLoaded', function(){

    initFromStorage();

    addTodoButton.addEventListener('click', () => todoInputVisible(true));
    document
        .querySelectorAll('.sub-container.todo .todo-item')
        .forEach(todoItem => addTodoItemEventListener(todoItem));

    todoInput.addEventListener('keyup', event => {
        if (event.code === 'Escape') {
            todoInputVisible(false);
        } else if (event.code === 'Enter' || event.code === 'NumpadEnter') {
            validateTodo(todoInput.value);
        }
    });

});