import Vue from 'vue'
import App from './App.vue'

import BootstrapVue from 'bootstrap-vue'
import _ from 'lodash'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import VueGlobalVar from 'vue-global-var'
import { Algor, Pole, User, Voln, Poten, DeikAstar, Alert } from '@/models'
Vue.use(VueGlobalVar, {
  globals: {
    algor: Algor,
    pole: Pole,
    user: User,
    voln: Voln,
    poten: Poten,
    deikAstar: DeikAstar,
    alert: Alert
  }
})

Vue.use(BootstrapVue)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
