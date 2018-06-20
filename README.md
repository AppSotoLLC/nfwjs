# Introduction 

Nfw.js makes it easy to build modular web apps using plain old web standards. Nfw.js does not use compilers, directives, special syntax, command line tools, or anything else that adds complexity to web development. Nfw.js simply uses JavaScript, HTML5, and a few well-established software design patterns. 

# Getting Started

This short guide will illustrate how to transform a static HTML web page into a dynamic web app.

## User Interface

First, create a static web page `index.html` that includes Nfw.js and jQuery. This example also uses Bootstrap CSS, although it is not required. 

```html
<!-- index.html -->

<!doctype html>
<html lang="en">
    <head>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css">
        <title>Nfw.js Example #1</title>
    </head>
    <body>
        <div class="container">
            <br/>
            <div class="form-group">
                <input class="form-control" placeholder="Type hello world to enable button" id="TextInput" autofocus>
            </div>
            <div class="form-group">
                <button class="btn btn-primary" id="Button1" disabled>Clear</button>
            </div>
        </div>
        <script src="https://code.jquery.com/jquery-3.3.1.min.js"></script>
        <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/js/bootstrap.min.js"></script>
        <script src="./nfw.min.js"></script>
        <script>
        $(document).ready(function() {
            let appController = new nfw.AppController('myapp');
        });
        </script>
    </body>
</html>
```

Open `index.html` in a web browser. The web page itself should contain a text input field and a disabled button. The JavaScript console should contain a message such as `myapp is ready`. 

## Application Logic

The next step is to add application logic that will be modular, maintainable, and extensible. This will be done by writing Nfw.js components to define the behavior of the DOM elements with `id` attributes `TextInput1` and `Button1`.  

```javascript
// button-1.js

(function(myapp) {

    myapp.Button1 = class extends nfw.ViewComponent {

        initialize() {
            this.observe('TextInput1');
        }

        handleStateChange(changedComponentName, state) {
            if (changedComponentName == 'TextInput1') {
                const buttonIsDisabled = (state.TextInput1.meetsRequirements);
                this.getElement().prop('disabled', buttonIsDisabled);
            }
        }

    }

}(window.myapp = window.myapp || {}));
```

The JavaScript file `button-1.js` defines the `Button1` class in the `myapp` namespace while using the IIFE pattern to safely access `myapp`. The JavaScript file `text-input-1.js` follows the same pattern, extending the `ViewComponent` class to define a Nfw.js custom component.

```javascript
// text-input-1.js

(function(myapp) {

    myapp.TextInput1 = class extends nfw.ViewComponent {

        initialize() {
            this.getElement().keyup((event) => { this.handleKeyupEvent(event) });
        }

        handleKeyupEvent(event) {
            // ignore certain keystrokes
            const ignored = [16, 17, 18, 27, 37, 38, 39, 40, 91, 93];
            if (ignored.includes(event.which)) return;

            // validate input
            const value = this.getElement().val().toLowerCase();
            const isHelloWorld = (value == 'hello world');

            // validate input, notify observers
            this.setState({
                meetsRequirements: isHelloWorld,
                value: this.getElement().val()
            });
        }
    }

}(window.myapp = window.myapp || {}));

```

The JavaScript files should be included in `index.html` *after* the inclusion of `nfw.min.js`. 

```html
        <script src="./nfw.min.js"></script>
        <script src="./button-1.js"></script>
        <script src="./text-input-1.js"></script>
```

After reloading `index.html` in a web browser, the JavaScript console should contain messages such as `Button1 is observing TextInput1`, `Button1 component created`, and `TextInput1 component created`. 

Type “hello world” (or “HeLLo WoRLd”) into the input field and notice when the button transitions from disabled to enabled.

## How It Works

When `index.html` is loaded into a web browser, the following line of code creates an `AppController` for the app named `myapp`:

```html
            let appController = new nfw.AppController('myapp');
```

When `AppController` is created, it automatically tries to match class names in the `myapp` namespace with `id` attributes of DOM elements. When a match is found, `AppController` creates an instance of the matching class (matches are only sought for classes that extend `nfw.ViewComponent`).

When a class instance is created by Nfw.js, the component's `initialize` method is automatically called.


```javascript
        initialize() {
            this.observe('TextInput1');
        }
```


The `observe` method tells Nfw.js that the *observing* component (represented by `this`) wants to execute code when the *observed* component changes state. In the example, the `Button1` component observes the `TextInput1` component. 

Any component that observes other components must have a `handleStateChange` method in its class definition. The `handleStateChange` method is called automatically when an observed component changes state. 

