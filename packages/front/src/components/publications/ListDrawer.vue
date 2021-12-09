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
        <div v-if="err || !publications" class="error-msg">
          <span
            class="mdi-set mdi-book-remove-outline"
            style="font-size: 3em; margin-bottom: 4px"
          >
          </span>
          <br />
          Brak znalezionych publikacji w wybranym obszarze. Wybierz inny obszar.
        </div>
        <el-scrollbar always v-else v-loading="loading">
          <div id="infinite-list">
            <PublicationCard
              v-for="publication in publications"
              :key="publication.id"
              :publication="publication"
            />
          </div>
        </el-scrollbar>
      </div>
    </el-drawer>
  </div>
</template>

<script lang="ts">
import Publication, { PublicationsPage } from "@/interfaces/Publication";
import PublicationCard from "./PublicationCard.vue";
import {
  defineComponent,
  PropType,
  watch,
  computed,
  ref,
  onMounted,
} from "vue";
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
    const allPublications = ref<Publication[]>([]);

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
        fetch();
      }
    );

    watch([() => props.year], () => {
      if (props.byYear) fetch();
    });

    watch([pageNumber], () => {
      fetch();
    });

    const loadMorePublications = () => {
      pageNumber.value++;
    };

    const publications = computed(() => {
      let newData = data?.value?.data;
      if (newData) newData = allPublications.value.concat(newData);
      return newData;
    });

    onMounted(() => {
      // Detect when scrolled to bottom.
      const listElm = document.querySelector("#infinite-list");
      listElm?.addEventListener("scroll", () => {
        console.log("saddnsakjdnjksa");

        if (listElm.scrollTop + listElm.clientHeight >= listElm.scrollHeight) {
          loadMorePublications();
        }
      });
    });

    return { publications, loading, err, scrollComponent };
  },
});
</script>

<style lang="scss" scoped>
h2,
h3 {
  margin-top: 0;
  margin-bottom: 0;
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
