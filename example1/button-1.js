(function(myapp) {

    myapp.Button1 = class extends nfw.ViewComponent {

        initialize() {
            this.observe('TextInput1');
        }

        handleStateChange(changedComponent, state) {
            if (changedComponent == 'TextInput1') {
                const buttonIsDisabled = (!state.TextInput1.meetsRequirements);
                this.getElement().prop('disabled', buttonIsDisabled);
            }
        }

    }

}(window.myapp = window.myapp || {}));
