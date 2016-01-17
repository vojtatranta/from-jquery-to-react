(function(win, doc, undefined) {
  function getModelFromPath(path) {
    return path.split('.')[0]
  }

  function getPropFromPath(path) {
    return path.split('.')[1]
  }

  function memberOfStringPath(path, index) {
    return path.split('.')[index]
  }

  function extend(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; }

  var Model = function(properties) {
    this._listeners = []
    this._keyListeners = {}
    this._properties = properties || {}
  }

  Model.prototype.listen = function(handler, key) {
    if (key) {
      if (this._keyListeners[key]) this._keyListeners[key].push(handler)
      else this._keyListeners[key] = [handler]
    } else {
      this._listeners.push(handler)
    }
  }

  Model.prototype._emitChange = function(key) {
    if (key) {
      Object.keys(this._keyListeners).forEach(function(propName) {
        this._keyListeners[propName].forEach(function(handler) {
          handler.call(this, this.get(propName))
        }.bind(this))
      }.bind(this))
    }
    this._listeners.forEach(function(handler) {
      handler.call(this)
    }.bind(this))
  }

  Model.prototype.updateWith = function(updateObj) {
    Object.keys(updateObj).forEach(function(key) {
      this._properties[key] = updateObj[key]
    }.bind(this))
    this._emitChange()
  }

  Model.prototype.set = function(key, value) {
    this._properties[key] = value;
    this._emitChange(key)
    return value
  }

  Model.prototype.get = function(key) {
    return this._properties[key]
  }


  var App = function(element, controllers, services) {
    this._element = element
    this._controllers = controllers
    this._controllerInstances = {}
    this._services = services || {}
  }

  App.prototype.init = function() {
    Object.keys(this._controllers).forEach(function(controllerName) {
      var controller = new this._controllers[controllerName](this._element, this._services)
      this._controllerInstances[controllerName] = controller
    }.bind(this))
  }

  App.prototype.run = function(controllerName) {
    var controller = this._controllerInstances[controllerName]
    if (controller) {
      controller.run()
    }
  }

  App.prototype.model = function(element, controllerModelPath) {
    var splittedPath = controllerModelPath.split('.')
    var controller = this._controllerInstances[memberOfStringPath(controllerModelPath, 0)]
    var pathToModel = splittedPath.slice(1, splittedPath.length - 1)
    var model = controller.getPropertyByPath(pathToModel)
    var modelProp = splittedPath[splittedPath.length - 1]
    model.set(modelProp, element.value)
  }

  App.prototype.trigger = function(element, handlerPath) {
    var args = Array.prototype.slice.call(arguments)
    var params = args.slice(2, args.length)
    var controllerName = memberOfStringPath(handlerPath, 0)
    var method = memberOfStringPath(handlerPath, 1)
    var controller = this._controllerInstances[controllerName]
    return controller[method].apply(controller, [element].concat(params))
  }

  var Controller = function(element, services) {
    this._element = element
    this._services = services
    this.tasks = [
      this._services.taskFactory({
        id: 10,
        completed: false,
        text: 'This Is task',
        editing: false
      }),
      this._services.taskFactory({
        id: 11,
        completed: true,
        text: 'This is another task',
        editing: false
      })
    ]
  }

  Controller.prototype.run = function() {
    this._index()
  }

  Controller.prototype.getPropertyByPath = function(path) {
    return path.reduce(function(object, key) {
      return object[key]
    }.bind(this), this)
  }

  Controller.prototype.getTemplate = function() {
    return this._template(services)
  }

  Controller.prototype.onToggleCompleted = function(element, taskId) {
    var taskToComplete = this._getTaskById(taskId)
    taskToComplete.set('completed', !taskToComplete.get('completed'))
  }

  Controller.prototype.onEditingDone = function(element, taskId) {
    var task = this._getTaskById(taskId)
    task.updateWith({
      editing: false,
      text: element.value
    })
  }

  Controller.prototype.doneEditing = function(element, event) {
    if (event.keyCode == 13) {
      element.blur()
    }
  }

  Controller.prototype.addTask = function(element, event) {
    if (event.keyCode == 13) {
      this.tasks.push(this._services.taskFactory({
        text: element.value,
        completed: false,
        editing: false,
        id: this.tasks.length
      }))

      return this._index()
    }
  }

  Controller.prototype._getTaskById = function(taskId) {
    var tasksToComplete = this.tasks.filter(function(task) {
      return task.get('id') == taskId
    })

    return tasksToComplete[0]
  }

  Controller.prototype.onDestroy = function(element, taskId) {
    this.tasks = this.tasks.filter(function(task) {
      return task.get('id') != taskId
    })

    return this._index()
  }

  Controller.prototype.onEditing = function(element, taskId) {
    var taskToComplete = this._getTaskById(taskId)
    taskToComplete.set('editing', true)
  }

  Controller.prototype._index = function() {
    var tasks = this.tasks
    this.render(tasks, function() {
      return `
      <section class="todoapp">
        <header class="header">
          <h1>todos</h1>
          <input class="new-todo" onKeyUp="app.trigger(this, 'tasksController.addTask', event)" placeholder="What needs to be done?" autofocus="">
        </header>
        <section class="main" style="display: block;">
          <input class="toggle-all" type="checkbox">
          <label for="toggle-all">Mark all as complete</label>
        <ul class="todo-list" > ` +
        tasks.map(function(task, index) {
          return`
            <li class="`+ (task.get('completed') ? `completed` : ``) +` ` +  (task.get('editing') ? 'editing' : '') + `">
              <div class="view" style="display:` + (task.get('editing') ? 'none' : 'block') + `">
                <input class="toggle" onChange="app.trigger(this, 'tasksController.onToggleCompleted', `+ task.get('id') + `)" type="checkbox" `+ (task.get('completed') ? `checked` : ``) +`>
                <label ondblclick="app.trigger(this, 'tasksController.onEditing',` + task.get('id') + `)">`+ task.get('text') +`</label>
                <button class="destroy" onClick="app.trigger(this, 'tasksController.onDestroy',` + task.get('id') + `)"></button>
              </div>
              <input onKeyUp="app.trigger(this, 'tasksController.doneEditing', event)" onBlur="app.trigger(this, 'tasksController.onEditingDone', ` + task.get('id') + `)" class="edit" value="`+ task.get('text') +`">
            </li>`
        }).join('') + `
        </ul>
        </section>
        </section>
          <footer class="footer" style="display: block;">
          <span class="todo-count">
          <strong>` + this.tasks.filter(function(task) { return !task.get('completed') }).length + `</strong> items left</span>
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
        `
    })
  }

  Controller.prototype.render = function(modelsToListen, template) {
    this._createTemplate(modelsToListen, template)()
  }

  Controller.prototype._createTemplate = function(modelsToListen, renderer) {
    var templateFunction = function() {
      this._element.innerHTML = renderer.call(this)
    }.bind(this)

    modelsToListen.forEach(function(model) {
      model.listen(templateFunction)
    })

    return templateFunction
  }

  var Task = function(properties) {
    Model.call(this, properties)
  }
  extend(Task, Model)

  function taskFactory(properties) {
    return new Task(properties)
  }



  window.app = new App(document.getElementById('main'), {
    'tasksController': Controller
  }, {
    'taskFactory': taskFactory
  })

  window.app.init()

  window.app.run('tasksController')


})(window, document)
