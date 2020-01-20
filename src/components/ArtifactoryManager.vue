<template>
  <v-card>
    <v-card-title>
      <v-toolbar-title>Artifactory Manager</v-toolbar-title>
    </v-card-title>
    <v-data-table :items="artifactories" :headers="artifactoriesHeaders" :loading="artifactoriesLoading" hide-actions>
      <template slot="items" slot-scope="props">
        <td>
          <v-btn icon    slot="activator" >
              <v-icon large color="red lighten-1" v-if="props.item.artifactoryId=='not created'">remove_circle</v-icon>
              <v-icon large color="green darken-2" v-else>check_circle</v-icon>
          </v-btn>
        </td>
        <td>{{ props.item.artifactoryId }}</td>
        <td>{{ props.item.host }}</td>
        <td>
          <v-btn icon @click.native.stop="addArtifactoryDisplay=true" v-if="props.item.artifactoryId=='not created'">
            <v-icon large>build</v-icon>
          </v-btn>
          <a :href="`${props.item.host}`" target="_blank" class="btn btn--flat btn--router indigo--text" v-if="props.item.artifactoryId!='not created'">
            <v-icon large>open_in_new</v-icon>
          </a>
          <v-btn icon  @click.native="openRemoveArtifactoryDialog(props.index)" v-if="props.item.artifactoryId!='not created'">
            <v-icon large>delete</v-icon>
          </v-btn>
        </td>
      </template>
    </v-data-table>

    <!-- artifactory dialogs -->
    <v-dialog v-model="addArtifactoryDisplay" width="600px" persistent>
      <v-card>

        <v-stepper v-model="tabIndex">
          <v-stepper-header>
            <v-stepper-step step="1" :complete="tabIndex > 1">Configuration</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step step="2" :complete="tabIndex > 2">Hosteds</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step step="3" :complete="tabIndex > 3">Proxies</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step step="4">Groups</v-stepper-step>
          </v-stepper-header>

          <v-stepper-items>

            <v-stepper-content step="1">
              <v-container grid-list-sm class="pa-4">
                <v-form v-model="valid" ref="configurationForm" >
                  <v-layout row wrap><v-flex xs12>
                    <v-select :items="artifactoryItems" label="Artifactory" v-model="newArtifactory.artifactory" item-text="name" single-line bottom :rules="rules.artifactory"></v-select>
                  </v-flex></v-layout>
                  <v-layout row wrap><v-flex xs12>
                    <v-select :items="artifactoryImageItems" label="Image" v-model="newArtifactory.image" item-text="name" item-value="name" single-line bottom :rules="rules.image"></v-select>
                  </v-flex></v-layout>
                  <v-layout row wrap><v-flex xs12>
                    <v-checkbox v-model="newArtifactory.customConfig" :label="`Customize`" @click.native="toggleCustomize()" data-vv-name="checkbox" type="checkbox"></v-checkbox>
                  </v-flex></v-layout>
                </v-form>
                <v-alert id="creationAlertVA" color="error" icon="warning" v-model="createArtifactoryAlert.opened" dismissible> {{ createArtifactoryAlert.message }}</v-alert>
              </v-container>
              <v-btn color="primary" @click.native="tab1ButtonAction()">{{ tab1BottonLabel }}</v-btn>
              <v-btn flat @click="closeCreateArtifactory()">Cancel</v-btn>
            </v-stepper-content>

            <v-stepper-content step="2">
              <v-container grid-list-sm class="pa-4">
                <v-form ref="hostedForm" >
                  <v-layout row wrap><v-flex xs12>
                    <v-text-field prepend-icon="" v-model="newArtifactoryHosted.name" placeholder="Hosted Name" :rules="rules.name"></v-text-field>
                  </v-flex></v-layout>
                  <v-layout row wrap><v-flex xs12>
                    <v-select :items="versionPolicyItems" label="Version Policy" v-model="newArtifactoryHosted.versionPolicy" item-text="name" item-value="name" single-line bottom :rules="rules.versionPolicy"></v-select>
                  </v-flex></v-layout>
                  <v-layout row wrap><v-flex xs12>
                    <v-select :items="layoutPolicyItems" label="Layout Policy" v-model="newArtifactoryHosted.layoutPolicy" item-text="name" item-value="name" single-line bottom :rules="rules.layoutPolicy"></v-select>
                  </v-flex></v-layout>
                  <v-layout row><v-flex xs12>
                    <v-btn color="primary" @click.native="addHosted(newArtifactoryHosted)">Add Hosted</v-btn>
                    <v-alert color="error" icon="warning" v-model="hostedsAlert.opened" dismissible> {{ hostedsAlert.message }}</v-alert>
                  </v-flex></v-layout>
                </v-form>  
                <v-layout row><v-flex xs12>
                  <v-data-table :items="newArtifactory.configuration.hosteds" :headers="artifactoriesHostedsHeaders" hide-actions>
                    <template slot="items" slot-scope="props">
                      <td>{{ props.item.name }}</td>
                      <td>{{ props.item.versionPolicy }}</td>
                      <td>{{ props.item.layoutPolicy }}</td>
                      <td>
                        <v-btn icon  @click.native="removeHosted(props.index)">
                          <v-icon large>delete</v-icon>
                        </v-btn>
                      </td>
                    </template>
                  </v-data-table>
                </v-flex></v-layout>
              </v-container>
              <v-btn color="primary" @click.native="tabIndex = 1">Back</v-btn>
              <v-btn color="primary" @click.native="tabIndex = 3">Continue</v-btn>
              <v-btn flat @click="closeCreateArtifactory()">Cancel</v-btn>
            </v-stepper-content>

            <v-stepper-content step="3">
              <v-container grid-list-sm class="pa-4">
                <v-form ref="proxyForm" >
                  <v-layout row wrap><v-flex xs12>
                    <v-text-field prepend-icon="" v-model="newArtifactoryProxy.name" placeholder="Proxy Name" :rules="rules.name"></v-text-field>
                  </v-flex></v-layout>
                  <v-layout row wrap>
                    <v-select :items="versionPolicyItems" label="Version Policy" v-model="newArtifactoryProxy.versionPolicy" item-text="name" item-value="name" single-line bottom :rules="rules.versionPolicy"></v-select>
                    <v-select :items="layoutPolicyItems" label="Layout Policy" v-model="newArtifactoryProxy.layoutPolicy" item-text="name" item-value="name" single-line bottom :rules="rules.layoutPolicy"></v-select>
                  </v-layout>
                  <v-layout row wrap><v-flex xs12>
                    <v-text-field prepend-icon="" v-model="newArtifactoryProxy.remoteUrl" placeholder="Remote Url" :rules="rules.remoteUrl"></v-text-field>
                  </v-flex></v-layout>
                  <v-layout row wrap><v-flex xs12>
                    <v-checkbox v-model="newArtifactoryProxy.requiredAuth" :label="`Required Auth`" data-vv-name="checkbox" type="checkbox"></v-checkbox>
                  </v-flex></v-layout>
                  <v-layout v-if="newArtifactoryProxy.requiredAuth" row wrap><v-flex xs12>
                    <v-text-field prepend-icon="" v-model="newArtifactoryProxy.authentication.username" placeholder="Username" :rules="rules.proxyUsername"></v-text-field>
                  </v-flex></v-layout>
                  <v-layout v-if="newArtifactoryProxy.requiredAuth" row wrap><v-flex xs12>
                    <v-text-field prepend-icon="" v-model="newArtifactoryProxy.authentication.password" type="password" placeholder="Password" :rules="rules.proxyPassword"></v-text-field>
                  </v-flex></v-layout>
                  <v-layout row><v-flex xs12>
                    <v-btn color="primary" @click.native="addProxy(newArtifactoryProxy)">Add Proxy</v-btn>
                    <v-alert color="error" icon="warning" v-model="proxiesAlert.opened" dismissible> {{ proxiesAlert.message }}</v-alert>
                  </v-flex></v-layout>
                </v-form>
                <v-layout row><v-flex xs12>
                  <v-data-table :items="newArtifactory.configuration.proxies" :headers="artifactoriesProxiesHeaders" hide-actions>
                    <template slot="items" slot-scope="props">
                      <td>{{ props.item.name }}</td>
                      <td>{{ props.item.versionPolicy }}</td>
                      <td>{{ props.item.layoutPolicy }}</td>
                      <td>
                        <v-btn icon  @click.native="removeProxy(props.index)">
                          <v-icon large>delete</v-icon>
                        </v-btn>
                      </td>
                    </template>
                  </v-data-table>
                </v-flex></v-layout>
              </v-container>
              <v-btn color="primary" @click.native="tabIndex = 2">Back</v-btn>
              <v-btn color="primary" @click.native="tabIndex = 4">Continue</v-btn>
              <v-btn flat @click="closeCreateArtifactory()">Cancel</v-btn>
            </v-stepper-content>

            <v-stepper-content step="4">
              <v-container grid-list-sm class="pa-4">
                <v-form ref="groupForm" >
                  <v-layout row wrap><v-flex xs12>
                    <v-text-field prepend-icon="" v-model="newArtifactoryGroup.name" placeholder="Group Name" :rules="rules.name"></v-text-field>
                  </v-flex></v-layout>
                </v-form>
                <v-form ref="groupMemberForm" >
                  <v-layout row>
                    <v-select :items="memberItems"  v-model="memberToAdd" item-text="name" combobox :rules="rules.member"></v-select>
                    <v-btn color="primary" @click.native="addMember(memberToAdd)">Add Member</v-btn>
                  </v-layout>
                </v-form>
                <v-layout row wrap><v-flex xs12>
                  <v-list>
                    <template v-for="(item) in newArtifactoryGroup.members">
                      <p :key="item">{{ item }}</p>
                    </template>
                  </v-list>
                </v-flex></v-layout>
                <v-layout row><v-flex xs12>
                  <v-btn color="primary" @click.native="addGroup(newArtifactoryGroup)">Add Group</v-btn>
                  <v-alert color="error" icon="warning" v-model="groupsAlert.opened" dismissible> {{ groupsAlert.message }}</v-alert>
                </v-flex></v-layout>
                <v-layout row><v-flex xs12>
                  <v-data-table :items="newArtifactory.configuration.groups" :headers="artifactoriesGroupsHeaders" hide-actions>
                    <template slot="items" slot-scope="props">
                      <td>{{ props.item.name }}</td>
                      <td>{{ props.item.members }}</td>
                      <td>
                        <v-btn icon  @click.native="newArtifactory.configuration.groups.splice(props.index,1)">
                          <v-icon large>delete</v-icon>
                        </v-btn>
                      </td>
                    </template>
                  </v-data-table>
                </v-flex></v-layout>
                <v-alert id="creationAlertVA" color="error" icon="warning" v-model="createArtifactoryAlert.opened" dismissible> {{ createArtifactoryAlert.message }}</v-alert>
              </v-container>
              <v-btn color="primary" @click.native="tabIndex = 3">Back</v-btn>
              <v-btn color="primary" @click.native="addArtifactory()">Save</v-btn>
              <v-btn flat @click="closeCreateArtifactory()">Cancel</v-btn>
            </v-stepper-content>

          </v-stepper-items>
        </v-stepper>
      </v-card>

    </v-dialog>

    <v-dialog v-model="removeArtifactoryDisplay" width="400px">
      <v-card>
        <v-card-title class="grey lighten-4 py-4 title" >Remove Artifactory</v-card-title>
        <v-container grid-list-sm class="pa-4">
          <v-layout row wrap><v-flex xs12>
              <h1 class="title">Are you sure you want to remove the artifactory?</h1>
          </v-flex></v-layout>
        </v-container>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat color="primary" @click="removeArtifactoryDisplay=false">Cancel</v-btn>
          <v-btn flat @click="removeArtifactory()">Remove</v-btn>
        </v-card-actions>
        <v-alert color="error" icon="warning" v-model="removeArtifactoryAlertOpened" > {{ removeArtifactoryAlertMessage }}</v-alert>
      </v-card>
    </v-dialog>
    <!-- end artifactory dialogs -->

  </v-card>
  
