var express = require('express');
var fs = require('fs');
var app = express();

app.get('/', function(req, res){
    res.sendfile('index.html');
});

app.get('/video', function(req, res){

    var path = 'play.mp4';
    var stat = fs.statSync(path);
    var range = req.headers.range;
    var total = stat.size;

    // Veio uma request sem range, quer o arquivo todo
    if(!range){
        res.writeHead(200, {
            'Content-Length': total,
            'Accept-Ranges': 'bytes',
            'Content-Type': 'video/mp4'
        });

        return fs.createReadStream(path).pipe(res);
    }

    // Chegou uma request com range, provavelmente alguém
    // apertou a timeline em um lugar que ainda não está carregado
    var parts = range.replace(/bytes=/, '').split('-');
    var partialstart = parts[0];
    var partialend = parts[1];

    var start = parseInt(partialstart, 10);
    var end = partialend ? parseInt(partialend, 10) : total - 1;

    var chunksize = (end - start) + 1;

    res.writeHead(206, {
        'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4'
    });

    fs.createReadStream(path, {
        start : start,
        end : end
    }).pipe(res);
});

app.listen(8080);
