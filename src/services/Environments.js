import axios from '../lib/axios';

const Environments = {
  all(namespace) {
    return axios
      .get(`/clients/${namespace}/environments`)
      .then(response => response.data)
      .catch(error => error.response.data);
  },
  get(namespace, environmentId) {
    return axios.get(`/clients/${namespace}/environments/${environmentId}/aem`).then(resp => resp.data);
  },
  add(namespace, environmentId, environment) {
    return axios
      .post(`/clients/${namespace}/environments/${environmentId}/aem`, environment)
      .then(response => response.data)
      .catch(error => error.response.data);
  },

  update(namespace, environmentId, environment) {
    return axios
      .patch(`/clients/${namespace}/environments/${environmentId}/aem`, environment)
      .then(response => response.data);
  },

  remove(namespace, environmentId) {
    return axios
      .delete(`/clients/${namespace}/environments/${environmentId}/aem`)
      .then(response => response.data)
      .catch(error => error.response.data);
  },
};

export default Environments;
