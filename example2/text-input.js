(function(myapp) {

    myapp.TextInput = class extends nfw.ViewComponent {

        initialize() {
            this.observe('Button2');
            this.getElement().keyup((event) => { this.handleKeyupEvent(event) });
        }

        handleStateChange(changedComponentName, state) {
            if (changedComponentName == 'Button2') {
                this.getElement().val('');
                this.getElement().focus();
            }
        }

        handleKeyupEvent(event) {
            const ignored = [16, 17, 18, 27, 37, 38, 39, 40, 91, 93];
            if (ignored.includes(event.which)) return;
            this.setState({
                currentValue: this.getElement().val()
            });
        }

    }

}(window.myapp = window.myapp || {}));
