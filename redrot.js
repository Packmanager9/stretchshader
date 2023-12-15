
// window.addEventListener('DOMContentLoaded', (event) => {
const squaretable = {} // this section of code is an optimization for use of the hypotenuse function on Line and LineOP objects
for (let t = 0; t < 10000000; t++) {
    squaretable[`${t}`] = Math.sqrt(t)
    if (t > 999) {
        t += 9
    }
}
let video_recorder
let recording = 0
function CanvasCaptureToWEBM(canvas, bitrate) {
    // the video_recorder is set to  '= new CanvasCaptureToWEBM(canvas, 4500000);' in the setup, 
    // it uses the same canvas as the rest of the file.
    // to start a recording call .record() on video_recorder
    /*
    for example, 
    if(keysPressed['-'] && recording == 0){
        recording = 1
        video_recorder.record()
    }
    if(keysPressed['='] && recording == 1){
        recording = 0
        video_recorder.stop()
        video_recorder.download('File Name As A String.webm')
    }
    */
    this.record = Record
    this.stop = Stop
    this.download = saveToDownloads
    let blobCaptures = []
    let outputFormat = {}
    let recorder = {}
    let canvasInput = canvas.captureStream()
    if (typeof canvasInput == undefined || !canvasInput) {
        return
    }
    const video = document.createElement('video')
    video.style.display = 'none'

    function Record() {
        let formats = [
            'video/vp8',
            "video/webm",
            'video/webm,codecs=vp9',
            "video/webm\;codecs=vp8",
            "video/webm\;codecs=daala",
            "video/webm\;codecs=h264",
            "video/mpeg"
        ];

        for (let t = 0; t < formats.length; t++) {
            if (MediaRecorder.isTypeSupported(formats[t])) {
                outputFormat = formats[t]
                break
            }
        }
        if (typeof outputFormat != "string") {
            return
        } else {
            let videoSettings = {
                mimeType: outputFormat,
                videoBitsPerSecond: bitrate || 2000000 // 2Mbps
            };
            blobCaptures = []
            try {
                recorder = new MediaRecorder(canvasInput, videoSettings)
            } catch (error) {
                return;
            }
            recorder.onstop = handleStop
            recorder.ondataavailable = handleAvailableData
            recorder.start(100)
        }
    }
    function handleAvailableData(event) {
        if (event.data && event.data.size > 0) {
            blobCaptures.push(event.data)
        }
    }
    function handleStop() {
        const superBuffer = new Blob(blobCaptures, { type: outputFormat })
        video.src = window.URL.createObjectURL(superBuffer)
    }
    function Stop() {
        recorder.stop()
        video.controls = true
    }
    function saveToDownloads(input) { // specifying a file name for the output
        const name = input || 'video_out.webm'
        const blob = new Blob(blobCaptures, { type: outputFormat })
        const url = window.URL.createObjectURL(blob)
        const storageElement = document.createElement('a')
        storageElement.style.display = 'none'
        storageElement.href = url
        storageElement.download = name
        document.body.appendChild(storageElement)
        storageElement.click()
        setTimeout(() => {
            document.body.removeChild(storageElement)
            window.URL.revokeObjectURL(url)
        }, 100)
    }
}
const gamepadAPI = {
    controller: {},
    turbo: true,
    connect: function (evt) {
        if (navigator.getGamepads()[0] != null) {
            gamepadAPI.controller = navigator.getGamepads()[0]
            gamepadAPI.turbo = true;
        } else if (navigator.getGamepads()[1] != null) {
            gamepadAPI.controller = navigator.getGamepads()[0]
            gamepadAPI.turbo = true;
        } else if (navigator.getGamepads()[2] != null) {
            gamepadAPI.controller = navigator.getGamepads()[0]
            gamepadAPI.turbo = true;
        } else if (navigator.getGamepads()[3] != null) {
            gamepadAPI.controller = navigator.getGamepads()[0]
            gamepadAPI.turbo = true;
        }
        for (let i = 0; i < gamepads.length; i++) {
            if (gamepads[i] === null) {
                continue;
            }
            if (!gamepads[i].connected) {
                continue;
            }
        }
    },
    disconnect: function (evt) {
        gamepadAPI.turbo = false;
        delete gamepadAPI.controller;
    },
    update: function () {
        gamepadAPI.controller = navigator.getGamepads()[0]
        gamepadAPI.buttonsCache = [];// clear the buttons cache
        for (var k = 0; k < gamepadAPI.buttonsStatus.length; k++) {// move the buttons status from the previous frame to the cache
            gamepadAPI.buttonsCache[k] = gamepadAPI.buttonsStatus[k];
        }
        gamepadAPI.buttonsStatus = [];// clear the buttons status
        var c = gamepadAPI.controller || {}; // get the gamepad object
        var pressed = [];
        if (c.buttons) {
            for (var b = 0, t = c.buttons.length; b < t; b++) {// loop through buttons and push the pressed ones to the array
                if (c.buttons[b].pressed) {
                    pressed.push(gamepadAPI.buttons[b]);
                }
            }
        }
        var axes = [];
        if (c.axes) {
            for (var a = 0, x = c.axes.length; a < x; a++) {// loop through axes and push their values to the array
                axes.push(c.axes[a].toFixed(2));
            }
        }
        gamepadAPI.axesStatus = axes;// assign received values
        gamepadAPI.buttonsStatus = pressed;
        // console.log(pressed); // return buttons for debugging purposes
        return pressed;
    },
    buttonPressed: function (button, hold) {
        var newPress = false;
        for (var i = 0, s = gamepadAPI.buttonsStatus.length; i < s; i++) {// loop through pressed buttons
            if (gamepadAPI.buttonsStatus[i] == button) {// if we found the button we're looking for...
                newPress = true;// set the boolean variable to true
                if (!hold) {// if we want to check the single press
                    for (var j = 0, p = gamepadAPI.buttonsCache.length; j < p; j++) {// loop through the cached states from the previous frame
                        if (gamepadAPI.buttonsCache[j] == button) { // if the button was already pressed, ignore new press
                            newPress = false;
                        }
                    }
                }
            }
        }
        return newPress;
    },
    buttons: [
        'A', 'B', 'X', 'Y', 'LB', 'RB', 'Left-Trigger', 'Right-Trigger', 'Back', 'Start', 'Axis-Left', 'Axis-Right', 'DPad-Up', 'DPad-Down', 'DPad-Left', 'DPad-Right', "Power"
    ],
    buttonsCache: [],
    buttonsStatus: [],
    axesStatus: []
};
let canvas
let canvas_context
let keysPressed = {}
let FLEX_engine
let TIP_engine = {}
let XS_engine
let YS_engine
class Point {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.radius = 0
    }
    pointDistance(point) {
        return (new LineOP(this, point, "transparent", 0)).hypotenuse()
    }
}

