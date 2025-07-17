import { RadialGauge } from 'canvas-gauges'

export let GAUGES = {}

// Gauge sizes
const smallOnes = 172
const bigOnes = 280

// Font sizes
const smallOnesFont = 1.15

export default function render(dom) {
	// Gas pedal position
	GAUGES.throttle = build(dom, "throttle", {
		title: "Throttle",
		unit: "%",
		size: smallOnes,
		min: 0,
		max: 100,
		step: 10,
		angle: 225,
		rotation: -20,
		numbers: 3,
		decimals: 0,
		fontSize: smallOnesFont,
	}, {
		minorTicks: 4,
		majorTicks: [0, 20, 40, 60, 80, 100]
	})

	// Engine load
	GAUGES.load = build(dom, "load", {
		title: "Load",
		unit: "%",
		size: smallOnes,
		min: 0,
		max: 100,
		step: 10,
		angle: 225,
		rotation: -20,
		numbers: 3,
		decimals: 0,
		fontSize: smallOnesFont,
	}, {
		minorTicks: 4,
		majorTicks: [0, 20, 40, 60, 80, 100]
	})

	// Tachometer
	GAUGES.tachometer = build(dom, "tacho", {
		title: "Engine",
		unit: "revs/min",
		size: bigOnes,
		max: 6000,
		step: 1000,
		numbers: 4,
		fontSize: 1.15,
	}, {
		majorTicks: [0, 1, 2, 3, 4, 5, 6],
		minorTicks: 5,
		highlights: [
			{
				from: 4800,
				to: 6000,
				color: "#F446"
			}
		]
	})

	// Speedometer
	GAUGES.speedometer = build(dom, "speedo", {
		title: "Speed",
		unit: "km/h",
		max: 160,
		step: 20,
		numbers: 3,
		fontSize: 1.15,
		size: bigOnes,
	})

	// Engine temperature
	GAUGES.coolant = build(dom, "coolant", {
		title: "Coolant",
		unit: "°C",
		size: smallOnes,
		min: 45,
		max: 120,
		angle: 225,
		numbers: 2,
		step: 15,
		rotation: -20,
		fontSize: smallOnesFont,
	}, {
		minorTicks: 5,
		exactTicks: true,
		highlights: [
			{
				from: 45,
				to: 60,
				color: "#48F6"
			},
			{
				from: 105,
				to: 110,
				color: "#FBB6"
			},
			{
				from: 110,
				to: 120,
				color: "#F446"
			}
		]
	})

	// Car battery level
	GAUGES.battery = build(dom, "battery", {
		title: "Battery",
		unit: "V",
		size: smallOnes,
		min: 9,
		max: 16,
		step: 1,
		angle: 225,
		numbers: 2,
		decimals: 1,
		rotation: -20,
		fontSize: smallOnesFont,
	}, {
		minorTicks: 2,
		highlights: [
			{
				from: 9,
				to: 10,
				color: "#F446"
			},
			{
				from: 10,
				to: 11,
				color: "#FB06"
			},
			{
				from: 14.8,
				to: 16,
				color: "#F446"
			},
		]
	})

	// Draw them all
	for (let x in GAUGES) {
		GAUGES[x].draw()
	}

	// Dumb setter, for testing
	// My refresh speed was about 2.7x reads per second
	// setInterval(function() {
	// 	GAUGES.speedometer.value = 65 + Math.random() * 2
	// 	GAUGES.tachometer.value = 1750 + Math.random() * 100
	// 	GAUGES.coolant.value = 84 + Math.random() * 2
	// 	GAUGES.battery.value = 12.5 + Math.random() * .25
	// 	GAUGES.throttle.value = 20 + Math.random() * 25
	// 	GAUGES.load.value = 40 + Math.random() * 3
	// }, 500)
}


function build(dom, id, custom = {}, props = {}) {
	let defs = {
		title: "test",
		unit: "NA/h",
		min: 0,
		max: 100,
		step: 10,
		size: 240,
		angle: 270,
		decimals: 0,
		numbers: 3,
		rotation: 0,
		fontSize: 1,
		...custom
	}

	let node = document.createElement("canvas")
	node.id = id

	let target = new RadialGauge({
		renderTo: node,
		maxValue: defs.max,
		value: defs.min,
		majorTicks: Array(Math.ceil((defs.max - defs.min + defs.step) / defs.step)).fill().map((_, i) => defs.min + i * defs.step),
		minorTicks: 4,
		title: defs.title,
		units: defs.unit,
		strokeTicks: false,
		valueBoxStroke: false,
		needleCircleInner: true,
		needleCircleOuter: true,
		width: defs.size,
		height: defs.size,
		minValue: defs.min,
		highlights: [],
		animationRule: "dequad",
		animationDuration: window.avgref,
		valueDec: defs.decimals,
		valueInt: defs.numbers,
		ticksAngle: defs.angle,
		startAngle: (360 - defs.angle) / 2 + defs.rotation,
		needleStart: 20,
		needleEnd: 92,
		needleWidth: 2,
		needleType: "arrow",
		barStrokeWidth: 0,
		colorBarStroke: "#111",
		colorMajorTicks: "#F77",
		colorMinorTicks: "#F778",
		colorPlate: "#111",
		borderInnerWidth: 4,
		colorBorderInner: "#8888",
		colorBorderInnerEnd: "#8886",
		borderOuterWidth: 2,
		colorBorderOuter: "#FFF8",
		colorBorderOuterEnd: "#FFF6",
		colorBorderMiddle: "#333",
		colorBorderMiddleEnd: "#222",
		animatedValue: true,
		borderMiddleWidth: 0,
		colorNumbers: "#FCCD",
		fontNumbersSize: 24 * defs.fontSize,
		fontNumbers: "sans-serif",
		fontNumbersWeight: 700,
		fontValue: "tiny5",
		fontValueSize: 32 * defs.fontSize,
		fontValueWeight: 900,
		valueBoxBorderRadius: 2,
		colorValueBoxBackground: "#F445",
		colorValueText: "#F44",
		...props
	})
	document.querySelector(dom).appendChild(node)

	setTimeout(() => {
		target.update()
	}, 0)

	setTimeout(() => {
		target.value = defs.max
	}, window.avgref * 0.5)

	setTimeout(() => {
		target.value = defs.min
	}, window.avgref * 1.75)

	return target
}
