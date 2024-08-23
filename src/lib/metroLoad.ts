const colors = [
    "#00ff00",
    "#66ff33",
    "#99cc44",
    "#cccc22",
    "#ffcc33",
    "#ff7722",
    "#ff4422",
    "#cc2211",
    "#991100",
    "#551100",
]
export const getStationColor = (load: number, maxLoad: number) => {
    const score = (load / maxLoad) * 10
    const normalized = Math.min(Math.max(Math.round(score), 1), 10) - 1
    return colors[normalized]
}

export const metroTimedCoefficents = [
    0.23,
    0.06,
    0,
    0,
    0,
    0,
    0.58,
    1.8,
    2.33,
    2.08,
    1.25,
    0.84,
    0.80,
    0.89,
    0.80,
    0.77,
    1.00,
    1.67,
    2.33,
    2.23,
    2.10,
    1.85,
    0.72,
    0.54,
];