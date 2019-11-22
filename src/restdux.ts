import { Action, Reducer } from "redux";
import { ThunkAction, ThunkDispatch } from "redux-thunk";

export type IActionResult<Parms, Snd, Ret> = Action<string> & {
	sent?: Snd;
	handler?: FullPromiseResult<Parms, Snd, Ret>;
	id?: Id;
	response?: Response;
	result: Ret;
	type?: string;
	urlParameters?: Parms;
};

type PartialActionResult<Parms, Snd, Ret> = Partial<IActionResult<Parms, Snd, Ret>>;

type Resolve<T> = (r: T | PromiseLike<T>) => void;
type Reject<T> = (reason: any) => void;
type FetchMethod =  "DELETE" | "GET" | "HEAD" | "OPTIONS" | "POST" | "PUT" | "PATCH"
	| "delete" | "get" | "head" | "options" | "post" | "put" | "patch";

type ExtPromise<T> = Promise<T> & {
	resolve?: (r: T | PromiseLike<T>) => void;
	reject?: (reason: any) => void;
};

type FullPromiseResult<Parms, Snd, Ret> = ExtPromise<IActionResult<Parms, Snd, Ret>>;

export type Id = string | number;

export interface ICacheOptions<Ret> {
	invalid?: (entity?: Ret, meta?: IMeta<Ret>) => boolean;
}

type ThunkResult<T, Ste> = ThunkAction<T, Ste, undefined, Action>;
type FullThunkResult<Parms, Snd, Ret> = ThunkResult<FullPromiseResult<Parms, Snd, Ret>, Ret>;
export type ApiThunkDispatch<TState = any, TExtraThunkArg = undefined, TBasicAction extends Action = Action>
	= ThunkDispatch<TState, TExtraThunkArg, TBasicAction>;
export interface IDispatchProp<TState = any, TExtraThunkArg = undefined, TBasicAction extends Action = Action> {
	dispatch: ApiThunkDispatch<TState, TExtraThunkArg, TBasicAction>;
}

type CacheReadAction<Parms, Snd, Ret> = (
	cacheOptions: ICacheOptions<Ret>,
	id: Id,
	sent?: Snd,
	urlParameters?: Parms,
) => FullThunkResult<Parms, Snd, Ret>;

type RunAction<Parms, Snd, Ret> = (
	id?: Id,
	sent?: Snd,
	urlParameters?: Parms,
) => FullThunkResult<Parms, Snd, Ret>;

type InitiateAction<Parms, Snd, Ret> = (
	id?: Id,
	sent?: Snd,
	urlParameters?: Parms,
	handler?: FullPromiseResult<Parms, Snd, Ret>,
) => PartialActionResult<Parms, Snd, Ret>;

type InvalidateAction<Parms, Snd, Ret> = (
	id: Id,
	sent?: Snd,
	urlParameters?: Parms,
) => {id?: Id, type: string};

type SuccessAction<Parms, Snd, Ret> = (
	response: Response,
	result: Ret,
	id?: Id,
	sent?: Snd,
	urlParameters?: Parms,
) => IActionResult<Parms, Snd, Ret>;

type FailureAction<Parms, Snd, Ret> = (
	response: Response,
	result: Ret,
	id?: Id,
	sent?: Snd,
	urlParameters?: Parms,
) => IActionResult<Parms, Snd, Ret>;

export interface IMeta<Ret> {
	loadFailed?: Date;
	loaded?: Date;
	loading?: Date;
	handler?: FullPromiseResult<any, any, Ret>;
}

interface IGenericCallBag<Ste> {
	[key: string]: ICall<any, any, any, Ste>;
}

interface ICallActions {
	run: any;
	[key: string]: any;
}