class Vector { // vector math and physics if you prefer this over vector components on circles
    constructor(object = (new Point(0, 0)), xmom = 0, ymom = 0) {
        this.xmom = xmom
        this.ymom = ymom
        this.object = object
    }
    isToward(point) {
        let link = new LineOP(this.object, point)
        let dis1 = link.squareDistance()
        let dummy = new Point(this.object.x + this.xmom, this.object.y + this.ymom)
        let link2 = new LineOP(dummy, point)
        let dis2 = link2.squareDistance()
        if (dis2 < dis1) {
            return true
        } else {
            return false
        }
    }
    rotate(angleGoal) {
        let link = new Line(this.xmom, this.ymom, 0, 0)
        let length = link.hypotenuse()
        let x = (length * Math.cos(angleGoal))
        let y = (length * Math.sin(angleGoal))
        this.xmom = x
        this.ymom = y
    }
    magnitude() {
        return (new Line(this.xmom, this.ymom, 0, 0)).hypotenuse()
    }
    normalize(size = 1) {
        let magnitude = this.magnitude()
        this.xmom /= magnitude
        this.ymom /= magnitude
        this.xmom *= size
        this.ymom *= size
    }
    multiply(vect) {
        let point = new Point(0, 0)
        let end = new Point(this.xmom + vect.xmom, this.ymom + vect.ymom)
        return point.pointDistance(end)
    }
    add(vect) {
        return new Vector(this.object, this.xmom + vect.xmom, this.ymom + vect.ymom)
    }
    subtract(vect) {
        return new Vector(this.object, this.xmom - vect.xmom, this.ymom - vect.ymom)
    }
    divide(vect) {
        return new Vector(this.object, this.xmom / vect.xmom, this.ymom / vect.ymom) //be careful with this, I don't think this is right
    }
    draw() {
        let dummy = new Point(this.object.x + this.xmom, this.object.y + this.ymom)
        let link = new LineOP(this.object, dummy, "#FFFFFF", 1)
        link.draw()
    }
}
class Line {
    constructor(x, y, x2, y2, color, width) {
        this.x1 = x
        this.y1 = y
        this.x2 = x2
        this.y2 = y2
        this.color = color
        this.width = width
    }
    angle() {
        return Math.atan2(this.y1 - this.y2, this.x1 - this.x2)
    }
    squareDistance() {
        let xdif = this.x1 - this.x2
        let ydif = this.y1 - this.y2
        let squareDistance = (xdif * xdif) + (ydif * ydif)
        return squareDistance
    }
    hypotenuse() {
        let xdif = this.x1 - this.x2
        let ydif = this.y1 - this.y2
        let hypotenuse = (xdif * xdif) + (ydif * ydif)
        if (hypotenuse < 10000000 - 1) {
            if (hypotenuse > 1000) {
                return squaretable[`${Math.round(10 * Math.round((hypotenuse * .1)))}`]
            } else {
                return squaretable[`${Math.round(hypotenuse)}`]
            }
        } else {
            return Math.sqrt(hypotenuse)
        }
    }
    draw() {
        let linewidthstorage = canvas_context.lineWidth
        canvas_context.strokeStyle = this.color
        canvas_context.lineWidth = this.width
        canvas_context.beginPath()
        canvas_context.moveTo(this.x1, this.y1)
        canvas_context.lineTo(this.x2, this.y2)
        canvas_context.stroke()
        canvas_context.lineWidth = linewidthstorage
    }
}
class LineOP {
    constructor(object, target, color, width) {
        this.object = object
        this.target = target
        this.color = color
        this.width = width
    }
    intersects(line) {
        console.log(line)
        var det, gm, lm;
        det = (this.target.x - this.object.x) * (line.target.y - line.object.y) - (line.target.x - line.object.x) * (this.target.y - this.object.y);
        if (det === 0) {
            return false;
        } else {
            lm = ((line.target.y - line.object.y) * (line.target.x - this.object.x) + (line.object.x - line.target.x) * (line.target.y - this.object.y)) / det;
            gm = ((this.object.y - this.target.y) * (line.target.x - this.object.x) + (this.target.x - this.object.x) * (line.target.y - this.object.y)) / det;
            return (0 < lm && lm < 1) && (0 < gm && gm < 1);
        }
    }
    squareDistance() {
        let xdif = this.object.x - this.target.x
        let ydif = this.object.y - this.target.y
        let squareDistance = (xdif * xdif) + (ydif * ydif)
        return squareDistance
    }
    hypotenuse() {
        let xdif = this.object.x - this.target.x
        let ydif = this.object.y - this.target.y
        let hypotenuse = (xdif * xdif) + (ydif * ydif)
        if (hypotenuse < 10000000 - 1) {
            if (hypotenuse > 1000) {
                return squaretable[`${Math.round(10 * Math.round((hypotenuse * .1)))}`]
            } else {
                return squaretable[`${Math.round(hypotenuse)}`]
            }
        } else {
            return Math.sqrt(hypotenuse)
        }
    }
    angle() {
        return Math.atan2(this.object.y - this.target.y, this.object.x - this.target.x)
    }
    draw() {
        let linewidthstorage = canvas_context.lineWidth
        canvas_context.strokeStyle = this.color
        canvas_context.lineWidth = this.width
        canvas_context.beginPath()
        canvas_context.moveTo(this.object.x, this.object.y)
        canvas_context.lineTo(this.target.x, this.target.y)
        canvas_context.stroke()
        canvas_context.lineWidth = linewidthstorage
    }
}
class Rectangle {
    constructor(x, y, width, height, color, fill = 1, stroke = 0, strokeWidth = 1) {
        this.x = x
        this.y = y
        this.height = height
        this.width = width
        this.color = color
        this.xmom = 0
        this.ymom = 0
        this.stroke = stroke
        this.strokeWidth = strokeWidth
        this.fill = fill
    }
    draw() {
        canvas_context.fillStyle = this.color
        canvas_context.fillRect(this.x, this.y, this.width, this.height)
    }
    move() {
        this.x += this.xmom
        this.y += this.ymom
    }
    isPointInside(point) {
        if (point.x >= this.x) {
            if (point.y >= this.y) {
                if (point.x <= this.x + this.width) {
                    if (point.y <= this.y + this.height) {
                        return true
                    }
                }
            }
        }
        return false
    }
    doesPerimeterTouch(point) {
        if (point.x + point.radius >= this.x) {
            if (point.y + point.radius >= this.y) {
                if (point.x - point.radius <= this.x + this.width) {
                    if (point.y - point.radius <= this.y + this.height) {
                        return true
                    }
                }
            }
        }
        return false
    }
}
class Circle {
    constructor(x, y, radius, color, xmom = 0, ymom = 0, friction = 1, reflect = 0, strokeWidth = 0, strokeColor = "transparent") {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.xmom = xmom
        this.ymom = ymom
        this.friction = friction
        this.reflect = reflect
        this.strokeWidth = strokeWidth
        this.strokeColor = strokeColor
    }
    draw() {
        if (this.x < -this.radius) {
            this.x += canvas.width + this.radius
        }
        if (this.y < -this.radius) {
            this.y += canvas.width + this.radius
        }
        this.x %= canvas.width + this.radius + 1
        this.y %= canvas.height + this.radius + 1
        canvas_context.lineWidth = this.strokeWidth
        canvas_context.strokeStyle = this.color
        canvas_context.beginPath();
        if (this.radius > 0) {
            canvas_context.arc(this.x, this.y, this.radius, 0, (Math.PI * 2), true)
            canvas_context.fillStyle = this.color
            canvas_context.fill()
            canvas_context.stroke();
        } else {
            // console.log("The circle is below a radius of 0, and has not been drawn. The circle is:", this)
        }
    }
    move() {
        if (this.reflect == 1) {
            if (this.x + this.radius > canvas.width) {
                if (this.xmom > 0) {
                    this.xmom *= -1
                }
            }
            if (this.y + this.radius > canvas.height) {
                if (this.ymom > 0) {
                    this.ymom *= -1
                }
            }
            if (this.x - this.radius < 0) {
                if (this.xmom < 0) {
                    this.xmom *= -1
                }
            }
            if (this.y - this.radius < 0) {
                if (this.ymom < 0) {
                    this.ymom *= -1
                }
            }
        }
        this.x += this.xmom
        this.y += this.ymom
    }
    unmove() {
        if (this.reflect == 1) {
            if (this.x + this.radius > canvas.width) {
                if (this.xmom > 0) {
                    this.xmom *= -1
                }
            }
            if (this.y + this.radius > canvas.height) {
                if (this.ymom > 0) {
                    this.ymom *= -1
                }
            }
            if (this.x - this.radius < 0) {
                if (this.xmom < 0) {
                    this.xmom *= -1
                }
            }
            if (this.y - this.radius < 0) {
                if (this.ymom < 0) {
                    this.ymom *= -1
                }
            }
        }
        this.x -= this.xmom
        this.y -= this.ymom
    }
    frictiveMove() {
        if (this.reflect == 1) {
            if (this.x + this.radius > canvas.width) {
                if (this.xmom > 0) {
                    this.xmom *= -1
                }
            }
            if (this.y + this.radius > canvas.height) {
                if (this.ymom > 0) {
                    this.ymom *= -1
                }
            }
            if (this.x - this.radius < 0) {
                if (this.xmom < 0) {
                    this.xmom *= -1
                }
            }
            if (this.y - this.radius < 0) {
                if (this.ymom < 0) {
                    this.ymom *= -1
                }
            }
        }
        this.x += this.xmom
        this.y += this.ymom
        this.xmom *= this.friction
        this.ymom *= this.friction
    }
    frictiveunMove() {
        if (this.reflect == 1) {
            if (this.x + this.radius > canvas.width) {
                if (this.xmom > 0) {
                    this.xmom *= -1
                }
            }
            if (this.y + this.radius > canvas.height) {
                if (this.ymom > 0) {
                    this.ymom *= -1
                }
            }
            if (this.x - this.radius < 0) {
                if (this.xmom < 0) {
                    this.xmom *= -1
                }
            }
            if (this.y - this.radius < 0) {
                if (this.ymom < 0) {
                    this.ymom *= -1
                }
            }
        }
        this.xmom /= this.friction
        this.ymom /= this.friction
        this.x -= this.xmom
        this.y -= this.ymom
    }
    isPointInside(point) {
        this.areaY = point.y - this.y
        this.areaX = point.x - this.x
        if (((this.areaX * this.areaX) + (this.areaY * this.areaY)) <= (this.radius * this.radius)) {
            return true
        }
        return false
    }
    doesPerimeterTouch(point) {
        this.areaY = point.y - this.y
        this.areaX = point.x - this.x
        if (((this.areaX * this.areaX) + (this.areaY * this.areaY)) <= ((this.radius + point.radius) * (this.radius + point.radius))) {
            return true
        }
        return false
    }
}
class CircleR {
    constructor(x, y, radius, color, xmom = 0, ymom = 0, friction = 1, reflect = 0, strokeWidth = 0, strokeColor = "transparent") {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.xmom = xmom
        this.ymom = ymom
        this.friction = friction
        this.reflect = reflect
        this.strokeWidth = strokeWidth
        this.strokeColor = strokeColor
    }
    draw() {
        if (this.x < -this.radius) {
            this.x += canvas.width + this.radius
        }
        if (this.y < -this.radius) {
            this.y += canvas.width + this.radius
        }
        this.x %= canvas.width + this.radius + 1
        this.y %= canvas.height + this.radius + 1
        canvas_context.lineWidth = this.strokeWidth
        canvas_context.strokeStyle = this.color
        canvas_context.beginPath();
        if (this.radius > 0) {
            canvas_context.arc(this.x, this.y, this.radius, 0, (Math.PI * 2), true)
            canvas_context.fillStyle = this.color
            // canvas_context.fill()
            canvas_context.stroke();
        } else {
            // console.log("The circle is below a radius of 0, and has not been drawn. The circle is:", this)
        }
    }
    move() {
        if (this.reflect == 1) {
            if (this.x + this.radius > canvas.width) {
                if (this.xmom > 0) {
                    this.xmom *= -1
                }
            }
            if (this.y + this.radius > canvas.height) {
                if (this.ymom > 0) {
                    this.ymom *= -1
                }
            }
            if (this.x - this.radius < 0) {
                if (this.xmom < 0) {
                    this.xmom *= -1
                }
            }
            if (this.y - this.radius < 0) {
                if (this.ymom < 0) {
                    this.ymom *= -1
                }
            }
        }
        this.x += this.xmom
        this.y += this.ymom
    }
    unmove() {
        if (this.reflect == 1) {
            if (this.x + this.radius > canvas.width) {
                if (this.xmom > 0) {
                    this.xmom *= -1
                }
            }
            if (this.y + this.radius > canvas.height) {
                if (this.ymom > 0) {
                    this.ymom *= -1
                }
            }
            if (this.x - this.radius < 0) {
                if (this.xmom < 0) {
                    this.xmom *= -1
                }
            }
            if (this.y - this.radius < 0) {
                if (this.ymom < 0) {
                    this.ymom *= -1
                }
            }
        }
        this.x -= this.xmom
        this.y -= this.ymom
    }
    frictiveMove() {
        if (this.reflect == 1) {
            if (this.x + this.radius > canvas.width) {
                if (this.xmom > 0) {
                    this.xmom *= -1
                }
            }
            if (this.y + this.radius > canvas.height) {
                if (this.ymom > 0) {
                    this.ymom *= -1
                }
            }
            if (this.x - this.radius < 0) {
                if (this.xmom < 0) {
                    this.xmom *= -1
                }
            }
            if (this.y - this.radius < 0) {
                if (this.ymom < 0) {
                    this.ymom *= -1
                }
            }
        }
        this.x += this.xmom
        this.y += this.ymom
        this.xmom *= this.friction
        this.ymom *= this.friction
    }
    frictiveunMove() {
        if (this.reflect == 1) {
            if (this.x + this.radius > canvas.width) {
                if (this.xmom > 0) {
                    this.xmom *= -1
                }
            }
            if (this.y + this.radius > canvas.height) {
                if (this.ymom > 0) {
                    this.ymom *= -1
                }
            }
            if (this.x - this.radius < 0) {
                if (this.xmom < 0) {
                    this.xmom *= -1
                }
            }
            if (this.y - this.radius < 0) {
                if (this.ymom < 0) {
                    this.ymom *= -1
                }
            }
        }
        this.xmom /= this.friction
        this.ymom /= this.friction
        this.x -= this.xmom
        this.y -= this.ymom
    }
    isPointInside(point) {
        this.areaY = point.y - this.y
        this.areaX = point.x - this.x
        if (((this.areaX * this.areaX) + (this.areaY * this.areaY)) <= (this.radius * this.radius)) {
            return true
        }
        return false
    }
    doesPerimeterTouch(point) {
        this.areaY = point.y - this.y
        this.areaX = point.x - this.x
        if (((this.areaX * this.areaX) + (this.areaY * this.areaY)) <= ((this.radius + point.radius) * (this.radius + point.radius))) {
            return true
        }
        return false
    }
}
class Polygon {
    constructor(x, y, size, color, sides = 3, xmom = 0, ymom = 0, angle = 0, reflect = 0) {
        if (sides < 2) {
            sides = 2
        }
        this.reflect = reflect
        this.xmom = xmom
        this.ymom = ymom
        this.body = new Circle(x, y, size - (size * .293), "transparent")
        this.nodes = []
        this.angle = angle
        this.size = size
        this.color = color
        this.angleIncrement = (Math.PI * 2) / sides
        this.sides = sides
        for (let t = 0; t < sides; t++) {
            let node = new Circle(this.body.x + (this.size * (Math.cos(this.angle))), this.body.y + (this.size * (Math.sin(this.angle))), 0, "transparent")
            this.nodes.push(node)
            this.angle += this.angleIncrement
        }
    }
    isPointInside(point) { // rough approximation
        this.body.radius = this.size - (this.size * .293)
        if (this.sides <= 2) {
            return false
        }
        this.areaY = point.y - this.body.y
        this.areaX = point.x - this.body.x
        if (((this.areaX * this.areaX) + (this.areaY * this.areaY)) <= (this.body.radius * this.body.radius)) {
            return true
        }
        return false
    }
    move() {
        if (this.reflect == 1) {
            if (this.body.x > canvas.width) {
                if (this.xmom > 0) {
                    this.xmom *= -1
                }
            }
            if (this.body.y > canvas.height) {
                if (this.ymom > 0) {
                    this.ymom *= -1
                }
            }
            if (this.body.x < 0) {
                if (this.xmom < 0) {
                    this.xmom *= -1
                }
            }
            if (this.body.y < 0) {
                if (this.ymom < 0) {
                    this.ymom *= -1
                }
            }
        }
        this.body.x += this.xmom
        this.body.y += this.ymom
    }
    draw() {
        this.nodes = []
        this.angleIncrement = (Math.PI * 2) / this.sides
        this.body.radius = this.size - (this.size * .293)
        for (let t = 0; t < this.sides; t++) {
            let node = new Circle(this.body.x + (this.size * (Math.cos(this.angle))), this.body.y + (this.size * (Math.sin(this.angle))), 0, "transparent")
            this.nodes.push(node)
            this.angle += this.angleIncrement
        }
        canvas_context.strokeStyle = this.color
        canvas_context.fillStyle = this.color
        canvas_context.lineWidth = 0
        canvas_context.beginPath()
        canvas_context.moveTo(this.nodes[0].x, this.nodes[0].y)
        for (let t = 1; t < this.nodes.length; t++) {
            canvas_context.lineTo(this.nodes[t].x, this.nodes[t].y)
        }
        canvas_context.lineTo(this.nodes[0].x, this.nodes[0].y)
        canvas_context.fill()
        canvas_context.stroke()
        canvas_context.closePath()
    }
}
class Shape {
    constructor(shapes) {
        this.shapes = shapes
    }
    draw() {
        for (let t = 0; t < this.shapes.length; t++) {
            this.shapes[t].draw()
        }
    }
    move() {
        if (typeof this.xmom != "number") {
            this.xmom = 0
        }
        if (typeof this.ymom != "number") {
            this.ymom = 0
        }
        for (let t = 0; t < this.shapes.length; t++) {
            this.shapes[t].x += this.xmom
            this.shapes[t].y += this.ymom
            this.shapes[t].draw()
        }
    }
    isPointInside(point) {
        for (let t = 0; t < this.shapes.length; t++) {
            if (this.shapes[t].isPointInside(point)) {
                return true
            }
        }
        return false
    }
    doesPerimeterTouch(point) {
        for (let t = 0; t < this.shapes.length; t++) {
            if (this.shapes[t].doesPerimeterTouch(point)) {
                return true
            }
        }
        return false
    }
    innerShape(point) {
        for (let t = 0; t < this.shapes.length; t++) {
            if (this.shapes[t].doesPerimeterTouch(point)) {
                return this.shapes[t]
            }
        }
        return false
    }
    isInsideOf(box) {
        for (let t = 0; t < this.shapes.length; t++) {
            if (box.isPointInside(this.shapes[t])) {
                return true
            }
        }
        return false
    }
    adjustByFromDisplacement(x, y) {
        for (let t = 0; t < this.shapes.length; t++) {
            if (typeof this.shapes[t].fromRatio == "number") {
                this.shapes[t].x += x * this.shapes[t].fromRatio
                this.shapes[t].y += y * this.shapes[t].fromRatio
            }
        }
    }
    adjustByToDisplacement(x, y) {
        for (let t = 0; t < this.shapes.length; t++) {
            if (typeof this.shapes[t].toRatio == "number") {
                this.shapes[t].x += x * this.shapes[t].toRatio
                this.shapes[t].y += y * this.shapes[t].toRatio
            }
        }
    }
    mixIn(arr) {
        for (let t = 0; t < arr.length; t++) {
            for (let k = 0; k < arr[t].shapes.length; k++) {
                this.shapes.push(arr[t].shapes[k])
            }
        }
    }
    push(object) {
        this.shapes.push(object)
    }
}

