import { createWebHistory, createRouter } from 'vue-router'

import AllMatch from '../components/AllMatch.vue'
import RateMatch from '../components/RateMatch.vue'
import DegenerateBases from '../components/DegenerateBases.vue'

const routes = [
    { path: '/', component: AllMatch },
    { path: '/rate', component: RateMatch },
    { path: '/degenerate', component: DegenerateBases },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router;