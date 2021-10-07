document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    var db = new PouchDB('todo');

    var remoteCouch = false; 

    document.querySelector('#saveTask').addEventListener("click", handleSubmit);
    document.querySelector('#editTaskSubmit').addEventListener("click", editSubmit);
    document.querySelector('#delete').addEventListener("click", deleteTask);
    function showTodos() { 
      db.allDocs({
        include_docs: true, 
        descending: true
        
      }, function(err, doc) { 
        redrawTodosUI(doc.rows); 
      }); 
    };

    db.changes({ 
      since: 'now', 
      live: true 
    }).on('change', showTodos); 

    function redrawTodosUI(todos) { 
      var ul = document.getElementById('todoList'); 
      ul.innerHTML = ''; 
      if (todos.length == 0) {
        ul.innerHTML = 'Nothing to see here'
      } else {
        todos.forEach(function(todo) { 
          
          var stuff = todo.doc
          var bg
          if (stuff.priority == 'Low') {
            bg = 'bg-light'
          } else if (stuff.priority == 'Moderate') {
            bg = 'bg-info'
          } else if (stuff.priority == 'High') {
            bg = 'bg-warning'
          }
          ul.innerHTML+= `<div class="col-12 col-sm-6 p-2"><div class="card"> 
                    <div class="card-header ${bg}">${stuff.priority}</div>
                    <div class="card-body"> 
                      <h5 class="card-title">${stuff.task}</h5> 
                      <p class="card-text">${stuff.remark}
                      <br>
                      <b>Progress:</b>
                      <div class="progress" style="height:px;"> <div class="progress-bar" role="progressbar" style="width: ${(stuff.progress/4)*100}%;" aria-valuenow="${(stuff.progress/4)*100}" aria-valuemin="0" aria-valuemax="100">${(stuff.progress/4)*100}%</div> </div>
                      
                      <b>Deadline: </b>${new Date(stuff.deadline).toDateString()}</p> 
                      <a data-bs-toggle="modal" data-bs-target="#todoMore" data-bs-whatever="${stuff._id}" class="btn btn-primary">Go somewhere</a> 
                    </div>
                  </div></div>

                  `;
        });
      }
      
    }
    function uuidv4() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }

    function addTodo(task, remark, progress, priority, deadline) {
      var todo = {
        _id: uuidv4(),
        task: task,
        remark: remark,
        progress: progress,
        priority: priority,
        deadline: deadline,
        created: new Date().toISOString()
      };
      
      db.put(todo, function callback(err, result) {
        if (!err) {
          
          alert('Successfully posted a task!');
        }
      });
    }

    function editTodo(task, remark, progress, priority, deadline, id, rev) {

      db.get(id).then(function(doc) {
        return db.put({
          _id: id,
          _rev: rev,
          task: task,
          remark: remark,
          progress: progress,
          priority: priority,
          deadline: deadline
        });
      }).then(function(response) {
        // handle response
      }).catch(function (err) {
        console.log(err);
      });
    }

    const form = document.querySelector(".taskform");

    function handleSubmit() {
      //e.preventDefault();
      const data = new FormData(form); 
      const value = Object.fromEntries(data.entries()); 
      const v = { value };
      //console.log(v)
      addTodo(v.value.task, v.value.remark, v.value.progress, v.value.priority, v.value.date)
      form.reset()
    } 

    var __id
    var __rev
    function getData(ide, reve){
      __rev = reve
      __id = ide
    }
    const editform = document.querySelector(".edittaskform");

    function editSubmit() {
      //e.preventDefault();
      const fdata = new FormData(editform); 
      const fvalue = Object.fromEntries(fdata.entries()); 
      const f = { fvalue };
      editTodo(f.fvalue.etask, f.fvalue.eremark, f.fvalue.eprogress, f.fvalue.epriority, f.fvalue.edate, __id, __rev);
    } 

    function deleteTask() {
      var r = confirm("Are you if you want to delete it? You can't retrieve it after deleting!");
      if (r == true) {
        db.get(__id).then(function(doc) {
          return db.remove(doc._id, doc._rev);
        }).then(function (result) {
          // handle result
        }).catch(function (err) {
          console.log(err);
        });
      } else {

      }
      
    }

    var todoMore = document.getElementById('todoMore');
    var moreMain = document.getElementById('moreMain');
    todoMore.addEventListener('show.bs.modal', function (event) {
      
      var button = event.relatedTarget
      
      var id = button.getAttribute('data-bs-whatever')
      db.get(id).then(function (doc) {
        document.getElementById('editTask').value = doc.task
        document.getElementById('editRemark').value = doc.remark
        document.getElementById('editProgress').value = doc.progress
        document.getElementById('editPriority').value = doc.priority
        document.getElementById('edate').value = doc.deadline
        getData(doc._id, doc._rev)
        /*document.getElementById('__id').value = doc._id
        document.getElementById('__id').placeholder = doc._id
        document.getElementById('__rev').value = doc._rev
        document.getElementById('__rev').placeholder = doc._rev*/

      }).catch(function (err) {
        console.log(err);
      });
    })

    form.addEventListener("submit", handleSubmit);
    window.onload = showTodos;
}