class Spring {
    constructor(x, y, radius, color, body = 0, length = 1, gravity = 0, width = 1) {
        if (body == 0) {
            this.body = new Circle(x, y, radius, color)
            this.anchor = new Circle(x, y, radius, color)
            this.beam = new Line(this.body.x, this.body.y, this.anchor.x, this.anchor.y, "yellow", width)
            this.length = length
        } else {
            this.body = body
            this.anchor = new Circle(x, y, radius, color)
            this.beam = new Line(this.body.x, this.body.y, this.anchor.x, this.anchor.y, "yellow", width)
            this.length = length
        }
        this.gravity = gravity
        this.width = width
    }
    balance() {
        this.beam = new Line(this.body.x, this.body.y, this.anchor.x, this.anchor.y, "yellow", this.width)
        if (this.beam.hypotenuse() < this.length) {
            this.body.xmom += (this.body.x - this.anchor.x) / this.length
            this.body.ymom += (this.body.y - this.anchor.y) / this.length
            this.anchor.xmom -= (this.body.x - this.anchor.x) / this.length
            this.anchor.ymom -= (this.body.y - this.anchor.y) / this.length
        } else {
            this.body.xmom -= (this.body.x - this.anchor.x) / this.length
            this.body.ymom -= (this.body.y - this.anchor.y) / this.length
            this.anchor.xmom += (this.body.x - this.anchor.x) / this.length
            this.anchor.ymom += (this.body.y - this.anchor.y) / this.length
        }
        let xmomentumaverage = (this.body.xmom + this.anchor.xmom) / 2
        let ymomentumaverage = (this.body.ymom + this.anchor.ymom) / 2
        this.body.xmom = (this.body.xmom + xmomentumaverage) / 2
        this.body.ymom = (this.body.ymom + ymomentumaverage) / 2
        this.anchor.xmom = (this.anchor.xmom + xmomentumaverage) / 2
        this.anchor.ymom = (this.anchor.ymom + ymomentumaverage) / 2
    }
    draw() {
        this.beam = new Line(this.body.x, this.body.y, this.anchor.x, this.anchor.y, "yellow", this.width)
        this.beam.draw()
        this.body.draw()
        this.anchor.draw()
    }
    move() {
        this.anchor.ymom += this.gravity
        this.anchor.move()
    }

}
class SpringOP {
    constructor(body, anchor, length, width = 3, color = body.color) {
        this.body = body
        this.anchor = anchor
        this.beam = new LineOP(body, anchor, color, width)
        this.length = length
    }
    balance() {
        if (this.beam.hypotenuse() < this.length) {
            this.body.xmom += ((this.body.x - this.anchor.x) / this.length)
            this.body.ymom += ((this.body.y - this.anchor.y) / this.length)
            this.anchor.xmom -= ((this.body.x - this.anchor.x) / this.length)
            this.anchor.ymom -= ((this.body.y - this.anchor.y) / this.length)
        } else if (this.beam.hypotenuse() > this.length) {
            this.body.xmom -= (this.body.x - this.anchor.x) / (this.length)
            this.body.ymom -= (this.body.y - this.anchor.y) / (this.length)
            this.anchor.xmom += (this.body.x - this.anchor.x) / (this.length)
            this.anchor.ymom += (this.body.y - this.anchor.y) / (this.length)
        }

        let xmomentumaverage = (this.body.xmom + this.anchor.xmom) / 2
        let ymomentumaverage = (this.body.ymom + this.anchor.ymom) / 2
        this.body.xmom = (this.body.xmom + xmomentumaverage) / 2
        this.body.ymom = (this.body.ymom + ymomentumaverage) / 2
        this.anchor.xmom = (this.anchor.xmom + xmomentumaverage) / 2
        this.anchor.ymom = (this.anchor.ymom + ymomentumaverage) / 2
    }
    draw() {
        this.beam.draw()
    }
    move() {
        //movement of SpringOP objects should be handled separate from their linkage, to allow for many connections, balance here with this object, move nodes independently
    }
}

