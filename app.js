"use strict"

var app = angular.module('todo', [
  'ngRoute'
])

app.config(function($routeProvider) {
  $routeProvider
    .when('/', {
      template: '<home></home>'
    })
    .otherwise({
      redirectTo: '/'
    })
})

app.directive('home', function(taskService) {
  return {
    template: `
      <h1>Todos</h1>
      <task-list tasks="ctrl.tasks" on-remove="ctrl.remove(task)" on-check="ctrl.check(task)"></task-list>
      <label>Add Item</label>

      <div>
        <new-task on-submit="ctrl.addTask(name)"></new-task>
      </div>
    `,

    bindToController: true,
    controllerAs: 'ctrl',
    controller: function HomeComponent() {
      this.addTask = function (name) {
        taskService.add(name)
        this.updateTasks()
      }

      this.remove = function(task) {
        taskService.remove(task)
        this.updateTasks()
      }

      this.check = function (task) {
        task.check(task)
        this.updateTasks()
      }

      this.updateTasks = function() {
        this.tasks = taskService.getAll()
      }

      this.updateTasks()
    }
  };
})

app.directive('newTask', function() {
  return {
    template: `
      <form ng-submit="ctrl.submit()">
        <input type="text" placeholder="New task&hellip;" ng-model="ctrl.name" />
        <input type="submit" value="Add" />
      </form>
    `,

    scope: {
      name: '@?',
      onSubmit: '&'
    },
    bindToController: true,
    controllerAs: 'ctrl',

    controller: function NewTaskComponent() {
        this.name = undefined

        this.submit = function () {
          this.onSubmit({ name: this.name })
        }
    }
  }
})

app.service('taskService', function() {
  var set = function(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks))
  }

  var get = function() {
    return JSON.parse(localStorage.getItem('tasks'))
  }

  var tasks = get()
  var currentId = 0
  if (!tasks) {
    set([])
  }
  else {
    var mostRecentTask = _.max(get(), function (task) {
      return task.id
    })
    console.log("mostRecentTask", mostRecentTask);
    currentId = mostRecentTask.id
  }

  console.log("tasks", tasks, currentId);

  return {
    _create: function (name) {
      currentId += 1;
      console.log("creating with currentId", currentId);
      return {
        name: name,
        id: currentId,
        complete: false
      }
    },

    add: function(task) {
      let tasks = get()
      tasks.push(this._create(task))
      set(tasks)
    },

    remove: function(task) {
      let tasks = this.getAll()
      var removedItem = _.remove(tasks, function(t) {
        return t.id === task.id
      })
      set(tasks)
      return removedItem
    },

    complete: function(task) {
      task.complete = false
    },

    getAll: function() {
      return get()
    }

  }
})

app.directive('taskList', function() {
  return {
    template: `
      <ul class="list-unstyled">
        <li ng-repeat="task in ctrl.tasks track by task.id"
            ng-class="{faded: task.completed}">
          <input type="checkbox" ng-checked="task.complete">
          <span>{{ task.name }}</span>
          <a ng-click="ctrl.remove(task)">Remove</a>
        </li>
      <ul>
    `,

    scope: {
      tasks: '=',
      onRemove: '&'
    },
    bindToController: true,
    controllerAs: 'ctrl',

    controller: function NewTaskComponent($scope, taskService) {
      this.remove = function (task) {
        this.onRemove({ task: task })
      }
    }
  }
})
