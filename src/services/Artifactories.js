import axios from '../lib/axios';

const Artifactories = {
  all(namespace) {
    return axios
      .get(`/clients/${namespace}/artifactory/nexus`)
      .then(response => response.data)
      .catch(error => error.response.data);
  },
  remove(namespace, artifactoryId) {
    return axios
      .delete(`/clients/${namespace}/artifactory/${artifactoryId}`)
      .then(response => response.data)
      .catch(error => error.response.data);
  },
  add(namespace, environment) {
    return axios
      .post(`/clients/${namespace}/artifactory`, environment)
      .then(response => response.data)
      .catch(error => error.response.data);
  },
};

export default Artifactories;
