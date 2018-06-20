(function(nfw) {

    const StorageBucketPrefix = 'nfw-local-state-';
    var AppName = 'myapp';
    var StateChangeDelegates = [ ];
    var StateChangeTimestamps = { };
    var TopicDelegates = { };

    /**
     * Static class provides state management for application components
     * @class StateDelegate
     */
    nfw.StateDelegate = class {

        /**
         * Reserve local storage namespace to avoid collisions with other apps
         * @param {string} appName - The name of the application
         */
        static setNamespace(appName) {
            AppName = appName;
            localStorage.setItem(nfw.StateDelegate.getBucketName(), JSON.stringify({}));
        }

        /**
         * Observe all state-change events
         * @param {function} callback - Function to call upon state-change event
         * @returns {function} unsubscribe - Method to call to unsubscribe from the state-change event
         */
        static observeAll(callback) {
            StateChangeDelegates.push(callback);
            const index = StateChangeDelegates.length - 1;
            return () => {
                if (index >= StateChangeDelegates.length) return;
                StateChangeDelegates[index] = null; 
            }
        }

        /**
         * Observe state-change event
         * @param {string} topic - The topic to which caller subscribes (use "*" for all)
         * @param {function} callback - Function to call upon state-change event
         * @returns {function} unsubscribe - Method to call to unsubscribe from the state-change event
         */
        static observe(topic, callback) {
            if (topic == '*') {
                return nfw.StateDelegate.observeAll(callback);
            }
            else {
                if (!TopicDelegates.hasOwnProperty(topic)) {
                    TopicDelegates[topic] = [ ];
                }
                TopicDelegates[topic].push(callback);
                const index = TopicDelegates[topic].length - 1;
                return () => {
                    if (index >= TopicDelegates[topic].length) return;
                    TopicDelegates[topic][index] = null; 
                }
            }
        }

        /**
         * Set state data for a given topic
         * @param {string} topic - The topic to write to local storage
         * @param {object} state - State data to store with the topic
         */
        static setState(topic, data) {

            // get current state cache in its entirety
            let stateBucket = nfw.StateDelegate.getStateBucket();

            // determine whether to write to cache
            try {
                // compare current and new states
                const prevStateSerial = JSON.stringify(stateBucket);
                stateBucket[topic] = data;
                const nextStateSerial = JSON.stringify(stateBucket);

                // if state hasn't changed, check timestamp delta
                if (prevStateSerial == nextStateSerial) {
                    const nextTimestamp = Date.now();
                    const prevTimestamp = StateChangeTimestamps[topic] || nextTimestamp - 1000;

                    // ignore state change if insufficient time has passed since previous
                    if (nextTimestamp - prevTimestamp < 20) {
                        console.log(`ignoring redundant state change for topic ${topic}`);
                        return;
                    }
                }

                // write new data to cache
                StateChangeTimestamps[topic] = Date.now();
                localStorage.setItem(nfw.StateDelegate.getBucketName(), JSON.stringify(stateBucket));
            }
            catch(e) {
                console.error(`local storage write failed: ${e}`);
                return;
            }

            // combine topic delegates and state change delegates
            const topicCallbacks = TopicDelegates[topic] || [ ];
            const allCallbacks = StateChangeDelegates.concat(topicCallbacks);

            // notify delegates of new state 
            for (var x=0; x<allCallbacks.length; x++) {
                try {
                    if (!allCallbacks[x]) continue;
                    allCallbacks[x].apply(null, [topic, stateBucket]);
                }
                catch(e) {
                    console.log(`attempt to set state for topic ${topic}`);
                    console.error(`delegate invocation failed: ${e}`);
                }
            }
        }

        /**
         * Get state data for a given topic
         * @param {string} topic - The topic to get from local storage
         * @returns {object} state - State data stored with the topic
         */
        static getState(topic) {
            let stateBucket = nfw.StateDelegate.getStateBucket();
            try {
                return stateBucket[topic] || { };
            }
            catch(e) {
                console.warn(`cannot extract topic ${topic} from state bucket: ${e}`);
                return { };
            }
        }

        /**
         * Get state data for all topics
         * @returns data - State data stored with all topics
         */
        static getStateBucket() {
            try {
                // get state data from local storage
                let serializedBucket = localStorage.getItem(nfw.StateDelegate.getBucketName()) || JSON.stringify({ });
                let bucket = JSON.parse(serializedBucket);

                // return state data 
                return bucket;
            }
            catch(e) {
                console.error(`cannot deserialize state bucket: ${e}`);
                return { };
            }
        }

        /**
         * Get local storage bucket name. Before calling this method be sure to 
         * initialize namespace by calling setNamespace();
         * @returns {string} bucketName - Unique identifier for app's state storage bucket
         */
        static getBucketName() {
            return `${StorageBucketPrefix}${AppName}`;
        }
    }

}(window.nfw = window.nfw || {}));
