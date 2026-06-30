import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia';
import 'ant-design-vue/dist/reset.css';
import '@/styles/app.less';
import AntDesignVue from 'ant-design-vue';
import { registerDirectives } from '@/directives';

const app = createApp(App);

app.use(router);
app.use(createPinia());
app.use(AntDesignVue);

registerDirectives(app);

app.mount('#app')
