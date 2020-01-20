import Vue from 'vue';
import Router from 'vue-router';
import Accounts from '@/containers/Accounts';
import Deployments from '@/containers/Deployments';
import Instances from '@/containers/Instances';
import Services from '@/containers/Services';
import DispatcherConfig from '@/containers/DispatcherConfig';
import Toolbelt from '@/containers/Toolbelt';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/accounts',
      name: 'Accounts',
      component: Accounts,
    },
    {
      path: '/deployments/:account',
      name: 'Deployments',
      component: Deployments,
      children: [
        {
          path: 'instances/:environment',
          component: Instances,
        },
      ],
    },
    {
      path: '/services/:account',
      name: 'Services',
      component: Services,
    },
    {
      path: '/dispatcherconfig/:account',
      name: 'Dispatcher Configuration',
      component: DispatcherConfig,
    },
    {
      path: '/toolbelt/:account',
      name: 'Toolbelt',
      component: Toolbelt,
    },
  ],
});
