(function(myapp) {

    myapp.Headline = class extends nfw.ViewComponent {

        initialize() {
            this.textBuffer = '';
            this.observe('TextInput');
            this.observe('Button1');
            this.observe('Button2');
        }

        handleStateChange(changedComponentName, state) {

            if (changedComponentName == 'TextInput') {
                this.textBuffer = String(state.TextInput.currentValue);
            }

            if (changedComponentName == 'Button1' && this.textBuffer.length > 0) {
                const currentContent = this.getElement().text();
                const newContent = `${currentContent} ${this.textBuffer}`;
                this.getElement().text(newContent);
            }

            if (changedComponentName == 'Button2') {
                this.textBuffer = '';
                this.getElement().text('');
            }
        }
    }

}(window.myapp = window.myapp || {}));
