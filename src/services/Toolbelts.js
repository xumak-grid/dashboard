import axios from '../lib/axios';

const Toolbelts = {
  all(namespace) {
    return axios
      .get(`/clients/${namespace}/tools/toolbelt`)
      .then(response => response.data)
      .catch(error => error.response.data);
  },
  add(namespace) {
    return axios
      .post(`/clients/${namespace}/tools/toolbelt`)
      .then(response => response.data)
      .catch(error => error.response.data);
  },
  remove(namespace) {
    return axios
      .delete(`/clients/${namespace}/tools/toolbelt`)
      .then(response => response.data)
      .catch(error => error.response.data);
  },
};

export default Toolbelts;
