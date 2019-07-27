import { Action, Reducer } from "redux";
import { ThunkAction, ThunkDispatch } from "redux-thunk";
export declare type IActionResult<Parms, Snd, Ret> = Action<string> & {
    sent?: Snd;
    handler?: FullPromiseResult<Parms, Snd, Ret>;
    id?: Id;
    response?: Response;
    result: Ret;
    type?: string;
    urlParameters?: Parms;
};
declare type PartialActionResult<Parms, Snd, Ret> = Partial<IActionResult<Parms, Snd, Ret>>;
declare type FetchMethod = "DELETE" | "GET" | "HEAD" | "OPTIONS" | "POST" | "PUT" | "PATCH" | "delete" | "get" | "head" | "options" | "post" | "put" | "patch";
declare type ExtPromise<T> = Promise<T> & {
    resolve?: (r: T | PromiseLike<T>) => void;
    reject?: (reason: any) => void;
};
declare type FullPromiseResult<Parms, Snd, Ret> = ExtPromise<IActionResult<Parms, Snd, Ret>>;
export declare type Id = string | number;
export interface ICacheOptions<Ret> {
    invalid?: (entity?: Ret, meta?: IMeta<Ret>) => boolean;
}
declare type ThunkResult<T, Ste> = ThunkAction<T, Ste, undefined, Action>;
declare type FullThunkResult<Parms, Snd, Ret> = ThunkResult<FullPromiseResult<Parms, Snd, Ret>, Ret>;
export declare type ApiThunkDispatch<TState = any, TExtraThunkArg = undefined, TBasicAction extends Action = Action> = ThunkDispatch<TState, TExtraThunkArg, TBasicAction>;
export interface IDispatchProp<TState = any, TExtraThunkArg = undefined, TBasicAction extends Action = Action> {
    dispatch: ApiThunkDispatch<TState, TExtraThunkArg, TBasicAction>;
}
declare type CacheReadAction<Parms, Snd, Ret> = (cacheOptions: ICacheOptions<Ret>, id: Id, sent?: Snd, urlParameters?: Parms) => FullThunkResult<Parms, Snd, Ret>;
declare type RunAction<Parms, Snd, Ret> = (id?: Id, sent?: Snd, urlParameters?: Parms) => FullThunkResult<Parms, Snd, Ret>;
declare type InitiateAction<Parms, Snd, Ret> = (id?: Id, sent?: Snd, urlParameters?: Parms, handler?: FullPromiseResult<Parms, Snd, Ret>) => PartialActionResult<Parms, Snd, Ret>;
declare type InvalidateAction<Parms, Snd, Ret> = (id: Id, sent?: Snd, urlParameters?: Parms) => {
    id?: Id;
    type: string;
};
declare type SuccessAction<Parms, Snd, Ret> = (response: Response, result: Ret, id?: Id, sent?: Snd, urlParameters?: Parms) => IActionResult<Parms, Snd, Ret>;
declare type FailureAction<Parms, Snd, Ret> = (response: Response, result: Ret, id?: Id, sent?: Snd, urlParameters?: Parms) => IActionResult<Parms, Snd, Ret>;
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
declare type IParameterBag = object;
export interface IStateBucket<Ret> {
    data: {
        [key: string]: Ret;
    };
    meta: {
        [key: string]: IMeta<Ret>;
    };
}
export declare const DefaultStateBucket: {
    data: {};
    meta: {};
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
export declare function combineReducers<Ste, Act extends Action<any>>(reducers: Array<Reducer<Ste, Act>>): Reducer<Ste, Act>;
interface INoResource<Ret> {
    actions?: null;
    reducer?: null;
    types?: null;
}
export declare function GetNoResource<Ret>(): INoResource<Ret>;
export declare function CombineResource<Parms, Snd, Ret, C extends IGenericCallBag<IStateBucket<Ret>>>(resource: IResource<Parms, Snd, Ret>, callBucket: C): {
    actions: {
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
    } & { [P in keyof C]: C[P]["actions"]["run"]; };
    reducer: Reducer<IStateBucket<Ret>, IActionResult<Parms, Snd, Ret>>;
    types: {
        create: ITypeBag;
        delete: ITypeBag;
        index: ITypeBag;
        read: ITypeBag;
        update: ITypeBag;
    } & { [P in keyof C]: C[P]["types"]; };
};
export declare function CombineCalls<Ste, C extends IGenericCallBag<Ste>>(resource: INoResource<Ste>, callBucket: C): {
    actions: { [P in keyof C]: C[P]["actions"]["run"]; };
    reducer: Reducer<Ste, any>;
    types: { [P in keyof C]: C[P]["types"]; };
};
export declare function getQueryString<Parms extends IParameterBag>(urlParameters?: Parms): string;
export declare function idUrlBuilder<Parms extends IParameterBag>(rootUrl: string | (() => string)): (id?: string | number | undefined, urlParameters?: Parms | undefined) => string;
export declare function Call<Parms = {}, Snd = {}, Ret = {}, Ste = {}>(newOptions: ICallOptions<Parms, Snd, Ret, Ste>): {
    actions: {
        failure: FailureAction<Parms, Snd, Ret>;
        initiate: InitiateAction<Parms, Snd, Ret>;
        run: (id?: string | number | undefined, sent?: Snd | undefined, urlParameters?: Parms | undefined) => ThunkAction<ExtPromise<IActionResult<Parms, Snd, Ret>>, Ret, undefined, Action<any>>;
        success: SuccessAction<Parms, Snd, Ret>;
    };
    name: string;
    reducer: (s: any) => any;
    setName: (newName: string) => any;
    types: {
        failure: string;
        initiate: string;
        run: string;
        success: string;
    };
};
export declare function Resource<Parms extends IParameterBag, Snd, Ret>(options: IResourceOptions<Parms, Snd, Ret>): IResource<Parms, Snd, Ret>;
export {};