class Color {
    constructor(baseColor, red = -1, green = -1, blue = -1, alpha = 1) {
        this.hue = baseColor
        if (red != -1 && green != -1 && blue != -1) {
            this.r = red
            this.g = green
            this.b = blue
            if (alpha != 1) {
                if (alpha < 1) {
                    this.alpha = alpha
                } else {
                    this.alpha = alpha / 255
                    if (this.alpha > 1) {
                        this.alpha = 1
                    }
                }
            }
            if (this.r > 255) {
                this.r = 255
            }
            if (this.g > 255) {
                this.g = 255
            }
            if (this.b > 255) {
                this.b = 255
            }
            if (this.r < 0) {
                this.r = 0
            }
            if (this.g < 0) {
                this.g = 0
            }
            if (this.b < 0) {
                this.b = 0
            }
        } else {
            this.r = 0
            this.g = 0
            this.b = 0
        }
    }
    normalize() {
        if (this.r > 255) {
            this.r = 255
        }
        if (this.g > 255) {
            this.g = 255
        }
        if (this.b > 255) {
            this.b = 255
        }
        if (this.r < 0) {
            this.r = 0
        }
        if (this.g < 0) {
            this.g = 0
        }
        if (this.b < 0) {
            this.b = 0
        }
    }
    randomLight() {
        var letters = '0123456789ABCDEF';
        var hash = '#';
        for (var i = 0; i < 6; i++) {
            hash += letters[(Math.floor(Math.random() * 12) + 4)];
        }
        var color = new Color(hash, 55 + Math.random() * 200, 55 + Math.random() * 200, 55 + Math.random() * 200)
        return color;
    }
    randomDark() {
        var letters = '0123456789ABCDEF';
        var hash = '#';
        for (var i = 0; i < 6; i++) {
            hash += letters[(Math.floor(Math.random() * 12))];
        }
        var color = new Color(hash, Math.random() * 200, Math.random() * 200, Math.random() * 200)
        return color;
    }
    random() {
        var letters = '0123456789ABCDEF';
        var hash = '#';
        for (var i = 0; i < 6; i++) {
            hash += letters[(Math.floor(Math.random() * 16))];
        }
        var color = new Color(hash, Math.random() * 255, Math.random() * 255, Math.random() * 255)
        return color;
    }
}
class Softbody { //buggy, spins in place
    constructor(x, y, radius, color, members = 10, memberLength = 5, force = 10, gravity = 0) {
        this.springs = []
        this.pin = new Circle(x, y, radius, color)
        this.spring = new Spring(x, y, radius, color, this.pin, memberLength, gravity)
        this.springs.push(this.spring)
        for (let k = 0; k < members; k++) {
            this.spring = new Spring(x, y, radius, color, this.spring.anchor, memberLength, gravity)
            if (k < members - 1) {
                this.springs.push(this.spring)
            } else {
                this.spring.anchor = this.pin
                this.springs.push(this.spring)
            }
        }
        this.forceConstant = force
        this.centroid = new Point(0, 0)
    }
    circularize() {
        this.xpoint = 0
        this.ypoint = 0
        for (let s = 0; s < this.springs.length; s++) {
            this.xpoint += (this.springs[s].anchor.x / this.springs.length)
            this.ypoint += (this.springs[s].anchor.y / this.springs.length)
        }
        this.centroid.x = this.xpoint
        this.centroid.y = this.ypoint
        this.angle = 0
        this.angleIncrement = (Math.PI * 2) / this.springs.length
        for (let t = 0; t < this.springs.length; t++) {
            this.springs[t].body.x = this.centroid.x + (Math.cos(this.angle) * this.forceConstant)
            this.springs[t].body.y = this.centroid.y + (Math.sin(this.angle) * this.forceConstant)
            this.angle += this.angleIncrement
        }
    }
    balance() {
        for (let s = this.springs.length - 1; s >= 0; s--) {
            this.springs[s].balance()
        }
        this.xpoint = 0
        this.ypoint = 0
        for (let s = 0; s < this.springs.length; s++) {
            this.xpoint += (this.springs[s].anchor.x / this.springs.length)
            this.ypoint += (this.springs[s].anchor.y / this.springs.length)
        }
        this.centroid.x = this.xpoint
        this.centroid.y = this.ypoint
        for (let s = 0; s < this.springs.length; s++) {
            this.link = new Line(this.centroid.x, this.centroid.y, this.springs[s].anchor.x, this.springs[s].anchor.y, 0, "transparent")
            if (this.link.hypotenuse() != 0) {
                this.springs[s].anchor.xmom += (((this.springs[s].anchor.x - this.centroid.x) / (this.link.hypotenuse()))) * this.forceConstant
                this.springs[s].anchor.ymom += (((this.springs[s].anchor.y - this.centroid.y) / (this.link.hypotenuse()))) * this.forceConstant
            }
        }
        for (let s = 0; s < this.springs.length; s++) {
            this.springs[s].move()
        }
        for (let s = 0; s < this.springs.length; s++) {
            this.springs[s].draw()
        }
    }
}
class Observer {
    constructor(x, y, radius, color, range = 100, rays = 10, angle = (Math.PI * .125)) {
        this.body = new Circle(x, y, radius, color)
        this.color = color
        this.ray = []
        this.rayrange = range
        this.globalangle = Math.PI
        this.gapangle = angle
        this.currentangle = 0
        this.obstacles = []
        this.raymake = rays
    }
    beam() {
        this.currentangle = this.gapangle / 2
        for (let k = 0; k < this.raymake; k++) {
            this.currentangle += (this.gapangle / Math.ceil(this.raymake / 2))
            let ray = new Circle(this.body.x, this.body.y, 1, "white", (((Math.cos(this.globalangle + this.currentangle)))), (((Math.sin(this.globalangle + this.currentangle)))))
            ray.collided = 0
            ray.lifespan = this.rayrange - 1
            this.ray.push(ray)
        }
        for (let f = 0; f < this.rayrange; f++) {
            for (let t = 0; t < this.ray.length; t++) {
                if (this.ray[t].collided < 1) {
                    this.ray[t].move()
                    for (let q = 0; q < this.obstacles.length; q++) {
                        if (this.obstacles[q].isPointInside(this.ray[t])) {
                            this.ray[t].collided = 1
                        }
                    }
                }
            }
        }
    }
    draw() {
        this.beam()
        this.body.draw()
        canvas_context.lineWidth = 1
        canvas_context.fillStyle = this.color
        canvas_context.strokeStyle = this.color
        canvas_context.beginPath()
        canvas_context.moveTo(this.body.x, this.body.y)
        for (let y = 0; y < this.ray.length; y++) {
            canvas_context.lineTo(this.ray[y].x, this.ray[y].y)
            canvas_context.lineTo(this.body.x, this.body.y)
        }
        canvas_context.stroke()
        canvas_context.fill()
        this.ray = []
    }
}
function setUp(canvas_pass, style = "#000000") {
    canvas = canvas_pass
    video_recorder = new CanvasCaptureToWEBM(canvas, 9500000);
    canvas_context = canvas.getContext('2d');
    canvas.style.background = style
    window.setInterval(function () {
        main()
    }, 75)
    document.addEventListener('keydown', (event) => {
        keysPressed[event.key] = true;
    });
    document.addEventListener('keyup', (event) => {
        delete keysPressed[event.key];
    });
    window.addEventListener('pointerdown', e => {
        FLEX_engine = canvas.getBoundingClientRect();
        XS_engine = e.clientX - FLEX_engine.left;
        YS_engine = e.clientY - FLEX_engine.top;
        TIP_engine.x = XS_engine
        TIP_engine.y = YS_engine
        TIP_engine.body = TIP_engine
        // example usage: if(object.isPointInside(TIP_engine)){ take action }
    });
    window.addEventListener('pointermove', continued_stimuli);
    window.addEventListener('pointerup', e => {
    })
    function continued_stimuli(e) {
        FLEX_engine = canvas.getBoundingClientRect();
        XS_engine = e.clientX - FLEX_engine.left;
        YS_engine = e.clientY - FLEX_engine.top;
        TIP_engine.x = XS_engine
        TIP_engine.y = YS_engine
        TIP_engine.body = TIP_engine
    }
}
function gamepad_control(object, speed = 1) { // basic control for objects using the controler
    //         console.log(gamepadAPI.axesStatus[1]*gamepadAPI.axesStatus[0]) //debugging
    if (typeof object.body != 'undefined') {
        if (typeof (gamepadAPI.axesStatus[1]) != 'undefined') {
            if (typeof (gamepadAPI.axesStatus[0]) != 'undefined') {
                object.body.x += (gamepadAPI.axesStatus[0] * speed)
                object.body.y += (gamepadAPI.axesStatus[1] * speed)
            }
        }
    } else if (typeof object != 'undefined') {
        if (typeof (gamepadAPI.axesStatus[1]) != 'undefined') {
            if (typeof (gamepadAPI.axesStatus[0]) != 'undefined') {
                object.x += (gamepadAPI.axesStatus[0] * speed)
                object.y += (gamepadAPI.axesStatus[1] * speed)
            }
        }
    }
}
function control(object, speed = 1) { // basic control for objects
    if (typeof object.body != 'undefined') {
        if (keysPressed['w']) {
            object.body.y -= speed
        }
        if (keysPressed['d']) {
            object.body.x += speed
        }
        if (keysPressed['s']) {
            object.body.y += speed
        }
        if (keysPressed['a']) {
            object.body.x -= speed
        }
    } else if (typeof object != 'undefined') {
        if (keysPressed['w']) {
            object.y -= speed
        }
        if (keysPressed['d']) {
            object.x += speed
        }
        if (keysPressed['s']) {
            object.y += speed
        }
        if (keysPressed['a']) {
            object.x -= speed
        }
    }
}
function getRandomLightColor() { // random color that will be visible on  black background
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[(Math.floor(Math.random() * 12) + 4)];
    }
    return color;
}
function getRandomColor() { // random color
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[(Math.floor(Math.random() * 16) + 0)];
    }
    return color;
}
function getRandomDarkColor() {// color that will be visible on a black background
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[(Math.floor(Math.random() * 12))];
    }
    return color;
}
function castBetween(from, to, granularity = 10, radius = 1) { //creates a sort of beam hitbox between two points, with a granularity (number of members over distance), with a radius defined as well
    let limit = granularity
    let shape_array = []
    for (let t = 0; t < limit; t++) {
        let circ = new Circle((from.x * (t / limit)) + (to.x * ((limit - t) / limit)), (from.y * (t / limit)) + (to.y * ((limit - t) / limit)), radius, "red")
        circ.toRatio = t / limit
        circ.fromRatio = (limit - t) / limit
        shape_array.push(circ)
    }
    return (new Shape(shape_array))
}

