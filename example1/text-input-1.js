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
