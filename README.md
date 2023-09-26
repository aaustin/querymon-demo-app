# Overview


This repo is a small demo React app showing a search-as-type implementation with all appropriate Querymon tracking implemented. If you are working in a Javascript environment, either frontend or backend, you can use the vanilla Querymon JS module in NPM. The module should work in any environment or framework due to its simplicity. The library has a single dependency, `uuid`, is extremely simple and is designed to be a very light wrapper around the Querymon API.

# Install the module (required)

The Javascript SDK should work in any environment, and can be added quickly from [NPM](https://www.npmjs.com/package/querymon).

```javascript NPM
npm install querymon
```
```Text Yarn
yarn add querymon
```

# Initialize the SDK (required)

Initializing the SDK is simple, but needs to be done in a location that will persist the instance of Querymon throughout the lifecycle of search, returning results and clicking. It should NOT re-instantiate mid cycle.

Below is a sample of initializing the SDK in App.js of a simple React app.

```javascript
// Once added via NPM
import { Querymon } from 'querymon';


/* @param {object} configuration
 * REQUIRED @param {string} configuration.searchInterfaceKey - The Search Interface Key
 * OPTIONAL @param {integer} configuration.debounceTime - The debounce time in ms for the search, defaults to 1000ms
 * OPTIONAL @param {string} configuration.userId - The userId to log for all events. If not provided, a random uuid will be generated
 */
const querymon = new Querymon({
  searchInterfaceKey: 'Your API key from https://app.querymon.com/search',
  userId: 'the persistent user ID to tie conversions, and do other reporting like cohorts'
});


export default function MyApp() {
  // Your application code
```

Note that for convenience, you can pass the `userId` here a single time, and it will automatically be appended to all future requests. If inconvenient, you can always pass the `userId` along with each request below.

# Log search (required)

The most basic logging can happen with a simple call to `logSearch` with the user query as show below.

### Basic method invocation

```javascript
// Register query with Querymon. Async fire and forget
querymon.logSearch('search query here');
```

### All method options

If you need further customization, such as analytics tagging and segmentation, to pass the user ID or override the timestamp that the query occurred, you can pass these parameters via the options object.

```javascript
/* Method to log search query
 * REQUIRED @param {string} query - The search query
 * OPTIONAL @param {object} options - An object of optional parameters
 *   OPTIONAL @param {list of strings} options.metadata - An array of up to 4 strings to categorize the search query
 *   OPTIONAL @param {string} options.userId - The userId to log for all events to override the userId provided in the constructor
 *   OPTIONAL @param {int} options.queryTime - The time the query began (ms since 1970), defaults to the time of method invocation
 */
querymon.logSearch('search query here', {
  metadata: ['variant A', 'split C'],
  userId: 'user 1234',
  queryTime: 1695674081849
});
```

# Log the results (required)

When the results are returned from the query, you can pass them to the result logging method call as shown below. Be careful to mind the format of the result objects.

### Basic method invocation

```javascript
// Register results with Querymon. Fire and forget.
querymon.logResults('search query here', yourResults.map((item, index) => {
  return {
    entityId: item.id,
    name: item.name,
    description: item.description,
    url: item.url,
    index: index
  };
}));
```

### All method options

You also have the ability to specify the `userId`and pass a specific timestamp if being logged later. Full example below:

```javascript
/* Method to log results that were returned
 * REQUIRED @param  {string}  query   - The search query
 * REQUIRED @param  {list}    results - The list of the results returned from the search engine
 *                              Example format: [{index: row number integer, entityId: 'identifier for the result', name: 'name of result string', description: 'short description of the result', url: 'url for result'}]
 * OPTIONAL @param  {object}  options - An object of optional parameters
 *   OPTIONAL @param   {string}  options.userId           - The userId to log for all events to override the userId provided in the constructor
 *   OPTIONAL @param   {int}  options.resultReturnTime - The time the results were returned (ms since 1970), defaults to the time of method invocation
 */
querymon.logResults('search query here', yourResults.map((item, index) => {
  return {
    entityId: item.id,
    name: item.name,
    description: item.description,
    url: item.url,
    index: index
  };
}), {
  userId: 'user 1234',
  resultReturnTime: 1695674081849
});
```

# Log click (required)

After you return the results to the user, if the user selects one of the results, you can log the click on the results with the following method. 

### Basic method invocation

The simplest version just logs the result row and name for matching.

```javascript
// Register interaction with Querymon
querymon.logClick('search query here', result.index, result.name);
```

### All method options

Again, you also have the ability to pass further parameters to specify the `userId` or interaction time if logging later than the actual event.

```javascript
/* Method to log clicks on results
 * REQUIRED @param  {string}  query   - The search query
 * REQUIRED @param  {int}  resultRow - The row for the result that was clicked
 * REQUIRED @param  {string}  resultName - The name of the result that was clicked
 * OPTIONAL @param  {object}  options - An object of optional parameters
 *   OPTIONAL @param   {string}  options.userId           - The userId to log for all events to override the userId provided in the constructor
 *   OPTIONAL @param   {int}  options.interactionTime - The time the result was clicked (ms since 1970), defaults to the time of method invocation
 */
querymon.logClick('search query here', result.index, result.name, {
	userId: 'user 1234',
  interactionTime: 1695674081849
});
```

# Log conversion event (optional)

Presumably this will happen later, on a different page from the search experience. Because of that, there is no need to pass the search query. Please do ensure to use the same `searchInterfaceKey` as used before to map the conversion data back to you search interface.

### Basic method invocation

```javascript
// Register conversion event with Querymon
querymon.logConversion('purchase');
```

### All method options

Again, you also have the ability to pass further parameters to specify the `userId` or event time if logging the event later. We also recommend that you pass the `eventValue` in cents to track revenue attribution.

```javascript
 /* Method to log a conversion event tied to the specific search interface
  * REQUIRED @param  {string}  eventName   - The name of the conversion event
  * OPTIONAL @param  {object}  options - An object of optional parameters
  *   OPTIONAL @param   {string}  options.eventValue - The value of the conversion event, in cents. No decimals.
  *   OPTIONAL @param   {string}  options.userId     - The userId to log for all events to override the userId provided in the constructor
  *   OPTIONAL @param   {int}  options.eventTime  - The time the conversion event occurred (ms since 1970), defaults to the time of method invocation
  */
querymon.logConversion('purchase', {
  eventValue: 999,
	userId: 'user 1234',
  eventTime: 1695674081849
});
```
