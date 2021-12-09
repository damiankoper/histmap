<template>
  <div>
    <el-drawer
      :model-value="visible"
      @close="$emit('update:visible', false)"
      direction="ltr"
      :size="460"
    >
      <template v-slot:title>
        <SmallTitle />
      </template>
      <el-row justify="space-between" align="center">
        <h2>
          <span class="mdi-set mdi-book-marker-outline"></span>
          Wyszukiwanie obszarowe
        </h2>
      </el-row>
      <hr style="margin: 12px 0" />
      <div style="height: calc(100% - 48px)" v-loading="loading">
        <!-- publications.length === 0 -->
        <div v-if="err || !publications" class="error-msg">
          <span
            class="mdi-set mdi-book-remove-outline"
            style="font-size: 3em; margin-bottom: 4px"
          >
          </span>
          <br />
          Brak znalezionych publikacji w wybranym obszarze. Wybierz inny obszar.
        </div>
        <ul
          v-else
          v-infinite-scroll="loadMorePublications"
          class="infinite-list"
          style="overflow: auto"
        >
          <li v-for="publication in publications" :key="publication.id">
            <PublicationCard :publication="publication" />
          </li>
        </ul>
      </div>
    </el-drawer>
  </div>
</template>

<script lang="ts">
import Publication, { PublicationsPage } from "@/interfaces/Publication";
import PublicationCard from "./PublicationCard.vue";
import { defineComponent, PropType, watch, ref } from "vue";
import SmallTitle from "../layout/SmallTitle.vue";
import useApi from "@/composables/useApi";
import { MapArea } from "@/composables/useMap";
import * as L from "leaflet";
export default defineComponent({
  components: { SmallTitle, PublicationCard },
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    mapArea: {
      type: Object as PropType<MapArea>,
      requried: false,
    },
    byYear: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    const scrollComponent = ref<HTMLElement | null>(null);
    const pageNumber = ref<number>(1);
    let publications = ref<Publication[]>([]);

    const { fetch, data, loading, err } = useApi<PublicationsPage>(
      () => "area",
      () => ({
        params: {
          lat: (props.mapArea?.point as L.LatLng).lat,
          lon: (props.mapArea?.point as L.LatLng).lng,
          r: props.mapArea?.radius,
          t: props.byYear ? props.year : 0,
          limit: 5,
          page: pageNumber.value,
        },
      })
    );

    watch(
      () => props.mapArea,
      () => {
        publications.value = [];
        pageNumber.value = 1;
        fetch();
        appendPublications();
        console.log(data.value?.data);
        console.log(publications.value);
      }
    );

    watch([() => props.year], () => {
      if (props.byYear) fetch();
    });

    const loadMorePublications = () => {
      fetch();
      appendPublications();
      pageNumber.value++;
    };

    const appendPublications = () => {
      let newData = data.value?.data;
      if (newData) publications.value = publications.value.concat(newData);
    };

    return {
      publications,
      loading,
      err,
      scrollComponent,
      loadMorePublications,
    };
  },
});
</script>

<style lang="scss" scoped>
h2,
h3 {
  margin-top: 0;
  margin-bottom: 0;
}
.infinite-list {
  height: 100%;
  padding: 0;
  margin: 0;
  list-style: none;
}
.error-msg {
  text-align: center;
}
:deep(.el-drawer) {
  .el-drawer__body {
    overflow: hidden;
    padding-top: 0;
  }
}
</style>
