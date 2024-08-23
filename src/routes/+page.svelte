<script lang="ts">
  import Map, { type RawRoad, type RawStation } from "$lib/components/Map.svelte";
  import logo from "$lib/assets/logo.svg";
  import menu from "$lib/assets/menu.svg";
  import { roadTimedCoefficents } from "$lib/roadLoad";
  import { metroTimedCoefficents } from "$lib/metroLoad";
  import { defaultPoly, defaultUuid } from "$lib/init";

  type Selection = { pos: [number, number], uuid: string }
  type Poly = { uuid: string, polygon: number[][][], livingSquare?: number, workingSquare?: number }

  let polys = $state<Poly[]>([
    { uuid: defaultUuid, polygon: [defaultPoly], livingSquare: 190_000, workingSquare: 214_000 }
  ])
  let selection = $state<Selection | null>(null);

  let time = $state(12);
  let roadCoefficent = $derived(roadTimedCoefficents[time] ?? 1);
  let metroCoefficent = $derived(metroTimedCoefficents[time] ?? 1);

  let roads = $state<RawRoad[]>([]);
  let timedRoutes = $derived(roads.map(r => ({ ...r, load: r.load * roadCoefficent })));

  let metroStations = $state<RawStation[]>([]);
  let timedStations = $derived(metroStations.map(s => ({ ...s, load: s.load * metroCoefficent })));

  $effect(() => {
    if (!polys.length)
      return;
    const projects = polys
      .filter(poly => poly.livingSquare !== undefined && poly.workingSquare !== undefined)
    if (!projects.length)
      return;
    fetch("https://mtpback.skfx.io/geo/calculate", {
      method: "POST",
      body: JSON.stringify({
        projects: projects.map(poly => ({
          points: poly.polygon.flat(1),
          livingSquare: poly.livingSquare,
          workingSquare: poly.workingSquare,
        }))
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then(r => r.json()).then(r => {
      metroStations = r.metroLoad?.mid.map((s: any) => ({
        name: s.title,
        load: s.loadPKH,
        point: s.point,
      })) ?? []
      roads = r.roadLoad?.mid.map((r: any) => ({
        name: r.name,
        load: r.currentFlow,
        maxLoad: r.maxFlow,
        points: r.line,
      })) ?? []
    })
  })
</script>

<main class="h-screen flex flex-col">
  <Map
    onclick={(e, p, u) => {
      const ref = polys.find(p => p.uuid === u)
      if (!ref)
        polys = [...polys, { uuid: u, polygon: p.geometry!.getCoordinates() }]
      else {
        ref.polygon = p.geometry!.getCoordinates()
        polys = polys
      }

      selection = {
        pos: [e.clientX, e.clientY],
        uuid: u,
      }
    }}
    ondismiss={() => (selection = null)}
    roads={timedRoutes}
    stations={timedStations}
  />
  {#if selection !== null}
    {@const { pos, uuid } = selection}
    {@const poly = polys.find(p => p.uuid === uuid)!}
    <form
      class="absolute bg-white p-4 flex flex-col gap-3 border rounded-lg border-neutral-300 shadow-xl"
      style="left: {pos[0]}px; top: {pos[1]}px;"
      onsubmit={(e) => {
        e.preventDefault();
        polys = polys;
        selection = null;
      }}
    >
      <label class="flex items-center text-neutral-700 gap-1.5">
        Жилая площадь:
        <div class="flex-1 w-2"></div>
        <input
          class="focus:ring-yellow-50 focus:border-yellow-300 sm:text-sm border-neutral-300 rounded-md outline-none border px-2 py-1 focus:ring-4"
          placeholder="100 000"
          min="0"
          required
          type="number"
          value={poly.livingSquare}
          onchange={(e) => poly.livingSquare = +e.currentTarget.value}
        />
        <span class="flex items-center">
          м<span class="text-xs mb-2">2</span>
        </span>
      </label>
      <label class="flex items-center text-neutral-700 gap-1.5">
        Коммерческая площадь:
        <div class="flex-1 w-2"></div>
        <input
          class="focus:ring-yellow-50 focus:border-yellow-300 sm:text-sm border-neutral-200 rounded-md outline-none border px-2 py-1 focus:ring-4"
          placeholder="100 000"
          min="0"
          required
          type="number"
          value={poly.workingSquare}
          onchange={(e) => poly.workingSquare = +e.currentTarget.value}
        />
        <span class="flex items-center">
          м<span class="text-xs mb-2">2</span>
        </span>
      </label>
      <button
        class="focus:ring-yellow-50 focus:border-yellow-500 sm:text-sm border-yellow-400 rounded-md outline-none border px-3 py-2 focus:ring-4 font-semibold bg-yellow-300"
      >
        Расчитать
      </button>
    </form>
  {/if}
  <div class="absolute bg-white bottom-0 inset-x-0 w-full p-4 flex flex-col">
    <input type="range" min={0} max={23} bind:value={time} class="mx-4 appearance-none bg-yellow-50 rounded-full accent-yellow-500 shadow-inner" />
    <div class="flex justify-between">
      {#each [...Array(24)] as _, i}
        <span class={i === time ? "font-semibold" : "text-neutral-500"}>
          {#if i < 10}0{/if}{i}<span class="max-lg:hidden">:00</span>
        </span>
      {/each}
    </div>
    <div class="hidden">
      {timedStations[0]?.load} {metroCoefficent}
      {timedRoutes[0]?.load} {roadCoefficent}
    </div>
  </div>
</main>
