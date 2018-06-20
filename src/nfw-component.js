(function(nfw) {

    nfw.HeadlessComponent = class {

        /**
        * Creates a new Headless Component
        * @constructor 
        * @param {string} componentId - The unique identifier for the component
        */
        constructor(componentId) {
            if (!componentId) {
                console.error('cannot instantiate component without id');
                return;
            }
            this.id = componentId;
            this.initialize();
        }

        /**
         * Perform any initialization that should occur after instantiation. 
         * This method should be overloaded by child class.
         */
        initialize() {
            //
        }

        /**
         * Announce state change to observing components
         * @param {object} state - State of component as represented by key/value pairs
         */
        setState(state) {
            nfw.StateDelegate.setState(this.id, state);
        }

        /**
         * Invoked when observed component changes state 
         * @param {string} componentName - Name of component that has changed state
         * @param {object} state - State of component as represented by key/value pairs
         */
        handleStateChange(componentName, newState) {
            //
        }

        /**
         * Observe other component's state change events
         * @param {string} componentName - The name of the component to observe
         * @returns {function} unObserve - Method to call to stop observing 
         */
        observe(target) {
            console.log(`${this.id} is observing ${target}`);
            if (target == this.id) {
                console.warn(`cannot observe self: ${this.id}`);
                return ()=>{};
            }
            return nfw.StateDelegate.observe(target, this.handleStateChange.bind(this));
        }

    }

}(window.nfw = window.nfw || {}));

