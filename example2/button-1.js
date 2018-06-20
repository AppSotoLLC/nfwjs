(function(myapp) {

    myapp.Button1 = class extends nfw.ViewComponent {

        initialize() {
            this.getElement().click((event) => { this.handleClick(event) });
        }

        handleClick(event) {
            this.setState({ 
                lastClickTimestamp: Date.now()
            });
        }
    }

}(window.myapp = window.myapp || {}));
