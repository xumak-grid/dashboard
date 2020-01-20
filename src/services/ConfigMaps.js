import axios from '../lib/axios';

const ConfigMaps = {
  allDispatcherConfig(namespace, deployment) {
    return axios
      .get(`/clients/${namespace}/environments/${deployment}/aem/dispatcherconfig`)
      .then(response => response.data)
      .catch(error => error.response.data);
  },
  updateDispatcherConfig(namespace, deployment, environment) {
    return axios
      .patch(`/clients/${namespace}/environments/${deployment}/aem/dispatcherconfig`, environment)
      .then(response => response.data)
      .catch(error => error.response.data);
  },
};

export default ConfigMaps;
