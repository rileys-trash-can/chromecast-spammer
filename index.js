const ChromecastAPI = require("chromecast-api")
const http = require("./http.js")
const fs = require("fs")
const con = require("./console/console.js")
const client = new ChromecastAPI();

playing = []
warned = false
// help:
con.registercmd("help", (argv) => {
	console.log(
`Help menu:
  devices                 - list of all detected devices
  refresh                 - restart mDNS and SSDN search
  update                  - restart mDNS and SSDN search
  starthttp <port> <file> - start http server on specific port & file
  send <friendlyName>     - start playback on specific chromecast
  sendall                 - start playback on all detecdet chromecasts
  stop / stopall          - stop playback on all connected chromecasts
  url                     - show url going to be sent to the chromecasts
  seturl                  - set the url send to chromecasts
                          - can also be YouTube link (just have to make
                          - sure the devices can reach the internet (
                          - if you need a proxy this likely won't work))
  state                   - some state information`
	)
})

con.registercmd("state", (argv) => {
	console.log(
`State:
  url:                   ${http.url()}
  httpserver:            ${http.listening ? "running" : "not running"}
  videopath:             ${http.filepath}
  # of devices detected: ${client.devices.length}
  (see devices command for details)`
  	)
})

con.registercmd("devices", (argv) => {
	console.log(`List of all devices: (${client.devices.length})`)
	client.devices.forEach((d) => {
		console.log(`Device "${d.friendlyName} at ${d.host} (${d.name})`)
	})
})

con.registercmd("refresh", (argv) => {
	console.log("Triggering mDNS and SSDN search")
	client.update()
})
con.alias("refresh", "update")

con.registercmd("starthttp", (argv, r) => {
	if( !argv[1] | !argv[2] ) return r(console.log("Not enough arguments\nUsage: starthttp <port> <file>"))

	//random port
	if( argv[1] === "random" | argv[1] === "r")
		argv[1] = Math.floor(Math.random()*1919)+8080

	http.filepath = argv[2];
	http.listen(parseInt(argv[1], 10), _ => {
		console.log("listening on port", argv[1])
		r()
	})
}, true)

con.registercmd("url", (argv) => {
	console.log("the urls are:", http.url());
	console.log("if you think its not available for the chromecasts, please set one by hand using the seturl command")
})

con.registercmd("seturl", (argv) => {
	if( !argv[1] ) return console.log("Not enough arguments!\nUsage: seturl <url>")

	http.seturl(argv[1])
})

con.registercmd("send", (argv, r) => {
	if( !argv[1] ) return r(console.log("Usage: send <friendlyName>"))
	if( !warned && !http.listening ) return r(console.log("Can't send cuz http is not listening\nexecute again to bypass this warning\nyou have been warned", warned = true))
	
	let found = false

	client.devices.forEach((d) => {
		if( d.friendlyName === argv[1] ) {
			d.play( http.url(), _ => {
				playing.push(d)
				r(console.log(`playing on device ${d.friendlyName} aka ${d.name}`))
			})
			found = true
		}
	})
	if(!found) return r(console.log(`Couldn't file device with name ${argv[1]}`))
}, true)

con.registercmd("sendall", (argv, r) => {
	client.devices.forEach((d) => {
		d.play( http.url(), _ => {
			playing.push(d)
			r(console.log(`playing on device ${d.friendlyName} aka ${d.name}`))
		})
	})
})

con.registercmd("stop", (argv) => {
	playing.filter(device => {
		device.stop(() => {
			console.log(`stopped playback on ${device.friendlyName}`)
		})
		return false
	})
})
con.alias("stop", "stopall")

con.init()
