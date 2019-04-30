import {applyMiddleware, combineReducers, createStore} from "redux";
import thunk from "redux-thunk";
import {Call, CombineResource, Resource} from "../index";

type Post = {
	body: string,
	id: number,
	title: string,
	userId: number,
};

const {actions, types, reducer} = CombineResource(
	Resource<{}, Partial<Post>, Post>(
		{
			name: "post",
			rootUrl: "https://jsonplaceholder.typicode.com/posts",
		},
	), {
		comments: Call({
			method: "GET",
			url: (id) => `https://jsonplaceholder.typicode.com/posts/${id}/layoff`,
		}),
	},
);

const store = createStore(combineReducers({
	post: reducer,
}), applyMiddleware(thunk));

async function test() {
	await store.dispatch(actions.read(1));
	const state = store.getState();
	const post = state.post.data[1];
	document.querySelector("body").innerHTML = `<pre>${JSON.stringify(post, null, 2)}</pre>`;
}

test();
