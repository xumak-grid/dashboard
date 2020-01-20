<template>
  <div style="background:#fff">
    <v-toolbar card class="white" prominent>
      <v-icon light large>list</v-icon>
      <v-toolbar-title>Toolbelt</v-toolbar-title>
    </v-toolbar>

    <v-divider />

    <v-container fluid>
      <v-layout row wrap>

        <v-flex xs12 sm12>

          <toolbelt-manager ref="toolbeltManager"></toolbelt-manager>

        </v-flex>
      </v-layout>
    </v-container>

    <router-view></router-view>
  </div>
</template>

<script>

const ToolbeltManager = () => import(
    '../components/ToolbeltManager.vue'
);

export default {
  name: 'Toolbelt',
  data() {
    return {

    };
  },
  beforeRouteUpdate (to, from, next) {
    next();
    this.$refs.toolbeltManager.fetch()
  },

  components: {
    ToolbeltManager,
  },
};
</script>

<style scoped>

</style>
