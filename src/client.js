const io = require('socket.io-client')('http://localhost:3000')
const ProgressBar = require('progress')

let working = false

io.on('connect', () => {
    console.log('connect:', io.id)
});
io.on('disconnect', () => {
    console.log('disconnect')
});
io.on('work', data => {
    if (working)
        io.emit('start', data)

    startWork(data)
})

function startWork(data) {
    working = true
    let bar = new ProgressBar(`#${data.id} :bar :percent :elapsed s`, {
        total: 100,
        width: 30,
        complete: '=',
        incomplete: ' '
    })
    let timer = setInterval(() => {
        bar.tick()
        if (bar.complete) {
            io.emit('done', data)
            clearInterval(timer)
        }
    }, data.workTime/100)
}