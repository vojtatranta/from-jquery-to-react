
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