function castBetweenPoints(from, to, granularity = 10, radius = 1) { //creates a sort of beam hitbox between two points, with a granularity (number of members over distance), with a radius defined as well
    let limit = granularity
    let shape_array = []
    for (let t = 0; t < limit; t++) {
        let circ = new Circle((from.x * (t / limit)) + (to.x * ((limit - t) / limit)), (from.y * (t / limit)) + (to.y * ((limit - t) / limit)), radius, "red")
        circ.toRatio = t / limit
        circ.fromRatio = (limit - t) / limit
        shape_array.push(circ)
    }
    return shape_array
}

class Disang {
    constructor(dis, ang) {
        this.dis = dis
        this.angle = ang
    }
}

class BezierHitbox {
    constructor(x, y, cx, cy, ex, ey, color = "red") { // this function takes a starting x,y, a control point x,y, and a end point x,y
        this.color = color
        this.x = x
        this.y = y
        this.cx = cx
        this.cy = cy
        this.ex = ex
        this.ey = ey
        this.metapoint = new Circle((x + cx + ex) / 3, (y + cy + ey) / 3, 3, "#FFFFFF")
        this.granularity = 100
        this.body = [...castBetweenPoints((new Point(this.x, this.y)), (new Point(this.ex, this.ey)), this.granularity, 0)]

        let angle = (new Line(this.x, this.y, this.ex, this.ey)).angle()

        this.angles = []
        for (let t = 0; t < this.granularity; t++) {
            this.angles.push(angle)
        }
        for (let t = 0; t <= 1; t += 1 / this.granularity) {
            this.body.push(this.getQuadraticXY(t))
            this.angles.push(this.getQuadraticAngle(t))
        }
        this.hitbox = []
        for (let t = 0; t < this.body.length; t++) {
            let link = new LineOP(this.body[t], this.metapoint)
            let disang = new Disang(link.hypotenuse(), link.angle() + (Math.PI * 2))
            this.hitbox.push(disang)
        }
        this.constructed = 1
    }
    isPointInside(point) {
        let link = new LineOP(point, this.metapoint)
        let angle = (link.angle() + (Math.PI * 2))
        let dis = link.hypotenuse()
        for (let t = 1; t < this.hitbox.length; t++) {
            if (Math.abs(this.hitbox[t].angle - this.hitbox[t - 1].angle) > 1) {
                continue
            }
            if (angle.between(this.hitbox[t].angle, this.hitbox[t - 1].angle)) {
                if (dis < (this.hitbox[t].dis + this.hitbox[t - 1].dis) * .5) {
                    return true
                }
            }
        }
        return false
    }
    doesPerimeterTouch(point) {
        let link = new LineOP(point, this.metapoint)
        let angle = (link.angle() + (Math.PI * 2))
        let dis = link.hypotenuse()
        for (let t = 1; t < this.hitbox.length; t++) {
            if (Math.abs(this.hitbox[t].angle - this.hitbox[t - 1].angle) > 1) {
                continue
            }
            if (angle.between(this.hitbox[t].angle, this.hitbox[t - 1].angle)) {
                if (dis < ((this.hitbox[t].dis + this.hitbox[t - 1].dis) * .5) + point.radius) {
                    return this.angles[t]
                }
            }
        }
        return false
    }
    draw() {
        this.metapoint.draw()
        let tline = new Line(this.x, this.y, this.ex, this.ey, this.color, 3)
        tline.draw()
        canvas_context.beginPath()
        this.median = new Point((this.x + this.ex) * .5, (this.y + this.ey) * .5)
        let angle = (new LineOP(this.median, this.metapoint)).angle()
        let dis = (new LineOP(this.median, this.metapoint)).hypotenuse()
        canvas_context.bezierCurveTo(this.x, this.y, this.cx - (Math.cos(angle) * dis * .38), this.cy - (Math.sin(angle) * dis * .38), this.ex, this.ey)

        canvas_context.fillStyle = this.color
        canvas_context.strokeStyle = this.color
        canvas_context.lineWidth = 3
        canvas_context.stroke()
    }
    getQuadraticXY(t) {
        return new Point((((1 - t) * (1 - t)) * this.x) + (2 * (1 - t) * t * this.cx) + (t * t * this.ex), (((1 - t) * (1 - t)) * this.y) + (2 * (1 - t) * t * this.cy) + (t * t * this.ey))
    }
    getQuadraticAngle(t) {
        var dx = 2 * (1 - t) * (this.cx - this.x) + 2 * t * (this.ex - this.cx);
        var dy = 2 * (1 - t) * (this.cy - this.y) + 2 * t * (this.ey - this.cy);
        return -Math.atan2(dx, dy) + 0.5 * Math.PI;
    }
}
Number.prototype.between = function (a, b, inclusive) {
    var min = Math.min(a, b),
        max = Math.max(a, b);
    return inclusive ? this >= min && this <= max : this > min && this < max;
}

