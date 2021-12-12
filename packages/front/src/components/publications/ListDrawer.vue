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
        <div style="margin-left: 28px" v-if="data?.total > 0">
          Znaleziono pozycji: {{ data.total }}
        </div>
      </el-row>
      <hr style="margin: 12px 0" />
      <div style="height: calc(100% - 48px)" v-loading="loading">
        <div
          v-if="err || (publications.length === 0 && loading === false)"
          class="error-msg"
        >
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
          <div class="end-of-list" v-if="endOfList">Koniec wyników</div>
          <div class="end-of-list" v-else>Ładowanie...</div>
        </ul>
      </div>
    </el-drawer>
  </div>
</template>

<script lang="ts">
import Publication, { PublicationsPage } from "@/interfaces/Publication";
import PublicationCard from "./PublicationCard.vue";
import { defineComponent, PropType, watch, ref, watchEffect } from "vue";
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
    zoom: {
      type: Number,
      required: true,
    },
    mapArea: {
      type: Object as PropType<MapArea>,
      requried: false,
    },
  },
  setup(props) {
    const scrollComponent = ref<HTMLElement | null>(null);
    const pageNumber = ref<number>(1);
    let publications = ref<Publication[]>([]);
    const tempRefToMakeWatchWork = ref<Publication[]>([]);
    const endOfList = ref(false);

    const { fetch, data, loading, err } = useApi<PublicationsPage>(
      () => "area",
      () => ({
        params: {
          lat: (props.mapArea?.point as L.LatLng).lat,
          lon: (props.mapArea?.point as L.LatLng).lng,
          r: props.mapArea?.radius,
          t: props.year,
          z: props.zoom,
          limit: 5,
          page: pageNumber.value,
        },
      })
    );

    watch(
      () => props.mapArea,
      async () => {
        publications.value = [];
        pageNumber.value = 1;
        await fetch();
        endOfList.value = data.value?.pageCount === 1;
      }
    );

    watchEffect(() => {
      if (data.value?.data) tempRefToMakeWatchWork.value = data.value.data;
    });

    watch(tempRefToMakeWatchWork, () => {
      if (data.value?.data) {
        publications.value = publications.value.concat(data.value.data);
      }
    });

    const loadMorePublications = () => {
      if (pageNumber.value == 1) {
        pageNumber.value++;
      } else if (pageNumber.value === data.value?.pageCount) {
        fetch();
        endOfList.value = true;
        pageNumber.value++;
      } else if (
        data?.value?.pageCount &&
        pageNumber.value < data.value?.pageCount
      ) {
        fetch();
        pageNumber.value++;
      }
    };

    return {
      publications,
      loading,
      err,
      data,
      endOfList,
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
  height: calc(100% - 24px);
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
.end-of-list {
  text-align: center;
  margin: 20px 0;
  font-size: 20px;
  font-weight: bold;
}
</style>
