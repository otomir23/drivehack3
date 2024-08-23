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
export const getRoadColor = (load: number, maxLoad: number) => {
    const score = (load / maxLoad) * 10
    const normalized = Math.min(Math.max(Math.round(score), 1), 10) - 1
    return colors[normalized]
}

export const roadTimedCoefficents = [
    0.50,
    0.40,
    0.30,
    0.20,
    0.15,
    0.47,
    1.02,
    1.5,
    1.90,
    1.95,
    1.70,
    1.35,
    1.25,
    1.15,
    1.23,
    1.10,
    1.43,
    1.60,
    1.90,
    1.95,
    1.70,
    1.2,
    0.95,
    0.67,
];