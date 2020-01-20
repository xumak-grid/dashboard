<template>
  <v-card>
    <v-card-title>
        <v-toolbar-title>Source Control Manager</v-toolbar-title>
    </v-card-title>
    <v-data-table :items="sourceControls" :headers="sourceControlsHeaders" :loading="sourceControlsLoading" hide-actions>
        <template slot="items" slot-scope="props">
        <td>
            <v-btn icon    slot="activator" >
                <v-icon large color="red lighten-1" v-if="props.item.scmId=='not created'">remove_circle</v-icon>
                <v-icon large color="green darken-2" v-else>check_circle</v-icon>
            </v-btn>
        </td>
        <td>{{ props.item.scmId }}</td>
        <td>{{ props.item.host }}</td>
        <td>
            <v-btn icon @click.native.stop="addSourceControlDisplay=true" v-if="props.item.scmId=='not created'">
                <v-icon large>build</v-icon>
            </v-btn>
            <a :href="`${props.item.host}`" target="_blank" class="btn btn--flat btn--router indigo--text" v-if="props.item.scmId!='not created'">
                <v-icon large>open_in_new</v-icon>
            </a>
            <v-btn icon  @click.native="openRemoveSourceControlDialog(props.index)" v-if="props.item.scmId!='not created'">
                <v-icon large>delete</v-icon>
            </v-btn>
        </td>
        </template>
    </v-data-table>

    <!-- sourcecontrol dialogs -->
    <v-dialog v-model="addSourceControlDisplay" width="600px" persistent>
      <v-card>

        <v-stepper v-model="tabIndex">
          <v-stepper-header>
            <v-stepper-step step="1" :complete="tabIndex > 1">Configuration</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step step="2" :complete="tabIndex > 2">Initialization</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step step="3" :complete="tabIndex > 3">Organizations</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step step="4">Repositories</v-stepper-step>
          </v-stepper-header>

          <v-stepper-items>

            <v-stepper-content step="1">
              <v-container grid-list-sm class="pa-4">
                <v-form v-model="valid" ref="configurationForm" >
                  <v-layout row wrap><v-flex xs12>
                    <v-select :items="sourceControlItems" label="Source Control" v-model="newSourceControl.scm" item-text="name" single-line bottom :rules="rules.sourceControl"></v-select>
                  </v-flex></v-layout>
                  <v-layout row wrap><v-flex xs12>
                    <v-select :items="sourceControlImageItems" label="Image" v-model="newSourceControl.image" item-text="name" item-value="name" single-line bottom :rules="rules.image"></v-select>
                  </v-flex></v-layout>
                  <v-layout row wrap><v-flex xs12>
                    <v-checkbox v-model="newSourceControl.customConfig" :label="`Customize`" @click.native="toggleCustomize()" data-vv-name="checkbox" type="checkbox"></v-checkbox>
                  </v-flex></v-layout>
                </v-form>
                <v-alert id="creationAlertVA" color="error" icon="warning" v-model="createSourceControlAlert.opened" dismissible> {{ createSourceControlAlert.message }}</v-alert>
              </v-container>
              <v-btn color="primary" @click.native="tab1ButtonAction()">{{ tab1BottonLabel }}</v-btn>
              <v-btn flat @click="closeCreateSourceControl()">Cancel</v-btn>
            </v-stepper-content>

            <v-stepper-content step="2">
              <v-container grid-list-sm class="pa-4">
                <v-form ref="initializationForm" >
                  <v-layout row wrap><v-flex xs12>
                    <v-text-field v-model="newSourceControl.configuration.init_data.admin_name" placeholder="Admin Name" :rules="rules.adminName"></v-text-field></v-flex>
                  </v-layout>
                  <v-layout row wrap>
                    <v-flex xs6><v-text-field v-model="newSourceControl.configuration.init_data.admin_passwd" placeholder="Admin Password" type="password" :rules="[rules.adminPassword]"></v-text-field></v-flex>
                    <v-flex xs6><v-text-field v-model="newSourceControl.configuration.init_data.admin_confirm_passwd" placeholder="Confirm Password" :rules="[rules.confirmationPassword]" type="password"></v-text-field></v-flex>
                  </v-layout>
                  <v-layout row wrap><v-flex xs12>
                    <v-text-field v-model="newSourceControl.configuration.init_data.admin_email" placeholder="Email" :rules="rules.email"></v-text-field>
                  </v-flex></v-layout>
                </v-form>  
              </v-container>
              <v-btn color="primary" @click.native="tabIndex = 1">Back</v-btn>
              <v-btn color="primary" @click.native="tabIndex = 3">Continue</v-btn>
              <v-btn flat @click="closeCreateSourceControl()">Cancel</v-btn>
            </v-stepper-content>

            <v-stepper-content step="3">
              <v-container grid-list-sm class="pa-4">
                <v-form ref="organizationForm" >
                  <v-layout row wrap><v-flex xs12>
                    <v-text-field v-model="newSourceControlOrganization.username" placeholder="Name" :rules="rules.organizationName"></v-text-field>
                  </v-flex></v-layout>
                  <v-layout row wrap><v-flex xs12>
                    <v-text-field v-model="newSourceControlOrganization.full_name" placeholder="Full Name"></v-text-field>
                  </v-flex></v-layout>
                  <v-layout row wrap><v-flex xs12>
                    <v-text-field v-model="newSourceControlOrganization.description" placeholder="Description"></v-text-field>
                  </v-flex></v-layout>
                  <v-layout row wrap>
                    <v-flex xs8><v-text-field v-model="newSourceControlOrganization.website" placeholder="Website" :rules="[rules.organizationWebsite]"></v-text-field></v-flex>
                    <v-flex xs4><v-text-field v-model="newSourceControlOrganization.location" placeholder="Location" hint="(i.e. USA)"></v-text-field></v-flex>
                  </v-layout>
                  <v-layout row><v-flex xs12>
                    <v-btn color="primary" @click.native="addOrganization(newSourceControlOrganization)">Add Organization</v-btn>
                    <v-alert color="error" icon="warning" v-model="organizationsAlert.opened" dismissible> {{ organizationsAlert.message }}</v-alert>
                  </v-flex></v-layout>
                </v-form>
                <v-layout row><v-flex xs12>
                  <v-data-table :items="newSourceControl.configuration.organizations" :headers="sourceControlsOrganizationsHeaders" hide-actions>
                    <template slot="items" slot-scope="props">
                      <td>{{ props.item.username }}</td>
                      <td>{{ props.item.description }}</td>
                      <td>
                        <v-btn icon  @click.native="removeOrganization(props.index)">
                          <v-icon large>delete</v-icon>
                        </v-btn>
                      </td>
                    </template>
                  </v-data-table>
                </v-flex></v-layout>
              </v-container>
              <v-btn color="primary" @click.native="tabIndex = 2">Back</v-btn>
              <v-btn color="primary" @click.native="tabIndex = 4">Continue</v-btn>
              <v-btn flat @click="closeCreateSourceControl()">Cancel</v-btn>
            </v-stepper-content>

            <v-stepper-content step="4">
              <v-container grid-list-sm class="pa-4">
                <v-form ref="repositoryForm" >

                  <v-layout row wrap><v-flex xs12>
                    <v-text-field prepend-icon="" v-model="newSourceControlRepository.name" placeholder="Name" :rules="rules.repositoryName"></v-text-field>
                  </v-flex></v-layout>
                  <v-layout row wrap><v-flex xs12>
                    <v-text-field prepend-icon="" v-model="newSourceControlRepository.description" placeholder="Description"></v-text-field>
                  </v-flex></v-layout>
                  <v-layout row wrap><v-flex xs12>
                    <v-select :items="contentSetupTypeItems" label="Content Setup Type" v-model="newSourceControlRepository.content_setup_type" item-text="name" item-value="name"></v-select>
                  </v-flex></v-layout>
                  <v-layout row wrap><v-flex xs12>
                    <v-checkbox v-model="newSourceControlRepository.private" :label="`Private`" data-vv-name="checkbox" type="checkbox"></v-checkbox>
                  </v-flex></v-layout>
                  <v-layout row wrap><v-flex xs12>
                    <v-select :items="organizationItems" v-model="newSourceControlRepository.owner" label="Owner" item-text="username" item-value="username" ></v-select>
                  </v-flex></v-layout>
                  <v-layout row><v-flex xs12>
                    <v-btn color="primary" @click.native="addRepository(newSourceControlRepository)">Add Repository</v-btn>
                    <v-alert color="error" icon="warning" v-model="repositoriesAlert.opened" dismissible> {{ repositoriesAlert.message }}</v-alert>
                  </v-flex></v-layout>
                </v-form>
                <v-layout row><v-flex xs12>
                  <v-data-table :items="newSourceControl.configuration.repositories" :headers="sourceControlsRepositoriesHeaders" hide-actions>
                    <template slot="items" slot-scope="props">
                      <td>{{ props.item.name }}</td>
                      <td>{{ props.item.owner }}</td>
                      <td>
                        <v-icon small v-if="props.item.private==true">done</v-icon>
                      </td>
                      <td>
                        <v-btn icon  @click.native="newSourceControl.configuration.repositories.splice(props.index,1)">
                          <v-icon large>delete</v-icon>
                        </v-btn>
                      </td>
                    </template>
                  </v-data-table>
                </v-flex></v-layout>
                <v-alert id="creationAlertVA" color="error" icon="warning" v-model="createSourceControlAlert.opened" dismissible> {{ createSourceControlAlert.message }}</v-alert>
              </v-container>
              <v-btn color="primary" @click.native="tabIndex = 3">Back</v-btn>
              <v-btn color="primary" @click.native="addSourceControl()">Save</v-btn>
              <v-btn flat @click="closeCreateSourceControl()">Cancel</v-btn>
            </v-stepper-content>

          </v-stepper-items>
        </v-stepper>
      </v-card>
    </v-dialog>

    <v-dialog v-model="removeSourceControlDisplay" width="400px">
      <v-card>
        <v-card-title class="grey lighten-4 py-4 title" >Remove Source Control Manager</v-card-title>
        <v-container grid-list-sm class="pa-4">
          <v-layout row wrap><v-flex xs12>
              <h1 class="title">Are you sure you want to remove the source control manager?</h1>
          </v-flex></v-layout>
        </v-container>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat color="primary" @click="removeSourceControlDisplay=false">Cancel</v-btn>
          <v-btn flat @click="removeSourceControl()">Remove</v-btn>
        </v-card-actions>
        <v-alert color="error" icon="warning" v-model="removeSourceControlAlertOpened" > {{ removeSourceControlAlertMessage }}</v-alert>
      </v-card>
    </v-dialog>
    <!-- end source control dialogs -->
  </v-card>