let setup_canvas = document.getElementById('canvas') //getting canvas from document

setUp(setup_canvas) // setting up canvas refrences, starting timer. 

// object instantiation and creation happens here 

class Spinner {
    constructor() {
        this.body = new Circle(Math.random() * 400, Math.random() * 400, 5, "white")
        this.r = Math.random() * 255
        this.g = Math.random() * 255
        this.b = 128
        this.mag = (Math.random() * 5) + 2
        this.body.radius = this.mag * 2
        this.link = new LineOP(this.body, this.body)
    }
    draw() {
        this.body.color = `rgb(${this.r},${this.g},${this.b})`
        if (this.r > this.g + 30) {
            this.body.color = "magenta"
        } else if (this.g > this.r + 30) {
            this.body.color = "yellow"
        } else {
            this.body.color = "cyan"
        }
        this.body.draw()
        for (let t = 0; t < spinners.length; t++) {
            if (spinners[t] != this) {
                this.link.target = spinners[t].body
                let l = Math.max(this.link.hypotenuse(), (this.body.radius + spinners[t].body.radius) * .5)
                let k = this.mag * 40
                let net = (this.r - this.g) / 25500
                // if(net > 0){
                //     spinners[t].r-=.1
                //     spinners[t].g+=.1
                // }else{
                //     spinners[t].r+=.1
                //     spinners[t].g-=.1

                // }
                if (l < (k)) {
                    let rat = l / k
                    l *= 1.0001
                    let a = (this.link.angle()) + (net * rat)
                    spinners[t].body.x = (this.body.x - (Math.cos(a) * l))
                    spinners[t].body.y = (this.body.y - (Math.sin(a) * l))

                    // if(spinners[t].body.x == spinners[t].body.radius){
                    //     spinners[t].f = spinners[t].g
                    //     spinners[t].g = spinners[t].r
                    //     spinners[t].r = spinners[t].f
                    //     // spinners[t].body.x  = canvas.width-(spinners[t].body.radius+1)
                    // }
                    // if(spinners[t].body.y == spinners[t].body.radius){
                    //     spinners[t].f = spinners[t].g
                    //     spinners[t].g = spinners[t].r
                    //     spinners[t].r = spinners[t].f
                    //     // spinners[t].body.y  = canvas.height-(spinners[t].body.radius+1)
                    // }
                    // if(spinners[t].body.x == canvas.width-(spinners[t].body.radius)){
                    //     spinners[t].f = spinners[t].g
                    //     spinners[t].g = spinners[t].r
                    //     spinners[t].r = spinners[t].f
                    //     // spinners[t].body.x  =spinners[t].body.radius
                    // }
                    // if(spinners[t].body.y == canvas.height-(spinners[t].body.radius)){
                    //     spinners[t].f = spinners[t].g
                    //     spinners[t].g = spinners[t].r
                    //     spinners[t].r = spinners[t].f
                    //     // spinners[t].body.y  =spinners[t].body.radius
                    // }

                }
            }
        }
    }
}
let spinners = []
for (let t = 0; t < 300; t++) {
    spinners.push(new Spinner())
}

