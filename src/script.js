import './css/reset.css'
import './css/fonts.css'
import './style.css'
import { Canvas } from '../src/js/canvas/index'
import { gsap } from 'gsap'
import Splitting from 'splitting'
export let canvas

// const url = document.querySelector(`.a__url`)
Splitting()
canvas = new Canvas()
canvas.addPlanes()
