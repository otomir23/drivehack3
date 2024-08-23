const colors = [
    "islands#greenDotIcon",
    "islands#darkGreenDotIcon",
    "islands#oliveDotIcon",
    "islands#yellowDotIcon",
    "islands#orangeDotIcon",
    "islands#darkOrangeDotIcon",
    "islands#redDotIcon",
    "islands#redDotIcon",
    "islands#brownDotIcon",
    "islands#blackDotIcon",
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