class Graph {
    constructor() {
        this.nodes = []
        this.cons = [[1, 1], [2, 2], [3, 3], [3, 1], [3, 4], [4, 4], [4, 1], [4, 3]]
        for (let t = 0; t < 4; t++) {
            this.nodes.push(new Circle(200 + ((t % 2) * 100), 200 + (Math.floor(t / 2) * 100), 30, `rgb(${t * 70}, ${(t % 3) * 170}, ${((1 + t) % 2) * 255})`))
        }
    }
    draw() {
        for (let t = 0; t < this.cons.length; t++) {
            if (this.cons[t][0] != this.cons[t][1]) {
                let p = new Point(this.nodes[this.cons[t][0] - 1].x + (t * 2), this.nodes[this.cons[t][0] - 1].y + (t * 2))
                let px = new Point(this.nodes[this.cons[t][1] - 1].x + (t * 2), this.nodes[this.cons[t][1] - 1].y + (t * 2))
                let link = new LineOP(p, px, "red", 1)
                link.draw()
            } else {
                let link = new CircleR(250 + ((250 - this.nodes[this.cons[t][0] - 1].x) * -1.5), 250 + ((250 - this.nodes[this.cons[t][0] - 1].y) * -1.5), 35, this.nodes[this.cons[t][0] - 1].color)
                link.draw()
            }
        }
        for (let t = 0; t < this.nodes.length; t++) {
            this.nodes[t].draw()
        }
        for (let t = 0; t < this.nodes.length; t++) {
            canvas_context.font = "40px arial"
            canvas_context.fillStyle = "black"
            canvas_context.fillText(t + 1, this.nodes[t].x - 10, this.nodes[t].y + 8)
        }
    }
}
// let g = new Graph()

// let s = new SpringOP(new Circle(300, 300, 10, "red"), new Circle(350, 300, 10, "red"), 50, 2, "yellow")

class Scale {
    constructor(s, x, y, r, g, b, a = 1) {
        this.canvas = document.createElement("CANVAS");
        this.canvas.width = 1280
        this.canvas.height = 400
        this.y = y
        this.x = x
        this.canvas_context = this.canvas.getContext('2d');
        this.r = r
        this.g = g
        this.b = b
        this.a = a
        this.s = s
        this.color = `rgb(${this.r},${this.g},${this.b})`
        this.ang = 0
        this.link = new LineOP(this, TIP_engine)
    }
    draw() {
        if (this.r + this.b + this.g > 100) {

            this.canvas_context.fillStyle = this.color
            this.canvas_context.fillRect(0, 0, this.s, this.s * 20)

            canvas_context.translate(this.x, this.y)
            canvas_context.rotate(this.ang)
            canvas_context.translate(-this.x, -this.y)

            canvas_context.drawImage(this.canvas, 0, 0, this.s, this.s * 20, this.x, this.y, this.s, this.s * 20)

            canvas_context.translate(this.x, this.y)
            canvas_context.rotate(-this.ang)
            canvas_context.translate(-this.x, -this.y)

            this.ang = this.link.angle()
        }
        // this.breakcanvas_context.translate((this.breakbox[t].x + (this.breakbox[t].xmom * this.breakbox[t].time)) + (this.breakbox[t].width * .5), (this.breakbox[t].y + (this.breakbox[t].ymom * this.breakbox[t].time)) + (this.breakbox[t].height * .5));
        // this.breakcanvas_context.rotate(this.breakbox[t].angle);
        // this.breakcanvas_context.translate(-((this.breakbox[t].x + (this.breakbox[t].xmom * this.breakbox[t].time)) + (this.breakbox[t].width * .5)), -((this.breakbox[t].y + (this.breakbox[t].ymom * this.breakbox[t].time)) + (this.breakbox[t].height * .5)));

        // this.breakcanvas_context.drawImage(this.partcanvas, this.breakbox[t].x, this.breakbox[t].y, this.breakbox[t].width, this.breakbox[t].height, this.breakbox[t].x + (this.breakbox[t].xmom * this.breakbox[t].time), this.breakbox[t].y + (this.breakbox[t].ymom * this.breakbox[t].time), this.breakbox[t].width, this.breakbox[t].height)

        // this.breakcanvas_context.translate((this.breakbox[t].x + (this.breakbox[t].xmom * this.breakbox[t].time)) + (this.breakbox[t].width * .5), (this.breakbox[t].y + (this.breakbox[t].ymom * this.breakbox[t].time)) + (this.breakbox[t].height * .5));
        // this.breakcanvas_context.rotate(-this.breakbox[t].angle);
        // this.breakcanvas_context.translate(-((this.breakbox[t].x + (this.breakbox[t].xmom * this.breakbox[t].time)) + (this.breakbox[t].width * .5)), -((this.breakbox[t].y + (this.breakbox[t].ymom * this.breakbox[t].time)) + (this.breakbox[t].height * .5)));

    }
}


let pomaoimg = new Image()
pomaoimg.src = "PIE.png"
let pomaoimg2 = new Image()
pomaoimg2.src = "128spim.png"
canvas_context.drawImage(pomaoimg, 0, 0, 64, 64, 0, 0, 80, 80)
let pix = canvas_context.getImageData(0, 0, 80, 80)
class ScaleBody {
    constructor() {
        this.scales = []
        pix = canvas_context.getImageData(0, 0, 80, 80)

        for (let t = 0; t < 20; t++) {
            for (let k = 0; k < 20; k++) {
                let rec = new Scale(16, 128 + (t * 8), 128 + (k * 8), pix.data[t * (4 * 4) + (k * 80 * 4 * 4)], pix.data[((t * 4 * 4) + ((k * 80 * 4 * 4))) + 1], pix.data[((t * 4 * 4) + (k * 80 * 4 * 4)) + 2], 1)
                this.scales.push(rec)
            }
        }
    }
    draw() {
        for (let t = 0; t < this.scales.length; t++) {
            this.scales[t].draw()
        }
    }
}
let go = new ScaleBody()


class Cube {
    constructor(s, x, y, r, g, b, a = 1) {
        this.canvas = document.createElement("CANVAS");
        this.canvas.width = 1280
        this.canvas.height = 400
        this.y = y
        this.x = x
        this.canvas_context = this.canvas.getContext('2d');
        this.r = r
        this.g = g
        this.b = b
        this.a = a
        this.s = s
        this.color = `rgb(${this.r},${this.g},${this.b})`
        this.ang = 0
        this.link = new LineOP(this, TIP_engine)
    }
    draw() {

        if (this.r + this.b + this.g > 100) {

            this.canvas_context.fillStyle = this.color
            this.canvas_context.fillRect(0, 0, this.s * 20, this.s * 20)

            canvas_context.translate(this.x, this.y)
            canvas_context.rotate(this.ang)
            canvas_context.translate(-this.x, -this.y)

            canvas_context.drawImage(this.canvas, 0, 0, this.s * 20, this.s * 20, this.x, this.y, this.s * 20, this.s * 20)

            canvas_context.translate(this.x, this.y)
            canvas_context.rotate(-this.ang)
            canvas_context.translate(-this.x, -this.y)

            this.ang = this.link.angle()
        }
    }
}

// class 


let anim = new Image()
anim.src = "r73.png"
let anims = []
for (let t = 0; t < 90; t++) {
    let anim = new Image()
    anim.src = `r${t}.png`
    anims.push(anim)

}

let f = 0
class Scramble {
    constructor() {
        f++
        this.g = 0
    }
    draw() {

        this.g = 0
        for (let t = 0; t < 80; t++) {
            anim = anims[this.g]
            canvas_context.drawImage(anim, (64 * f) % anims[this.g].width, 0, 64, 64, 10 + (Math.floor(this.g / 20) * 100), 10 + (32 * (((this.g - 1) % 20))), 32, 32)
            this.pix = canvas_context.getImageData(10 + (Math.floor(this.g / 20) * 100), 10 + (32 * (((this.g - 1) % 20))), 32, 32)
            this.pix2 = canvas_context.getImageData(10 + (Math.floor(this.g / 20) * 100), 10 + (32 * (((this.g - 1) % 20))), 32, 32)
            let pigy = []
            for (let t = 0; t < this.pix.data.length; t += 4) {
                let pigx = {}
                pigx.r = this.pix.data[t]
                pigx.g = this.pix.data[t + 1]
                pigx.b = this.pix.data[t + 2]
                pigx.a = this.pix.data[t + 3]
                pigy.push(pigx)
            }
            pigy = pigy.sort((a, b) => a.g < b.g ? -1 : 1)
            pigy = pigy.sort((a, b) => a.r < b.r ? -1 : 1)
            pigy = pigy.sort((a, b) => a.b < b.b ? -1 : 1)
            pigy = pigy.sort((a, b) => a.a > b.a ? -1 : 1)
            for (let t = 0; t < pigy.length; t++) {
                this.pix.data[t * 4] = pigy[t].r
                this.pix.data[(t * 4) + 1] = pigy[t].g
                this.pix.data[(t * 4) + 2] = pigy[t].b
                this.pix.data[(t * 4) + 3] = pigy[t].a
            }
            for (let t = 0; t < this.pix.data.length; t++) {
                this.pix2.data[t] = this.pix.data[t]
                this.pix2.data[t + 1] = this.pix.data[t + 1]
                this.pix2.data[t + 2] = this.pix.data[t + 2]
                this.pix2.data[t + 3] = this.pix.data[t + 3]
            }
            canvas_context.putImageData(this.pix2, 42 + (Math.floor(this.g / 20) * 100), 10 + (32 * (((this.g - 1) % 20))))

            this.g++
        }

    }
}


