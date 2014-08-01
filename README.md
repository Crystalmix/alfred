Alfred
================

Alfred widget

## Example usage

```html
<alfred connections="connections"
        histories="histories"
        amount="6"
        height-cell="45"
        placeholder="placeholder"
        on-enter-callback="enterConnection(connection)"
        on-add-callback="addConnection()"
        on-edit-callback="editConnection(connection)"
        on-remove-callback="removeConnection(connection)">
</alfred>
```


## Paramaters

"connections" - array of json objects of hosts

"histories" - array of json objects of histories

"amount" - amount of cells at the list

"height-cell" - height of the cell (px)

"placeholder" - placeholder at the input field (ssh user@hostname -p port)

"on-enter-callback" - callback which get connection on the 'enter' event

"on-add-callback" - callback which get add connection

"on-edit-callback" - callback which get connection on the 'edit' event

"on-remove-callback" - callback which get connection on the 'remove' event


## Install requirements

```bash
$ npm install
$ bower install
```

Add custom styles to the class
```css
.alfred-widget {
    /* add custom styles*/
}
```

## Build

```bash
$ grunt
```


## Tests

Run test server

```bash
$ grunt test
```

## Demo

```bash
$ grunt demo
```
