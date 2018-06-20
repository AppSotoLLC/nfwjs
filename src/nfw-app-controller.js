(function(nfw) {

    nfw.AppController = class {

        constructor(appName) {
            // initialize namespace
            this.appNamespace = appName;
            nfw.StateDelegate.setNamespace(appName);

            // subscribe to state change events
            nfw.StateDelegate.observeAll(this.handleStateChange.bind(this));

            // instantiate view components
            this.createViewComponents(); 

            // logging
            console.log(`${this.appNamespace} is ready`);
        }

        handleStateChange(topic, newStateData) {
            console.log(`${topic} state change`);
            //console.log(JSON.stringify(newStateData));
        }

        createViewComponents() {
            // instantiate component store
            this.components = { };
            var component = null;

            // validate namespace
            if (!window.hasOwnProperty(this.appNamespace)) {
                window[this.appNamespace] = { };
            }

            // iterate classes in namespace
            const classNameList = Object.keys(window[this.appNamespace]);
            for (var x=0; x<classNameList.length; x++) {

                // ignore class if not a view component class
                const className = classNameList[x];
                if (!window[this.appNamespace][className].isViewComponentClass) continue;

                // instantiate view component instance
                component = new window[this.appNamespace][className](className);

                // keep reference to view component if it has valid dom
                if (component.hasValidDom()) {
                    console.log(`${className} component created`);
                    this.components[className] = component;
                }
                else {
                    component = null;
                    console.warn(`cannot create component with class ${className}`);
                }
            }
            
        }

    }

}(window.nfw = window.nfw || {}));

