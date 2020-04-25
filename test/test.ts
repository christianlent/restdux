import {
	Call,
	CombineResource,
	DefaultStateBucket,
	IStateBucket,
	Resource,
	CombineCalls,
	GetNoResource,
} from "./restdux";

interface Return {
	test: string;
	tested: boolean;
}

type Send = Return;

interface Parameters {
	is_test: string;
}

interface Pagination<T> {
	items: T[];
	total: number;
	page: number;
}

const transformIndex = (pagination: Pagination<Return>) => pagination.items;

const resource = Resource<Parameters, Send, Return, Pagination<Return>>({
	name: "test",
	rootUrl: "/tests",
	transformIndex,
});

const { actions, types, reducer } = CombineResource(resource, {
	markTested: Call<{}, {}, Return, IStateBucket<Return>>({
		method: "put",
		reducer: (
			state = DefaultStateBucket as IStateBucket<Return>,
			action
		): IStateBucket<Return> => {
			if (action.type !== types.markTested.success || !action.id) {
				return state;
			}
			return resource.patchEntity(state, action.id, { tested: true });
		},
		url: "/tests/mark-tested",
	}),
});

CombineCalls(GetNoResource<Return>(), {
	login: Call<{}, Send, Return, Return>({
		method: "post",
		url: "/auth/login",
	}),
	register: Call<{}, Send, Return, Return>({
		method: "post",
		url: "/auth/register",
	}),
});

export { actions, types, reducer };
