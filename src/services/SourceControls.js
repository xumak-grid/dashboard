import axios from '../lib/axios';

const SourceControls = {
  all(namespace) {
    return axios
      .get(`/clients/${namespace}/scm/gogs`)
      .then(response => response.data)
      .catch(error => error.response.data);
  },
  remove(namespace, sourceControlId) {
    return axios
      .delete(`/clients/${namespace}/scm/${sourceControlId}`)
      .then(response => response.data)
      .catch(error => error.response.data);
  },
  add(namespace, environment) {
    return axios
      .post(`/clients/${namespace}/scm`, environment)
      .then(response => response.data)
      .catch(error => error.response.data);
  },
};

export default SourceControls;
