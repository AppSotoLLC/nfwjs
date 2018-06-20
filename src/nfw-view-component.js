(function(nfw) {

    nfw.ViewComponent = class extends nfw.HeadlessComponent {

        /**
         * Perform any initialization that should occur after instantiation. 
         * This method should be overloaded by child class.
         */
        initialize() {
            //
        }

        /**
         * Determine whether current HTML document includes markup
         * needed for component to function correctly.
         */
        hasValidDom(requiredIdList = [ ]) {
            let self = this.getElement();
            if (self.length != 1) {
                console.warn(`view component requires unique dom node with id ${this.id}`);
                return false;
            }
            for (var x=0; x<requiredIdList.length; x++) {
                const id = requiredIdList[x];
                const e = $('#'+id);
                if (e.length != 1) {
                    console.warn(`view component requires unique dom node with id ${id}`);
                    return false;
                }
            }
            return true;
        }

        /**
         * Get handle to jquery element to which component is attached
         * @returns {object} element - jQuery element or empty array
         */
        getElement() {
            try {
                let element = $('#'+this.id);
                return element;
            }
            catch(e) {
                return [ ];
            }
        }

    }

    nfw.ViewComponent.isViewComponentClass = true;

}(window.nfw = window.nfw || {}));

