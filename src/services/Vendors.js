import axios from '../lib/axios';

const Vendors = {
  allArtifactories() {
    return axios
      .get(`/vendors/artifactory/list`)
      .then(response => response.data)
      .catch(error => error.response.data);
  },
  allSourceControls() {
    return axios
      .get(`/vendors/scm/list`)
      .then(response => response.data)
      .catch(error => error.response.data);
  },
  allConstinuousIntegrations() {
    return axios
      .get(`/vendors/ci/list`)
      .then(response => response.data)
      .catch(error => error.response.data);
  },
  allInstancesTypes() {
    return axios
      .get(`/instances/type/list`)
      .then(response => response.data)
      .catch(error => error.response.data);
  },
  allAEMVersions() {
    return axios
      .get(`/images/aem/list`)
      .then(response => response.data)
      .catch(error => error.response.data);
  },
  allDispatcherVersions() {
    return axios
      .get(`/images/dispatcher/list`)
      .then(response => response.data)
      .catch(error => error.response.data);
  },
};

export default Vendors;