// let s = new Scramble()

function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {

    // Check if none of the lines are of length 0
    if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
        return false
    }

    denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))

    // Lines are parallel
    if (denominator === 0) {
        return false
    }

    let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
    let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator

    // is the intersection along the segments
    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
        return false
    }

    // Return a object with the x and y coordinates of the intersection
    let x = x1 + ua * (x2 - x1)
    let y = y1 + ua * (y2 - y1)

    return { x, y }
}





class LinkUp {
    constructor() {
        this.points = [new Circle(Math.random() * canvas.width, Math.random() * canvas.width, 20, "red", -Math.random() * 6, Math.random() * 1, 0, 1), new Circle(Math.random() * canvas.width, Math.random() * canvas.width, 20, "red", Math.random() * 1, -Math.random() * 6, 0, 1)]
        this.dot = new Point(0, 0)
        this.go = new Point(0, 0)
        this.xw = 3
        this.yw = 3
        this.canvas = document.createElement("CANVAS");
        this.canvas.width = 320
        this.canvas.height = 320
        this.canvas_context = this.canvas.getContext('2d');
    }
    draw() {
        if (keysPressed['x']) {
            this.xw++
        }
        if (keysPressed['z']) {
            this.xw--
            if (this.xw <= 1) {
                this.xw = 1
            }
        }
        if (keysPressed['y']) {
            this.yw++
        }
        if (keysPressed['t']) {
            this.yw--
            if (this.yw <= 1) {
                this.yw = 1
            }
        }
        this.link = new LineOP(this.points[0], this.points[1], getRandomColor(), 1)
        this.linkx = new LineOP(this.points[0], this.points[1], getRandomColor(), 1)
        this.points[0].move()
        this.points[1].move()
        this.hash = {}
        this.points[0].xmom -= (Math.sqrt(this.link.hypotenuse())) * (Math.sign(this.points[0].x - this.points[1].x)) / 300
        this.points[0].ymom -= (Math.sqrt(this.link.hypotenuse())) * (Math.sign(this.points[0].y - this.points[1].y)) / 300
        this.points[1].xmom += (Math.sqrt(this.link.hypotenuse())) * (Math.sign(this.points[0].x - this.points[1].x)) / 300
        this.points[1].ymom += (Math.sqrt(this.link.hypotenuse())) * (Math.sign(this.points[0].y - this.points[1].y)) / 300
        this.h = (this.link.hypotenuse()) + 1
        this.a = this.link.angle() - (Math.PI / 2)
        let ca = Math.cos(this.a)
        let sa = Math.sin(this.a)
        this.pix = canvas_context.getImageData(0, 0, canvas.width, canvas.height)
        for (let t = 0; t < this.pix.data.length; t += 4) {
            let x1 = Math.floor((Math.floor(t / 4) % canvas.width) / this.xw)
            let y1 = Math.floor((Math.floor(t / 4) / canvas.height) / this.yw)
            let wet = 0
            if (!this.hash[`${x1},${y1}`]) {
                let x = (Math.floor(t / 4) % canvas.width)
                let y = (Math.floor(t / 4) / canvas.height)
                this.center = new Point((this.points[0].x + this.points[1].x) / 2, (this.points[0].y + this.points[1].y) / 2)
                let sx = x - this.center.x
                let sy = y - this.center.y
                if (Math.abs(sx) + Math.abs(sy) > this.link.hypotenuse() + 173) {
                    wet = 1
                }
            }
            if (wet == 1) {
                this.pix.data[t + 1] = 255
                this.pix.data[t + 1] = 0
                this.pix.data[t + 2] = 0
                this.pix.data[t + 3] = 255
                this.hash[`${x1},${y1}`] = [2550000, 25555, 25555]
            } else if (!this.hash[`${x1},${y1}`]) {
                let x = (Math.floor(t / 4) % canvas.width)
                let y = (Math.floor(t / 4) / canvas.height)
                this.go.x = x - (ca * (2 * (canvas.width + canvas.height)))
                this.go.y = y - (sa * (2 * (canvas.width + canvas.height)))
                this.dot.x = x + (ca * (2 * (canvas.width + canvas.height)))
                this.dot.y = y + (sa * (2 * (canvas.width + canvas.height)))
                this.linkx.object = this.go
                this.linkx.target = this.dot
                let p = intersect(this.link.object.x, this.link.object.y, this.link.target.x, this.link.target.y, this.linkx.object.x, this.linkx.object.y, this.linkx.target.x, this.linkx.target.y)
                this.go.x = x
                this.go.y = y
                this.linkx.target = this.go
                this.p = p
                this.linkx.object = p
                let rd = this.linkx.hypotenuse() * 2
                this.linkx.object = this.points[0]
                let gd = this.linkx.hypotenuse() * 2
                this.linkx.object = this.points[1]
                let bd = this.linkx.hypotenuse() * 2
                if (rd > -1) {
                    this.pix.data[t] = (rd * bd * gd) / 2550
                } else {
                    this.pix.data[t] = (Math.min(bd, gd)) * bd * gd / 2550
                }
                this.pix.data[t + 1] = 255 - bd
                this.pix.data[t + 2] = 255 - gd
                this.pix.data[t + 3] = 255
                this.hash[`${x1},${y1}`] = [rd, gd, bd]
            } else {
                if (this.hash[`${x1},${y1}`][0] > -1) {
                    this.pix.data[t] = (this.hash[`${x1},${y1}`][0] * this.hash[`${x1},${y1}`][2] * this.hash[`${x1},${y1}`][1]) / 2550
                } else {
                    this.pix.data[t] = (Math.min(this.hash[`${x1},${y1}`][2], this.hash[`${x1},${y1}`][1])) * this.hash[`${x1},${y1}`][2] * this.hash[`${x1},${y1}`][1] / 2550
                }
                this.pix.data[t + 1] = 255 - this.hash[`${x1},${y1}`][2]
                this.pix.data[t + 2] = 255 - this.hash[`${x1},${y1}`][1]
                this.pix.data[t + 3] = 255
            }
        }

        for (let t = 0; t < this.pix.data.length; t += 4) {

            this.pix.data[t + 1] *= .7
            this.pix.data[t + 2] *= .7
            this.pix.data[t ]  *= .7
        }
        canvas_context.putImageData(this.pix, 0, 0)
    }
}


let l = new LinkUp()





function main() {
    // canvas_context.clearRect(0, 0, canvas.width, canvas.height)  // refreshes the image

    // if(keysPressed['-'] && recording == 0){
    //     recording = 1
    //     video_recorder.record()
    // }
    // if(keysPressed['='] && recording == 1){
    //     recording = 0
    //     video_recorder.stop()
    //     video_recorder.download('ball.webm')
    // }
    l.draw()
    // fs.draw()
    // let s = new Scramble()
    //     s.draw()
    // if(keysPressed['m']){
    //     go.draw()
    //     canvas_context.drawImage(pomaoimg,0,0,64,64, 0,0,80,80)
    //     }
    //     if(keysPressed['g']){
    //     go.draw()
    //     canvas_context.drawImage(pomaoimg2,0,0,64,64, 0,0,80,80)
    //     }

    // if(keysPressed[' ']){
    //     canvas_context.clearRect(0, 0, canvas.width, canvas.height)  // refreshes the image
    //     canvas_context.drawImage(pomaoimg,0,0,64,64, 0,0,80,80)
    //     go = new ScaleBody()
    // }

    // if(keysPressed['p']){
    //     canvas_context.clearRect(0, 0, canvas.width, canvas.height)  // refreshes the image
    //     canvas_context.drawImage(pomaoimg2,0,0,64,64, 0,0,80,80)
    //     go = new ScaleBody()
    // }
}

// })
