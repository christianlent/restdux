# Restdux

Restdux is a Typescript/Javascript library for interacting with RESTful server APIs and connecting them to Redux store. It has the following features:
- Typescript-first design. With properly created resources, typescript will validate all API call names, parameters, sent data, and payloads. This also means that editors like Visual Studio Code that support intellisense will be able to auto-complete all those parameters
- Caching. Restdux will allows users to force a read, or to do a cache read. The user can specify custom rules for cache validity, or imperatively invalidate specific resources.
- Batching. If the REST server supports it, Restdux can defer fetching and request larger batches using the index API call.
	- e.g. http://example.com/numbers?id[]=2&id[]=3&id[]=5&id[]=7&id[]=11&id[]=13&id[]=17&id[]=19
- Deterministic redux state for resource, including ID indexed resources. This makes many operations such as updates, deletes, and fetches very performant.
- Persisted metadata. Each resource will persist initiation datetime, success datetime, failure datetime, and a promise handler while the call is in motion.
- Uses "fetch" out of the box to minimize footprint and maximize browser compatibility
- Promise-based returns so action dispatchers can inspect api call results, such as the Fetch response, returned data, and caught errors.

There are several other excellent libraries out there that fulfill the same objectives, including:
- Redux Resource - https://github.com/jamesplease/redux-resource
- Redux Rest Resource - https://github.com/mgcrea/redux-rest-resource
- Redux Api - https://github.com/lexich/redux-api

## Requirements
- Redux
- Redux Thunk
- Fetch (included in modern browsers, polyfillable for node/react-native)

## Installation
```bash
npm install restdux
```

## Usage
```typescript
import {Call, CombineResource, Resource} from 'restdux';

Type Post = {
	body: string,
	id: number,
	title: string,
	userId: number,
}

export const {actions, types, reducer} = CombineResource(
	Resource<{}, Partial<Post>, Post>(
		{
			name: 'post',
			rootUrl: 'https://jsonplaceholder.typicode.com/posts',
		}
	), {
		comments: Call({
			method: 'GET',
			url: (id) => `https://jsonplaceholder.typicode.com/posts/${id}/comments
		}),
	},
);
```

## Documentation

### function Resource(options)
Resource options:
- **batchReads**: boolean
	- default: **false**
	- Enables Restdux to fetch multiple entities from the server in one call.
- **batchDelayMax**: number
	- default: **300**
	- When batch reads are enabled, the maximum time Restdux will wait to fetch data.
- **batchDelayMin**: number
	- default: **300**
	- When batch reads are enabled, the minimum time Restdux will wait to fetch data.
- **batchIdsParameter**: string
	- default: **"ids[]"**
	- When batch reads are enabled, query string parameter that will be appended to the index call.
- **headers**: IHeaderBag | (() => IHeaderBag)
	- default
		- "Accept": "application/json",
		- "Content-Type": "application/json",
	- Key/value pairs that will be sent as headers with each service call. This can be an object or a function that returns an object.
- **idField**: string
	- default: **"id"**
	- The name of the field that will be used as an id on the entity
- **methodCreate**: "DELETE" | "GET" | "HEAD" | "OPTIONS" | "POST" | "PUT" | "PATCH"
	- default: **"POST"**
	- The HTTP method/verb that will be used for Create calls.
- **methodDelete**: "DELETE" | "GET" | "HEAD" | "OPTIONS" | "POST" | "PUT" | "PATCH"
	- default: **"DELETE"**
	- The HTTP method/verb that will be used for Delete calls.
- **methodIndex**: "DELETE" | "GET" | "HEAD" | "OPTIONS" | "POST" | "PUT" | "PATCH"
	- default: **"GET"**
	- The HTTP method/verb that will be used for Index calls.
- **methodRead**: "DELETE" | "GET" | "HEAD" | "OPTIONS" | "POST" | "PUT" | "PATCH"
	- default: **"GET"**
	- The HTTP method/verb that will be used for Read calls.
- **methodUpdate**: "DELETE" | "GET" | "HEAD" | "OPTIONS" | "POST" | "PUT" | "PATCH"
	- default: **"PUT"**
	- The HTTP method/verb that will be used for Update calls. Although PUT is default, many users may prefer the symantics of PATCH since it conveys that not all fields must be sent to the server.
- **name***: string
	- **required**
	- The name of the Restdux resource. This will be prepended to all corresponding type names. It is strongly recommended that this match the name of the combineReducer key used for this resource to ensure clarity, but it not required.
- **parseResult**: (resultBody: any) => Ret
	- default: **(resultBody) => resultBody**
	- A function used to transform each payload that is received from the server.
- **preFetch**: () => void
	- default: **function() {}**
	- A function that is run before each "fetch" transaction to the server.
- **rootUrl**: string
	- **required**
	- The root URL that will be used for all calls to this service
		- create: ${rootUrl}
		- delete: ${rootUrl}/${id}
		- index: ${rootUrl}
		- read: ${rootUrl}/${id}
		- update: ${rootUrl}/${id}
- **stringifyBody**: (requestBody: Snd) => string
	- default: **(requestBody) => JSON.stringify(requestBody)**
	- A function used to transform each payload that is sent to the server.
- **transformIndex**: (resultBody: any) => Ret[]
	- default: **(resultBody) => resultBody**
	- A function used to transform each index payload that is received from the server. This is particularly useful for index methods that return paginated data.
- **updateStateOnUpdateInitiate**: boolean
	- default: **true**
	- Enables Restdux to update the contents of a redux store when an update is initated (rather than waiting for a server response).
- **updateStateOnUpdateSuccess**: boolean
	- default: **true**
	- Enables Restdux to update the contents of a redux store when an update succeeds (rather than updating when when the call succeeds).
- **validateStatus**: (status: number) => boolean
	- default: **(status) => status >= 200 && status < 300**
	- A function that determines whether a service call has succeeded (true) or failed (false).

### function Call(options)
Call options:
- **headers**: IHeaderBag | (() => IHeaderBag)
	- default
		- "Accept": "application/json",
		- "Content-Type": "application/json",
	- Key/value pairs that will be sent as headers with each service call. This can be an object or a function that returns an object.
- **idField**: string
	- default: **"id"**
	- The name of the field that will be used as an id on the entity
- **method**: "DELETE" | "GET" | "HEAD" | "OPTIONS" | "POST" | "PUT" | "PATCH"
	- default: **"GET"**
	- The HTTP method/verb that will be used for this call.
- **parseResult**: (resultBody: any) => Ret
	- default: **(resultBody) => resultBody**
	- A function used to transform each payload that is received from the server.
- **preFetch**: () => void
	- default: **function() {}**
	- A function that is run before each "fetch" transaction to the server.
- **reducer**: (state: State, action: Action) => State
	- default: **(state, action) => state**
	- The Redux reducer to use for this call. Standard Redux rules apply (no mutation, check types, etc.)
- **resourceName***: string
	- **""**
	- If this is associated with a Restdux resource, the name of the Restdux resource. This will be prepended to all type names for the purpose of disambiguation.
- **stringifyBody**: (requestBody: Snd) => string
	- default: **(requestBody) => JSON.stringify(requestBody)**
	- A function used to transform each payload that is sent to the server.
- **url**: string
	- **required**
	- The URL that will be used for this call
- **validateStatus**: (status: number) => boolean
	- default: **(status) => status >= 200 && status < 300**
	- A function that determines whether a service call has succeeded (true) or failed (false).
