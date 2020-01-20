import axios from '../lib/axios';

const Instances = {
  all(namespace, environmentId) {
    return axios
      .get(`/clients/${namespace}/environments/${environmentId}/aem/instances`)
      .then(response => response.data)
      .catch(error => error.response.data);
  },
};

export default Instances;