export interface IResourceActions<Parms, Snd, Ret> {
	index: RunAction<Parms, Snd, Ret>;
	indexInitiate: InitiateAction<Parms, Snd, Ret>;
	indexSuccess: SuccessAction<Parms, Snd, Ret>;
	indexFailure: FailureAction<Parms, Snd, Ret>;
	create: RunAction<Parms, Snd, Ret>;
	createInitiate: InitiateAction<Parms, Snd, Ret>;
	createSuccess: SuccessAction<Parms, Snd, Ret>;
	createFailure: FailureAction<Parms, Snd, Ret>;
	cacheread: CacheReadAction<Parms, Snd, Ret>;
	invalidate: InvalidateAction<Parms, Snd, Ret>;
	read: RunAction<Parms, Snd, Ret>;
	readInitiate: InitiateAction<Parms, Snd, Ret>;
	readSuccess: SuccessAction<Parms, Snd, Ret>;
	readFailure: FailureAction<Parms, Snd, Ret>;
	update: RunAction<Parms, Snd, Ret>;
	updateInitiate: InitiateAction<Parms, Snd, Ret>;
	updateSuccess: SuccessAction<Parms, Snd, Ret>;
	updateFailure: FailureAction<Parms, Snd, Ret>;
	delete: RunAction<Parms, Snd, Ret>;
	deleteInitiate: InitiateAction<Parms, Snd, Ret>;
	deleteSuccess: SuccessAction<Parms, Snd, Ret>;
	deleteFailure: FailureAction<Parms, Snd, Ret>;
}

export interface IResourceTypes {
	create: ITypeBag;
	delete: ITypeBag;
	index: ITypeBag;
	read: ITypeBag;
	update: ITypeBag;
}

export interface ITypeBag {
	[key: string]: string;
}

interface IHeaderBag {
	[key: string]: string;
}

type IParameterBag = object;

export interface IStateBucket<Ret> {
	data: {
		[key: string]: Ret;
	};
	meta: {
		[key: string]: IMeta<Ret>;
	};
}

export const DefaultStateBucket = {
	data: {},
	meta: {},
};

interface ICall<Parms, Snd, Ret, Ste> {
	actions: ICallActions;
	name: string;
	reducer: Reducer<Ste, IActionResult<Parms, Snd, Ret>>;
	setName: (name: string) => ICall<Parms, Snd, Ret, Ste>;
	types: ITypeBag;
}

export interface IResource<Parms, Snd, Ret> {
	actions: IResourceActions<Parms, Snd, Ret>;
	reducer: Reducer<IStateBucket<Ret>, IActionResult<Parms, Snd, Ret>>;
	types: IResourceTypes;
	name: string;
	getEntity: (state: IStateBucket<Ret>, id: Id) => Ret;
	patchEntity: (state: IStateBucket<Ret>, id: Id, newData: Partial<Ret>) => IStateBucket<Ret>;
	updateEntity: (state: IStateBucket<Ret>, id: Id, newData: Ret) => IStateBucket<Ret>;
}

interface ICallOptions<Parms, Snd, Ret, Ste> {
	headers?: IHeaderBag | (() => IHeaderBag);
	idField?: string;
	method?: FetchMethod;
	name?: string;
	parseResult?: (resultBody: any) => Ret;
	preFetch?: () => void;
	reducer?: Reducer<Ste, IActionResult<Parms, Snd, Ret>>;
	stringifyBody?: (requestBody: Snd) => string;
	resourceName?: string;
	url: ((id?: Id, urlParameters?: Parms) => string) | string;
	validateStatus?: (status: number) => boolean;
}

interface IResourceOptions<Parms, Snd, Ret> {
	batchReads?: boolean;
	batchSizeMax?: number;
	batchDelayMax?: number;
	batchDelayMin?: number;
	batchIdsParameter?: string;
	cacheOptions?: ICacheOptions<Ret>,
	headers?: IHeaderBag | (() => IHeaderBag);
	idField?: string;
	methodCreate?: FetchMethod;
	methodDelete?: FetchMethod;
	methodIndex?: FetchMethod;
	methodRead?: FetchMethod;
	methodUpdate?: FetchMethod;
	name: string;
	parseResult?: (resultBody: any) => Ret;
	preFetch?: () => void;
	rootUrl: string | (() => string);
	stringifyBody?: (requestBody: Snd) => string;
	transformIndex?: (result: any) => Ret[];
	updateStateOnUpdateInitiate?: boolean;
	updateStateOnUpdateSuccess?: boolean;
	validateStatus?: (status: number) => boolean;
}

