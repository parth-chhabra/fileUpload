const Koa = require('koa');
const Router = require('koa-router');
const utils = require('sm-utils');
const koaStatic = require('koa-static');
const fs = require('fs');

const app = new Koa();
const router = new Router()
const port = process.env.PORT || 8080;

app.use(koaStatic(__dirname + '/dist'));

const uploads = {};

async function isUserLoggedIn(ctx, next) {
    if (ctx.request.headers.user) {
        console.log('User Authenticated');
        await next();
        return;
    }
    console.log('user not authenticated');
    ctx.status = 200;
    ctx.body = {
        type: 'Authentication failure',
        data: 'user not authenticated',
    };
    return;
}

router.post('/upload', isUserLoggedIn, async (ctx) => {
    const fileId = ctx.request.headers['fileid'];
    const name = ctx.request.headers['name'];
    const fileSize = parseInt(ctx.request.headers['size'], 10);
    const startFrom = parseInt(ctx.request.headers['startfrom'], 10);

    if (uploads[fileId] && fileSize == uploads[fileId].bytesReceived) {
        ctx.body = {};
        return;
    }

    if (!uploads[fileId]) uploads[fileId] = {bytesReceived: 0};

    let writeStream;
    if (!startFrom) {
        writeStream = fs.createWriteStream(name);
    }
    else {
        writeStream = fs.createWriteStream(name, {flags: 'a'});
    }
    
    ctx.req.on('data', (data) => {
        uploads[fileId].bytesReceived += data.length;
    });

    ctx.req.pipe(writeStream);

    let status = 200;
    let body = {};
    writeStream.on('close', () => {
        if (uploads[fileId].bytesReceived == fileSize) {
            console.log("success");
            delete uploads[fileId];
            status = 200;
            body = {
                type: 'success',
            };
            return;
        }
        else {
            console.log("error while writing: " + uploads[fileId].bytesReceived);
            status = 500;
            return;
        }
    });

    writeStream.on('error', (err) => {
        console.log(err);
        status = 500;
    });

    ctx.status = status;
    ctx.body = body;
});

router.get('/status', isUserLoggedIn, async (ctx) => {
    const fileId = ctx.request.headers['fileid'];
    const name = ctx.request.headers['name'];
    const fileSize = parseInt(ctx.request.headers['size'], 10);
    
    if (name) {
        try {
            let stats = await utils.file(name).stat();
            if (stats.isFile())
            {
                console.log(`file found on server with size: ${stats.size}`);
                if (fileSize == stats.size) {
                    ctx.body = {
                        uploaded: fileSize,
                    };
                    return;
                }
                if (!uploads[fileId]) uploads[fileId] = {};
                uploads[fileId].bytesReceived = stats.size;
            }
        }
        catch (err){
            // console.log(err);
        }
    }
    if (uploads[fileId]) {
        ctx.body = {
            uploaded : uploads[fileId].bytesReceived,
        };
        return;
    }
    ctx.body = {
        uploaded : 0,
    };
    return;
});

router.get('/(.*)', async (ctx) => {
    const html = await utils.file('./dist/index.html').read();
    ctx.type = 'text/html';
    ctx.body = html;
});

app.use(router.routes());
app.use(router.allowedMethods());
app.listen(port, () => {
    console.log('Listening on port: ', port);
});
