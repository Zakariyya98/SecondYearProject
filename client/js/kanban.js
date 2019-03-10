const prompt = require('electron-prompt');
$(document).ready(function() {

  //Create a Kanban Board
  var KanbanTest = new jKanban({
        //Specifying the board
        element : '#kanban',
        gutter  : '10px',

        //Change the text of the element which is clicked on
        click : function(el){
          $('#page-mask').fadeTo(500, 0.7);

          //Prompt the user to type the new name of the element
          prompt({
            title: 'Change the title',
            label: 'Title:',
            value: '',
            inputAttrs: {
              type: 'text'
            }
          })
          .then((r) => {
            if(r === null) {
              console.log('User cancelled');

            //Will change the item name if the user has typed something
            }else {
              console.log(r);
              if (r == ""){
                alert('Please enter an item name');
              }else {
              el.innerHTML = r;
              }
            }
            $('#page-mask').fadeOut(500);
          })
          .catch(console.error);
        },

        //Creating the boards
        boards  :[
            {
                'id' : '_todo',
                'title'  : 'To Do (drag me)',
                'class' : 'toDoBoard',
                'item'  : [

                ]
            },
            {
                'id' : '_working',
                'title'  : 'Working',
                'class' : 'workingBoard',
                'item'  : [

                ]
            },
            {
                'id' : '_done',
                'dragTo' : ['_working'],
                'title'  : 'Done (Drag only in Working)',
                'class' : 'doneBoard',
                'item'  : [

                ]
            }
        ]
    });

    //Add an item listener
    $('#addToDo').on('click', function() {
        $('#page-mask').fadeTo(500, 0.7);

        //Will prompt the user to type name for the item
        prompt({
          title: 'Add an Item',
          label: 'Name of Item:',
          value: '',
          inputAttrs: {
            type: 'text'
          }
        })
        .then((r) => {
          if(r === null) {
            console.log('user cancelled');
          //Will change the item name if the user has typed something
          }else {
            if (r == ""){
              alert('Please enter an item name');
            }else {
              KanbanTest.addElement(
                  '_todo',
                  {
                    'title':r,
                  }
              );
            }
          }
          $('#page-mask').fadeOut(500);
        })
        .catch(console.error);
    })

    //Add a board listener
    $('#addDefault').on('click', function () {

        //Creating new board
        KanbanTest.addBoards(
            [{
                'id' : '_default',
                'title'  : 'Default (Can\'t drop in Done)',
                'dragTo':['_todo','_working'],
                'class' : 'defaultBoard',
                'item'  : [

                ]
            }]
        )
    });

    //Remove a board listener
    $('#removeBoard').on('click',function(){

        //Removing an existing board
        KanbanTest.removeBoard('_default');
    });
  })