</template>


<script>

import ArtifactoriesService from '../services/Artifactories';
import VendorsService from '../services/Vendors';
const initArtifactory = {
  customConfig: false,
  artifactory: {},
  configuration: {
    groups: [],
    hosteds: [],
    proxies: [],
  }
};

const initArtifactoryGroup = {
  name: "",
  members: [],
};

const initArtifactoryHosted = {
  name: "",
  versionPolicy: "",
  layoutPolicy: "",
};

const initArtifactoryProxy = {
  name: "",
  versionPolicy: "",
  layoutPolicy: "",
  requiredAuth: false,
  authentication: {
    username: "",
    password: "",
  }
};
const initMemberItems = [
  { name: 'maven-releases', type: 'default' },
  { name: 'maven-snapshots', type: 'default' }
]
const initAlert = {
  message: '',
  opened: false
}

export default {
  name: 'ArtifactoryManager',
  data() {
    return {
      tabIndex: 0,
      tab1BottonLabel: "Save",

      newArtifactoryGroup: Object.assign({}, JSON.parse(JSON.stringify(initArtifactoryGroup))),
      memberToAdd: "",
      artifactoriesGroupsHeaders: [
        { value: 'name', text: 'Name', align: 'left', sortable: false },
        { value: 'members', text: 'Members', align: 'left', sortable: false },
      ],
      newArtifactoryHosted: Object.assign({}, JSON.parse(JSON.stringify(initArtifactoryHosted))),
      artifactoriesHostedsHeaders: [
        { value: 'name', text: 'Name', align: 'left', sortable: false },
        { value: 'versionPolicy', text: 'Version Policy', align: 'left', sortable: false },
        { value: 'layoutPolicy', text: 'Layout Policy', align: 'left', sortable: false },
      ],

      newArtifactoryProxy: Object.assign({}, JSON.parse(JSON.stringify(initArtifactoryProxy))),
      artifactoriesProxiesHeaders: [
        { value: 'name', text: 'Name', align: 'left', sortable: false },
        { value: 'versionPolicy', text: 'Version Policy', align: 'left', sortable: false },
        { value: 'layoutPolicy', text: 'Layout Policy', align: 'left', sortable: false },
      ],
      memberItems: initMemberItems,

      groupsAlert: Object.assign({}, initAlert),
      hostedsAlert: Object.assign({}, initAlert),
      proxiesAlert: Object.assign({}, initAlert),
      createArtifactoryAlert: Object.assign({}, initAlert),

      // Rules
      rules: {
        name: [
          (value) => !!(value) || 'Name is required',
          (value) => /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/.test(value) || 'Nname not valid'
        ],
        layoutPolicy: [
          (value) => !!(value) || 'Layout policy is required',
        ],
        versionPolicy: [
          (value) => !!(value) || 'Version policy is required',
        ],
        remoteUrl: [
          (value) => !!(value) || 'Remote URL is required',
          (value) => /^(http[s]?:\/\/){1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/.test(value) || !value || 'Remote URL must be valid',
        ],
        proxyUsername: [
          (value) => ((this.newArtifactoryProxy.requiredAuth) && !!(value)) || 'Username required',
        ],
        proxyPassword: [
          (value) => ((this.newArtifactoryProxy.requiredAuth) && !!(value)) || 'Password required',
        ],
        member: [
          (value) => !!value || 'Member must not be empty',
          (value) => /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/.test(value) || 'Member name not valid'
        ],
        artifactory: [
          (value) => (value != null && !!value.name) || 'Artifactory is required',
        ],
        image: [
          (value) => !!value || 'Image is required'
        ]
      },

      valid: true,
      account: this.$route.params.account,

      // Artifactories
      selectedArtifactory: {},
      addArtifactoryDisplay: false,
      artifactoryItems: [],
      versionPolicyItems: [
        { name: 'RELEASE'},
        { name: 'SNAPSHOT'},
        { name: 'MIXED'},
      ],
      layoutPolicyItems: [
        { name: 'STRICT'},
        { name: 'PERMISSIVE'},
      ],
      newArtifactory: Object.assign({}, JSON.parse(JSON.stringify(initArtifactory))),
      removeArtifactoryDisplay: false,
      removeArtifactoryAlertOpened: false,
      removeArtifactoryAlertMessage: '',
      artifactories: [],
      artifactoriesLoading: false,
      artifactoriesHeaders: [
        { value: 'configured', text: 'Configured', align: 'left', sortable: false },
        { value: 'artifactoryId', text: 'Vendor', align: 'left', sortable: false },
        { value: 'host', text: 'Host', align: 'left', sortable: false },
      ],

      rows: [10, 20, 50, { text: 'All', value: -1 }],
    };
  },
  computed: {
    artifactoryImageItems: function () {
      if (this.newArtifactory.artifactory) {
        return this.newArtifactory.artifactory.images;
      } else {
        return [];
      }
    }
  },
  beforeRouteUpdate (to, from, next) {
    this.account = to.params.account;
    next();
    this.artifactoriesFetch();
    this.artifactoryItemsFetch();
  },

  created() {
    this.fetch();
  },
  
  methods: {
    // Customize
    toggleCustomize() {
      if (this.newArtifactory.customConfig) {
        this.tab1BottonLabel = "Continue";
      } else {
        this.tab1BottonLabel = "Save";
      }
    },
    tab1ButtonAction() {
      if (this.newArtifactory.customConfig) {
        this.tabIndex = 2;
      } else {
        this.addArtifactory();
      }
    },

    recalculateMemberList() {
      this.memberItems = initMemberItems.concat(this.newArtifactory.configuration.hosteds);
      this.memberItems = this.memberItems.concat(this.newArtifactory.configuration.proxies);
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

    // Groups methods
    addMember(memberToAdd) {
      if (!this.$refs.groupMemberForm.validate()) {
        return;
      }
      // Duplicated members validation
      if (this.newArtifactoryGroup.members.indexOf(memberToAdd) >= 0) {
        this.groupsAlert.message = "This member already exists";
        this.groupsAlert.opened = true;
        return;
      }
      this.newArtifactoryGroup.members.push(memberToAdd);
      this.memberToAdd = "";
      this.$refs.groupMemberForm.reset();
    },
    addGroup(groupToAdd) {
      // Duplicated group validation
      var isDuplicated = this.containsObject(groupToAdd, "name", this.newArtifactory.configuration.groups);
      if (isDuplicated) {
        this.groupsAlert.message = "This organization already exists";
        this.groupsAlert.opened = true;
        return;
      }

      if (this.$refs.groupForm.validate()) {
        var group = Object.assign({}, JSON.parse(JSON.stringify(groupToAdd))); 
        this.newArtifactory.configuration.groups.push(group);

        this.memberToAdd = "";
        this.newArtifactoryGroup = Object.assign({}, JSON.parse(JSON.stringify(initArtifactoryGroup)));
        this.$refs.groupForm.reset();
      }
    },

    // Hosteds methods
    addHosted(hostedToAdd) {
      // Duplicated hosted validation
      var isDuplicated = this.containsObject(hostedToAdd, "name", this.newArtifactory.configuration.hosteds);
      if (isDuplicated) {
        this.hostedsAlert.message = "This hosted already exists";
        this.hostedsAlert.opened = true;
        return;
      }

      if (this.$refs.hostedForm.validate()) {
        var hosted = Object.assign({}, JSON.parse(JSON.stringify(hostedToAdd))); 
        this.newArtifactory.configuration.hosteds.push(hosted);

        this.recalculateMemberList();
        this.newArtifactoryHosted = Object.assign({}, JSON.parse(JSON.stringify(initArtifactoryHosted))); 
        this.$refs.hostedForm.reset();
      }
    },
    removeHosted(index) {
      this.newArtifactory.configuration.hosteds.splice(index,1);
      this.recalculateMemberList();
    },

    // Proxies methods
    addProxy(proxyToAdd) {
      // Duplicated hosted validation
      var isDuplicated = this.containsObject(proxyToAdd, "name", this.newArtifactory.configuration.proxies);
      if (isDuplicated) {
        this.proxiesAlert.message = "This proxy already exists";
        this.proxiesAlert.opened = true;
        return;
      }

      if (this.$refs.proxyForm.validate()) {
        var proxy = Object.assign({}, JSON.parse(JSON.stringify(proxyToAdd))); 
        this.newArtifactory.configuration.proxies.push(proxy);
        
        this.recalculateMemberList();
        this.newArtifactoryProxy = Object.assign({}, JSON.parse(JSON.stringify(initArtifactoryProxy))); 
        this.$refs.proxyForm.reset();
      }
    },
    removeProxy(index) {
      this.newArtifactory.configuration.proxies.splice(index,1);
      this.recalculateMemberList();
    },

    // Artifactory functions
    fetch() {
      this.account = this.$route.params.account;
      this.artifactoriesFetch();
      this.artifactoryItemsFetch();
    },
    artifactoriesFetch() {
      this.artifactoriesLoading = true;
      return ArtifactoriesService.all(this.account).then(result => {
        if (result.code) {
          this.artifactories = [];
          const emptyArtifactory = { artifactoryId: 'not created'};
          this.artifactories.push(emptyArtifactory);
        } else {
          this.artifactories = [];
          this.artifactories.push(result);
        }
        this.artifactoriesLoading = false;
      });
    },
    artifactoryItemsFetch() {
      return VendorsService.allArtifactories()
        .then(result => {
          if (result.code) {
          } else {
            this.artifactoryItems = result;
          }
      });
    },
    addArtifactory() {
      // Validations
      if (!this.$refs.configurationForm.validate()) {
        this.tabIndex = 1;
        return;
      }

      const requestBody = {
        artifactoryId: this.newArtifactory.artifactory.name,
        image: this.newArtifactory.image,
        customConfig: this.newArtifactory.customConfig,
        configuration: JSON.parse(JSON.stringify(this.newArtifactory.configuration)),
      };
      ArtifactoriesService.add(this.account, requestBody).then(result => {
        if (result.code) {
          this.createArtifactoryAlert.message = result.msg;
          this.createArtifactoryAlert.opened = true;
        } else {
          this.cleanCreateArtifactoryDialog();
          this.addArtifactoryDisplay = false;
          this.artifactoriesFetch();
        }
      });
    },
    closeCreateArtifactory() {
      this.cleanCreateArtifactoryDialog();
      this.addArtifactoryDisplay = false;
    },
    cleanCreateArtifactoryDialog() {
      // Clean alerts
      this.createArtifactoryAlert = Object.assign({}, initAlert);
      this.groupsAlert = Object.assign({}, initAlert);
      this.hostedsAlert = Object.assign({}, initAlert);
      this.proxiesAlert = Object.assign({}, initAlert);
      // Clean artifactory data
      this.newArtifactory = Object.assign({}, JSON.parse(JSON.stringify(initArtifactory)));
      // Clean subforms
      this.memberToAdd = "";
      this.newArtifactoryGroup = Object.assign({}, JSON.parse(JSON.stringify(initArtifactoryGroup)));
      this.newArtifactoryHosted = Object.assign({}, JSON.parse(JSON.stringify(initArtifactoryHosted)));
      this.newArtifactoryProxy = Object.assign({}, JSON.parse(JSON.stringify(initArtifactoryProxy)));
      // Clean subforms validations
      this.$refs.configurationForm.reset();
      this.$refs.hostedForm.reset();
      this.$refs.proxyForm.reset();
      this.$refs.groupForm.reset();
      this.$refs.groupMemberForm.reset();
      // Set dialog tab to initial
      this.tabIndex = 1
      this.toggleCustomize()
    },
    openRemoveArtifactoryDialog(artifactoryIndex) {
      this.selectedArtifactory = this.artifactories[artifactoryIndex];
      this.removeArtifactoryDisplay = true;
    },
    removeArtifactory() {
      ArtifactoriesService.remove(this.account, this.selectedArtifactory.artifactoryId).then(result => {
        if (result.code) {
          this.removeArtifactoryAlertMessage = result.msg;
          this.removeArtifactoryAlertOpened = true;
        } else {
          this.closeRemoveArtifactory();
          this.artifactoriesFetch();
        }
      });
    },
    closeRemoveArtifactory() {
      this.clearRemoveArtifactoryAlert();
      this.removeArtifactoryDisplay = false;
    },
    clearRemoveArtifactoryAlert() {
      this.removeArtifactoryAlertMessage = '';
      this.removeArtifactoryAlertOpened = false;
    },
  
  },
};
</script>

<style scoped>

</style>
