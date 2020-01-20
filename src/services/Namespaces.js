import axios from '../lib/axios';

const Namespaces = {
  all() {
    return axios.get('/clients').then(resp => resp.data);
  },
  add(namespace) {
    return axios
      .post('/clients', namespace)
      .then(response => response.data)
      .catch(error => error.response.data);
  },
  update(id, namespace) {
    return axios.put(`/clients/${id}`, namespace).then(response => response.data);
  },
  remove(id) {
    return axios
      .delete(`/clients/${id}`)
      .then(response => response.data)
      .catch(error => error.response.data);
  },
};

export default Namespaces;
