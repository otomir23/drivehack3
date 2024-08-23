<script lang="ts" context="module">
  export type RawRoad = {
    points: [number, number][];
    load: number;
  };
  export type RawStation = {
    name: string;
    point: [number, number];
    load: number;
  };
</script>

<script lang="ts">
  import { defaultPoly, defaultUuid } from "$lib/init";

  import { getStationColor } from "$lib/metroLoad";

  import { getRoadColor } from "$lib/roadLoad";
  import { onMount } from "svelte";
  import type { GeoObject, Map, Polygon } from "yandex-maps";

  let mapContainer: HTMLDivElement;
  let map: Map;
  let polygon: Polygon;
  let points: [number, number][] = [];

  let roads: GeoObject[] = [];
  let stations: GeoObject[] = [];

  const addPolygon = (
    uuid: string,
    pos: [number, number],
    shape?: [number, number][][]
  ) => {
    const geo = new ymaps.geometry.Polygon(
      shape ?? [
        [
          [pos[0] - 0.001, pos[1] - 0.001],
          [pos[0] - 0.001, pos[1] + 0.001],
          [pos[0] + 0.001, pos[1] + 0.001],
          [pos[0] + 0.001, pos[1] - 0.001],
        ],
      ]
    );
    const polygon = new ymaps.Polygon(geo);
    polygon.events.add("click", (e) => {
      e.stopPropagation();
      onclick(e.originalEvent.domEvent.originalEvent, polygon, uuid);
    });
    map.geoObjects.add(polygon);
    polygon.editor.startEditing();
  };

  let {
    lat = defaultPoly[0][0],
    lon = defaultPoly[0][1],
    zoom = 16,
    onclick = () => {},
    ondismiss = () => {},
    roads: rawRoads = [],
    stations: rawStations = [],
  }: {
    lat?: number;
    lon?: number;
    zoom?: number;
    roads?: RawRoad[];
    stations?: RawStation[];
    onclick?: (e: MouseEvent, polygon: Polygon, id: string) => void;
    ondismiss?: () => void;
  } = $props();

  onMount(async () => {
    const { Map, Polygon, ready } = ymaps;
    await new Promise((r) => ready(() => r(undefined)));

    const LOCATION: ymaps.IMapState = {
      center: [lat, lon],
      zoom,
      controls: [],
    };

    map = new Map(mapContainer, LOCATION, {
      yandexMapDisablePoiInteractivity: true,
    });

    map.events.add("click", (e) => {
      ondismiss();
      addPolygon(crypto.randomUUID(), e.get("coords"));
    });
    map.events.add("actionbegin", () => {
      ondismiss();
    });

    addPolygon(defaultUuid, defaultPoly[0], [defaultPoly]);
  });

  $effect(() => {
    if (!rawRoads || !map) return;

    roads.forEach((r) => map.geoObjects.remove(r));
    stations.forEach((r) => map.geoObjects.remove(r));
    roads = rawRoads.map(
      (r) =>
        new ymaps.GeoObject(
          {
            geometry: new ymaps.geometry.LineString(r.points),
            properties: {
              hintContent: `~${r.load} тс/час`,
            },
          },
          {
            strokeColor: getRoadColor(r.load, 2400),
            strokeOpacity: 0.5,
            strokeWidth: 10,
          }
        )
    );
    stations = rawStations.map(
      (r) =>
        new ymaps.GeoObject(
          {
            geometry: new ymaps.geometry.Point(r.point),
            properties: {
              hintContent: `${r.name}: ~${Math.round(r.load)}к пассажиров/час`,
            },
          },
          {
            iconColor: getStationColor(r.load, 150),
          }
        )
    );
    roads.forEach((r) => map.geoObjects.add(r));
    stations.forEach((r) => map.geoObjects.add(r));
  });
</script>

<div bind:this={mapContainer} class="h-full rounded-md overflow-hidden"></div>
