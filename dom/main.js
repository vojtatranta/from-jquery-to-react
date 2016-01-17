(function(win, doc, $, undefined) {

  var updateCounter = function()
  {
    var counter = 0
    $('.todo-list > li').each(function() {
      if ($(this).find('.toggle:checked').length == 0) counter++;
    })
    $('.todo-count strong').text(counter)
  }

  //odškrtnutí
  $(doc).on('change', '.toggle', function() {
    var wholeTodoItem = $(this).closest('li')
    if ($(this).is(':checked')) {
      wholeTodoItem.addClass('completed')
    } else {
      wholeTodoItem.removeClass('completed')
    }

    updateCounter()
  })

  //přidávání
  //samotné přidávání
  $(doc).on('keyup', '.new-todo', function(e) {
    if (e.keyCode == 13) { //když enter
      if (this.value.length == 0) {
        return;
      }
      var newTodo = $('.todo-list > li').first().clone()

      //co když je li completed - nedá se spoléhat na to, že bude vždy alespoň jedna uncompleted
      newTodo.removeClass('completed')
      newTodo.find('.toggle').attr('checked', false)

      //co když není žádné li
      //newTodo = $('<li><div class="view"><input class="toggle" type="checkbox"><label>Prepare for JS lesson</label><button class="destroy"></button></div><input class="edit" value="Prepare for JS lesson"></li>')

      newTodo.find('label').text(this.value)
      $('.todo-list').prepend(newTodo)
      this.value = ''

      //aktualizovat počítadlo zbývajících
      updateCounter()
    }
  })

  //mazání
  $(doc).on('click', '.destroy', function() {
    $(this).closest('li').remove()
    updateCounter()
  })

  //uprava
  $(doc).on('dblclick', '.todo-list > li', function() {
    var edit = $(this).find('.edit')
    edit.val($(this).find('label').text()).show()
    $(this).find('label').hide()
    edit.focus()
  })

  //zrušení úpravy
  $(doc).on('keyup', '.todo-list > li .edit', function(e) {
    var label = $(this).closest('li').find('label')
    if (e.keyCode == 13) {
      label.text(this.value)
      label.show()
      $(this).hide()
    } else if (e.keyCode == 27) { //když escape
      $(this).hide()
      label.show()
    }

  })

})(window, document, jQuery)
