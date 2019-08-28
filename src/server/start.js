const io = require('socket.io')(3000)
const readline = require('readline')
const colors = require('colors')

const clientWorkTime = {}
const workQueue = []

const r = readline.createInterface({
	input: process.stdin,
	output: process.stdout
})

io.on('connection', client => {
	console.log('connection:', client.id)
	clientWorkTime[client.id] = Date.now()
	refresh()

	client.on('disconnect', () => {
		console.log('disconnect:', client.id)
		delete clientWorkTime[client.id]
	})

	client.on('start', data => {
		console.log(`#${data.id} ${'작업을 전달했습니다'.yellow}`)
		clientWorkTime[client.id] = Infinity
		workQueue.shift()
		refresh()
	})

	client.on('done', data => {
		console.log(`#${data.id} ${'작업이 완료되었습니다'.green}`)
		clientWorkTime[client.id] = Date.now()
		refresh()
	})
})

// 사용자가 작업을 요청합니다.
let workId = 0
r.on('line', () => {
	console.log(`#${workId} ${'작업이 생성되었습니다'.red}`)
	workQueue.push({
		type: 'work',
		id: workId++,
		workTime: (Math.random() * 7000) + 3000
	})
	refresh()
})

function getOldestId() {
	let oldestTime = Infinity
	let oldestId = null

	for (let id in clientWorkTime) {
		let time = clientWorkTime[id]

		if (time < oldestTime) {
			oldestTime = time
			oldestId = id
		}
	}

	return oldestId
}

function refresh() {
	if (workQueue.length > 0) {
		let id = getOldestId()
		if (id)
			io.to(id).emit('work', workQueue[0])
	}
}