export function combineReducers<Ste, Act extends Action<any>>(reducers: Array<Reducer<Ste, Act>>)
	: Reducer<Ste, Act> {
	return function combinedReducer(state: Ste | undefined, action: Act) {
		reducers.forEach(function each(reducer) {
			state = reducer(state, action);
		});
		return state as Ste;
	};
}

function DefaultReducer<Ste>(state: Ste | undefined): Ste {
	return state as Ste;
}

interface INoResource<Ret> {
	actions?: null;
	reducer?: null;
	types?: null;
}

export function GetNoResource<Ret>(): INoResource<Ret> {
	return {};
}

interface ICombinedCalls<Ste, C extends IGenericCallBag<Ste>> {
	actions: {
		[P in keyof C]: C[P]["actions"]["run"];
	};
	reducer: Reducer<Ste, any>;
	types: {
		[P in keyof C]: C[P]["types"];
	};
}

export function CombineResource<Parms, Snd, Ret, C extends IGenericCallBag<IStateBucket<Ret>>>(
	resource: IResource<Parms, Snd, Ret>, callBucket: C) {
	type Ste = IStateBucket<Ret>;
	const calls: ICombinedCalls<Ste, C> = CombineCalls<Ste, C>(GetNoResource<Ste>(), callBucket);
	return {
		actions: {...resource.actions, ...calls.actions},
		reducer: combineReducers<IStateBucket<Ret>, IActionResult<Parms, Snd, Ret>>([resource.reducer, calls.reducer]),
		types: {...resource.types, ...calls.types},
	};
}

export function CombineCalls<Ste, C extends IGenericCallBag<Ste>>(
	resource: INoResource<Ste>, callBucket: C) {

	const calls = Object.keys(callBucket).map((name) => callBucket[name].setName(name));

	type ActionsType = {
		[P in keyof C]: C[P]["actions"]["run"];
	};

	const actions = {} as ActionsType;
	calls.forEach((call) => actions[call.name as keyof C] = call.actions.run);

	const reducer = combineReducers<Ste, any>(calls.map((call) => call.reducer));

	type TypesType = {
		[P in keyof C]: C[P]["types"];
	};

	const types = {} as TypesType;
	calls.forEach((call) => types[call.name as keyof C] = call.types);

	return {
		actions,
		reducer,
		types,
	};
}

export function getQueryString<Parms extends IParameterBag>(urlParameters?: Parms) {
	if (!urlParameters) {
		return "";
	}
	const parameters = urlParameters as {[key: string]: string};
	function renderKey(key: string) {
		const value = parameters[key];
		if (Array.isArray(value)) {
			return value.map((v) => `${key}=${encodeURIComponent(v)}`).join("&");
		}
		return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
	}
	return "?" + Object
		.keys(parameters)
		.map(renderKey)
		.join("&");
}

export function idUrlBuilder<Parms extends IParameterBag>(rootUrl: string | (() => string)) {
	return function urlF(id?: Id, urlParameters?: Parms) {
		rootUrl = typeof rootUrl === "function" ? rootUrl() : rootUrl;
		rootUrl = rootUrl.replace(/\/$/, "");
		return rootUrl
			+ "/"
			+ id
			+ getQueryString<Parms>(urlParameters)
		;
	};
}

function urlBuilder<Parms extends IParameterBag>(rootUrl: string | (() => string)) {
	return function urlF(id?: Id, urlParameters?: Parms) {
		rootUrl = typeof rootUrl === "function" ? rootUrl() : rootUrl;
		rootUrl = rootUrl.replace(/\/$/, "");
		return rootUrl + getQueryString<Parms>(urlParameters);
	};
}

