(function(myapp) {

    myapp.Summary = class extends nfw.ViewComponent {

        initialize() {
            this.observe('*');
        }

        handleStateChange(changedComponentName, state) {
            const currentContent = this.getElement().html();
            const newContent = `[${Date.now()}] ${changedComponentName} component changed state\n`;
            this.getElement().html(newContent + currentContent);
        }
    }

}(window.myapp = window.myapp || {}));
