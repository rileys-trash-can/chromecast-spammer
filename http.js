// part of chromecast spammer by derz
// GPL 3.0
const express = require("express");
const app = express()
const fs = require("fs")
const { networkInterfaces } = require("os")

function ip() {
	// get own local ip
	const nets = networkInterfaces()
	let ips = [];

	for( const name of Object.keys(nets) ) {
		for( const net of nets[name] ) {
			if (net.family === "IPv4" && !net.internal ) {
				ips.push(net.address)
			}
		}
	} 

	return ips
}

this.listen = (port, cb) => {
	app.listen(port, a => {
		this.listening = true
		cb(a)
	})
	this.port = port
}
this.seturl = ( url ) => {
	this.url = _ => {
		return url
	}
}
this.url = _ => {
	return `http://${ip()[0]}:${this.port}/video.mp4`
}

this.filepath = "video.mp4";

app.get("/video.mp4", (req, res) => {
	let path = "./" + this.filepath
    fs.stat(path, (err, stat) => { //thx for the example i basically just copied it :))) https://webomnizz.com/video-stream-example-with-nodejs-and-html5/
    
    // Handle file not found
    if (err !== null && err.code === 'ENOENT') {
    	res.sendStatus(404);
    } else {

    	const fileSize = stat.size
        const range = req.headers.range
    
                if (range) {
    
                    const parts = range.replace(/bytes=/, "").split("-");
    
                    const start = parseInt(parts[0], 10);
                    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    
                    const chunksize = (end - start) + 1;
                    const file = fs.createReadStream(path, { start, end });
                    const head = {
                        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                        'Accept-Ranges': 'bytes',
                        'Content-Length': chunksize,
                        'Content-Type': 'video/mp4',
                    }
    
                    res.writeHead(206, head);
                    file.pipe(res);
                } else {
                    const head = {
                        'Content-Length': fileSize,
                        'Content-Type': 'video/mp4',
                    }
    
                    res.writeHead(200, head);
                    fs.createReadStream(path).pipe(res);
                }
            }
        })
})

// "test suite"
if( process.argv[2] === "test" ) {
	console.log(ip())
	this.listen(parseInt(process.argv[3],10))
	console.log("url is", this.url())
}
