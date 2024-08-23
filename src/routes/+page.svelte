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
      roads = []
    })
  })
</script>

<main class="h-screen flex flex-col">
  <header
    class="px-2 py-1 bg-[#fbed9e] flex items-center h-8 gap-3 text-sm text-[#333333] border-black/40 border-b leading-tight"
  >
    <img src={logo} alt="Логотип 1С" />
    <img src={menu} alt="Иконка меню" />
    <p>Демонстрационное приложение (1С:Предприятие)</p>
  </header>
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
      class="absolute bg-white px-6 py-8 flex flex-col gap-3 border rounded border-black/30 border-b-black/40 shadow-md"
      style="left: {pos[0]}px; top: {pos[1]}px;"
      onsubmit={(e) => {
        e.preventDefault();
        polys = polys;
        selection = null;
      }}
    >
      <label class="flex items-center text-[#4b4b4b] gap-1.5">
        Жилая площадь:
        <div class="flex-1 w-2"></div>
        <input
          class="ring-1 ring-[#B0B0B0] rounded-sm focus:outline-[#FACC1F] outline-offset-4 focus:ring-0 focus:rounded-none shadow-inner leading-tight px-1 py-0.5"
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
      <label class="flex items-center text-[#4b4b4b] gap-1.5">
        Коммерческая площадь:
        <div class="flex-1 w-2"></div>
        <input
          class="ring-1 ring-[#B0B0B0] rounded-sm focus:outline-[#FACC1F] outline-offset-4 focus:ring-0 focus:rounded-none shadow-inner leading-tight px-1 py-0.5"
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
        class="rounded-sm border border-black/30 border-b-black/40 shadow leading-snug p-1 outline-none group"
        style="background-repeat: repeat-x; background-position: left bottom, 0 0; background-image: url(https://platform.demo.1c.ru/demo83/ru_RU/e1csys/mngsrv/_pressBottom.png?sysver=8.3.25.1286), url(https://platform.demo.1c.ru/demo83/ru_RU/e1csys/mngsrv/_pressTop.png?sysver=8.3.25.1286);"
      >
        <span
          class="group-focus:border border-black/30 w-full text-center block rounded-sm"
        >
          Расчитать
        </span>
      </button>
    </form>
  {/if}
  <div class="absolute bg-white bottom-0 inset-x-0 w-full p-4 flex flex-col">
    <input type="range" min={0} max={23} bind:value={time} class="mx-4 appearance-none bg-gray-200 rounded-full accent-yellow-500 shadow-inner" />
    <div class="flex justify-between">
      {#each [...Array(24)] as _, i}
        <span class={i === time ? "font-semibold" : "text-gray-600"}>
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
