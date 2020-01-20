import axios from '../lib/axios';

const ContinuousIntegrations = {
  all(namespace) {
    return axios
      .get(`/clients/${namespace}/ci/drone`)
      .then(response => response.data)
      .catch(error => error.response.data);
  },
  remove(namespace, continuousIntegrationID) {
    return axios
      .delete(`/clients/${namespace}/ci/${continuousIntegrationID}`)
      .then(response => response.data)
      .catch(error => error.response.data);
  },
  add(namespace, environment) {
    return axios
      .post(`/clients/${namespace}/ci`, environment)
      .then(response => response.data)
      .catch(error => error.response.data);
  },
};

export default ContinuousIntegrations;