export function Call<Parms = {}, Snd = {}, Ret = {}, Ste = {}>(
	newOptions: ICallOptions<Parms, Snd, Ret, Ste>,
) {
	const defaultCallOptions = {
		headers: {
			"Accept": "application/json",
			"Content-Type": "application/json",
		},
		idField: "id",
		method: "get",
		name: "",
		parseResult: (resultBody: any) => resultBody as Ret,
		preFetch: () => null,
		resourceName: "",
		stringifyBody: (requestBody: Snd) => JSON.stringify(requestBody),
		validateStatus: function f(status: number) {
			return status >= 200 && status < 300;
		},
	};

	const options = {...defaultCallOptions, ...newOptions};
	const name = options.name;
	const stringifyBody = options.stringifyBody as (requestBody: Snd) => string;
	const types = {
		failure: `${options.resourceName.toUpperCase()}_${name.toUpperCase()}_FAILURE`,
		initiate: `${options.resourceName.toUpperCase()}_${name.toUpperCase()}_INITIATE`,
		run: `${options.resourceName.toUpperCase()}_${name.toUpperCase()}`,
		success: `${options.resourceName.toUpperCase()}_${name.toUpperCase()}_SUCCESS`,
	};

	const initiate: InitiateAction<Parms, Snd, Ret> = (
		id?: Id,
		sent?: Snd,
		urlParameters?: Parms,
		handler?: FullPromiseResult<Parms, Snd, Ret>,
	) => {
		return {
			handler,
			id,
			sent,
			type: types.initiate,
			urlParameters,
		};
	};
	const success: SuccessAction<Parms, Snd, Ret> = (
		response,
		result: Ret,
		id?: Id,
		sent?: Snd,
		urlParameters?: Parms,
	) => {
		return {
			id,
			response,
			result,
			sent,
			type: types.success,
			urlParameters,
		};
	};
	const failure: FailureAction<Parms, Snd, Ret> = (
		response,
		result: Ret,
		id?: Id,
		sent?: Snd,
		urlParameters?: Parms,
	) => {
		return {
			id,
			response,
			result,
			sent,
			type: types.failure,
			urlParameters,
		};
	};

	function run(id?: Id, sent?: Snd, urlParameters?: Parms)
		: FullThunkResult<Parms, Snd, Ret> {
		return function returnF(dispatch: any) {
			let resolve: Resolve<IActionResult<Parms, Snd, Ret>>;
			let reject: Reject<IActionResult<Parms, Snd, Ret>>;
			const handler = new Promise<IActionResult<Parms, Snd, Ret>>((res, rej) => {
				resolve = res;
				reject = rej;
			});
			dispatch(initiate(id, sent, urlParameters, handler));
			const headers: IHeaderBag = typeof options.headers === "function"
				? options.headers()
				: options.headers;
			const url = typeof options.url === "function" ? options.url(id, urlParameters) : options.url;
			let fetchResponse: Response;
			let fetchResult: Ret;
			const fetchOptions = {
				body: "",
				headers,
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
				.then(function then(response: Response) {
					fetchResponse = response;
					if (response.status === 204) {
						return {};
					}
					return response.json();
				})
				.then(function then(result) {
					return options.parseResult(result);
				})
				.then(function f(result: Ret): IActionResult<Parms, Snd, Ret> | FullPromiseResult<Parms, Snd, Ret> {
					fetchResult = result;
					if (!options.validateStatus(fetchResponse.status)) {
						dispatch(failure(fetchResponse, fetchResult, id, sent, urlParameters));
						const actionResult: IActionResult<Parms, Snd, Ret> = {
							response: fetchResponse,
							result: fetchResult,
							type: "error",
						};

						return Promise.reject(actionResult);
					}
					return dispatch(success(fetchResponse, fetchResult, id, sent, urlParameters));
				})
				.then(function then(result: IActionResult<Parms, Snd, Ret>) {
					resolve(result);
					return result;
				})
				.catch((error) => {
					dispatch(failure(fetchResponse, fetchResult, id, sent, urlParameters));
					const result = {
						error,
						response: fetchResponse,
						result: fetchResult,
						type: "error",
					};
					reject(result);
					return Promise.reject(result);
				});
		};
	}

	const actions = {
		failure,
		initiate,
		run,
		success,
	};
	const reducer = (options.reducer || DefaultReducer) as (s: any) => any;

	return {
		actions,
		name,
		reducer,
		setName: (newName: string) => Call({...newOptions, name: newName}),
		types,
	};
}

const defaultResourceOptions = {
	batchDelayMax: 300,
	batchDelayMin: 100,
	batchIdsParameter: "ids[]",
	batchSizeMax: 50,
	batchReads: false,
	cacheOptions: {},
	headers: {
		"Accept": "application/json",
		"Content-Type": "application/json",
	},
	idField: "id",
	methodCreate: "post" as FetchMethod,
	methodDelete: "delete" as FetchMethod,
	methodIndex: "get" as FetchMethod,
	methodRead: "get" as FetchMethod,
	methodUpdate: "put" as FetchMethod,
	preFetch: () => null,
	transformIndex: (result: any) => result,
	updateStateOnUpdateInitiate: true,
	updateStateOnUpdateSuccess: true,
};

export function Resource<Parms extends IParameterBag, Snd, Ret>(
	options: IResourceOptions<Parms, Snd, Ret>,
): IResource<Parms, Snd, Ret> {
	options = {...defaultResourceOptions, ...options};
	const idField = options.idField as string;
	const resourceName = options.name;
	const transformIndex: (result: any) => Ret[] = options.transformIndex
		|| ((result) => result);

	const calls = {
		create: Call<Parms, Snd, Ret, IStateBucket<Ret>>({
			...options,
			method: options.methodCreate,
			name: "create",
			resourceName,
			url: urlBuilder(options.rootUrl),
		}),
		delete: Call<Parms, Snd, Ret, IStateBucket<Ret>>({
			...options,
			method: options.methodDelete,
			name: "delete",
			resourceName,
			url: idUrlBuilder(options.rootUrl),
		}),
		index: Call<Parms, Snd, Ret, IStateBucket<Ret>>({
			...options,
			method: options.methodIndex,
			name: "index",
			resourceName,
			url: urlBuilder(options.rootUrl),
		}),
		read: Call<Parms, Snd, Ret, IStateBucket<Ret>>({
			...options,
			method: options.methodRead,
			name: "read",
			resourceName,
			url: idUrlBuilder(options.rootUrl),
		}),
		update: Call<Parms, Snd, Ret, IStateBucket<Ret>>({
			...options,
			method: options.methodUpdate,
			name: "update",
			resourceName,
			url: idUrlBuilder(options.rootUrl),
		}),
	};

	const types = {
		create: calls.create.types,
		delete: calls.delete.types,
		index: calls.index.types,
		read: calls.read.types,
		update: calls.update.types,
	};

	function getEntity(state: IStateBucket<Ret>, id: Id): Ret {
		return state.data[id];
	}

	function getMeta(state?: IStateBucket<Ret>, id?: Id): IMeta<Ret> | undefined {
		if (!state || !id) {
			return;
		}
		return state.meta[id];
	}

	function isValid(cacheOptions: ICacheOptions<Ret>, state: IStateBucket<Ret>, id: Id) {
		const entity = getEntity(state, id);
		const meta = getMeta(state, id);

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

	let timeoutHandler: number = 0;
	function queueUpdate(h: () => void) {
		timeoutHandler = setTimeout(h, options.batchDelayMin);
	}

	function isQueued(meta: IMeta<Ret>) {
		return meta.handler != null
			&& meta.loading != null
			&& meta.handler.resolve != null;
	}

	function filterMax<T>(arr: T[], max: number, cb: (t: T) => boolean): T[] {
		const res: T[] = [];
		let lcv = 0;
		while (res.length < max && lcv < arr.length) {
			if (cb(arr[lcv])) {
				res.push(arr[lcv]);
			}
			lcv++;
		}
		return res;
	}

	const cacheread: CacheReadAction<Parms, Snd, Ret> = function cachereadF(
		cacheOptions: ICacheOptions<Ret> = {},
		id: Id,
		sent?: Snd,
		urlParameters?: Parms,
	) {
		return function crReturn(dispatch, getState: any) {

			function batchProcess() {
				const batchState: IStateBucket<Ret> = getState()[resourceName];
				const batchDelayMin = options.batchDelayMin || defaultResourceOptions.batchDelayMin;
				const batchSizeMax = options.batchSizeMax || defaultResourceOptions.batchSizeMax;
				let latest = 0;
				const batchedMetaBag: {[key: string]: IMeta<Ret>} = {};
				filterMax(Object.keys(batchState.meta), batchSizeMax, (targetId) => isQueued(batchState.meta[targetId]))
					.forEach((targetId) => {
						const batchedMeta = batchState.meta[targetId];
						const loadingTime = (batchedMeta.loading || new Date()).getTime();
						if (loadingTime > latest) {
							latest = loadingTime;
						}

						batchedMetaBag[targetId] = batchedMeta;
					}
				);

				if (!Object.keys(batchedMetaBag).length || new Date().getTime() - latest < batchDelayMin) {
					queueUpdate(batchProcess);
					return;
				}

				const parameters: any = {};
				parameters[options.batchIdsParameter as string] = Object.keys(batchedMetaBag);
				dispatch(actions.index(undefined, undefined, parameters))
					.then((action) => {
						const results = transformIndex(action.result);
						Object.keys(batchedMetaBag).forEach((targetId) => {
							const placeholderEntity = batchedMetaBag[targetId];
							const target = results.find((res) => {
								return (res as any)[idField] == targetId;
							});
							if (!target || !placeholderEntity.handler || !placeholderEntity.handler.resolve) {
								dispatch(actions.readFailure(action.response as Response, {} as Ret, targetId));
								return;
							}
							placeholderEntity.handler.resolve({...action, result: target});
						});
						queueUpdate(batchProcess);
					})
					.catch(function c(err) {
						Object.keys(batchedMetaBag).forEach((targetId) => {
							const placeholderEntity = batchedMetaBag[targetId];
							dispatch(actions.readFailure(err.response as Response, {} as Ret, targetId));
							if (!placeholderEntity.handler || !placeholderEntity.handler.reject) {
								return;
							}
							placeholderEntity.handler.reject(err);
						});
						queueUpdate(batchProcess);
						console.error.call(null, arguments);
					})
				;
			}

			const state: IStateBucket<Ret> = getState()[resourceName];
			const meta = getMeta(state, id);
			if (meta && meta.handler) {
				return meta.handler;
			}

			const entity = getEntity(state, id);
			if (entity && meta && isValid({
				...options.cacheOptions,
				...cacheOptions,
			}, state, id)) {
				return Promise.resolve({
					result: entity,
					type: `${resourceName.toUpperCase()}_CACHE`,
				});
			}

			if (options.batchReads) {
				if (meta && isQueued(meta) && meta.handler) {
					return meta.handler;
				}
				let resolve: Resolve<IActionResult<Parms, Snd, Ret>> = () => undefined;
				let reject: Reject<IActionResult<Parms, Snd, Ret>> = () => undefined;
				const handler = new Promise<IActionResult<Parms, Snd, Ret>>((res, rej) => {
					resolve = res;
					reject = rej;
				}) as ExtPromise<IActionResult<Parms, Snd, Ret>>;
				handler.reject = reject;
				handler.resolve = resolve;

				if (!timeoutHandler) {
					queueUpdate(batchProcess);
				}

				dispatch(actions.readInitiate(id, undefined, undefined, handler) as FullThunkResult<Parms, Snd, Ret>);
				return handler;
			}
			return dispatch(actions.read(id, sent, urlParameters));
		};
	};

	function invalidate(id: Id, sent?: Snd, urlParameters?: Parms) {
		return {
			id,
			sent,
			type: `${resourceName.toUpperCase()}_INVALIDATE`,
			urlParameters,
		};
	}

	const actions: IResourceActions<Parms, Snd, Ret> = {
		cacheread,
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
		invalidate,
		read: calls.read.actions.run,
		readFailure: calls.read.actions.failure,
		readInitiate: calls.read.actions.initiate,
		readSuccess: calls.read.actions.success,
		update: calls.update.actions.run,
		updateFailure: calls.update.actions.failure,
		updateInitiate: calls.update.actions.initiate,
		updateSuccess: calls.update.actions.success,
	};

	function updateEntity(state: IStateBucket<Ret>, id?: Id, newData?: Ret, newMeta?: IMeta<Ret>): IStateBucket<Ret> {
		if (!id) {
			return state;
		}
		state = {
			data: {...state.data},
			meta: {...state.meta},
		};
		if (newData) {
			const entity = getEntity(state, id);
			state.data[id] = {
				...entity,
				...newData,
			};
		}
		if (newMeta) {
			const meta = getMeta(state, id);
			state.meta[id] = {
				...meta,
				...newMeta,
			};
		}
		return state;
	}

	function patchEntity(
		state: IStateBucket<Ret>,
		id?: Id,
		newData?: Partial<Ret>,
		newMeta?: Partial<IMeta<Ret>>,
	): IStateBucket<Ret> {
		if (!id) {
			return state;
		}

		state = {
			data: {...state.data},
			meta: {...state.meta},
		};

		const entity = getEntity(state, id);
		if (newData && entity) {
			state.data[id] = {
				...entity,
				...newData,
			};
		}

		const meta = getMeta(state, id);
		if (newMeta && meta) {
			state.meta[id] = {
				...meta,
				...newMeta,
			};
		}
		return state;
	}

	function deleteEntity(state: IStateBucket<Ret>, id?: Id): IStateBucket<Ret> {
		if (!id) {
			return state;
		}

		state = {
			data: {...state.data},
			meta: {...state.meta},
		};
		delete state.data[id];
		delete state.meta[id];
		return state;
	}

	function reducer(
		state: IStateBucket<Ret> = DefaultStateBucket,
		action: IActionResult<Parms, Snd, Ret>,
	): IStateBucket<Ret> {
		let id: Id;
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
				return patchEntity(state, action.id, action.sent as unknown as Partial<Ret>);
			case calls.update.types.success:
				if (!options.updateStateOnUpdateSuccess) {
					return state;
				}
				return updateEntity(state, action.id, action.result);
			case calls.create.types.success:
				id = (action.result as any)[idField] as Id;
				return updateEntity(state, id, action.result);
			case calls.delete.types.success:
				return deleteEntity(state, action.id);
			case calls.index.types.success:
				state = {...state};
				const results = transformIndex(action.result);
				results.forEach((item: Ret) => {
					id = (item as any)[idField] as Id;
					state = updateEntity(state, id, item, {
						handler: undefined,
						loadFailed: undefined,
						loaded: new Date(),
						loading: undefined,
					});
				});
				return state;
			case `${resourceName.toUpperCase()}_INVALIDATE`:
				return updateEntity(state, action.id, undefined, {
					handler: undefined,
					loadFailed: undefined,
					loaded: undefined,
					loading: undefined,
				});
		}
		return state;
	}

	return {actions, name: resourceName, types, reducer, getEntity, patchEntity, updateEntity};
}
