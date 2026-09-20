import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia';
import 'ant-design-vue/dist/reset.css';
import '@/styles/app.less';
import AntDesignVue from 'ant-design-vue';
// me-ui 组件样式由其组件 JS 自带导入，此文件通过 :root 前缀提高优先级覆盖其默认主题色
import '@/styles/me-ui-dark-overrides.less';
import { registerDirectives } from '@/directives';

const app = createApp(App);

app.use(router);
app.use(createPinia());
app.use(AntDesignVue);

registerDirectives(app);

app.mount('#app')