</template>

<script>

import SourceControlsService from '../services/SourceControls';
import VendorsService from '../services/Vendors';

const initSourceControl = {
  customConfig: false,
  projectName: '',
  scm: {},
  configuration: {
    init_data: {
      admin_name: '',
      admin_passwd: '',
      admin_confirm_passwd: '',
      admin_email: ''
    },
    organizations: [],
    repositories: []
  }
};
const initSourceControlOrganization = {
  username: "",
  full_name: "",
  description: "",
  website: "",
  location: ""
};
const initSourceControlRepository = {
  name: "",
  description: "",
  content_setup_type: "",
  private: false,
  owner: ""
};
const initOrganizationItems = [
  { username: '' }
];
const initAlert = {
  message: '',
  opened: false
}

export default {
  name: 'SourceControlManager',
  data() {
    return {
      tabIndex: 0,
      tab1BottonLabel: "Save",

      valid: true,

      newSourceControlOrganization: Object.assign({}, JSON.parse(JSON.stringify(initSourceControlOrganization))),
      sourceControlsOrganizationsHeaders: [
        { value: 'full_name', text: 'Name', align: 'left', sortable: false },
        { value: 'description', text: 'Description', align: 'left', sortable: false }
      ],
      newSourceControlRepository: Object.assign({}, JSON.parse(JSON.stringify(initSourceControlRepository))),
      sourceControlsRepositoriesHeaders: [
        { value: 'name', text: 'Name', align: 'left', sortable: false },
        { value: 'owner', text: 'Owner', align: 'left', sortable: false },
        { value: 'private', text: 'Private', align: 'left', sortable: false }
      ],
      organizationItems: initOrganizationItems,
      contentSetupTypeItems: [
        { name: 'empty', value: 'empty'},
        { name: 'danta-aem-demo', value: 'danta-aem-demo'}
      ],

      // Rules
      rules: {
        email: [
          (value) => !!value || 'Email required',
          (value) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) || 'Email must be valid'
        ],
        adminName: [
          (value) => !!value || 'Admin name required',
          (value) => /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/.test(value) || 'Admin name not valid',
          (value) => (value != 'admin' && value != 'org') || 'This is a reserved word',
        ],
        organizationName: [
          (value) => !!value || 'Organization name required',
          (value) => /^[a-zA-Z0-9]([-a-zA-Z0-9]*[a-zA-Z0-9])?$/.test(value) || 'Organization name not valid',
          (value) => (value != 'admin' && value != 'org') || 'This is a reserved word',
          (value) => (value != this.newSourceControl.configuration.init_data.admin_name) || 'Organization name must not be the same as the admin name',
        ],
        organizationWebsite:
          (value) => /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/.test(value) || !value || 'Website must be valid',
        repositoryName: [
          (value) => !!value || 'Repository name required',
          (value) => /^[a-zA-Z0-9]([-a-zA-Z0-9]*[a-zA-Z0-9])?$/.test(value) || 'Repository name not valid',
        ],
        adminPassword:
          (value) => !!value || 'Password required',
        confirmationPassword:
          (value) => value == this.newSourceControl.configuration.init_data.admin_passwd || 'Password confirmation does not match',
        sourceControl: [
          (value) => (value != null && !!value.name) || 'Source control is required',
        ],
        image: [
          (value) => !!value || 'Image is required'
        ]
      },

      // source controls
      addSourceControlDisplay: false,
      createSourceControlAlert: Object.assign({}, initAlert),
      organizationsAlert: Object.assign({}, initAlert),
      repositoriesAlert: Object.assign({}, initAlert),

      sourceControlItems: [],
      newSourceControl: Object.assign({}, JSON.parse(JSON.stringify(initSourceControl))),
      removeSourceControlDisplay: false,
      removeSourceControlAlertOpened: false,
      removeSourceControlAlertMessage: '',
      sourceControls: [],
      sourceControlsLoading: false,
      sourceControlsHeaders: [
        { value: 'configured', text: 'Configured', align: 'left', sortable: false },
        { value: 'scmId', text: 'Vendor', align: 'left', sortable: false },
        { value: 'host', text: 'Host', align: 'left', sortable: false },
      ],

      rows: [10, 20, 50, { text: 'All', value: -1 }],
    };
  },
  computed: {
    sourceControlImageItems: function () {
      if (this.newSourceControl.scm) {
        return this.newSourceControl.scm.images;
      } else {
        return [];
      }
    }
  },

  created() {
    this.fetch();
  },

  methods: {
    // customize
    toggleCustomize() {
      if (this.newSourceControl.customConfig) {
        this.tab1BottonLabel = "Continue";
      } else {
        this.tab1BottonLabel = "Save";
      }
    },
    tab1ButtonAction() {
      if (this.newSourceControl.customConfig) {
        this.tabIndex = 2;
      } else {
        this.addSourceControl();
      }
    },

    recalculateOrganizationList() {
      this.organizationItems = initOrganizationItems.concat(this.newSourceControl.configuration.organizations);
    },

    // source control functions
    fetch() {
      this.account = this.$route.params.account;
      this.sourceControlsFetch();
      this.sourceControlItemsFetch();
    },
    sourceControlsFetch() {
      this.sourceControlsLoading = true;
      return SourceControlsService.all(this.$route.params.account).then(result => {
        if (result.code) {
          this.sourceControls = [];
          const emptySourceControl = { scmId: 'not created'};
          this.sourceControls.push(emptySourceControl);
        } else {
          this.sourceControls = [];
          this.sourceControls.push(result);
        }
        this.sourceControlsLoading = false;
      });
    },
    sourceControlItemsFetch() {
      return VendorsService.allSourceControls()
        .then(result => {
          if (result.code) {
          } else {
            this.sourceControlItems = result;
          }
      });
    },

    containsObject(obj, property, list) {
      var result = false;
      var i;
      for (i = 0; i < list.length; i++) {
        if (list[i][property] === obj[property]) {
          result = true;
          return result;
        }
      }
      return result;
    },


    // Organization methods
    addOrganization(organizationToAdd) {
      // Duplicated oranization validation
      var isDuplicated = this.containsObject(organizationToAdd, "username", this.newSourceControl.configuration.organizations);
      if (isDuplicated) {
        this.organizationsAlert.message = "This organization already exists";
        this.organizationsAlert.opened = true;
        return;
      }

      if (this.$refs.organizationForm.validate()) {
        var organization = Object.assign({}, JSON.parse(JSON.stringify(organizationToAdd))); 
        this.newSourceControl.configuration.organizations.push(organization);
        
        this.recalculateOrganizationList();
        this.newSourceControlOrganization = Object.assign({}, JSON.parse(JSON.stringify(initSourceControlOrganization))); 
        this.$refs.organizationForm.reset();
      }
    },
    removeOrganization(index) {
      this.newSourceControl.configuration.organizations.splice(index,1);
      this.recalculateOrganizationList();
    },

    // Repositories methods
    addRepository(repositoryToAdd) {
      // Duplicated oranization validation
      var isDuplicated = this.containsObject(repositoryToAdd, "name", this.newSourceControl.configuration.repositories);
      if (isDuplicated) {
        this.repositoriesAlert.message = "This repository already exists";
        this.repositoriesAlert.opened = true;
        return;
      }

      if (this.$refs.repositoryForm.validate()) {
        var repository = Object.assign({}, JSON.parse(JSON.stringify(repositoryToAdd))); 
        this.newSourceControl.configuration.repositories.push(repository);
        
        this.newSourceControlRepository = Object.assign({}, JSON.parse(JSON.stringify(initSourceControlRepository))); 
        this.$refs.repositoryForm.reset();
      }
    },

    addSourceControl() {
      // Validations
      if (!this.$refs.configurationForm.validate()) {
        this.tabIndex = 1;
        return;
      } else if (this.newSourceControl.customConfig) {
        if (!this.$refs.initializationForm.validate()) {
          this.tabIndex = 2
          return;
        }  
      }

      const requestBody = {
        scmId: this.newSourceControl.scm.name,
        image: this.newSourceControl.image,
        customConfig: this.newSourceControl.customConfig,
        configuration: JSON.parse(JSON.stringify(this.newSourceControl.configuration)),
      };
      SourceControlsService.add(this.account, requestBody).then(result => {
        if (result.code) {
          this.createSourceControlAlert.message = result.msg;
          this.createSourceControlAlert.opened = true;
        } else {
          this.cleanCreateSourceControlDialog();
          this.addSourceControlDisplay = false;
          this.sourceControlsFetch();
        }
      });
    },
    closeCreateSourceControl() {
      this.cleanCreateSourceControlDialog();
      this.addSourceControlDisplay = false;
    },
    cleanCreateSourceControlDialog() {
      // Clean alerts
      this.createSourceControlAlert = Object.assign({}, initAlert);
      this.organizationsAlert = Object.assign({}, initAlert);
      this.repositoriesAlert = Object.assign({}, initAlert);
      this.$refs.initializationForm.reset();
      // Clean source control data
      this.newSourceControl = Object.assign({}, JSON.parse(JSON.stringify(initSourceControl)));
      // Clean subforms validations
      this.$refs.configurationForm.reset();
      this.$refs.organizationForm.reset();
      this.$refs.repositoryForm.reset();
      // Set dialog tab to initial
      this.tabIndex = 1
      this.toggleCustomize()
    },
    openRemoveSourceControlDialog(sourceControlIndex) {
      this.selectedSourceControl = this.sourceControls[sourceControlIndex];
      this.removeSourceControlDisplay = true;
    },
    removeSourceControl() {
      SourceControlsService.remove(this.$route.params.account, this.selectedSourceControl.scmId).then(result => {
        if (result.code) {
          this.removeSourceControlAlertMessage = result.msg;
          this.removeSourceControlAlertOpened = true;
        } else {
          this.closeRemoveSourceControl();
          this.sourceControlsFetch();
        }
      });
    },
    closeRemoveSourceControl() {
      this.clearRemoveSourceControlAlert();
      this.removeSourceControlDisplay = false;
    },
    clearRemoveSourceControlAlert() {
      this.removeSourceControlAlertMessage = '';
      this.removeSourceControlAlertOpened = false;
    },
    
  },
};
</script>

<style scoped>

</style>
  