```javascript
        handleStateChange(changedComponentName, state) {
            if (changedComponentName == 'TextInput1') {
                const buttonIsDisabled = (state.TextInput1.meetsRequirements);
                this.getElement().prop('disabled', buttonIsDisabled);
            }
        }
```

The first parameter to `handleStateChange` indicates which component has changed state, and the second parameter is a JavaScript object representing the new state of the changed component. In the example, the `Button1` component reacts to a state change event from the `TextInput1` component by setting a property on the DOM element with which it is coupled (but only if the `state` object indicates that certain business rules have been met).

A component changes state by calling its `setState` method. 

```javascript
            this.setState({
                meetsRequirements: isHelloWorld,
                value: this.getElement().val()
            });
```

The one and only argument to `setState` is a JavaScript object literal. The object literal can and should contain key/value pairs that accurately describe the state of the component, at the discretion of the developer. There is an implicit contract between *observee* and *observers* regarding the schema of the object literal. Nfw.js will not protect observers from exceptions for referencing `state.values.that.do.not.exist`.

The `getElement` method, a feature of the `ViewComponent` class, returns a jQuery object for the DOM element with which the component is coupled. In the example, `TextInput1` calls `getElement` as an alternative to the jQuery selector `$(“#TextInput1”)` and then binds to the jQuery object's `keyup` event. 

```javascript
            this.getElement().keyup((event) => { this.handleKeyupEvent(event) });
```

# Headless Components

Unlike `ViewComponent` objects, `HeadlessComponent` objects are not automatically created by `nfw.AppController`. It is the responsibility of the developer to create `HeadlessComponent` objects if and when needed. This section describes a use case in which a `HeadlessComponent` is part of the solution. 

In the example code in the *Getting Started* section, typing a certain phrase into the form field enables the button, but nothing happens when the button is clicked. Assuming the phrase should be posted to an API endpoint, a `HeadlessComponent` can be implemented to add networking capability to the web app. 

```javascript
(function(myapp) {

    myapp.NetworkWorker = class extends nfw.HeadlessComponent {

        initialize() {
            this.observe('Button1');
            this.observe('TextInput1');
            this.textInputBuffer = '';
        }

        handleStateChange(changedComponentName, state) {
            if (changedComponentName == 'Button1') {
                const endpointUrl = 'http://example.com';
                this.sendPostRequest(endpointUrl, { textInput: this.textInputBuffer });
            }
            if (changedComponentName == 'TextInput1') {
                if (state.TextInput1.meetsRequirements) {
                    this.textInputBuffer = state.TextInput1.value;
                }
                else {
                    this.textInputBuffer = '';
                }
            }
        }

        sendPostRequest(url, data) {
            try {
                const request = $.ajax({
                    type: 'POST',
                    url: url,
                    data: JSON.stringify(data)
                });
                request.done((data, status) => {
                    this.setState({
                        method: 'POST',
                        url: url,
                        status: status,
                        data: data
                    });
                });
            }
            catch(e) {
                console.error(`cannot complete post request: ${e}`);
            }
        }

    }

}(window.myapp = window.myapp || {}));

```

The JavaScript file should be included in `index.html`.

```html
        <script src="./network-worker.js"></script>
```

The object can be created after the app controller in `index.html`. When creating a `HeadlessComponent` it is necessary to include a unique identifier as an argument to the constructor. 

```javascript
        <script>
        $(document).ready(function() {
            let appController = new nfw.AppController('myapp');
            let networkWorker = new myapp.NetworkWorker(‘NetworkerWorker’);
        });
        </script>
```

# Core Concepts

While building an app with Nfw.js, the developer should embrace these concepts:

+ The application is the sum of its parts, and the parts are called components. 
+ A component defines the behavior for a discrete part of the user experience.
+ Components advance the user experience one event at a time by observing state changes and reacting accordingly.

Nfw.js provides two component classes, `HeadlessComponent` and `ViewComponent`, which can be used as the basis of an entire web app.

# Class Reference

## HeadlessComponent

The `HeadlessComponent` class should be used to define behavior of background activities such as networking and data processing. The class exposes the following methods:

#### initialize()
Performs any initialization that should occur after component instantiation. This method should be overloaded in child class.

#### handleStateChange(componentName, newState) 
This method is called when any observed components change state. This method should be overloaded in child class.

#### observe(componentName) 
Call this method to begin observing another component. Returns a method for unobserving.

#### setState(state) 
Call this method to announce state change to observing components. Parameter `state` is object literal of key/value pairs that describe the component’s current state.

## ViewComponent

The `ViewComponent` class should be used to define behavior of tightly coupled user interface elements. The class exposes the `HeadlessComponent` class methods listed above, as well as the following additional methods:

#### getElement()
Call this method to get a jQuery object for the DOM element with which the component is coupled. Functionally equivalent to `${“#componentName”}`.
