'use strict';

const API_KEY = '50d2199a-42dc-447d-81ed-d68a443b697e';
const API_URL = 'http://tasks-api.std-900.ist.mospolytech.ru/api/tasks';

const useAPI = false;

let localTasks = [];

let btn = document.querySelector('#create');

function createItem(value){
    const list = document.querySelector(`#${value.select}-list`);
    const item = document.getElementById('task-template').cloneNode(true);
    item.querySelector('.task-name').textContent = value.name;
    item.dataset.id=value.id
    item.querySelector('.task-description').textContent = value.desc;
    item.classList.remove('d-none');
    list.append(item);
}


function fetchTasks() {
    if (useAPI) {
        fetch(`${API_URL}?api_key=${API_KEY}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error(data.error);
                } else {
                    data.forEach(task => createItem(task));
                }
            })
            .catch(error => console.error('Error:', error));
    } else {
        localTasks.forEach(task => createItem(task));
    }
}

function createNewTask(name, desc, status) {
    const newTask = {
        id: Date.now().toString(),
        name: name,
        desc: desc,
        status: status
    };
    localTasks.push(newTask);
    createItem(newTask);
}

document.querySelector('#create').addEventListener('click', function (event) {
    let modal = event.target.closest('.modal');
    let name = modal.querySelector('#nameTask').value;
    let desc = modal.querySelector('#textTask').value;
    let status = modal.querySelector('#select').value;

    modal.querySelector('#nameTask').value = '';
    modal.querySelector('#textTask').value = '';
    modal.querySelector('#select').value = 'to-do';

    if (useAPI) {
        fetch(`${API_URL}?api_key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({name, desc, status}),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error(data.error);
                } else {
                    createItem(data);
                }
            })
            .catch(error => console.error('Error:', error));
    } else {
        createNewTask(name, desc, status);
    }
    updateTasksCounter();
});

function editModal(event) {
    let task = event.relatedTarget.closest('.task');
    let id = task.dataset.id;
    let name = task.querySelector('.task-name').textContent;
    let desc = task.querySelector('.task-description').textContent;

    const editModal = document.querySelector('#editModal');
    editModal.querySelector('#editNameTask').value = name;
    editModal.querySelector('#editTextTask').value = desc;

    editModal.querySelector('#save').addEventListener('click', function () {
        if (useAPI) {
            fetch(`${API_URL}/${id}?api_key=${API_KEY}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: editModal.querySelector('#editNameTask').value,
                    desc: editModal.querySelector('#editTextTask').value
                }),
            })
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        console.error(data.error);
                    } else {
                        task.querySelector('.task-name').textContent = data.name;
                        task.querySelector('.task-description').textContent = data.desc;
                    }
                })
                .catch(error => console.error('Error:', error));
        } else {
            const updatedTask = localTasks.find(t => t.id === id);
            if (updatedTask) {
                updatedTask.name = editModal.querySelector('#editNameTask').value;
                updatedTask.desc = editModal.querySelector('#editTextTask').value;
                task.querySelector('.task-name').textContent = updatedTask.name;
                task.querySelector('.task-description').textContent = updatedTask.desc;
            }
        }
    });
}

document.querySelector('#editModal').addEventListener('show.bs.modal', editModal);

function removeModal(event) {
    let task = event.relatedTarget.closest('.task');
    let id = task.dataset.id;

    document.querySelector('#removeModalBtn').addEventListener('click', function () {
        if (useAPI) {
            fetch(`${API_URL}/${id}?api_key=${API_KEY}`, {
                method: 'DELETE'
            })
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        console.error(data.error);
                    } else {
                        task.remove();
                    }
                })
                .catch(error => console.error('Error:', error));
        } else {
            localTasks = localTasks.filter(t => t.id !== id);
            task.remove();
        }
        updateTasksCounter();
    });
}

document.querySelector('#removeModal').addEventListener('show.bs.modal', removeModal);

function showTaskDetails(event) {
    let task = event.relatedTarget.closest('.task');
    let name = task.querySelector('.task-name').textContent;
    let desc = task.querySelector('.task-description').textContent;

    const showModal = document.querySelector('#showModal');
    showModal.querySelector('#showNameTask').value = name;
    showModal.querySelector('#showTextTask').value = desc;
}

document.querySelector('#showModal').addEventListener('show.bs.modal', showTaskDetails);

function moveTaskToToDo(event) {
    let task = event.target.closest('.task');
    let id = task.dataset.id;

    if (useAPI) {
        fetch(`${API_URL}/${id}?api_key=${API_KEY}&status=to-do`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error(data.error);
                } else {
                    task.remove();
                    const toDoList = document.getElementById('to-do-list');
                    toDoList.appendChild(task);
                    task.querySelector('.move-btn.move-done').classList.remove('invisible');
                    task.querySelector('.move-btn.move-to-do').classList.add('invisible');
                    updateTasksCounter();
                }
            })
            .catch(error => console.error('Error:', error));
    } else {
        const updatedTask = localTasks.find(t => t.id === id);
        if (updatedTask) {
            updatedTask.status = 'to-do';
            task.remove();
            const toDoList = document.getElementById('to-do-list');
            toDoList.appendChild(task);
            task.querySelector('.move-btn.move-done').classList.remove('invisible');
            task.querySelector('.move-btn.move-to-do').classList.add('invisible');
            updateTasksCounter();
        }
    }
}

function moveTaskToDone(event) {
    let task = event.target.closest('.task');
    let id = task.dataset.id;

    if (useAPI) {
        fetch(`${API_URL}/${id}?api_key=${API_KEY}&status=done`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error(data.error);
                } else {
                    task.remove();
                    const doneList = document.getElementById('done-list');
                    doneList.appendChild(task);
                    task.querySelector('.move-btn.move-to-do').classList.remove('invisible');
                    task.querySelector('.move-btn.move-done').classList.add('invisible');
                    updateTasksCounter();
                }
            })
            .catch(error => console.error('Error:', error));
    } else {
        const updatedTask = localTasks.find(t => t.id === id);
        if (updatedTask) {
            updatedTask.status = 'done';
            task.remove();
            const doneList = document.getElementById('done-list');
            doneList.appendChild(task);
            task.querySelector('.move-btn.move-to-do').classList.remove('invisible');
            task.querySelector('.move-btn.move-done').classList.add('invisible');
            updateTasksCounter();
        }
    }
}

document.querySelector('#to-do-list').addEventListener('click', function (event) {
    if (event.target.classList.value === "fas fa-arrow-right") {
        moveTaskToDone(event);
    }
});

document.querySelector('#done-list').addEventListener('click', function (event) {
    if (event.target.classList.value === "fas fa-arrow-left") {
        moveTaskToToDo(event);
    }
});

function updateTasksCounter() {
    let toDoCount = document.querySelectorAll('#to-do-list .task').length;
    let doneCount = document.querySelectorAll('#done-list .task').length;

    if (toDoCount > 0) {
        toDoCount = toDoCount - 1;
    }

    document.querySelectorAll('.to-do-counter').forEach(counter => {
        counter.textContent = toDoCount;
    });

    document.querySelectorAll('.done-counter').forEach(counter => {
        counter.textContent = doneCount;
    });

}

window.onload = function () {
    fetchTasks();
};
