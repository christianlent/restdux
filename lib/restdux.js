"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var DefaultStateBucket = {
    data: {},
    meta: {},
};
function combineReducers(reducers) {
    return function combinedReducer(state, action) {
        reducers.forEach(function each(reducer) {
            state = reducer(state, action);
        });
        return state;
    };
}
exports.combineReducers = combineReducers;
function DefaultReducer(state) {
    return state;
}
function GetNoResource() {
    return {};
}
exports.GetNoResource = GetNoResource;
function CombineResource(resource, callBucket) {
    if (callBucket === void 0) { callBucket = {}; }
    var calls = CombineCalls(GetNoResource(), callBucket);
    return {
        actions: __assign({}, resource.actions, calls.actions),
        reducer: combineReducers([resource.reducer, calls.reducer]),
        types: __assign({}, resource.types, calls.types),
    };
}
exports.CombineResource = CombineResource;
function CombineCalls(resource, callBucket) {
    if (callBucket === void 0) { callBucket = {}; }
    var calls = Object.keys(callBucket).map(function (name) {
        var options = callBucket[name].options;
        return Call(__assign({}, options, { name: name }));
    });
    var actions = {};
    calls.forEach(function (call) { return actions[call.name] = call.actions.run; });
    var reducer = combineReducers(calls.map(function (call) { return call.reducer; }));
    var types = {};
    calls.forEach(function (call) { return types[call.name] = call.types; });
    return {
        actions: actions,
        reducer: reducer,
        types: types,
    };
}
exports.CombineCalls = CombineCalls;
function getQueryString(urlParameters) {
    if (!urlParameters) {
        return "";
    }
    var parameters = urlParameters;
    function renderKey(key) {
        var value = parameters[key];
        if (Array.isArray(value)) {
            return value.map(function (v) { return key + "=" + encodeURIComponent(v); }).join("&");
        }
        return encodeURIComponent(key) + "=" + encodeURIComponent(value);
    }
    return "?" + Object
        .keys(parameters)
        .map(renderKey)
        .join("&");
}
exports.getQueryString = getQueryString;
function idUrlBuilder(rootUrl) {
    return function urlF(id, urlParameters) {
        rootUrl = rootUrl.replace(/\/$/, "");
        return rootUrl
            + "/"
            + id
            + getQueryString(urlParameters);
    };
}
exports.idUrlBuilder = idUrlBuilder;
function urlBuilder(url) {
    return function urlF(id, urlParameters) {
        url = url.replace(/\/$/, "");
        return url + getQueryString(urlParameters);
    };
}
function Call(newOptions) {
    var defaultCallOptions = {
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        idField: "id",
        method: "get",
        name: "",
        parseResult: function (resultBody) { return resultBody; },
        preFetch: function () { return null; },
        resourceName: "",
        stringifyBody: function (requestBody) { return JSON.stringify(requestBody); },
        validateStatus: function f(status) {
            return status >= 200 && status < 300;
        },
    };
    var options = __assign({}, defaultCallOptions, newOptions);
    var name = options.name;
    var stringifyBody = options.stringifyBody;
    var types = {
        failure: options.resourceName.toUpperCase() + "_" + name.toUpperCase() + "_FAILURE",
        initiate: options.resourceName.toUpperCase() + "_" + name.toUpperCase() + "_INITIATE",
        run: options.resourceName.toUpperCase() + "_" + name.toUpperCase(),
        success: options.resourceName.toUpperCase() + "_" + name.toUpperCase() + "_SUCCESS",
    };
    var initiate = function (id, sent, urlParameters, handler) {
        return {
            handler: handler,
            id: id,
            sent: sent,
            type: types.initiate,
            urlParameters: urlParameters,
        };
    };
    var success = function (response, result, id, sent, urlParameters) {
        return {
            id: id,
            response: response,
            result: result,
            sent: sent,
            type: types.success,
            urlParameters: urlParameters,
        };
    };
    var failure = function (response, result, id, sent, urlParameters) {
        return {
            id: id,
            response: response,
            result: result,
            sent: sent,
            type: types.failure,
            urlParameters: urlParameters,
        };
    };
    function run(id, sent, urlParameters) {
        return function returnF(dispatch) {
            var resolve;
            var reject;
            var handler = new Promise(function (res, rej) {
                resolve = res;
                reject = rej;
            });
            dispatch(initiate(id, sent, urlParameters, handler));
            var headers = typeof options.headers === "function"
                ? options.headers()
                : options.headers;
            var url = typeof options.url === "function" ? options.url(id, urlParameters) : options.url;
            var fetchResponse;
            var fetchResult;
            var fetchOptions = {
                body: "",
                headers: headers,
                method: options.method,
            };
            if (sent && stringifyBody(sent)) {
                fetchOptions.body = stringifyBody(sent);
            }
            options.preFetch();
            if (!fetchOptions.body) {
                delete fetchOptions.body;
            }
            return fetch(url, fetchOptions)
                .then(function then(response) {
                fetchResponse = response;
                if (response.status === 204) {
                    return {};
                }
                return response.json();
            })
                .then(function then(result) {
                return options.parseResult(result);
            })
                .then(function f(result) {
                fetchResult = result;
                if (!options.validateStatus(fetchResponse.status)) {
                    dispatch(failure(fetchResponse, fetchResult, id, sent, urlParameters));
                    var actionResult = {
                        response: fetchResponse,
                        result: fetchResult,
                        type: "error",
                    };
                    return Promise.reject(actionResult);
                }
                return dispatch(success(fetchResponse, fetchResult, id, sent, urlParameters));
            })
                .then(function then(result) {
                resolve(result);
                return result;
            })
                .catch(function (error) {
                dispatch(failure(fetchResponse, fetchResult, id, sent, urlParameters));
                var result = {
                    error: error,
                    response: fetchResponse,
                    result: fetchResult,
                    type: "error",
                };
                reject(result);
                return Promise.reject(result);
            });
        };
    }
    var actions = {
        failure: failure,
        initiate: initiate,
        run: run,
        success: success,
    };
    var reducer = options.reducer || DefaultReducer;
    return { actions: actions, types: types, reducer: reducer, name: name, options: newOptions };
}
exports.Call = Call;
var defaultResourceOptions = {
    batchDelayMax: 300,
    batchDelayMin: 100,
    batchIdsParameter: "ids[]",
    batchReads: false,
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
    },
    idField: "id",
    methodCreate: "post",
    methodDelete: "delete",
    methodIndex: "get",
    methodRead: "get",
    methodUpdate: "put",
    preFetch: function () { return null; },
    transformIndex: function (result) { return result; },
    updateStateOnUpdateInitiate: true,
    updateStateOnUpdateSuccess: true,
};
function Resource(options) {
    options = __assign({}, defaultResourceOptions, options);
    var idField = options.idField;
    var resourceName = options.name;
    var transformIndex = options.transformIndex
        || (function (result) { return result; });
    var calls = {
        create: Call(__assign({}, options, { method: options.methodCreate, name: "create", resourceName: resourceName, url: urlBuilder(options.rootUrl) })),
        delete: Call(__assign({}, options, { method: options.methodDelete, name: "delete", resourceName: resourceName, url: idUrlBuilder(options.rootUrl) })),
        index: Call(__assign({}, options, { method: options.methodIndex, name: "index", resourceName: resourceName, url: urlBuilder(options.rootUrl) })),
        read: Call(__assign({}, options, { method: options.methodRead, name: "read", resourceName: resourceName, url: idUrlBuilder(options.rootUrl) })),
        update: Call(__assign({}, options, { method: options.methodUpdate, name: "update", resourceName: resourceName, url: idUrlBuilder(options.rootUrl) })),
    };
    var types = {
        create: calls.create.types,
        delete: calls.delete.types,
        index: calls.index.types,
        read: calls.read.types,
        update: calls.update.types,
    };
    function getEntity(state, id) {
        return state.data[id];
    }
    function getMeta(state, id) {
        if (!state || !id) {
            return;
        }
        return state.meta[id];
    }
    function isValid(cacheOptions, state, id) {
        var entity = getEntity(state, id);
        var meta = getMeta(state, id);
        // If the id does not exist in our store, it is not valid
        if (!meta) {
            return false;
        }
        // If the entity does not pass the custom "invalid" check, it is not valid
        if (cacheOptions.invalid && cacheOptions.invalid(entity, meta)) {
            return false;
        }
        if (meta.loadFailed) {
            return false;
        }
        return true;
    }
    var timeoutHandler = 0;
    function queueUpdate(h) {
        timeoutHandler = setTimeout(h, options.batchDelayMin);
    }
    function isQueued(meta) {
        return meta.handler
            && meta.loading
            && meta.handler.resolve;
    }
    var cacheread = function cachereadF(cacheOptions, id, sent, urlParameters) {
        if (cacheOptions === void 0) { cacheOptions = {}; }
        return function crReturn(dispatch, getState) {
            function batchProcess() {
                var batchState = getState()[resourceName];
                var latest = 0;
                var batchedMetaBag = {};
                Object.keys(batchState.meta).forEach(function (targetId) {
                    var batchedMeta = batchState.meta[targetId];
                    if (!isQueued(batchedMeta)) {
                        return;
                    }
                    var loadingTime = (batchedMeta.loading || new Date()).getTime();
                    if (loadingTime > latest) {
                        latest = loadingTime;
                    }
                    batchedMetaBag[targetId] = batchedMeta;
                });
                var batchDelayMin = options.batchDelayMin || defaultResourceOptions.batchDelayMin;
                if (!Object.keys(batchedMetaBag).length || new Date().getTime() - latest < batchDelayMin) {
                    queueUpdate(batchProcess);
                    return;
                }
                var parameters = {};
                parameters[options.batchIdsParameter] = Object.keys(batchedMetaBag);
                dispatch(actions.index(undefined, undefined, parameters))
                    .then(function (action) {
                    var results = transformIndex(action.result);
                    Object.keys(batchedMetaBag).forEach(function (targetId) {
                        var placeholderEntity = batchedMetaBag[targetId];
                        var target = results.find(function (res) {
                            return res[idField] == targetId;
                        });
                        if (!target || !placeholderEntity.handler || !placeholderEntity.handler.resolve) {
                            dispatch(actions.readFailure(action.response, {}, targetId));
                            return;
                        }
                        placeholderEntity.handler.resolve(__assign({}, action, { result: target }));
                    });
                    queueUpdate(batchProcess);
                })
                    .catch(function c() {
                    queueUpdate(batchProcess);
                    console.error.call(null, arguments);
                });
            }
            var state = getState()[resourceName];
            var entity = getEntity(state, id);
            var meta = getMeta(state, id);
            if (entity && meta && isValid(cacheOptions, state, id)) {
                if (meta.handler) {
                    return meta.handler;
                }
                return Promise.resolve({
                    result: entity,
                    type: resourceName.toUpperCase() + "_CACHE",
                });
            }
            if (options.batchReads) {
                if (entity && meta && isQueued(entity) && meta.handler) {
                    return meta.handler;
                }
                var resolve_1 = function () { return undefined; };
                var reject_1 = function () { return undefined; };
                var handler = new Promise(function (res, rej) {
                    resolve_1 = res;
                    reject_1 = rej;
                });
                handler.reject = reject_1;
                handler.resolve = resolve_1;
                if (!timeoutHandler) {
                    queueUpdate(batchProcess);
                }
                dispatch(actions.readInitiate(id, undefined, undefined, handler));
                return handler;
            }
            return dispatch(actions.read(id, sent, urlParameters));
        };
    };
    function invalidate(id, sent, urlParameters) {
        return {
            id: id,
            sent: sent,
            type: resourceName.toUpperCase() + "_INVALIDATE",
            urlParameters: urlParameters,
        };
    }
    var actions = {
        cacheread: cacheread,
        create: calls.create.actions.run,
        createFailure: calls.create.actions.failure,
        createInitiate: calls.create.actions.initiate,
        createSuccess: calls.create.actions.success,
        delete: calls.delete.actions.run,
        deleteFailure: calls.delete.actions.failure,
        deleteInitiate: calls.delete.actions.initiate,
        deleteSuccess: calls.delete.actions.success,
        index: calls.index.actions.run,
        indexFailure: calls.index.actions.failure,
        indexInitiate: calls.index.actions.initiate,
        indexSuccess: calls.index.actions.success,
        invalidate: invalidate,
        read: calls.read.actions.run,
        readFailure: calls.read.actions.failure,
        readInitiate: calls.read.actions.initiate,
        readSuccess: calls.read.actions.success,
        update: calls.update.actions.run,
        updateFailure: calls.update.actions.failure,
        updateInitiate: calls.update.actions.initiate,
        updateSuccess: calls.update.actions.success,
    };
    function updateEntity(state, id, newData, newMeta) {
        if (!id) {
            return state;
        }
        state = {
            data: __assign({}, state.data),
            meta: __assign({}, state.meta),
        };
        if (newData) {
            var entity = getEntity(state, id);
            state.data[id] = __assign({}, entity, newData);
        }
        if (newMeta) {
            var meta = getMeta(state, id);
            state.meta[id] = __assign({}, meta, newMeta);
        }
        return state;
    }
    function patchEntity(state, id, newData, newMeta) {
        if (!id) {
            return state;
        }
        state = {
            data: __assign({}, state.data),
            meta: __assign({}, state.meta),
        };
        var entity = getEntity(state, id);
        if (newData && entity) {
            state.data[id] = __assign({}, entity, newData);
        }
        var meta = getMeta(state, id);
        if (newMeta && meta) {
            state.meta[id] = __assign({}, meta, newMeta);
        }
        return state;
    }
    function deleteEntity(state, id) {
        if (!id) {
            return state;
        }
        state = {
            data: __assign({}, state.data),
            meta: __assign({}, state.meta),
        };
        delete state.data[id];
        delete state.meta[id];
        return state;
    }
    function reducer(state, action) {
        if (state === void 0) { state = DefaultStateBucket; }
        var id;
        switch (action.type) {
            case calls.read.types.initiate:
                return updateEntity(state, action.id, undefined, {
                    handler: action.handler,
                    loadFailed: undefined,
                    loaded: undefined,
                    loading: new Date(),
                });
            case calls.read.types.failure:
                return updateEntity(state, action.id, undefined, {
                    handler: action.handler,
                    loadFailed: new Date(),
                    loaded: undefined,
                    loading: undefined,
                });
            case calls.read.types.success:
                return updateEntity(state, action.id, action.result, {
                    handler: undefined,
                    loadFailed: undefined,
                    loaded: new Date(),
                    loading: undefined,
                });
            case calls.update.types.initiate:
                if (!options.updateStateOnUpdateInitiate) {
                    return state;
                }
                return patchEntity(state, action.id, action.sent);
            case calls.update.types.success:
                if (!options.updateStateOnUpdateSuccess) {
                    return state;
                }
                return updateEntity(state, action.id, action.result);
            case calls.create.types.success:
                id = action.result[idField];
                return updateEntity(state, id, action.result);
            case calls.delete.types.success:
                return deleteEntity(state, action.id);
            case calls.index.types.success:
                state = __assign({}, state);
                var results = transformIndex(action.result);
                results.forEach(function (item) {
                    id = item[idField];
                    state = updateEntity(state, id, item, {
                        handler: undefined,
                        loadFailed: undefined,
                        loaded: new Date(),
                        loading: undefined,
                    });
                });
                return state;
            case resourceName.toUpperCase() + "_INVALIDATE":
                return updateEntity(state, action.id, undefined, {
                    handler: undefined,
                    loadFailed: undefined,
                    loaded: undefined,
                    loading: undefined,
                });
        }
        return state;
    }
    return { actions: actions, name: resourceName, types: types, reducer: reducer, getEntity: getEntity, patchEntity: patchEntity, updateEntity: updateEntity };
}
exports.Resource = Resource;
