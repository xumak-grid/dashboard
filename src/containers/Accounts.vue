<template>
  <div style="background:#fff">
    <v-toolbar card class="white" prominent>
      <v-icon light large>business</v-icon>
      <v-toolbar-title>Accounts</v-toolbar-title>
      <v-btn flat class="teal--text text--darken-2" left @click.native.stop="addAccountDisplay=true">
        <v-icon light class="teal--text text--darken-2" left>add</v-icon>Add
      </v-btn>
    </v-toolbar>
    <v-divider />
    <v-container fluid>
      <v-layout>
        <v-flex xs12 sm12>
          <v-card>
            <v-card-title>
              <v-spacer></v-spacer>
              <v-text-field append-icon="search" label="Search" single-line hide-details v-model="search"></v-text-field>
            </v-card-title>
            <v-data-table :items="accounts" :headers="headers" :search="search" v-model="selected" item-key="clientId" selected-key="clientId" :rows-per-page-items="rows" :loading="loading">
              <template slot="items" slot-scope="props">
                <td>{{ props.item.clientId }}</td>
                <td>

                  <v-tooltip right>
                    <v-btn icon  large  slot="activator" @click="$router.push(`/deployments/${props.item.clientId}`)">
                      <v-icon large>fa-rocket</v-icon>
                    </v-btn>
                    <span>Deployments</span>
                  </v-tooltip>

                  <v-tooltip right>
                    <v-btn icon  large  slot="activator" @click="$router.push(`/services/${props.item.clientId}`)">
                      <v-icon large>dehaze</v-icon>
                    </v-btn>
                    <span>Services</span>
                  </v-tooltip>

                  <v-btn icon  @click.native="openRemoveAccountDialog(props.index)">
                    <v-icon large>delete</v-icon>
                  </v-btn>

                </td>
              </template>
            </v-data-table>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>

    <v-dialog v-model="addAccountDisplay" width="600px" persistent>
      <v-card>
        <v-stepper v-model="tabIndex">
          <v-stepper-header>
            <v-stepper-step step="1" :complete="tabIndex > 1">Add Account</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step step="2" :complete="tabIndex > 2">Company Information</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step step="3" :complete="tabIndex > 3">Deployments</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step step="4">Confirm</v-stepper-step>
          </v-stepper-header>

          <v-stepper-items>

            <v-stepper-content step="1">
              <v-container grid-list-sm class="pa-4">
                <v-form ref="addAccountForm" >
                  <v-layout row wrap>
                    <v-flex xs12>
                      <v-text-field v-model="newAccount.clientId" prepend-icon="business" placeholder="Company" :rules="rules.clientId"></v-text-field>
                    </v-flex>
                    <v-layout row wrap><v-flex xs12>
                      <v-checkbox v-model="newAccount.customConfig" :label="`Full Deployment`" @click.native="toggleFullDeployment()" data-vv-name="checkbox" type="checkbox"></v-checkbox>
                    </v-flex></v-layout>
                  </v-layout>
                </v-form>
                <v-alert color="error" icon="warning" v-model="creationAlert.opened" dismissible> {{ creationAlert.message }}</v-alert>
              </v-container>

              <v-btn color="primary" @click.native="tab1ButtonAction()">{{ tab1BottonLabel }}</v-btn>
              <v-btn flat @click="closeCreateAccount()">Cancel</v-btn>
            </v-stepper-content>

            <v-stepper-content step="2">
              <v-container grid-list-sm class="pa-4">
                <v-form ref="companyInformationForm" >
                  <v-layout row wrap>
                    <v-flex xs12>
                      <v-text-field v-model="newAccount.configuration.fullCompanyName" placeholder="Full Company Name" :rules="rules.fullCompanyName"></v-text-field>
                    </v-flex>
                    <v-flex xs12>
                      <v-text-field v-model="newAccount.configuration.adminEmail" placeholder="Admin Email" :rules="rules.email"></v-text-field>
                    </v-flex>
                  </v-layout>
                </v-form>
              </v-container>

              <v-btn color="primary" @click.native="tabIndex = 1">Back</v-btn>
              <v-btn color="primary" @click.native="tabIndex = 3">Continue</v-btn>
              <v-btn flat @click="closeCreateAccount()">Cancel</v-btn>
            </v-stepper-content>

            <v-stepper-content step="3">
              <v-container grid-list-sm class="pa-4">

                <v-form ref="addEnvironmentForm" >
                  <v-layout row>
                    <v-flex xs6><v-text-field v-model="deploymentToAdd" placeholder="Environments" :rules="rules.environment"></v-text-field></v-flex>
                    <v-flex xs6><v-btn color="primary" @click.native="addDeployment(deploymentToAdd)">Add Environment</v-btn></v-flex>
                  </v-layout>
                </v-form>  
                <v-layout row>
                  <p>Environments: {{ newAccount.configuration.environments }}</p>
                </v-layout>
                <v-layout row>
                  <v-flex xs12>
                    <v-alert color="error" icon="warning" v-model="deploymentAlert.opened" dismissible> {{ deploymentAlert.message }}</v-alert>
                  </v-flex>
                </v-layout>

                <v-form ref="deploymentsForm">
                  <v-layout row wrap>
                    <v-flex xs8><v-select :items="versionItems" label="AEM instances Version" v-model="newAccount.configuration.aemInstancesVersion" item-text="name" item-value="name" single-line bottom :rules="rules.instance"></v-select></v-flex>
                    <v-flex xs4><v-select :items="instanceTypeItems" label="Type" v-model="newAccount.configuration.aemInstancesType" item-text="name" item-value="name" single-line bottom :rules="rules.instance"></v-select></v-flex>
                  </v-layout>
                  <v-layout row wrap>
                    <v-flex xs8><v-select :items="dispatcherVersionItems" label="Dispatchers Version" v-model="newAccount.configuration.dispatcherInstancesVersion" item-text="name" item-value="name" single-line bottom :rules="rules.instance"></v-select></v-flex>
                    <v-flex xs4><v-select :items="instanceTypeItems" label="Type" v-model="newAccount.configuration.dispatcherInstancesType" item-text="name" item-value="name" single-line bottom :rules="rules.instance"></v-select></v-flex>
                  </v-layout>
                  <v-layout row wrap>
                    <v-flex xs8>
                      <v-select :items="initialRepositoryTypeItems" label="Initial Repository Type" v-model="newAccount.configuration.initialRepositoryType" item-text="name" item-value="name"></v-select>
                    </v-flex>
                  </v-layout>
                </v-form>
                <v-alert color="error" icon="warning" v-model="creationAlert.opened" dismissible> {{ creationAlert.message }}</v-alert>
              </v-container>

              <v-btn color="primary" @click.native="tabIndex = 2">Back</v-btn>
              <v-btn color="primary" @click.native="previewAccount()">Preview</v-btn>
              <v-btn flat @click="closeCreateAccount()">Cancel</v-btn>
            </v-stepper-content>

            <v-stepper-content step="4">
              <v-container grid-list-sm class="pa-4">
                <h1>Full Deployment Summary</h1>
                <p><b>Client:</b> {{ accountPreview.Client.clientId }}</p>

                <h2>AEM Deployments</h2>
                <p><b>AEM Instances Version:</b> {{ accountPreview.Client.configuration.aemInstancesVersion }} <b>Type:</b> {{ accountPreview.Client.configuration.aemInstancesType }}</p>
                <p><b>Dispatcher Instances Version:</b> {{ accountPreview.Client.configuration.dispatcherInstancesVersion }} <b>Type:</b> {{ accountPreview.Client.configuration.dispatcherInstancesType }}</p>
                <h3>Deployments</h3>
                <v-list>
                  <template v-for="(item) in accountPreview.AEMDeployments">
                    <p :key="item.environmentId"><b>Name:</b> {{ item.environmentId }} <b>Authors:</b> {{ item.spec.authors.replicas }} <b>Publishers:</b> {{ item.spec.publishers.replicas }} <b>Dispatchers:</b> {{ item.spec.dispatchers.replicas }}</p>
                  </template>
                </v-list>

                <h2>Artifactory Manager</h2>
                <p><b>Artifactory Manager:</b> {{ accountPreview.Artifactory.artifactoryId }}</p>
                <p><b>Image:</b> {{ accountPreview.Artifactory.image }}</p>
                <h3>Groups</h3>
                <v-list>
                  <template v-for="(item) in accountPreview.Artifactory.configuration.groups">
                   
                    <div :key="item.name">
                      <p><b>Name:</b> {{ item.name }}</p>
                      <p><b>Members:</b> {{ item.members }}</p>
                    </div>

                  </template>
                </v-list>
                <h3>Hosteds</h3>
                <v-list>
                  <template v-for="(item) in accountPreview.Artifactory.configuration.hosteds">
                    <p :key="item.name"><b>Name:</b> {{ item.name }}</p>
                  </template>
                </v-list>
                <h3>Proxies</h3>
                <v-list>
                  <template v-for="(item) in accountPreview.Artifactory.configuration.proxies">
                    <p :key="item.name"><b>Name:</b> {{ item.name }}</p>
                  </template>
                </v-list>

                <h2>Source Control Manager</h2>
                <p><b>Source Control Manager:</b> {{ accountPreview.SCM.scmId }}</p>
                <p><b>Image:</b> {{ accountPreview.SCM.image }}</p>
                <h3>Organizations</h3>
                <v-list>
                  <template v-for="(item) in accountPreview.SCM.configuration.organizations">
                    <p :key="item.username"><b>Name:</b> {{ item.username }}</p>
                  </template>
                </v-list>
                <h3>Repositories</h3>
                <v-list>
                  <template v-for="(item) in accountPreview.SCM.configuration.repositories">
                    <div :key="item.name">
                      <p><b>Name:</b> {{ item.name }} <b>Owner:</b> {{ item.owner }}</p>
                      <p><b>Initial Repository Type:</b> {{ item.content_setup_type }}</p>
                    </div>
                  </template>
                </v-list>

                <h2>Continuous Integration Manager</h2>
                <p><b>Continuous Integration Manager:</b> {{ accountPreview.CI.ciId }}</p>
                <p><b>Image:</b> {{ accountPreview.CI.image }}</p>
                <v-alert color="error" icon="warning" v-model="creationAlert.opened" dismissible> {{ creationAlert.message }}</v-alert>
              </v-container>

              <v-btn color="primary" @click.native="tabIndex = 3">Back</v-btn>
              <v-btn color="primary" @click.native="addAccount()">Save</v-btn>
              <v-btn flat @click="closeCreateAccount()">Cancel</v-btn>
            </v-stepper-content>

          </v-stepper-items>

        </v-stepper>
        
      </v-card>
    </v-dialog>

    <v-dialog v-model="remove" width="400px">
      <v-card>
        <v-card-title class="grey lighten-4 py-4 title" >
          Remove Account
        </v-card-title>
        <v-container grid-list-sm class="pa-4">
          <v-layout row wrap>
            <v-flex xs12>
              <h1 class="title">{{ eliminationAccountMessage }}</h1>
            </v-flex>
          </v-layout>
        </v-container>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat color="primary" @click="closeRemoveAccount()">Cancel</v-btn>
          <v-btn flat @click="removeAccount()">Remove</v-btn>
        </v-card-actions>
        <v-alert color="error" icon="warning" v-model="removeAlert.opened" > {{ removeAlert.message }}</v-alert>
      </v-card>
    </v-dialog>

  </div>
