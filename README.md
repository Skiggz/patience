Patience
========

Patience is a lightweight javascript tool that allows you to wait for various conditions to be met, before doing something else.

----

Patience was originally created as a test helper, but can surely be used for other things. In any test scenario, you want to keep your test code out of your production code. With javascript, it's really easy to be intrusive. Patience avoids being intrusive, and lets you test asynchronous computation without latching into any of the code running it.

Patience has many similarities to some of the helper methods from [Casper JS](http://casperjs.org/) and uses native Promises (in browser land) that makes the syntax very easy to read and use. If you are not familiar with browser Promises, check out [mozilla's explanation here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

Last but not least, some more of the syntax was influenced by Pivotal's test framework [Jasmine JS](http://jasmine.github.io/)

#Usage
###Core Functionality
Let us say that you have a calorie counting app, and when you load the page a global value `calories` starts incrementing. We can use patience to wait for that value to reach 500 or above, and then alert something on screen.

```javascript
var isFull = function() {
   return calories > 500;
};
Patience.waitFor(isFull).toBe(true).then(function() {
   // This is your success callback
   alert('Ate more than 500 calories');
}, function() {
   // This is your fail callback, which happens when Patience times out
   alert('Never quite got to 500...');
});
```
###jQuery Built Ins
Patience also works great with jQuery selectors, and is incredibly useful for testing the DOM. Some great examples are, waiting for animations to finish, waiting for long computations, or asynch API calls to finish *without hooking into production code*. No mocks, no manipulation, just waiting patiently in test code land.

With that being said, let us say that our calorie counting app pops up a monster when the calorie count gets to 500.

```javascript
Patience.waitForSelector('#calorie-monster').toBe.visible().then(function(){
    alert('Calorie monster popped up!');
 }, function() {
    alert('Calorie monster never popped up..');
 });
```
Patience comes with three built-in selector checks

* `Patience.waitForSelector(<jquery selector>).toBe.visible()`
* `Patience.waitForSelector(<jquery selector>).toBe.hidden()`
* `Patience.waitForSelector(<jquery selector>).toBe.present()`

#Customization
Patience will time out a call based on the default timeout, or the timeout specified. Each call to .waitFor and .waitForSelector accepts a second argument that can override the default timeout (milliseconds). If you want to change the default, or the interval in which Patience checks conditions, use the following methods:

* `Patience.setDefaultTimeout(10000) // 10 seconds`
* `Patience.setDefaultInterval(100) // 10 times a second`

#Demo

Check out [Patience in action!](http://skiggz.github.io/patience/)

#jQuery
Currently Patience requires jQuery for use of the built in helpers. However, Patience will still work without it. I may move this complely away from jQuery in the future, but do not have plans to as of now. **The core funcitonality does not require jQuery**.

#Installation
If you want to use the built-ins, include jQuery first, then patience. Otherwise, you just need `patience.js`.
```html
<script type="text/javascript" src="patience.js"></script>
```

#Contact

As always, if you find issues with anything I've shared on github, open a ticket in github tracker or submit a pull request! Features or bugs! Thanks!