<template>
  <div style="background:#fff">
    <v-toolbar card class="white" prominent>
      <v-icon light large>list</v-icon>
      <v-toolbar-title>Services</v-toolbar-title>
    </v-toolbar>

    <v-divider />

    <v-container fluid>
      <v-layout row wrap>

        <v-flex xs12 sm12>

          <artifactory-manager ref="artifactoryManager"></artifactory-manager>

          <v-divider />

          <source-control-manager ref="sourceControlManager"></source-control-manager>

          <v-divider />

          <continuous-integration-manager ref="continuousIntegrationManager"></continuous-integration-manager>

        </v-flex>
      </v-layout>
    </v-container>

    <router-view></router-view>
  </div>
</template>

<script>

const ArtifactoryManager = () => import(
    '../components/ArtifactoryManager.vue'
);
const SourceControlManager = () => import(
    '../components/SourceControlManager.vue'
);
const ContinuousIntegrationManager = () => import(
    '../components/ContinuousIntegrationManager.vue'
);

export default {
  name: 'Services',
  data() {
    return {

    };
  },
  beforeRouteUpdate (to, from, next) {
    next();
    this.$refs.artifactoryManager.fetch()
    this.$refs.sourceControlManager.fetch()
    this.$refs.continuousIntegrationManager.fetch()
  },

  components: {
    ArtifactoryManager,
    SourceControlManager,
    ContinuousIntegrationManager
  },
};
</script>

<style scoped>

</style>
