import Vue from 'vue';
import Router from 'vue-router';

import Home from '../components/Home.vue';

Vue.use(Router);

const router = new Router({
	base: '/',
	mode: 'history',
	scrollBehavior: () => ({y: 0}),
	routes: [
		{
			path: '/',
			component: Home,
			name: 'Home',
		},
		{
			path: '*',
			component: Home,
			name: 'Home',
		}
	],
});

export default router;
