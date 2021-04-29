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

const addTodo = newTodo => {
    if (!newTodo.order) {
        newTodo.order = getHighestOrder(todoContainer) + 1;
    }
    todoList.forEach(todo => {
        if (todo.order >= newTodo.order) {
            todo.order++;
        }
    });
    todoList.push(newTodo);
    todoInputVisible(false);
    displayTodo(newTodo);
    orderTodosView();
    saveToLocalStorage();
}

const displayTodo = todoItem => {
    const container = todoItem.done ? todoDoneContainer : todoContainer;
    container.append(todoItem.done ? getTodoDoneMarkup(todoItem) : getTodoMarkup(todoItem));
}

const getTodoMarkup = todoItem => {
    const div = document.createElement('div');
    div.classList.add('todo-item');
    div.setAttribute('draggable', 'true');
    div.setAttribute('ondragstart', 'onTodoDragStart(event)');
    div.innerHTML =
    `<div class="todo-item-title">${todoItem.title}</div>
    <div class=" todo-item-icons">
        <i class="fas fa-pen" id="editTodo"></i>
        <i class="fas fa-trash-alt" id="deleteTodo"></i>
        <i class="fas fa-check-square done-icon" id="doneTodo"></i>
    </div>`
    addTodoItemEventListeners(div);
    return div;
};

const getTodoDoneMarkup = todoItem => {
    const div = document.createElement('div');
    div.setAttribute('draggable', 'true');
    div.setAttribute('ondragstart', 'onTodoDragStart(event)');
    div.classList.add('todo-item');
    div.innerHTML =
    `<div class="todo-item-title">${todoItem.title}</div>
    <div class=" todo-item-icons">
        <i class="fas fa-trash-alt" id="deleteTodo"></i>
        <i class="fas fa-clipboard" id="undoneTodo"></i>
    </div>`
    addTodoItemEventListeners(div);
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
            return false;
        }
    } else {
        todoInvalidErrorVisible(true);
        return false;
    }
    return true;
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
        todoList = JSON.parse(storedData).map(item => new TodoItem(item._title, item.done, item._order));
        todoList.forEach(todoItem => displayTodo(todoItem));
        orderTodosView();
    }
}

const deleteTodo = todoItem => {
    todoList = todoList.filter(item => {
        if (todoItem.order && item.order > todoItem.order) {
            item.order -= 1;
        }
        return item.title !== todoItem.title;
    });
    saveToLocalStorage();
}

const doneTodo = todoItem => {
    todoItem.toggleStatus();
    todoList.forEach(todo => {
        if (todo.order > todoItem.order) {
            todo.order--;
        }
    });
    todoItem.order = null;
    displayTodo(todoItem);
    saveToLocalStorage();
}

const renameTodo = (oldName, newName) => {
    todoList.find(i => i.title === oldName).title = newName;
    saveToLocalStorage();
};

const switchTitleWithInput = todoEl => {
    const previousTitle = todoEl.children[0].innerHTML;
    todoEl.firstChild.innerHTML = `<input type="text">`;
    const inputEl = todoEl.firstChild.children[0];
    inputEl.value = previousTitle;
    inputEl.focus();
    addEditInputEventListener(inputEl, previousTitle);
}

const addEditInputEventListener = (inputEl, previousTitle) => {
    inputEl.addEventListener('keyup', function(event) {
        if (event.code === 'Escape') {
            inputEl.remove();
            event.path[1].innerHTML = previousTitle;
        } else if (event.code === 'Enter' || event.code === 'NumpadEnter') {
            if (validateTodo(inputEl.value)) {
                renameTodo(previousTitle, inputEl.value);
                event.path[1].innerHTML = inputEl.value;
                inputEl.remove();
            }
        }
    });
} 

