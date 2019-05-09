const every = require('lodash.every');
const last = require('lodash.last');

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

async function asyncForEachParallel(array, callback) {
  const queue = [];
  for (let index = 0; index < array.length; index++) {
    queue.push(callback(array[index], index, array));
  }
  await asyncForEach(queue, async i => {
    await i;
  });
}

/**
 * View Constructor
 * =================
 *
 * Helper to simplify view logic in a Keystone application
 *
 * @api public
 */

module.exports = class View {
  // req: Request;
  // res: Response;
  // queryQueue: any[];
  // initQueue: any[];
  // renderQueue: any[];
  // actionQueue: any[];

  constructor(
    keystone,
    req,
    res,
    { schemaName = 'admin', populateRelated = null, allowQueryFromAction = true } = {}
  ) {
    if (!req || req.constructor.name !== 'IncomingMessage') {
      throw new Error('Keystone.View Error: Express request object is required.');
    }
    if (!res || res.constructor.name !== 'ServerResponse') {
      throw new Error('Keystone.View Error: Express response object is required.');
    }

    this.keystone = keystone;
    this.req = req;
    this.res = res;
    this.schemaName = schemaName;
    this.populateRelated = populateRelated;
    this.allowQueryFromAction = allowQueryFromAction;

    this.initQueue = []; // executed first in series
    this.actionQueue = []; // executed second in parallel, if optional conditions are met
    this.queryQueue = []; // executed third in parallel
    this.renderQueue = []; // executed fourth in parallel
  }

  on(on, condition, cb) {
    const req = this.req;
    let callback = condition;

    if (typeof on === 'function') {
      /* If the first argument is a function that returns truthy then add the second
       * argument to the action queue
       *
       * Example:
       *
       *     view.on(function() {
       *             var thing = true;
       *             return thing;
       *         },
       *         function(next) {
       *             console.log('thing is true!');
       *             next();
       *         }
       *     );
       */

      if (on()) {
        this.actionQueue.push(callback);
      }
    } else if (typeof on === 'object' && on !== null) {
      /* Do certain actions depending on information in the response object.
       *
       * Example:
       *
       *     view.on({ 'user.name.first': 'Admin' }, function(next) {
       *         console.log('Hello Admin!');
       *         next();
       *     });
       */

      const check = (value, path) => {
        let ctx = req;
        const parts = path.split('.');
        for (let i = 0; i < parts.length - 1; i++) {
          if (!ctx[parts[i]]) {
            return false;
          }
          ctx = ctx[parts[i]];
        }
        path = last(parts);
        return value === true && path in ctx ? true : ctx[path] === value;
      };

      if (every(on, check)) {
        this.actionQueue.push(callback);
      }
    } else if (on === 'get' || on === 'post' || on === 'put' || on === 'delete') {
      /* Handle HTTP verbs
       *
       * Example:
       *     view.on('get', function(next) {
       *         console.log('GOT!');
       *         next();
       *     });
       */
      if (req.method !== on.toUpperCase()) {
        return this;
      }

      if (arguments.length === 3) {
        /* on a POST and PUT requests search the req.body for a matching value
         * on every other request search the query.
         *
         * Example:
         *     view.on('post', { action: 'theAction' }, function(next) {
         *         // respond to the action
         *         next();
         *     });
         *
         * Example:
         *     view.on('get', { page: 2 }, function(next) {
         *         // do something specifically on ?page=2
         *         next();
         *     });
         */

        callback = cb;

        let values = {};
        if (typeof condition === 'string') {
          values[condition] = true;
        } else {
          values = condition;
        }

        const ctx = on === 'post' || on === 'put' ? req.body : req.query;

        if (
          !every(values || {}, function(value, path) {
            return value === true && path in ctx ? true : ctx[path] === value;
          })
        ) {
          return this;
        }
      }

      this.actionQueue.push(callback);
    } else if (on === 'init') {
      /* Init events are always fired in series, before any other actions
       *
       * Example:
       *     view.on('init', function (next) {
       *         // do something before any actions or queries have run
       *     });
       */

      this.initQueue.push(callback);
    } else if (on === 'render') {
      /* Render events are always fired last in parallel, after any other actions
       *
       * Example:
       *     view.on('render', function (next) {
       *         // do something after init, action and query middleware has run
       *     });
       */

      this.renderQueue.push(callback);
    }

    // TODO: Should throw if we didn't recognise the first argument!

    return this;
  }

  /**
   * Queues a mongoose query for execution before the view is rendered.
   * The results of the query are set in `locals[key]`.
   *
   * Keys can be nested paths, containing objects will be created as required.
   *
   * The third argument `then` can be a method to call after the query is completed
   * like function(err, results, callback), or a `populatedRelated` definition
   * (string or array).
   *
   * Examples:
   *
   * view.query('books', keystone.list('Book').model.find());
   *
   *     an array of books from the database will be added to locals.books. You can
   *     also nest properties on the locals variable.
   *
   * view.query(
   *     'admin.books',
   *      keystone.list('Book').model.find().where('user', 'Admin')
   * );
   *
   *     locals.admin.books will be the result of the query
   *     views.query().then is always called if it is available
   *
   * view.query('books', keystone.list('Book').model.find())
   *     .then(function (err, results, next) {
   *         if (err) return next(err);
   *         console.log(results);
   *         next();
   *     });
   *
   * @api public
   */
  query(key, query, options) {
    if (typeof query === 'string') {
      return this._queryGql(key, query, options);
    }
    return this._queryLegacy(key, query, options);
  }

  _queryGql(key, query, { variables = null, unwrap = true, ...options } = {}) {
    let locals = this.res.locals;
    const parts = key.split('.');
    const chain = new QueryCallbacks(options);

    key = parts.pop();

    for (let i = 0; i < parts.length; i++) {
      if (!locals[parts[i]]) {
        locals[parts[i]] = {};
      }
      locals = locals[parts[i]];
    }

    this.queryQueue.push(async () => {
      const callbacks = chain.callbacks;
      const queryFn = this.keystone._graphQLQuery[this.schemaName];
      const context = this.keystone.getAccessContext(this.schemaName, this.req);
      try {
        const { data, errors } = await queryFn(query, context, variables);
        locals[key] = data;
        const resultKeys = Object.keys(data || {});
        if (unwrap && resultKeys.length === 1) {
          locals[key] = data[resultKeys[0]];
        }
        if (
          'none' in callbacks &&
          every(data, value => !value || (Array.isArray(value) && !value.length))
        ) {
          /* If there are no results view.query().none will be called
           *
           * Example:
           *     view.query('books', keystone.list('Book').model.find())
           *         .none(function (next) {
           *             console.log('no results');
           *             next();
           *         });
           */
          await callbacks.none();
        } else if ('then' in callbacks) {
          if (typeof callbacks.then === 'function') {
            await callbacks.then(null, data);
          } else {
            //return keystone.populateRelated(results, callbacks.then, next);
            // should not reach here anyways
            await callbacks.err(new Error('populateRelated is not implemented'));
          }
        }

        // there could be errors in graphql operation which is returned above
        if (errors && 'err' in callbacks) {
          /* Will pass errors into the err callback
           *
           * Example:
           *     view.query('books', keystone.list('Book'))
           *         .err(function (err, next) {
           *             console.log('ERROR: ', err);
           *             next();
           *         });
           */
          await callbacks.err(errors);
        }
      } catch (err) {
        if ('err' in callbacks) {
          /* Will pass errors into the err callback
           *
           * Example:
           *     view.query('books', keystone.list('Book'))
           *         .err(function (err, next) {
           *             console.log('ERROR: ', err);
           *             next();
           *         });
           */
          await callbacks.err(err);
        } else if ('then' in callbacks) {
          if (typeof callbacks.then === 'function') {
            await callbacks.then(err);
          }
        }
      }
    });

    return chain;
  }

  _queryLegacy(key, query, options) {
    let locals = this.res.locals;
    const parts = key.split('.');
    const chain = new QueryCallbacks(options);

    key = parts.pop();

    for (let i = 0; i < parts.length; i++) {
      if (!locals[parts[i]]) {
        locals[parts[i]] = {};
      }
      locals = locals[parts[i]];
    }

    this.queryQueue.push(async () => {
      const callbacks = chain.callbacks;
      try {
        const results = await query.exec();
        locals[key] = results;

        if ((!results || (Array.isArray(results) && !results.length)) && 'none' in callbacks) {
          /* If there are no results view.query().none will be called
           *
           * Example:
           *     view.query('books', keystone.list('Book').model.find())
           *         .none(function (next) {
           *             console.log('no results');
           *             next();
           *         });
           */
          await callbacks.none();
        } else if ('then' in callbacks) {
          if (typeof callbacks.then === 'function') {
            await callbacks.then(null, results);
          } else if (typeof this.populateRelated === 'function') {
            await this.populateRelated(results, callbacks.then);
          }
        }
      } catch (err) {
        if ('err' in callbacks) {
          /* Will pass errors into the err callback
           *
           * Example:
           *     view.query('books', keystone.list('Book'))
           *         .err(function (err, next) {
           *             console.log('ERROR: ', err);
           *             next();
           *         });
           */
          await callbacks.err(err);
        } else if ('then' in callbacks) {
          if (typeof callbacks.then === 'function') {
            await callbacks.then(err);
          }
        }
      }
    });

    return chain;
  }

  /**
   * Executes the current queue of init and action methods in series, and
   * then executes the render function. If renderFn is a string, it is provided
   * to `res.render`.
   *
   * It is expected that *most* init and action stacks require processing in
   * series.  If there are several init or action methods that should be run in
   * parallel, queue them as an array, e.g. `view.on('init', [first, second])`.
   *
   * @api public
   */
  async render(renderFn, locals, callback) {
    let renderFnLocal = renderFn;
    const req = this.req;
    const res = this.res;
    let queryQueue = [...this.queryQueue];
    // clear queryQueue to capture new query que and place them on front
    this.queryQueue = [];

    if (typeof renderFn === 'string') {
      const viewPath = renderFn;
      renderFnLocal = async () => {
        if (typeof locals === 'function') {
          locals = locals();
        }
        this.res.render(viewPath, locals, callback);
      };
    }

    if (typeof renderFnLocal !== 'function') {
      throw new Error(
        'Keystone.View.render() renderFn must be a templatePath (string) or a function.'
      );
    }

    // process init queue and action queue, this allows more query to be queued during init queue and action que conditionally
    await asyncForEach([...this.initQueue, ...this.actionQueue], async i => {
      if (Array.isArray(i)) {
        // process nested arrays in parallel
        await asyncForEachParallel(i, _ => _());
      } else if (typeof i === 'function') {
        // process single methods in series
        await i();
      } else {
        throw new Error('View.render() events must be functions.');
      }
    });
    // ,  async err => {

    // });

    if (this.allowQueryFromAction) {
      // refresh query queue from changes made in execution of the init and action queue. place queries from action queue at front.
      queryQueue = [...this.queryQueue, ...queryQueue];
    }

    const preRenderQueue = [];

    // TODO: enable global pre:render queue on keystone or on view.
    // Add Keystone's global pre('render') queue
    // keystone.getMiddleware('pre:render').forEach(function (fn) {
    //     preRenderQueue.push(function (next) {
    //         fn(req, res, next);
    //     });
    // });

    // process queries & renderQueue
    await asyncForEach([...queryQueue, preRenderQueue, this.renderQueue], async i => {
      if (Array.isArray(i)) {
        // process nested arrays in parallel
        await asyncForEachParallel(i, _ => _());
      } else if (typeof i === 'function') {
        // process single methods in series
        await i();
      } else {
        throw new Error('View.render() events must be functions.');
      }
    });

    await renderFnLocal(null, req, res);
  }
};

/**
 * Adds a method (or array of methods) to be executed in parallel
 * to the `init`, `action` or `render` queue.
 *
 * @api public
 */

class QueryCallbacks {
  constructor(options) {
    if (typeof options === 'string') {
      options = { then: options };
    } else {
      options = options || {};
    }
    this.callbacks = {};
    if (options.err) this.callbacks.err = options.err;
    if (options.none) this.callbacks.none = options.none;
    if (options.then) this.callbacks.then = options.then;
    return this;
  }

  has(fn) {
    return fn in this.callbacks;
  }
  err(fn) {
    this.callbacks.err = fn;
    return this;
  }
  none(fn) {
    this.callbacks.none = fn;
    return this;
  }
  then(fn) {
    this.callbacks.then = fn;
    return this;
  }
}
