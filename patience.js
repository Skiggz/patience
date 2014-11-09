/*
 Limited scope for setup
*/
(function() {
    "use strict"
    var PatienceError = function(msg) {
        this.toString = function() {
            return '[ PatienceError: ' + msg + ' ]';
        };
    };

    /*
        Decent visibility check using jQuery
    */
    function hidden(item) {
        var sizeless = item.css('overflow') === 'hidden' && (item.height() === 0 || item.width() === 0);
        return (
            item.css('display') === 'none' ||
            item.css('visibility') === 'hidden' ||
            item.css('opacity') == 0 ||
            sizeless
        );
    }

    if (void(0) === window) {
        throw new PatienceError('window is not defined. Are you using Patience in a web browser? Currently that is all it supports.');
    }

    if (window.Patience) {
        throw new PatienceError('Patience is already defined. :(');
    }

    window.Patience = new (function() {

        var self = this;
        this.DEFAULT_TIMEOUT = 5000;
        this.DEFAULT_INTERVAL = 500;
        this.has$ = false;

        if (void(0) === window.jQuery && window.console && window.console.log) {
            console.log('jQuery was not found, some features will be restricted. If you are using jQuery, load patience.js after jQuery.');
        } else {
            self.has$ = true;
        }

        /*
            Ironically, Patience isn't very patient. 
            After a certain amount of time, Patience will call
            the reject method to indicate that whatever you
            were waiting for "never" happened.
        */
        this.setDefaultTimeout = function(timeout) {
            if (isNaN(timeout) || typeof timeout != 'number') {
                throw new PatienceError('setDefaultTimeout expects a number (milliseconds)');
            }
            self.DEFAULT_TIMEOUT = timeout;
        };

        /*
            Default interval is how often Patience waiters will
            look for the specified condition to be met
        */
        this.setDefaultInterval = function(timeout) {
            if (isNaN(timeout) || typeof timeout != 'number') {
                throw new PatienceError('setDefaultInterval expects a number (milliseconds)');
            }
            self.DEFAULT_INTERVAL = timeout;
        };

        /*
        * Simply for debugging and keeping track of
        * possible leaks. All waiter objects get stuffed
        * into here until they are gone, which, if all goes
        * correctly should clean themsevles up.
        * */
        this.waiters = {};
        // arbitrary counter for keying waiters map
        this.waiterCounter = 0;
        this.addWaiter = function(w) {
            w.id = self.waiterCounter;
            self.waiters[w.id] = w;
            self.waiterCounter += 1;
        };
        this.removeWaiter = function(w) {
            delete self.waiters[w.id];
        };

        this.finish = function(waiter, complete) {
            clearInterval(waiter.interval);
            self.removeWaiter(waiter);
            complete();
        };

        /*
        * Patience is simply an interface to create new waiters
        *
        * Waiters get instantiated and start waiting for
        * methods to return true, then makes it's best
        * attempt to clean itself up. It's simpler
        * than trying to manage many intervals in the
        * scope of the Patience parent object
        * */
        var Waiter = function(fn, result, timeout) {
            var w = this;
            this.interval = null;
            this.id = null;
            this.start = function(resolve, reject) {
                var startTime = +new Date();
                w.interval = setInterval(function() {
                    if (+new Date() - startTime > timeout) {
                        // Condition was not met in time
                        self.finish(w, reject);
                    } else {
                        var r = fn();
                        if (r === result) {
                            self.finish(w, resolve);
                        }
                    }
                }, self.DEFAULT_INTERVAL);
            };

        };

        function checkTimeout(timeout) {
            timeout = timeout || self.DEFAULT_TIMEOUT;
            if (!timeout || isNaN(timeout) || timeout < 501) {
                throw new PatienceError('Specified Patience.waitFor timeout is too short.');
            }
            return timeout;
        }

        this.waitFor = function waitFor(fn, timeout) {
            if (typeof fn != 'function') {
                throw new PatienceError("waitFor() requires a function argument (a condition to periodically check)");
            }
            timeout = checkTimeout(timeout);
            return {
                toBe: function(result) {
                    if (arguments.length > 0) {
                        var w = new Waiter(fn, result, timeout);
                        self.addWaiter(w);
                        return new Promise(function(resolve, reject) {
                            w.start(resolve, reject);
                        });
                    } else {
                        throw new PatienceError('You must set a result with .toBe(<result>)');
                    }
                }
            };
        };

        this.waitForSelector = function(selector, timeout) {
            if (!self.has$) {
                throw new PatienceError("Patience.waitForSelector requires jQuery");
            }
            if (typeof selector != 'string') {
                throw new PatienceError("waitForSelector() requires a selector");
            }
            timeout = checkTimeout(timeout);
            return {
                toBe: {
                    visible: function() {
                        var fn = function() {
                            var item = $(selector);
                            return item && !hidden(item);
                        };
                        var w = new Waiter(fn, true, timeout);
                        self.addWaiter(w);
                        return new Promise(function(resolve, reject) {
                            w.start(resolve, reject);
                        });
                    },
                    hidden: function() {
                        var fn = function() {
                            var item = $(selector);
                            return item && hidden(item);
                        };
                        var w = new Waiter(fn, true, timeout);
                        self.addWaiter(w);
                        return new Promise(function(resolve, reject) {
                            w.start(resolve, reject);
                        });
                    },
                    present: function() {
                        var fn = function() {
                            var item = $(selector);
                            return !!item && item.length > 0;
                        };
                        var w = new Waiter(fn, true, timeout);
                        self.addWaiter(w);
                        return new Promise(function(resolve, reject) {
                            w.start(resolve, reject);
                        });
                    }
                }
            }

        };

    })();
})();