</template>

<script>
import NamespacesService from '../services/Namespaces';
import VendorsService from '../services/Vendors';

const initAccount = {
  clientId: '',
  customConfig: false,
  configuration: {
    fullCompanyName: '',
    adminEmail: '',
    environments: [],
    aemInstancesVersion: '',
    aemInstancesType: '',
    dispatcherInstancesVersion: '',
    dispatcherInstancesType: '',
    initialRepositoryType: ''
  }
}
const initAlert = {
  message: '',
  opened: false
}

export default {
  name: 'Accounts',
  data() {
    return {
      tabIndex: 0,
      tab1BottonLabel: "Save",

      creationAlert: Object.assign({}, initAlert),
      deploymentAlert: Object.assign({}, initAlert),
      removeAlert: Object.assign({}, initAlert),

      eliminationAccountMessage: '',
      accountPreview: {
        Client: {
          clientId: '',
          configuration: {
            aemInstancesVersion: '',
            aemInstancesType: '',
            dispatcherInstancesVersion: '',
            dispatcherInstancesType: '',
          }
        },
        Artifactory: {
          artifactoryId: '',
          image: '',
          configuration: {
            groups: [],
            hosteds: [],
            proxies: []
          }
        },
        SCM: {
          scmId: 'gogs',
          image: 'grid/gogs:0.11.34',
          configuration: {
            organizations: [],
            repositories: []
          }
        },
        CI: {
          ciId: 'drone',
          image: 'drone-server',
        }
      },

      loading: false,
      addAccountDisplay: false,
      remove: false,
      editOpened: false,
      selectedAccount: {},
      search: '',
      accounts: [],
      selected: [],
      headers: [
        { value: 'name', text: 'Account', align: 'center', sortable: false },
        { value: 'actions', text: '', align: 'left', sortable: false },
      ],
      rows: [10, 20, 50, { text: 'All', value: -1 }],

      deploymentToAdd: '',
      newAccount: Object.assign({}, JSON.parse(JSON.stringify(initAccount))),

      instanceTypeItems: [],
      versionItems: [],
      dispatcherVersionItems: [],
      initialRepositoryTypeItems: [
        { name: 'empty', value: 'empty'},
        { name: 'danta-aem-demo', value: 'danta-aem-demo'}
      ],

      // Rules
      rules: { 
        clientId: [
          (value) => !!value || 'Company name required',
          (value) => /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/.test(value) || 'Company name not valid'
        ],
        fullCompanyName: [
          (value) => !!value || 'Full company name required',
        ],
        instance: [
          (value) => !!value || 'Full company name required',
        ],
        email: [
          (value) => !!value || 'Admin email required',
          (value) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) || 'Email must be valid'
        ],
        environment: [
          (value) => !!value || 'Environment must not be empty',
          (value) => /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/.test(value) || 'Environment name not valid'
        ],
      },
    };
  },
  computed: {
    actions: function actions() {
      if (!this.selected) {
        return false;
      }
      let r = false;
      for (let i = 0; i < this.selected.length; i += 1) {
        r = r || this.selected[i];
      }
      return r;
    },
  },
  created() {
    this.fetch();
  },
  methods: {
    // Navigation
    toggleFullDeployment() {
      if (this.newAccount.customConfig) {
        this.tab1BottonLabel = "Continue";
      } else {
        this.tab1BottonLabel = "Save";
      }
    },
    tab1ButtonAction() {
      if (this.newAccount.customConfig) {
        this.tabIndex = 2;
      } else {
        this.addAccount();
      }
    },

    fetch() {
      this.accountsFetch();
      this.instancesTypesFetch();
      this.aemVersionsFetch();
      this.dispatcherVersionsFetch();
    },
    accountsFetch() {
      this.loading = true;
      return NamespacesService.all().then(accounts => {
        this.accounts = accounts;
        this.selected = [];
        this.loading = false;
      });
    },
    instancesTypesFetch() {
      return VendorsService.allInstancesTypes()
        .then(result => {
          if (result.code) {
          } else {
            this.instanceTypeItems = result;
          }
      });
    },
    aemVersionsFetch() {
      return VendorsService.allAEMVersions()
        .then(result => {
          if (result.code) {
          } else {
            this.versionItems = result;
          }
      });
    },
    dispatcherVersionsFetch() {
      return VendorsService.allDispatcherVersions()
        .then(result => {
          if (result.code) {
          } else {
            this.dispatcherVersionItems = result;
          }
      });
    },

    edit(accountIdx) {
      this.selectedAccount = this.accounts[accountIdx];
      this.editOpened = true;
    },

    // Deployments methods
    addDeployment(deploymentToAdd) {
      if (!this.$refs.addEnvironmentForm.validate()) {
        return;
      }
      // Duplicated deployments validation
      if (this.newAccount.configuration.environments.indexOf(deploymentToAdd) >= 0) {
        this.deploymentAlert.message = "This environment already exists";
        this.deploymentAlert.opened = true;
        return;
      }

      this.newAccount.configuration.environments.push(deploymentToAdd);
      this.deploymentToAdd = "";
      this.$refs.addEnvironmentForm.reset();
    },

    

    previewAccount() {
      // Validations
      if (!this.$refs.addAccountForm.validate()) {
          this.tabIndex = 1
          return;
        }
      if (this.newAccount.customConfig) {
        if (!this.$refs.companyInformationForm.validate()) {
          this.tabIndex = 2;
          return;
        } else if (!this.$refs.deploymentsForm.validate()) {
          return;
        }  
      }

      const requestBody = JSON.parse(JSON.stringify(this.newAccount));
      requestBody.dryRun = true;

      NamespacesService.add(requestBody).then(result => {
        if (result.code) {
          this.creationAlert.message = result.msg;
          this.creationAlert.opened = true;
        } else {
          this.accountPreview = result;
          this.tabIndex = 4;
        }
      });
    },
    addAccount() {
      // Validations
      if (!this.$refs.addAccountForm.validate()) {
          this.tabIndex = 1
          return;
        }
      if (this.newAccount.customConfig) {
        if (!this.$refs.companyInformationForm.validate()) {
          this.tabIndex = 2;
          return;
        } else if (!this.$refs.deploymentsForm.validate()) {
          this.tabIndex = 3;
          return;
        }  
      }

      const requestBody = JSON.parse(JSON.stringify(this.newAccount));
      requestBody.dryRun = false;

      NamespacesService.add(requestBody).then(result => {
        if (result.code) {
          this.creationAlert.message = result.msg;
          this.creationAlert.opened = true;
        } else {
          this.closeCreateAccount();
          this.accountsFetch();
        }
      });
    },
    closeCreateAccount() {
      this.cleanCreationAlertDialog();
      this.addAccountDisplay = false;
    },
    cleanCreationAlertDialog() {
      // Clean alerts
      this.creationAlert = Object.assign({}, initAlert);
      this.deploymentAlert = Object.assign({}, initAlert);
      // Clean account data
      this.newAccount= Object.assign({}, JSON.parse(JSON.stringify(initAccount)));
      // Clean subforms
      this.deploymentToAdd = "";
      // Clean subforms validations
      this.$refs.addAccountForm.reset();
      this.$refs.companyInformationForm.reset();
      this.$refs.deploymentsForm.reset();
      this.$refs.addEnvironmentForm.reset();
      // Set dialog tab to initial
      this.tabIndex = 1
      this.toggleFullDeployment()
    },

    openRemoveAccountDialog(accountIndex) {
      this.selectedAccount = this.accounts[accountIndex];
      this.remove = true;
      this.eliminationAccountMessage =
        'Are you sure you want to eliminate the account ' + this.selectedAccount.clientId + '?';
    },
    removeAccount() {
      NamespacesService.remove(this.selectedAccount.clientId).then(result => {
        if (result.code) {
          this.removeAlert.message = result.msg;
          this.removeAlert.opened = true;
        } else {
          this.closeRemoveAccount();
        }
      });
    },
    closeRemoveAccount() {
      this.clearRemoveAlert();
      this.remove = false;
    },
    clearRemoveAlert() {
      this.removeAlert = Object.assign({}, initAlert);
    },
  },
};
</script>

<style scoped>

</style>
``
