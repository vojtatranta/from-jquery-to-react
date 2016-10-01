
var el = function(tag, properties, children) {
  if (!properties) properties = {}
  if (typeof children == 'string') children = [children]
  if (!children) children = []

  var element = document.createElement(tag)
  element = Object.assign(element, properties)

  return children.reduce(function(element, child) {
    if (typeof child === 'string') {
      child = document.createTextNode(child)
    }
    element.appendChild(child)
    return element
  }, element)
}


var root = document.getElementById('todoapp')

var render = function(element, code) {
  element.innerHTML = ''
  element.appendChild(code)
}

var todos = [
  {
    id: 10,
    completed: false,
    text: 'This Is task',
    editing: false
  },
  {
    id: 11,
    completed: true,
    text: 'This is another task',
    editing: false
  }
]

var createHandler = function(handler) {
  var defaults = Array.prototype.slice.call(arguments)
  defaults.shift()
  return function(e) {
    return handler.apply(window, defaults.concat([this, e]))
  }
}

var handleTodoCompleteToggleClick = function(change, todo, todoIndex, el, e) {
  e.preventDefault()
  change(function(data) {
    data.todos[todoIndex].completed = !data.todos[todoIndex].completed
    return data
  })
}

var handleTodoDestroy = function(change, todoIndex) {
  return change(function(data) {
    data.todos.splice(todoIndex, 1)
    return data
  })
}


var renderTodos = function(todos, change) {
 
  return todos.map(function(todo, todoIndex) {
    return el('li', { className: todo.completed ? 'completed' : '' }, [
      el('div', { className: 'view', }, [
        el('input', { className: 'toggle', type: 'checkbox', checked: todo.completed, onclick: createHandler(handleTodoCompleteToggleClick, change, todo, todoIndex) }),
        el('label', {}, todo.text),
        el('button', { className: 'destroy', onclick: createHandler(handleTodoDestroy, change, todoIndex) }),
      ]),
      el('input', { className: 'edit', value: todo.text, style: { display: todo.editting ? 'block' : 'none' } })
    ])
  })
}

var renderApp = function(data, change) {
  return el('div', { className: 'app-container' }, [
    el('header', { className: 'header' }, [
      el('h1', {}, 'todos'),
      el('input', { className: 'new-todo', placeholder: 'What needs to be done?', autofocus: true })
    ]),
    el('section', { className: 'main', style: { display: 'block' } }, [
      el('input', { className: 'toggle-all', type: 'checkbox' }),
      el('label', { for: 'toggle-all', type: 'checkbox' }),
      el('ul', { className: 'todo-list' }, renderTodos(data.todos, change)),
      el('footer', { className: 'footer', style: { display: 'block' } }, [
        el('span', { className: 'todo-count' }, [
          el('strong', {}, String(data.todos.filter(function(todo) { return !todo.completed} ).length)),
          ' items left'
        ])
      ])
    ]),
  ])
}

/*
<footer class="footer" style="display: block;">
      <span class="todo-count"><strong>5</strong> items left</span>
      <ul class="filters">
        <li>
          <a class="selected" href="#/">All</a>
        </li>
        <li>
          <a href="#/active">Active</a>
        </li>
        <li>
          <a href="#/completed">Completed</a>
        </li>
      </ul>
      
      <button class="clear-completed">Clear completed</button>
      
    </footer>
*/

var createChange = function(root, render, renderApp, initialData) {
  return function(actualChange) {
    var nextData = actualChange(initialData)
    var t = performance.now()
    var renderedApp = renderApp(nextData, createChange(root, render, renderApp, nextData))
    console.info('render', (performance.now() - t).toFixed(4) + 'ms', 'new state', nextData)
    render(root, renderedApp)
  }
}

var initialData = { todos: todos }
var changeFn = createChange(root, render, renderApp, initialData)
changeFn(function(currentData) {
  return currentData
})

/*
<section class="todoapp" id="todoapp">
      <header class="header">
        <h1>todos</h1>
        <input class="new-todo" placeholder="What needs to be done?" autofocus="">
      </header>
      <section class="main" style="display: block;">
        <input class="toggle-all" type="checkbox">
        <label for="toggle-all">Mark all as complete</label>
        <ul class="todo-list">
        <li>
      <div class="view">
        <input class="toggle" type="checkbox">
        <label>Create something great</label>
        <button class="destroy"></button>
      </div>
      <input class="edit" value="Create something great">
    </li><li class="completed">
      <div class="view">
        <input class="toggle" type="checkbox" checked="">
        <label>Make up topic of JS lesson</label>
        <button class="destroy"></button>
      </div>
      <input class="edit" value="Make up topic of JS lesson">
    </li><li>
      <div class="view">
        <input class="toggle" type="checkbox">
        <label>Prepare for JS lesson</label>
        <button class="destroy"></button>
      </div>
      <input class="edit" value="Prepare for JS lesson">
    </li><li class="">
      <div class="view">
        <input class="toggle" type="checkbox">
        <label>Learn JS before I teach JS lessons</label>
        <button class="destroy"></button>
      </div>
      <input class="edit" value="Learn JS before I teach JS lessons">
    </li><li>
      <div class="view">
        <input class="toggle" type="checkbox">
        <label>Actually learn JS before the lessons</label>
        <button class="destroy"></button>
      </div>
      <input class="edit" value="Actually learn JS before the lessons">
    </li><li class="completed">
      <div class="view">
        <input class="toggle" type="checkbox" checked="">
        <label>Teach da JS</label>
        <button class="destroy"></button>
      </div>
      <input class="edit" value="Teach da JS">
    </li><li class="">
      <div class="view">
        <input class="toggle" type="checkbox">
        <label>Pretend tha I can JS really well</label>
        <button class="destroy"></button>
      </div>
      <input class="edit" value="Pretend tha I can JS really well">
    </li></ul>
      </section>
      <footer class="footer" style="display: block;">
      <span class="todo-count"><strong>5</strong> items left</span>
      <ul class="filters">
        <li>
          <a class="selected" href="#/">All</a>
        </li>
        <li>
          <a href="#/active">Active</a>
        </li>
        <li>
          <a href="#/completed">Completed</a>
        </li>
      </ul>
      
      <button class="clear-completed">Clear completed</button>
      
    </footer>
    </section>
    <footer class="info">
      <p>Double-click to edit a todo</p>
    </footer>
    <script async="" src="https://www.google-analytics.com/analytics.js"></script><script type="text/template" id="item-template">
      <div class="view">
        <input class="toggle" type="checkbox" <%= completed ? 'checked' : '' %>>
        <label><%- title %></label>
        <button class="destroy"></button>
      </div>
      <input class="edit" value="<%- title %>">
    </script>
    <script type="text/template" id="stats-template">
      <span class="todo-count"><strong><%= remaining %></strong> <%= remaining === 1 ? 'item' : 'items' %> left</span>
      <ul class="filters">
        <li>
          <a class="selected" href="#/">All</a>
        </li>
        <li>
          <a href="#/active">Active</a>
        </li>
        <li>
          <a href="#/completed">Completed</a>
        </li>
      </ul>
      <button class="clear-completed">Clear completed</button>
</div>
*/
