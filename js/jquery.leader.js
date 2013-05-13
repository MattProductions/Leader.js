(function($){
$.fn.leader = function(options) {
    

    var defaults = {
        inputs: [{label: 'Label', type: 'text'}],
        name_prefix: 'lrd_',
        onSave: function(){}
    };
    var options = $.extend(defaults, options);
    
    
    var obj = $(this);
    var insert_cursor = 0;
    var selected_item = null;
    var output = [];
    var npfx = options.name_prefix;
    
    /**
    * Initial
    */
    
    
    $(document).ready(function(){
        
        // Load first insert item
        
        ldr.populate({
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
            if(obj.find('.'+npfx+'item.'+npfx+'selected').hasClass(npfx+'inserting')){
                ldr.insert(obj);
            }
            
            // User presses enter on editing field
            if(obj.find('.'+npfx+'item.'+npfx+'selected').hasClass(npfx+'editing')){
                ldr.edit(obj);
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
            if(obj.find('.'+npfx+'item.'+npfx+'selected .'+npfx+'input').val() == ''){
                element.preventDefault();
                // Start editing previous input
                ldr.archive_to_edit({obj: obj.find('.'+npfx+'item.'+npfx+'selected').prev()});
            }
            
        }
        
        // Presses tab
        
        if(keyCode == 9){
            element.preventDefault();
            
            // User presses enter on inserting field
            if(obj.find('.'+npfx+'item.'+npfx+'selected').hasClass(npfx+'inserting')){
                ldr.insert(obj);
            }
            
            // User presses enter on editing field
            if(obj.find('.'+npfx+'item.'+npfx+'selected').hasClass(npfx+'editing')){
                ldr.edit(obj);
            }
            
        }
        
    });
    
    
    /**
    * User clicks on an archived item
    */
    
    
    $('.'+npfx+'item.'+npfx+'archived').live('click', function(){
        ldr.archive_to_edit({obj: $(this)});
    });
    
    
    /**
    * User clicks on an editing item
    */
    
    
    $('.'+npfx+'item.'+npfx+'editing').live('click', function(){
        obj.find('.'+npfx+'item.'+npfx+'selected').removeClass(npfx+'selected');
        $(this).addClass(npfx+'selected').find('.'+npfx+'input').focus();
    });
    
    
    /**
    * User clicks on an inserting item
    */
    
    
    $('.'+npfx+'item.'+npfx+'inserting').live('click', function(){
        obj.find('.'+npfx+'item.'+npfx+'selected').removeClass(npfx+'selected');
        $(this).addClass(npfx+'selected').find('.'+npfx+'input').focus();
    });
    
    
    /**
    * Main methods
    */
    
    
    var ldr = {
        
        
        /**
        * Insert
        * Sequence to execute to insert a new value
        */
        
        
        insert: function(obj){
            
            // Save to output JSON object
            ldr.save({
                id: insert_cursor,
                label: options.inputs[insert_cursor]['label'],
                value: obj.find('.'+npfx+'item.'+npfx+'inserting .'+npfx+'input').val(),
                type: options.inputs[insert_cursor]['type']
            });
            
            // Add to archive
            ldr.archive({
                label: options.inputs[insert_cursor]['label'],
                value: ldr.format_value({value: obj.find('.'+npfx+'item.'+npfx+'inserting .'+npfx+'input').val(), type: options.inputs[insert_cursor]['type']}),
                type: options.inputs[insert_cursor]['type']
            });
            
            insert_cursor++;
            
            // Start new insertion field
            
            if(options.inputs[insert_cursor] != undefined){
                ldr.prep_next({
                    label: options.inputs[insert_cursor]['label'],
                    type: options.inputs[insert_cursor]['type']
                });
            }
            
            // Hide inserting if form completed
            
            if(options.inputs[insert_cursor] == undefined){ obj.find('.'+npfx+'item.'+npfx+'inserting').hide(); }
            
        },
        
        
        /**
        * Edit
        * Sequence to execute to edit archive item
        */
        
        
        edit: function(obj){
          
            // Update JSON object
            ldr.save({
                id: obj.find('.'+npfx+'item.'+npfx+'selected').attr('data-id'),
                label: obj.find('.'+npfx+'item.'+npfx+'selected .'+npfx+'label').html(),
                value: obj.find('.'+npfx+'item.'+npfx+'selected .'+npfx+'input').val(),
                type: obj.find('.'+npfx+'item.'+npfx+'selected').attr('data-type')
            });
            
            ldr.edit_to_archive({obj: obj.find('.'+npfx+'item.'+npfx+'selected')});
            ldr.focus_next();
            
        },
        
        
        /**
        * Archive
        * Submit input to archive
        */
        
        
        archive: function(options){
            $('<div class="'+npfx+'item '+npfx+'archived" data-type="' + options.type + '" data-id="' + insert_cursor + '" />')
            .insertBefore(obj.find('.'+npfx+'item.'+npfx+'inserting'))
            .append($('<div class="'+npfx+'label" />').html(options.label))
            .append($('<div class="'+npfx+'value" />').html(options.value));
        },
        
        
        /**
        * Populate
        * Add required elements to object
        */
        
        
        populate: function(options){
            $('<div class="'+npfx+'item '+npfx+'inserting" />').appendTo(obj)
            .append($('<div class="'+npfx+'label" />').html(options.label))
            .append($('<input type="' + options.type + '" class="'+npfx+'input" id="input" />').html(options.value));
        },
        
        
        /**
        * Prepare next insertion
        * Resets inserting input field and prepares next insert
        */
        
        
        prep_next: function(options){
                
                obj.find('.'+npfx+'item.'+npfx+'inserting .'+npfx+'label').html(options.label);
                obj.find('.'+npfx+'item.'+npfx+'inserting .'+npfx+'input').val('');
                
                // jQuery blocks attempts to do this as legacy IE versions don't like it, so we'll do it with pure js instead
                e = document.getElementById('input');
                e.setAttribute('type', options.type);
               
        },
        
        
        /**
        * Archive to edit
        * Removes archive item and replaces it with an edit item
        */
        
        
        archive_to_edit: function(options){
            
            obj.find('.'+npfx+'item.'+npfx+'selected').removeClass(npfx+'selected');
            
            // Get data
            
            var label = options.obj.find('.'+npfx+'label').html();
            var value = options.obj.find('.'+npfx+'value').html();
            var type = options.obj.attr('data-type');
            var id = options.obj.attr('data-id');
            
            // If type is password clear value
            
            if(type == 'password'){ value = ''; }
            
            // Build replacement
            
            var replacement = $('<div class="'+npfx+'item '+npfx+'editing '+npfx+'selected" data-type="' + type + '" data-id="' + id + '" />')
            .append($('<div class="'+npfx+'label" />').html(label))
            .append($('<input type="' + type + '" class="'+npfx+'input" />').val(value));
            
            // Replace
            
            options.obj.replaceWith(replacement);
            
            // Focus cursor on input
            
            replacement.find('.'+npfx+'input').focus();
            
            ldr.moveCursorToEnd(replacement.find('.'+npfx+'input'));
          
        },
        
        
        /**
        * Edit to archive
        * Removes edit item and replaces it with an archive item
        */
        
        
        edit_to_archive: function(options){
            
            // Get data
            
            var label = options.obj.find('.'+npfx+'label').html();
            var value = options.obj.find('.'+npfx+'input').val();
            var type = options.obj.attr('data-type');
            var id = options.obj.attr('data-id');
            
            // Build replacement
            
            var replacement = $('<div class="'+npfx+'item '+npfx+'archived" data-type="' + type + '" data-id="' + id + '" />')
            .append($('<div class="'+npfx+'label" />').html(label))
            .append($('<div class="'+npfx+'value" />').html(ldr.format_value({value: value, type: type})));
            
            // Replace
            
            options.obj.replaceWith(replacement);
          
        },
        
        
        /**
        * Move to next
        * Move focus to next input
        */
        
        
        focus_next: function(){
            
            obj.find('.'+npfx+'item.'+npfx+'selected').removeClass(npfx+'selected');
            if(obj.find('.'+npfx+'item.'+npfx+'editing').length > 0){
                obj.find('.'+npfx+'item.'+npfx+'editing:first').addClass(npfx+'selected').find('.'+npfx+'input').focus();
            }
            else if(obj.find('.'+npfx+'item.'+npfx+'inserting').length > 0){
                obj.find('.'+npfx+'item.'+npfx+'inserting').addClass(npfx+'selected').find('.'+npfx+'input').focus();
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
        },
        
        
        /**
        * Move cursor to end
        * Moves the cursor to the end of an input (for Firefox and IE)
        */
        
        
        moveCursorToEnd: function(el) {
            if (typeof el.selectionStart == "number") {
                el.selectionStart = el.selectionEnd = el.value.length;
            } else if(typeof el.createTextRange != "undefined"){
                el.focus();
                var range = el.createTextRange();
                range.collapse(false);
                range.select();
            }
        }
        

    }

};
})(jQuery);