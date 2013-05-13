(function($){
$.fn.leader = function(options) {
    

    var defaults = {
        inputs: [{label: 'Label', type: 'text'}],
        onSave: function(){}
    };
    var options = $.extend(defaults, options);
    
    
    var obj = $(this);
    var insert_cursor = 0;
    var selected_item = null;
    var output = [];
    
    /**
    * Initial
    */
    
    
    $(document).ready(function(){
        
        // Load first insert item
        
        inp.populate({
            label: options.inputs[insert_cursor]['label'],
            type: options.inputs[insert_cursor]['type']
        });
        
    });
    
    
    /**
    * Events
    */
    
    
    /**
    * Keypresses
    */
    
    
    obj.on('keypress', function(element){
    
        var keyCode = element.keyCode || element.which;
        
        // Presses Enter
        
        if(keyCode == 13){
            element.preventDefault();
            
            // User presses enter on inserting field
            if(obj.find('.item.selected').hasClass('inserting')){
                inp.insert(obj);
            }
            
            // User presses enter on editing field
            if(obj.find('.item.selected').hasClass('editing')){
                inp.edit(obj);
            }
            
        }
    
    });
    
    
    /**
    * Keydown
    */
    
    
    obj.on('keydown', function(element){
    
        var keyCode = element.keyCode || element.which;
        
        // Presses backspace
        
        if(keyCode == 8){
            
            // User presses backspace on an empty field
            if(obj.find('.item.selected .input').val() == ''){
                element.preventDefault();
                // Start editing previous input
                inp.archive_to_edit({obj: obj.find('.item.selected').prev()});
            }
            
        }
        
        // Presses tab
        
        if(keyCode == 9){
            element.preventDefault();
            
            // User presses enter on inserting field
            if(obj.find('.item.selected').hasClass('inserting')){
                inp.insert(obj);
            }
            
            // User presses enter on editing field
            if(obj.find('.item.selected').hasClass('editing')){
                inp.edit(obj);
            }
            
        }
        
    });
    
    
    /**
    * User clicks on an archived item
    */
    
    
    $('.item.archived').live('click', function(){
        inp.archive_to_edit({obj: $(this)});
    });
    
    
    /**
    * User clicks on an editing item
    */
    
    
    $('.item.editing').live('click', function(){
        obj.find('.item.selected').removeClass('selected');
        $(this).addClass('selected').find('.input').focus();
    });
    
    
    /**
    * User clicks on an inserting item
    */
    
    
    $('.item.inserting').live('click', function(){
        obj.find('.item.selected').removeClass('selected');
        $(this).addClass('selected').find('.input').focus();
    });
    
    
    /**
    * Main methods
    */
    
    
    var inp = {
        
        
        /**
        * Insert
        * Sequence to execute to insert a new value
        */
        
        
        insert: function(obj){
            
            // Save to output JSON object
            inp.save({
                id: insert_cursor,
                label: options.inputs[insert_cursor]['label'],
                value: obj.find('.item.inserting .input').val(),
                type: options.inputs[insert_cursor]['type']
            });
            
            // Add to archive
            inp.archive({
                label: options.inputs[insert_cursor]['label'],
                value: inp.format_value({value: obj.find('.item.inserting .input').val(), type: options.inputs[insert_cursor]['type']}),
                type: options.inputs[insert_cursor]['type']
            });
            
            insert_cursor++;
            
            // Start new insertion field
            
            if(options.inputs[insert_cursor] != undefined){
                inp.prep_next({
                    label: options.inputs[insert_cursor]['label'],
                    type: options.inputs[insert_cursor]['type']
                });
            }
            
            // Hide inserting if form completed
            
            if(options.inputs[insert_cursor] == undefined){ obj.find('.item.inserting').hide(); }
            
        },
        
        
        /**
        * Edit
        * Sequence to execute to edit archive item
        */
        
        
        edit: function(obj){
          
            // Update JSON object
            inp.save({
                id: obj.find('.item.selected').attr('data-id'),
                label: obj.find('.item.selected .label').html(),
                value: obj.find('.item.selected .input').val(),
                type: obj.find('.item.selected').attr('data-type')
            });
            
            inp.edit_to_archive({obj: obj.find('.item.selected')});
            inp.focus_next();
            
        },
        
        
        /**
        * Archive
        * Submit input to archive
        */
        
        
        archive: function(options){
            $('<div class="item archived" data-type="' + options.type + '" data-id="' + insert_cursor + '" />').insertBefore(obj.find('.item.inserting'))
            .append($('<div class="label" />').html(options.label))
            .append($('<div class="value" />').html(options.value));
        },
        
        
        /**
        * Populate
        * Add required elements to object
        */
        
        
        populate: function(options){
            $('<div class="item inserting" />').appendTo(obj)
            .append($('<div class="label" />').html(options.label))
            .append($('<input type="' + options.type + '" class="input" id="input" />').html(options.value));
        },
        
        
        /**
        * Prepare next insertion
        * Resets inserting input field and prepares next insert
        */
        
        
        prep_next: function(options){
                
                obj.find('.item.inserting .label').html(options.label);
                obj.find('.item.inserting .input').val('');
                
                // jQuery blocks attempts to do this as legacy IE versions don't like it, so we'll do it with pure js instead
                e = document.getElementById('input');
                e.setAttribute('type', options.type);
               
        },
        
        
        /**
        * Archive to edit
        * Removes archive item and replaces it with an edit item
        */
        
        
        archive_to_edit: function(options){
            
            obj.find('.item.selected').removeClass('selected');
            
            // Get data
            
            var label = options.obj.find('.label').html();
            var value = options.obj.find('.value').html();
            var type = options.obj.attr('data-type');
            var id = options.obj.attr('data-id');
            
            // If type is password clear value
            
            if(type == 'password'){ value = ''; }
            
            // Build replacement
            
            var replacement = $('<div class="item editing selected" data-type="' + type + '" data-id="' + id + '" />')
            .append($('<div class="label" />').html(label))
            .append($('<input type="' + type + '" class="input" />').val(value));
            
            // Replace
            
            options.obj.replaceWith(replacement);
            
            // Focus cursor on input
            
            replacement.find('.input').focus();
          
        },
        
        
        /**
        * Edit to archive
        * Removes edit item and replaces it with an archive item
        */
        
        
        edit_to_archive: function(options){
            
            // Get data
            
            var label = options.obj.find('.label').html();
            var value = options.obj.find('.input').val();
            var type = options.obj.attr('data-type');
            var id = options.obj.attr('data-id');
            
            // Build replacement
            
            var replacement = $('<div class="item archived" data-type="' + type + '" data-id="' + id + '" />')
            .append($('<div class="label" />').html(label))
            .append($('<div class="value" />').html(inp.format_value({value: value, type: type})));
            
            // Replace
            
            options.obj.replaceWith(replacement);
          
        },
        
        
        /**
        * Move to next
        * Move focus to next input
        */
        
        
        focus_next: function(){
            
            obj.find('.item.selected').removeClass('selected');
            if(obj.find('.item.editing').length > 0){
                obj.find('.item.editing:first').addClass('selected').find('.input').focus();
            }
            else if(obj.find('.item.inserting').length > 0){
                obj.find('.item.inserting').addClass('selected').find('.input').focus();
            }
            
        },
        
        
        /**
        * Format value
        * Takes submitted value and converts to string for display in archive
        */
        
        
        format_value: function(options){
            
            // Text
            
            if(options.type == 'text'){
                var value = options.value;
            }
            
            // Password
            
            if(options.type == 'password'){
                var value = '&bull;&bull;&bull;&bull;&bull;&bull;';
            }
            
            return value;
            
        },
        
        
        /**
        * Save
        * Saves values to JSON string ready for output
        */
        
        
        save: function(item){
            output[item.id] = item;
            options.onSave(output);
        }
        

    }

};
})(jQuery);