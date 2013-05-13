Leader.js
=========

Leader.js is a concept to enable the user to fill a form as quickly and easily as possible on mobile.

Filling forms on mobiles can be frustrating, with constant scrolling, tapping and opening/ re-opening of the keyboard. Leader.js simplifies the process with a shake up of the process.

1. The keyboard will stay open while moving onto the next input.
2. The user will automatically be moved onto the next input after completition.
3. The user can edit previous inputs by pressing the backspace.

The layout is also designed to use space more efficiently, letting the developer fit the form into tight spaces.

Demo
====

http://demo.peterbailey.eu/Leader.js/example.html

Usage
=====

```html
<div class="leader"></div> 
```

```javascript
$(document).ready(function(){
    $('.leader').leader({
        inputs: [
            {label: 'Username', type: 'text'},
            {label: 'Email', type: 'text'},
            {label: 'Password', type: 'password'},
            {label: 'Repeat', type: 'password'}
        ],
        onSave: function(output){
            console.log(output);
        }
    });
});
```

Notes
=====

- The default android keyboard will close when enter is pressed.