function addTodoItemEventListeners(todoItemElement) {
    const todoItem = getTodoFromTitle(todoItemElement.childNodes[0].innerHTML);
    todoItemElement.addEventListener('click', function(event) {
        if (event.target.id === 'editTodo') {
            switchTitleWithInput(this);
        } else if (event.target.id === 'deleteTodo') {
            this.remove();
            deleteTodo(todoItem);
        } else if (event.target.id === 'doneTodo') {
            this.remove();
            doneTodo(todoItem);
        } else if (event.target.id === 'undoneTodo') {
            undoTodoItem(todoItem);
        }
    })
}

const undoTodoItem = todoItem => {
    removeTodoFromDOM(todoItem);
    deleteTodo(todoItem);
    addTodo(new TodoItem(todoItem.title));
    orderTodosView();
}

const allowDrop = event => event.preventDefault();

const onTodoDragStart = event => {
    const todoTitle = event.srcElement.firstChild.innerHTML;
    event.dataTransfer.setData('todoTitle', todoTitle);
}

const onTodoDrop = (event, droppedToTodoDone) => {
    event.preventDefault();
    const droppedTodo = getTodoFromTitle(event.dataTransfer.getData('todoTitle'));
    if (droppedToTodoDone && droppedTodo.done) {
        removeTodoFromDOM(droppedTodo);
        deleteTodo(droppedTodo);
        addTodo(droppedTodo);
    } else if (!droppedToTodoDone && !droppedTodo.done) {
        removeTodoFromDOM(droppedTodo);
        doneTodo(droppedTodo);
    } else if (droppedToTodoDone && !droppedTodo.done && droppedOnTodoItem(event) && !droppedOnSelf(event, droppedTodo)) {
        const targetTodoTitle = event.path.find(el => el.className === 'todo-item').firstChild.innerHTML;
        const targetTodoOrder = getTodoFromTitle(targetTodoTitle).order;
        const newOrder = droppedUnderElement(event) ? targetTodoOrder + 1 : targetTodoOrder;
        removeTodoFromDOM(droppedTodo);
        deleteTodo(droppedTodo);
        addTodo(new TodoItem(droppedTodo.title, false, newOrder))
    }
}

const droppedOnSelf = (dragEvent, todoItem) => 
    dragEvent.path.find(el => el.className === 'todo-item').firstChild.innerHTML === todoItem.title;

const droppedUnderElement = dragEvent => {
    const droppedOn = dragEvent.path.find(el => el.className === 'todo-item');
    var rect = droppedOn.getBoundingClientRect();
    return dragEvent.clientY > (rect.top + rect.bottom) / 2;
}

const droppedOnTodoItem = dragEvent => {
    for (let element of dragEvent.path) {
        if (element.className === 'todo-item') {
            return true;
        }
    }
    return false;
}

const removeTodoFromDOM = (todoItem) => {
    let found = null;
    const removeFromContainer = todoItem.done ? todoDoneContainer : todoContainer;
    for (let todo of removeFromContainer.children) {
        if (todo.firstChild.innerHTML === todoItem.title) {
            found = todo;
            break;
        }
    }
    found.remove();
}
                                    
const getHighestOrder = () => todoContainer.childNodes.length;

const changeTodoOrder = (todoTitle, newOrder) => {
    todoList = todoList.map(todo => {

    });
}

const orderTodosView = () => {
    for (let todo of todoContainer.children) {
        const order = getTodoFromTitle(todo.firstChild.innerHTML).order;
        todo.style.order = order;
    }
}

const getTodoFromTitle = title => todoList.find(i => i.title === title);

document.addEventListener('DOMContentLoaded', function(){

    initFromStorage();

    addTodoButton.addEventListener('click', () => todoInputVisible(true));

    document.querySelector('#test').addEventListener('click', () => console.log(todoList));

    todoInput.addEventListener('keyup', event => {
        if (event.code === 'Escape') {
            todoInputVisible(false);
        } else if (event.code === 'Enter' || event.code === 'NumpadEnter') {
            if (validateTodo(todoInput.value)) {
                addTodo(new TodoItem(todoInput.value));
            }
        }
    });

});